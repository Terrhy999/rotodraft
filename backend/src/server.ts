import Fastify from "fastify";
import cors from "@fastify/cors";
import { Drafter, PrismaClient } from "@prisma/client";

const fastify = Fastify({
  logger: true,
});

fastify.register(cors, {
  origin: true,
});

const prisma: PrismaClient = new PrismaClient();

// Create a user
fastify.post("/users", async (request, reply) => {
  const { name, discordId } = request.body as {
    name: string;
    discordId: string;
  };

  try {
    const user = await prisma.user.create({ data: { name, discordId } });
    return await reply.status(201).send(user);
  } catch (error: unknown) {
    console.error("Error creating user: ", error);
    return reply
      .status(400)
      .send({ error: "User already exists or invalid input." });
  }
});

// Fetch a user
fastify.get<{ Params: { userName: string } }>(
  "/user/:userName",
  async (request, reply) => {
    const userName = request.params.userName;

    const userId = await prisma.user.findFirst({
      where: { name: userName },
    });

    return reply.status(200).send(userId);
  }
);

// Create a draft
fastify.post("/drafts", async (request, reply) => {
  const { name } = request.body as { name: string };

  const draft = await prisma.draft.create({
    data: { name },
  });

  return reply.status(201).send(draft);
});

// Fetch a draft by user
fastify.get<{ Params: { userId: number } }>(
  "/drafts/:userId",
  async (request, reply) => {
    const userId = Number(request.params.userId);

    const drafts = await prisma.draft.findMany({
      where: {
        drafters: {
          some: {
            userId: userId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    return reply.status(200).send(drafts);
  }
);

// Add a user to a draft
fastify.post<{
  Params: { draftId: string };
  Body: { userId: number };
}>("/drafts/:draftId/users", async (request, reply) => {
  const draftId = Number(request.params.draftId);
  const { userId } = request.body;

  try {
    const drafter = await prisma.drafter.create({
      data: { draftId, userId, draftOrder: 0 },
    });

    return await reply.status(201).send(drafter);
  } catch (error) {
    console.error("Error adding user to draft: ", error);
    return reply.status(400).send({ error: "Failed to add user to draft." });
  }
});

// Set draft order
fastify.post<{
  Params: { draftId: string };
}>("/drafts/:draftId/order", async (request, reply) => {
  const draftId = Number(request.params.draftId);

  try {
    const drafters = await prisma.drafter.findMany({
      where: { draftId },
    });

    if (drafters.length === 0) {
      return await reply
        .status(404)
        .send({ error: "No drafters found for this draft" });
    }

    const shuffledDrafters = shuffleArray(drafters);
    const updates = shuffledDrafters.map((drafter, index) =>
      prisma.drafter.updateMany({
        where: { id: drafter.id },
        data: { draftOrder: index + 1 },
      })
    );

    await prisma.$transaction(updates);

    return await reply
      .status(200)
      .send({ message: "Draft order set successfully" });
  } catch (error) {
    console.error("Error setting draft order", error);
    return reply.status(500).send({ error: "Failed to set draft order" });
  }
});

const shuffleArray = (array: Drafter[]): Drafter[] => {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    const temp = shuffledArray[i];
    if (temp) {
      shuffledArray[i] = shuffledArray[j] ?? temp;
      shuffledArray[j] = temp;
    }
  }
  return shuffledArray;
};

// Make a draft pick
fastify.post<{
  Params: { draftId: string };
  Body: { userId: number; draftPoolId: string };
}>("/drafts/:draftId/pick", async (request, reply) => {
  const draftId = Number(request.params.draftId);
  const { userId, draftPoolId } = request.body;

  try {
    const drafter = await prisma.drafter.findFirst({
      where: { draftId, userId },
    });

    if (!drafter)
      return await reply.status(404).send({ error: "user not in draft." });

    const totalPicks = await prisma.draftPick.count({ where: { draftId } });
    const pickNumber = totalPicks + 1;

    const draftPick = await prisma.draftPick.create({
      data: {
        draftId,
        drafterId: drafter.id,
        draftPoolId,
        pickNumber,
      },
    });

    return await reply.status(201).send(draftPick);
  } catch (error) {
    console.error("Error making draft pick: ", error);
    return reply.status(400).send({ error: "Failed to make draft pick." });
  }
});

// Add set to draft pool
fastify.post<{
  Params: { draftId: string };
  Body: { setId: string };
}>("/drafts/:draftId/cardpool", async (request, reply) => {
  const draftId = Number(request.params.draftId);
  const { setId } = request.body;

  try {
    // Step 1: Find all cards in the selected set
    const cardsInSet = await prisma.card.findMany({
      where: { setId: setId },
    });

    if (cardsInSet.length === 0) {
      return await reply
        .status(404)
        .send({ error: "No cards found for this set." });
    }

    // Step 2: Create `draftPool` records for all cards in this set
    const cardPoolEntries = cardsInSet.map((card) => ({
      draftId,
      cardId: card.id,
      count: 1, // Default count to 1 (can be adjusted later)
    }));

    await prisma.draftPool.createMany({
      data: cardPoolEntries,
      skipDuplicates: true, // Prevent duplicates
    });

    return await reply
      .status(201)
      .send({ message: "Set added to draft.", addedCards: cardsInSet.length });
  } catch (error) {
    console.error("Error adding set to draft: ", error);
    return reply.status(500).send({ error: "Failed to add set to draft." });
  }
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
    console.log("Server is running on http://localhost:3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
await start();
