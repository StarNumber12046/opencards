import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getUserDataByToken, withAuth } from "~/server/auth";
import { db } from "~/server/db";
import { userData, items } from "~/server/db/schema";
import { getDbUserDataById, getFullUserDataById } from "~/server/queries/user";

const itemMaps = [
  {
    id: "item_catch_anywhere_1",
    itemType: "CATCH_ANYWHERE",
    amount: 1,
    cost: 200,
  },
  {
    id: "item_catch_anywhere_2",
    itemType: "CATCH_ANYWHERE",
    amount: 3,
    cost: 400,
  },
  {
    id: "item_catch_anywhere_3",
    itemType: "CATCH_ANYWHERE",
    amount: 5,
    cost: 600,
  },
  {
    id: "item_catch_again_1",
    itemType: "CATCH_AGAIN",
    amount: 1,
    cost: 50,
  },
  {
    id: "item_catch_again_2",
    itemType: "CATCH_AGAIN",
    amount: 3,
    cost: 100,
  },
  {
    id: "item_catch_again_3",
    itemType: "CATCH_AGAIN",
    amount: 5,
    cost: 125,
  },
  {
    id: "item_cameras_stabilizer_1",
    itemType: "CAMERA_STABILIZER",
    amount: 1,
    cost: 25,
  },
  {
    id: "item_cameras_stabilizer_2",
    itemType: "CAMERA_STABILIZER",
    amount: 3,
    cost: 65,
  },
  {
    id: "item_cameras_stabilizer_3",
    itemType: "CAMERA_STABILIZER",
    amount: 10,
    cost: 200,
  },
];

export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    const jsonBody = (await req.json()) as { productId: string };
    const item = itemMaps.find((i) => i.id === jsonBody.productId);
    const currentUserData = await getDbUserDataById(user.id);
    if (!item) {
      return NextResponse.json({ error: "No item found" }, { status: 400 });
    }
    if (!currentUserData) {
      return NextResponse.json({ error: "No user found" }, { status: 405 });
    }
    const userCoins = currentUserData.coins - item.cost;
    await db
      .update(userData)
      .set({
        coins: userCoins,
      })
      .where(eq(userData.id, currentUserData.id))
      .execute();
    console.log({ [item.itemType]: item.amount });
    const addedItems = {
      ...{ CAMERA_STABILIZER: 0, CATCH_ANYWHERE: 0, CATCH_AGAIN: 0 },
      [item.itemType]: item.amount,
    };
    for (const [key, value] of Object.entries(addedItems)) {
      for (let i = 0; i < value; i++) {
        await db.insert(items).values({
          type: key,
          userId: currentUserData.id,
        });
      }
    }
    return NextResponse.json({
      coins: userCoins,
      addedItems,
    });
  });
}
