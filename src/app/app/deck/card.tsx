"use client";

import { useInView } from "react-intersection-observer";
import Image from "next/image";

import React from "react";
import { CardCategory, type ModelsFile, type Row } from "./models";
import type { Capture } from "~/types/user";
import type { Assets } from "./assets";
import { FaCamera, FaCloud } from "react-icons/fa";

function getCardStats(captures: Capture[]) {
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

function getCardTextColor(xp: number) {
  if (xp >= 50000) {
    return "text-[#896a1c]";
  }
  if (xp >= 15000) {
    return "text-neutral-500";
  }
  return "text-black";
}

function getCardOuterClass(glow: boolean, xp: number) {
  if (glow) {
    return "bg-[linear-gradient(to_bottom_right,#f2725d,#fccf4b,#ffff50,#aff7b6,#93ecf8,#ddaaff,#ffaaff)]";
  }
  if (xp >= 50000) {
    return "bg-gradient-to-tl from-[#fccf4b] to-yellow-200";
  }
  if (xp >= 15000) {
    return "bg-gradient-to-tl from-gray-600 to-gray-200";
  }
  return "bg-white";
}

function getLowerTextColor(xp: number) {
  if (xp >= 50000) {
    return "text-white";
  }
  if (xp >= 15000) {
    return "text-white";
  }
  return "text-black";
}

function getCardInnerClass(xp: number) {
  if (xp >= 50000) {
    return "bg-gradient-to-tl from-yellow-100 to-white";
  }
  if (xp >= 15000) {
    // Silver color
    return "bg-gradient-to-tl from-gray-300 to-gray-200";
  }
  // Paper color
  return "bg-white";
}

function getRarityImage(model: string, modelsFile: ModelsFile) {
  const modelRow = modelsFile.rows.find((row) => row.id === model);
  if (!modelRow) {
    return null;
  }
  switch (modelRow.cardCategory) {
    case CardCategory.Common:
      return "https://yq6gb3kpv5.ufs.sh/f/7HneIh2oDecxm13J5SG38OlXB1hi7m9ExStQuPTkD2UKojFw";
    case CardCategory.Uncommon:
      return "https://yq6gb3kpv5.ufs.sh/f/7HneIh2oDecxB39unl5oC7VgWRy82XJ5iSanLETYAQ4pUDeK";
    case CardCategory.Rare:
      return "https://yq6gb3kpv5.ufs.sh/f/7HneIh2oDecx1OGWnsiCad2wefoylF3rOHvVt0EjkXTLGZgx";
    case CardCategory.Scarce:
      return "https://yq6gb3kpv5.ufs.sh/f/7HneIh2oDecxTYe5OFUCx9WHfc460FsrJmqIvMBuYK5RaV2p";
    case CardCategory.Ultra:
      return "https://yq6gb3kpv5.ufs.sh/f/7HneIh2oDecxQbe0sv8dcwmZ8vrqkaYjpWE6PFN45SDUoeKG";
    case CardCategory.Fantasy:
    case CardCategory.Historical:
      return "https://yq6gb3kpv5.ufs.sh/f/7HneIh2oDecxVupVuS4vOQ2lxG9tfIPH7Z3uCoL0rsKyFbg4";
  }
  return null;
}

function getAircraftDetails(aircraftId: string, modelsFile: ModelsFile) {
  const modelRow = modelsFile.rows.find((row) => row.id === aircraftId);
  if (!modelRow) {
    return null;
  }
  console.log(modelRow);
  return { ...modelRow, manufacturer: modelRow.manufacturer ?? "Unknown" };
}

function getAircraftImage(
  aircraftId: string,
  tier: "gold" | "silver" | "paper",
  modelsFile: ModelsFile,
  modelsIndexFile: Assets,
) {
  if (!modelsIndexFile.models.images[tier][aircraftId + "_lg.png"]) {
    const modelRow = modelsFile.rows.find((row) => row.id === aircraftId);
    if (!modelRow) {
      return `https://cdn.skycards.oldapes.com/assets/models/images/${tier}/${aircraftId}_lg.png`;
    }
    if (modelRow.images) {
      return `https://cdn.skycards.oldapes.com/assets/models/images/${tier}/${modelRow.images[0]}_lg.png`;
    }
    return `https://cdn.skycards.oldapes.com/assets/models/images/${tier}/${aircraftId}_lg.png`;
  }
  return `https://cdn.skycards.oldapes.com/assets/models/images/${tier}/${aircraftId}_lg.png`;
}

function formatTier(xp: number) {
  if (xp < 15000) return "paper";
  if (xp < 50000) return "silver";
  return "gold";
}

function getHeaderColor(cardCategory: CardCategory) {
  switch (cardCategory) {
    case CardCategory.Common:
      return "#4883a8";
    case CardCategory.Fantasy:
      return "#75232f";
    case CardCategory.Historical:
      return "#75232f";
    case CardCategory.Rare:
      return "#ad6422";
    case CardCategory.Scarce:
      return "#a68e5e";
    case CardCategory.Ultra:
      return "#a86a88";
    case CardCategory.Uncommon:
      return "#247251";
  }
}

export function CardComponent({
  card,
  captures,
  modelsFile,
  modelsIndexFile,
}: {
  card: { id: string; aircraftId: string };
  captures: Capture[];
  modelsFile: ModelsFile;
  modelsIndexFile: Assets;
}) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0 });
  const { glow, xp, cloudiness, coverage } = getCardStats(captures);

  const [aircraftDetails, setAircraftDetails] = React.useState<Row | null>(
    null,
  );

  React.useEffect(() => {
    if (inView && !aircraftDetails) {
      setAircraftDetails(
        getAircraftDetails(card.aircraftId, modelsFile) ?? null,
      );
      console.log(aircraftDetails);
    }
  }, [inView, aircraftDetails]);

  return (
    <div
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ref={ref}
      className={
        "flex flex-col rounded-3xl p-2 bg-gradient-to-br w-xs font-flightdeck-bold " +
        getCardOuterClass(glow, xp)
      }
    >
      <div
        className={`flex flex-col items-center rounded-2xl p-4 min-h-[32rem] h-full ${getCardInnerClass(xp)}`}
      >
        <Image
          loader={(_props) => {
            return (
              getRarityImage(card.aircraftId, modelsFile) ??
              "https://yq6gb3kpv5.ufs.sh/f/7HneIh2oDecx1OGWnsiCad2wefoylF3rOHvVt0EjkXTLGZgx"
            );
          }}
          src={card.aircraftId}
          alt={card.aircraftId}
          width={500}
          height={150}
          style={{
            maxWidth: "100%",
            height: "auto",
          }}
        />

        <Image
          loader={(_props) =>
            getAircraftImage(
              card.aircraftId,
              formatTier(xp),
              modelsFile,
              modelsIndexFile,
            )
          }
          src={card.aircraftId + ".png"}
          alt={card.aircraftId}
          width={250}
          className="-top-16 relative"
          height={50}
          style={{
            maxWidth: "100%",
            height: "auto",
            objectFit: "cover",
          }}
        />

        <div className="-mt-28 relative">
          <h1
            className={`text-2xl font-bold text-center text-shadow-sm text-[${getHeaderColor((aircraftDetails?.cardCategory ?? "common") as CardCategory)}]`}
            style={{
              color: getHeaderColor(
                (aircraftDetails?.cardCategory ?? "common") as CardCategory,
              ),
            }}
          >
            {aircraftDetails?.manufacturer} {aircraftDetails?.name}
            <div
              className={"mt-4 grid grid-cols-2 gap-2 " + getCardTextColor(xp)}
            >
              <div className="flex flex-col gap-1">
                <h1 className="text-4xl font-bold text-center text-shadow-sm ">
                  {aircraftDetails?.firstFlight}
                </h1>
                <h2 className="text-sm">FIRST FLIGHT</h2>
              </div>
              <div className="flex flex-col gap-1">
                <h1 className="text-4xl font-bold text-center text-shadow-sm ">
                  {(aircraftDetails?.rareness ?? 0) / 100}
                </h1>
                <h2 className="text-sm">RARITY</h2>
              </div>
              <div className="flex flex-col gap-1">
                <h1 className="text-4xl font-bold text-center text-shadow-sm ">
                  {aircraftDetails?.wingspan ?? 0}
                </h1>
                <h2 className="text-sm">WINGSPAN, M</h2>
              </div>
              <div className="flex flex-col gap-1">
                <h1 className="text-4xl font-bold text-center text-shadow-sm ">
                  {aircraftDetails?.maxSpeed ?? 0}
                </h1>
                <h2 className="text-sm">SPEED, KT</h2>
              </div>
              <div className="flex flex-col gap-1">
                <h1 className="text-4xl font-bold text-center text-shadow-sm ">
                  {aircraftDetails?.seats ?? 0}
                </h1>
                <h2 className="text-sm">SEATS</h2>
              </div>
              <div className="flex flex-col gap-1">
                <h1 className="text-4xl font-bold text-center text-shadow-sm ">
                  {(aircraftDetails?.mtow ?? 0) / 1000}
                </h1>
                <h2 className="text-sm">WEIGHT, T</h2>
              </div>
            </div>
          </h1>
        </div>
      </div>
      <div
        className={
          "flex flex-row w-full items-center content-center gap-2 py-0.5 px-2 justify-center " +
          getLowerTextColor(xp)
        }
      >
        <p>{formatTier(xp).toUpperCase()}</p>
        <p>{xp} XP</p>
        <p className="inline-flex gap-2 items-center justify-center">
          <FaCloud /> {Math.round(coverage)}%
        </p>
        <p className="inline-flex gap-2 items-center justify-center">
          <FaCamera /> {Math.round(cloudiness)}%
        </p>
      </div>
    </div>
  );
}
