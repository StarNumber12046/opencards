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
  const result = await db
    .select({
      totalXp: captures.xp,
    })
    .from(captures)
    .innerJoin(cards, eq(captures.cardId, cards.id))
    .where(eq(cards.userId, user.id))
    .execute();

  return result.reduce((acc, cur) => acc + cur.totalXp, 0);
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

  // Fetch all related data in parallel using joins
  const [
    userCardsWithCaptures,
    userAchievements,
    userItems,
    missionsWithData,
    userFriends,
    userModels,
    userDeck,
  ] = await Promise.all([
    // Get cards with their captures
    db
      .select({
        card: cards,
        capture: captures,
      })
      .from(cards)
      .leftJoin(captures, eq(cards.id, captures.cardId))
      .where(eq(cards.userId, user.id))
      .execute(),

    db.select().from(achievements).where(eq(achievements.userId, userId)),
    db.select().from(items).where(eq(items.userId, userId)),

    // Get missions with their data
    db
      .select({
        mission: missions,
        data: missionData,
      })
      .from(missions)
      .leftJoin(missionData, eq(missions.id, missionData.missionId))
      .where(eq(missions.userId, userId))
      .execute(),

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

  // Process cards and captures
  const cardsMap = new Map<string, Card>();
  userCardsWithCaptures.forEach((row) => {
    if (!cardsMap.has(row.card.id)) {
      cardsMap.set(row.card.id, {
        ...row.card,
        captures: [],
        tier: Tier.Paper,
        cloudiness: 0,
        coverage: 0,
        glow: false,
        xp: 0,
        aircraftId: row.card.aircraftId,
      });
    }
    if (row.capture) {
      const card = cardsMap.get(row.card.id)!;
      card.captures.push(row.capture);
      const stats = getCardStats(card.captures);
      card.tier = getTier(card.captures);
      card.cloudiness = stats.cloudiness;
      card.coverage = stats.coverage;
      card.glow = stats.glow;
      card.xp = stats.xp;
    }
  });

  // Process missions
  const missionsMap = new Map();
  missionsWithData.forEach((row) => {
    if (!missionsMap.has(row.mission.id)) {
      missionsMap.set(row.mission.id, {
        ...row.mission,
        data: [],
      });
    }
    if (row.data) {
      missionsMap.get(row.mission.id).data.push(row.data);
    }
  });

  // Assemble and return complete user data
  return {
    ...user,
    achievements: userAchievements,
    cards: Array.from(cardsMap.values()),
    items: userItems.map((item) => ({
      ...item,
      type: item.type as ItemType,
    })),
    missions: Array.from(missionsMap.values() as Mission[]),
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
