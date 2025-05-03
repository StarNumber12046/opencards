import { db } from "~/server/db"; //your Drizzle database instance
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
  ItemType,
  Tier,
  type Capture,
  type Card,
  type UserData,
} from "~/types/user";

export function getTier(captures: Capture[]) {
  const totalXp = captures.reduce((acc, cur) => acc + cur.xp, 0);
  if (totalXp < 15000) return Tier.Paper;
  if (totalXp < 50000) return Tier.Silver;
  return Tier.Gold;
}

export function getCloudiness(captures: Capture[]) {
  const totalCloudiness = captures.reduce(
    (acc, cur) => acc + cur.cloudiness,
    0,
  );
  return totalCloudiness / captures.length;
}

export function getGlow(captures: Capture[]) {
  const isGlow = captures.some((c) => c.glow);
  return isGlow;
}

export function getCoverage(captures: Capture[]) {
  const totalCoverage = captures.reduce((acc, cur) => acc + cur.coverage, 0);
  return totalCoverage / captures.length;
}

export function getCardXp(captures: Capture[]) {
  const totalXp = captures.reduce((acc, cur) => acc + cur.xp, 0);
  return totalXp;
}

export async function getTotalXp(user: { id: string }) {
  const userCards = await db
    .select()
    .from(cards)
    .where(eq(cards.userId, user.id))
    .execute();
  const cardsXp = await Promise.all(
    userCards.map(async (card) => {
      const cptrs = await db
        .select()
        .from(captures)
        .where(eq(captures.cardId, card.id))
        .execute();
      return getCardXp(cptrs);
    }),
  );
  return cardsXp.reduce((acc, cur) => acc + cur, 0);
}

export async function getCapturedRegs(user: { id: string }): Promise<string[]> {
  const userCards = await db
    .select()
    .from(cards)
    .where(eq(cards.userId, user.id))
    .execute();
  const cardsRegs = await Promise.all(
    userCards.map(async (card) => {
      const cptrs = await db
        .select()
        .from(captures)
        .where(eq(captures.cardId, card.id))
        .execute();
      return cptrs.map((c) => c.reg);
    }),
  );
  return cardsRegs.flat();
}

export async function getUserDataById(
  userId: string,
): Promise<UserData | null> {
  //1. Base userData
  const [user] = await db
    .select()
    .from(userData)
    .where(eq(userData.userId, userId));
  // console.log("[getUserDataById] Base user:", user);
  if (!user) {
    // console.warn(`[getUserDataById] No user found for userId: ${userId}`);
    return null;
  }

  const crds = await db
    .select()
    .from(cards)
    .where(eq(cards.userId, user.id))
    .execute();
  // console.log(`[getUserDataById] Found ${crds.length} cards for user.`);

  const cardsWithCaptures: Card[] = await Promise.all(
    crds.map(async (card) => {
      const cptrs = await db
        .select()
        .from(captures)
        .where(eq(captures.cardId, card.id));
      // console.log(
      //   `[getUserDataById] Card ID ${card.id} has ${cptrs.length} captures.`,
      // );
      return {
        ...card,
        captures: cptrs,
        tier: getTier(cptrs),
        cloudiness: getCloudiness(cptrs),
        coverage: getCoverage(cptrs),
        glow: getGlow(cptrs),
        xp: getCardXp(cptrs),
        aircraftId: card.aircraftId,
      } as Card;
    }),
  );

  //2. Related data
  const [ach, itms, mssns, frnds, models, deck] = await Promise.all([
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
  // console.log(`[getUserDataById] Related data:`);
  // console.log(` - Achievements: ${ach.length}`);
  // console.log(` - Items: ${itms.length}`);
  // console.log(` - Missions: ${mssns.length}`);
  // console.log(` - Friends: ${frnds.length}`);
  // console.log(` - Models: ${models.length}`);
  // console.log(` - Deck: ${deck.length}`);

  // typecast items
  const typedItems = itms.map((item) => ({
    ...item,
    type: item.type as ItemType,
  }));

  //3. Attach mission data
  const missionWithData = await Promise.all(
    mssns.map(async (mission) => {
      const data = await db
        .select()
        .from(missionData)
        .where(eq(missionData.missionId, mission.id));
      // console.log(
      //   `[getUserDataById] Mission ID ${mission.id} has ${data.length} data entries.`,
      // );
      return { ...mission, data };
    }),
  );

  // console.log(`[getUserDataById] Done assembling user data for ${userId}`);

  const userDataFormatted: UserData = {
    ...user,
    achievements: ach,
    cards: cardsWithCaptures,
    items: itms.map((item) => ({
      ...item,
      type: item.type as ItemType,
    })),
    missions: missionWithData,
    friendIds: frnds.map((f) => f.friendId),
    unlockedModelIds: models.map((m) => m.modelId),
    battleDeck: deck.map((c) => c.cardId),
    relocation: { airportId: null, airport: 0, timestamp: 0 },
  };

  return userDataFormatted;
}
