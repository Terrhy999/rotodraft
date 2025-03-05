import fs from "fs";
import { PrismaClient } from "@prisma/client";
import path from "path";

const prisma = new PrismaClient();

type CardLayout =
  | "normal"
  | "split"
  | "flip"
  | "transform"
  | "modal_dfc"
  | "meld"
  | "leveler"
  | "class"
  | "case"
  | "saga"
  | "adventure"
  | "mutate"
  | "prototype";

type CardColors = "W" | "U" | "B" | "R" | "G";

interface ImageUris {
  small: string;
  normal: string;
  large: string;
  png: string;
  art_crop: string;
  border_crop: string;
}

interface BaseCard {
  id: string;
  oracle_id: string;
  name: string;
  uri: string;
  scryfall_uri: string;
  layout: CardLayout;
  color_identity: CardColors[];
  set_id: string;
  set: string;
  set_name: string;
  set_type: string;
  set_uri: string;
  set_search_uri: string;
  scryfall_set_uri: string;
  card_back_id: string;
  booster: boolean;
}

interface SingleFaceCard extends BaseCard {
  image_uris: ImageUris;
}

interface DualFaceCard extends BaseCard {
  card_faces: {
    image_uris: ImageUris;
  }[];
}

type ScryfallCard = SingleFaceCard | DualFaceCard;

const isDualFaced = (card: ScryfallCard): card is DualFaceCard => {
  const dfcLayout = new Set<CardLayout>(["modal_dfc", "transform"]);
  return dfcLayout.has(card.layout);
};

export interface Card {
  id: string;
  oracle_id: string;
  name: string;
  uri: string;
  scryfallUri: string;
  layout: CardLayout;
  colorIdentity: CardColors[];
  setId: string;
  set: string;
  setName: string;
  setType: string;
  setUri: string;
  setSearchUri: string;
  scryfallSetUri: string;
  booster: boolean;

  imageUriSmall: string | null;
  imageUriNormal: string | null;
  imageUriLarge: string | null;
  imageUriPng: string | null;
  imageUriArtCrop: string | null;
  imageUriBorderCrop: string | null;

  backImageUriSmall: string | null;
  backImageUriNormal: string | null;
  backImageUriLarge: string | null;
  backImageUriPng: string | null;
  backImageUriArtCrop: string | null;
  backImageUriBorderCrop: string | null;
}

export const parseScryfallCards = (filePath: string): Card[] => {
  const allowedLayouts = new Set<CardLayout>([
    "normal",
    "split",
    "flip",
    "transform",
    "modal_dfc",
    "meld",
    "leveler",
    "class",
    "case",
    "saga",
    "adventure",
    "mutate",
    "prototype",
  ]);

  const rawData = fs.readFileSync(filePath, "utf-8");
  const allCards = JSON.parse(rawData) as {
    layout: string;
    booster: boolean;
  }[];

  return allCards
    .filter(
      (card) => allowedLayouts.has(card.layout as CardLayout) && card.booster
    )
    .map((card) => card as ScryfallCard)
    .map((scryfallCard): Card => {
      const card: Card = {
        id: scryfallCard.id,
        oracle_id: scryfallCard.oracle_id,
        name: scryfallCard.name,
        uri: scryfallCard.uri,
        scryfallUri: scryfallCard.scryfall_uri,
        layout: scryfallCard.layout,
        colorIdentity: scryfallCard.color_identity,
        setId: scryfallCard.set_id,
        set: scryfallCard.set,
        setName: scryfallCard.set_name,
        setType: scryfallCard.set_type,
        setUri: scryfallCard.set_uri,
        setSearchUri: scryfallCard.set_search_uri,
        scryfallSetUri: scryfallCard.scryfall_set_uri,
        booster: scryfallCard.booster,

        imageUriSmall:
          (isDualFaced(scryfallCard)
            ? scryfallCard.card_faces[0]?.image_uris.small
            : scryfallCard.image_uris.small) ?? null,
        imageUriNormal:
          (isDualFaced(scryfallCard)
            ? scryfallCard.card_faces[0]?.image_uris.normal
            : scryfallCard.image_uris.normal) ?? null,
        imageUriLarge:
          (isDualFaced(scryfallCard)
            ? scryfallCard.card_faces[0]?.image_uris.large
            : scryfallCard.image_uris.large) ?? null,
        imageUriPng:
          (isDualFaced(scryfallCard)
            ? scryfallCard.card_faces[0]?.image_uris.png
            : scryfallCard.image_uris.png) ?? null,
        imageUriArtCrop:
          (isDualFaced(scryfallCard)
            ? scryfallCard.card_faces[0]?.image_uris.art_crop
            : scryfallCard.image_uris.art_crop) ?? null,
        imageUriBorderCrop:
          (isDualFaced(scryfallCard)
            ? scryfallCard.card_faces[0]?.image_uris.border_crop
            : scryfallCard.image_uris.border_crop) ?? null,

        backImageUriSmall:
          (isDualFaced(scryfallCard)
            ? scryfallCard.card_faces[1]?.image_uris.small
            : null) ?? null,
        backImageUriNormal:
          (isDualFaced(scryfallCard)
            ? scryfallCard.card_faces[1]?.image_uris.normal
            : null) ?? null,
        backImageUriLarge:
          (isDualFaced(scryfallCard)
            ? scryfallCard.card_faces[1]?.image_uris.large
            : null) ?? null,
        backImageUriPng:
          (isDualFaced(scryfallCard)
            ? scryfallCard.card_faces[1]?.image_uris.png
            : null) ?? null,
        backImageUriArtCrop:
          (isDualFaced(scryfallCard)
            ? scryfallCard.card_faces[1]?.image_uris.art_crop
            : null) ?? null,
        backImageUriBorderCrop:
          (isDualFaced(scryfallCard)
            ? scryfallCard.card_faces[1]?.image_uris.border_crop
            : null) ?? null,
      };
      return card;
    });
};

const addCardsToDatabase = async () => {
  try {
    const databasePath = path.join(
      import.meta.dirname,
      "../../database/default-cards-20250215101015.json"
    );
    const cards = parseScryfallCards(databasePath);

    const BATCH_SIZE = 100;
    for (let i = 0; i < cards.length; i += BATCH_SIZE) {
      const batch = cards.slice(i, i + BATCH_SIZE);

      await prisma.card.createMany({
        data: batch,
        skipDuplicates: true,
      });

      console.log(
        `Inserted batch ${(i / BATCH_SIZE + 1).toString()} of ${Math.ceil(cards.length / BATCH_SIZE).toString()}`
      );
    }

    console.log("Database seeding complete!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await prisma.$disconnect();
  }
};
await addCardsToDatabase();
