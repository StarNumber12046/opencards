import { cookies } from "next/headers";
import { db } from "~/server/db";
import { captures, cards, userData, users } from "~/server/db/schema";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { Suspense } from "react";
import Link from "next/link";
import type { Assets } from "./assets";
import { getCardStats } from "~/server/queries/user";
import { CardComponent } from "./card";
import type { ModelsFile } from "./models";
import { Skeleton } from "~/components/ui/skeleton";

async function Deck({ userDataId }: { userDataId: string }) {
  const modelsFile = await fetch("https://api.skycards.oldapes.com/models", {
    cache: "force-cache",
    next: { revalidate: false },
  });
  const modelsIndexFile = await fetch(
    "https://cdn.skycards.oldapes.com/assets/index.json",
    {
      cache: "force-cache",
      next: { revalidate: false },
    },
  );
  const models = (await modelsFile.json()) as ModelsFile;
  const modelsIndex = (await modelsIndexFile.json()) as Assets;
  const rows = await db
    .select({
      card: cards,
      capture: captures,
    })
    .from(cards)
    .leftJoin(captures, eq(captures.cardId, cards.id))
    .where(eq(cards.userId, userDataId))
    .execute();
  const userCards = Object.values(
    rows.reduce(
      (acc, { card, capture }) => {
        acc[card.id] ??= { card, captures: [] };
        if (capture) {
          acc[card.id]!.captures.push(capture);
        }
        return acc;
      },
      {} as Record<
        string,
        {
          card: typeof cards.$inferSelect;
          captures: (typeof captures.$inferSelect)[];
        }
      >,
    ),
  ).sort((a, b) => getCardStats(b.captures).xp - getCardStats(a.captures).xp);
  return (
    <div className="flex flex-wrap gap-4 justify-center bg-black">
      {userCards.map(async ({ card, captures }) => {
        return (
          <CardComponent
            captures={captures}
            card={card}
            key={card.id}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            modelsFile={models}
            modelsIndexFile={modelsIndex}
          />
        );
      })}
    </div>
  );
}
export default async function DeckPage() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("authToken");
  if (!authToken) {
    redirect("/app/login");
  }
  const [user] = await db
    .select({
      user: users,
      data: userData,
    })
    .from(users)
    .leftJoin(userData, eq(userData.userId, users.id))
    .where(eq(users.token, authToken.value))
    .execute();
  if (!user?.data) {
    return (
      <div>
        User not found
        <Link href="/app/login">Login</Link>
      </div>
    );
  }
  return (
    <div>
      <Suspense
        fallback={
          <div className="text-white flex flex-wrap w-full gap-4 items-center justify-center p-6 md:p-10">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
              return <Skeleton key={i} className="w-xs h-[32rem] rounded-md" />;
            })}
          </div>
        }
      >
        <Deck userDataId={user.data.id} />
      </Suspense>
    </div>
  );
}
