import { db } from "~/server/db";
import {
  userData,
  achievements,
  cards,
  items,
  missions,
  missionData,
  friends,
  unlockedModels,
  battleDeck,
  captures,
} from "~/server/db/schema";
import { eq } from "drizzle-orm";
import {
  type ItemType,
  Tier,
  type Capture,
  type Card,
  type UserData,
} from "~/types/user";

/**
 * Calculate the tier based on total XP from captures
 */
export function getTier(captures: Capture[]): Tier {
  const totalXp = captures.reduce((acc, cur) => acc + cur.xp, 0);
  if (totalXp < 15000) return Tier.Paper;
  if (totalXp < 50000) return Tier.Silver;
  return Tier.Gold;
}

/**
 * Calculate aggregate stats from captures
 */
export function getCardStats(captures: Capture[]) {
  if (captures.length === 0) {
    return {
      cloudiness: 0,
      coverage: 0,
      glow: false,
      xp: 0,
    };
  }

  return {
    cloudiness:
      captures.reduce((acc, cur) => acc + cur.cloudiness, 0) / captures.length,
    coverage:
      captures.reduce((acc, cur) => acc + cur.coverage, 0) / captures.length,
    glow: captures.some((c) => c.glow),
    xp: captures.reduce((acc, cur) => acc + cur.xp, 0),
  };
}

/**
 * Get total XP across all user cards
 */
export async function getTotalXp(user: { id: string }): Promise<number> {
  const userCards = await db
    .select({ id: cards.id })
    .from(cards)
    .where(eq(cards.userId, user.id))
    .execute();

  if (userCards.length === 0) return 0;

  // Using Promise.all to fetch captures for all cards in parallel
  const cardsXp = await Promise.all(
    userCards.map(async (card) => {
      const cardCaptures = await db
        .select({ xp: captures.xp })
        .from(captures)
        .where(eq(captures.cardId, card.id))
        .execute();

      return cardCaptures.reduce((total, capture) => total + capture.xp, 0);
    }),
  );

  return cardsXp.reduce((acc, cur) => acc + cur, 0);
}

/**
 * Get all captured registrations for a user
 */
export async function getCapturedRegs(user: { id: string }): Promise<string[]> {
  // Using a more efficient JOIN query instead of separate queries
  const registrations = await db
    .select({ reg: captures.reg })
    .from(captures)
    .innerJoin(cards, eq(captures.cardId, cards.id))
    .where(eq(cards.userId, user.id))
    .execute();

  return registrations.map((entry) => entry.reg);
}

/**
 * Get complete user data by user ID
 */
export async function getFullUserDataById(
  userId: string,
): Promise<UserData | null> {
  // Fetch base user data
  const [user] = await db
    .select()
    .from(userData)
    .where(eq(userData.userId, userId));

  if (!user) return null;

  // Fetch all related data in parallel
  const [
    userCards,
    userAchievements,
    userItems,
    userMissions,
    userFriends,
    userModels,
    userDeck,
  ] = await Promise.all([
    db.select().from(cards).where(eq(cards.userId, user.id)),
    db.select().from(achievements).where(eq(achievements.userId, userId)),
    db.select().from(items).where(eq(items.userId, userId)),
    db.select().from(missions).where(eq(missions.userId, userId)),
    db
      .select({ friendId: friends.friendId })
      .from(friends)
      .where(eq(friends.userId, userId)),
    db
      .select({ modelId: unlockedModels.modelId })
      .from(unlockedModels)
      .where(eq(unlockedModels.userId, userId)),
    db
      .select({ cardId: battleDeck.cardId })
      .from(battleDeck)
      .where(eq(battleDeck.userId, userId)),
  ]);

  // Process cards and captures data
  const cardsWithCaptures: Card[] = await Promise.all(
    userCards.map(async (card) => {
      const cardCaptures = await db
        .select()
        .from(captures)
        .where(eq(captures.cardId, card.id));

      // Calculate all stats at once
      const stats = getCardStats(cardCaptures);

      return {
        ...card,
        captures: cardCaptures,
        tier: getTier(cardCaptures),
        cloudiness: stats.cloudiness,
        coverage: stats.coverage,
        glow: stats.glow,
        xp: stats.xp,
        aircraftId: card.aircraftId,
      } as Card;
    }),
  );

  // Process mission data
  const missionsWithData = await Promise.all(
    userMissions.map(async (mission) => {
      const data = await db
        .select()
        .from(missionData)
        .where(eq(missionData.missionId, mission.id));

      return { ...mission, data };
    }),
  );

  // Assemble and return complete user data
  return {
    ...user,
    achievements: userAchievements,
    cards: cardsWithCaptures,

    items: userItems.map((item) => ({
      ...item,
      type: item.type as ItemType,
    })),
    missions: missionsWithData,
    friendIds: userFriends.map((f) => f.friendId),

    unlockedModelIds: userModels.map((m) => m.modelId),
    battleDeck: userDeck.map((c) => c.cardId),
    relocation: {
      airportId: user.relocationAirportId,
      airport: user.relocationAirport,
      timestamp: user.relocationTimestamp,
    },
    unlimitedPhotosTimeLeft:
      user.unlimitedPhotosExpiryTime - Date.now() > 0
        ? (user.unlimitedPhotosExpiryTime - Date.now()) / 1000
        : 0,
    radarExpandTimeLeft:
      user.radarExpandEndTimestamp - Date.now() > 0
        ? (user.radarExpandEndTimestamp - Date.now()) / 1000
        : 0,
    relocationTimeLeft:
      user.relocationEndTimestamp - Date.now() > 0
        ? (user.relocationEndTimestamp - Date.now()) / 1000
        : 0,
  } as UserData;
}

export async function getDbUserDataById(userId: string) {
  return (
    await db
      .select()
      .from(userData)
      .where(eq(userData.userId, userId))
      .execute()
  )[0];
}
