import { NextResponse } from "next/server";
import { withAuth } from "~/server/auth";
import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import { items } from "~/server/db/schema";
import { getUserDataById } from "~/server/queries/user";
export function GET(req: Request) {
  return withAuth(req, async (user) => {
    const currentUserData = await getUserDataById(user.id);
    if (!currentUserData) {
      return NextResponse.json({ error: "No user found" }, { status: 405 });
    }
    const availableItems = await db
      .select()
      .from(items)
      .where(eq(items.userId, currentUserData.id))
      .execute()
      .then((items) => items.map((item) => item.type));
    console.log(availableItems);
    // Group items by type
    const groupedItems = availableItems.reduce(
      (acc, item) => {
        if (acc[item]) {
          acc[item]++;
        } else {
          acc[item] = 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );
    return NextResponse.json({
      itemProducts: [
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
      ],
      availableItems: {
        ...{
          CATCH_ANYWHERE: 0,
          CATCH_AGAIN: 0,
          CAMERA_STABILIZER: 0,
          TRAVEL_FREE: 0,
          TRAVEL_ANYWHERE: 0,
        },
        ...groupedItems,
      },
    });
  });
}
