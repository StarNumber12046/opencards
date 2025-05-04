import { sql } from "drizzle-orm";
import { index, pgTableCreator } from "drizzle-orm/pg-core";
import { v4 as uuid } from "uuid";
export const createTable = pgTableCreator((name) => `opencards_${name}`);

export const users = createTable("user", (d) => ({
  token: d.text().notNull(),
  hashedPassword: d.text().notNull(),
  email: d.text().notNull(),
  id: d
    .text()
    .primaryKey()
    .$defaultFn(uuid as () => string),
}));

export const userData = createTable("user_data", (d) => ({
  id: d
    .text()
    .primaryKey()
    .$defaultFn(uuid as () => string),
  userId: d
    .text()
    .notNull()
    .references(() => users.id),
  name: d.text().notNull(),
  email: d.text().notNull(),
  messagingToken: d.text(),
  xp: d.integer().notNull(),
  numExposures: d.integer().notNull(),
  lastFilmHandout: d.bigint({ mode: "number" }).notNull(),
  lastFilmHandoutTimeLeft: d.bigint({ mode: "number" }).notNull(),
  coins: d.integer().notNull(),
  lastCapture: d.bigint({ mode: "number" }).notNull(),
  battleOnboardingCompleted: d.boolean().notNull(),
  usernameCompleted: d.boolean().notNull(),
  radarExpandTimeLeft: d.bigint({ mode: "number" }).notNull(),
  unlimitedPhotosExpiryTime: d.bigint({ mode: "number" }).notNull(),
  relocationAirportId: d.integer(),
  relocationAirport: d.integer().notNull(),
  relocationTimestamp: d.bigint({ mode: "number" }).notNull(),
  relocationTimeLeft: d.bigint({ mode: "number" }).notNull(),
  avatar: d.text().notNull(),
  isVerified: d.boolean().notNull(),
  friendCode: d.text().notNull(),
  numAircraftModels: d.integer().notNull(),
  numDestinations: d.integer().notNull(),
  numBattleWins: d.integer().notNull(),
  numAchievements: d.integer().notNull(),
  hasPendingFriendRequests: d.boolean().notNull(),
}));

export const achievements = createTable("achievement", (d) => ({
  id: d.text().primaryKey(),
  userId: d
    .text()
    .notNull()
    .references(() => userData.id),
  progressNumerator: d.integer().notNull(),
  isAchieved: d.boolean().notNull(),
}));

export const cards = createTable("card", (d) => ({
  id: d
    .text()
    .primaryKey()
    .$defaultFn(uuid as () => string),
  userId: d
    .text()
    .notNull()
    .references(() => userData.id),
  aircraftId: d.text().notNull(),
}));

export const captures = createTable("capture", (d) => ({
  id: d
    .text()
    .primaryKey()
    .$defaultFn(uuid as () => string),
  cardId: d
    .text()
    .notNull()
    .references(() => cards.id),
  lat: d.real().notNull(),
  lon: d.real().notNull(),
  alt: d.real().notNull(),
  speed: d.real().notNull(),
  destination: d.text(),
  destinationId: d.integer(),
  origin: d.text(),
  originId: d.integer(),
  flight: d.text(),
  reg: d.text().notNull(),
  callsign: d.text().notNull(),
  gpsLat: d.real().notNull(),
  gpsLon: d.real().notNull(),
  distance: d.real().notNull(),
  radarLat: d.real().notNull(),
  radarLon: d.real().notNull(),
  radarRange: d.real().notNull(),
  associatedAirportId: d.integer().notNull(),
  flightId: d.integer().notNull(),
  track: d.real().notNull(),
  icon: d.integer().notNull(),
  status: d.integer().notNull(),
  timestamp: d.bigint({ mode: "number" }).notNull(),
  onGround: d.boolean().notNull(),
  source: d.integer().notNull(),
  model: d.text().notNull(),
  xp: d.integer().notNull(),
  xpUserBonus: d.integer().notNull(),
  coverage: d.integer().notNull(),
  cloudiness: d.integer().notNull(),
  imageLarge: d.text(),
  imageThumb: d.text(),
  imageCopy: d.text(),
  glow: d.boolean().notNull(),
}));

export const items = createTable("item", (d) => ({
  id: d.serial().primaryKey(),
  userId: d
    .text()
    .notNull()
    .references(() => userData.id),
  type: d.text().notNull(), // enum: CAMERA_STABILIZER, etc.
}));

export const missions = createTable("mission", (d) => ({
  id: d.serial().primaryKey(),
  userId: d
    .text()
    .notNull()
    .references(() => userData.id),
  type: d.text().notNull(),
  unclaimed: d.integer().notNull(),
  unfinished: d.integer().notNull(),
}));

export const missionData = createTable("mission_data", (d) => ({
  id: d.integer().primaryKey(),
  missionId: d
    .integer()
    .notNull()
    .references(() => missions.id),
  key: d.text().notNull(),
  title: d.text().notNull(),
  award: d.integer().notNull(),
  type: d.text().notNull(),
  timestamp: d.integer().notNull(),
  claimed: d.boolean().notNull(),
  percentage: d.integer().notNull(),
  length: d.integer().notNull(),
}));

export const friends = createTable("friend", (d) => ({
  userId: d
    .text()
    .notNull()
    .references(() => userData.id),
  friendId: d.text().notNull(),
}));

export const unlockedModels = createTable("unlocked_model", (d) => ({
  userId: d
    .text()
    .notNull()
    .references(() => userData.id),
  modelId: d.text().notNull(),
}));

export const battleDeck = createTable("battle_deck", (d) => ({
  userId: d
    .text()
    .notNull()
    .references(() => userData.id),
  cardId: d.text().notNull(),
}));
