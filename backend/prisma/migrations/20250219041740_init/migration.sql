-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "oracle_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "uri" TEXT NOT NULL,
    "scryfallUri" TEXT NOT NULL,
    "layout" TEXT NOT NULL,
    "colorIdentity" TEXT[],
    "setId" TEXT NOT NULL,
    "set" TEXT NOT NULL,
    "setName" TEXT NOT NULL,
    "setType" TEXT NOT NULL,
    "setUri" TEXT NOT NULL,
    "setSearchUri" TEXT NOT NULL,
    "scryfallSetUri" TEXT NOT NULL,
    "booster" BOOLEAN NOT NULL,
    "imageUriSmall" TEXT,
    "imageUriNormal" TEXT,
    "imageUriLarge" TEXT,
    "imageUriPng" TEXT,
    "imageUriArtCrop" TEXT,
    "imageUriBorderCrop" TEXT,
    "backImageUriSmall" TEXT,
    "backImageUriNormal" TEXT,
    "backImageUriLarge" TEXT,
    "backImageUriPng" TEXT,
    "backImageUriArtCrop" TEXT,
    "backImageUriBorderCrop" TEXT,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DraftPool" (
    "id" TEXT NOT NULL,
    "draftId" INTEGER NOT NULL,
    "cardId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "DraftPool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Draft" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'created',

    CONSTRAINT "Draft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Drafter" (
    "id" SERIAL NOT NULL,
    "draftId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "draftOrder" INTEGER NOT NULL,

    CONSTRAINT "Drafter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DraftPick" (
    "id" SERIAL NOT NULL,
    "draftId" INTEGER NOT NULL,
    "drafterId" INTEGER NOT NULL,
    "draftPoolId" TEXT NOT NULL,
    "pickNumber" INTEGER NOT NULL,
    "pickedAt" TIMESTAMP(3),

    CONSTRAINT "DraftPick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Card_id_key" ON "Card"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");

-- AddForeignKey
ALTER TABLE "DraftPool" ADD CONSTRAINT "DraftPool_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "Draft"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DraftPool" ADD CONSTRAINT "DraftPool_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Drafter" ADD CONSTRAINT "Drafter_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "Draft"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Drafter" ADD CONSTRAINT "Drafter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DraftPick" ADD CONSTRAINT "DraftPick_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "Draft"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DraftPick" ADD CONSTRAINT "DraftPick_drafterId_fkey" FOREIGN KEY ("drafterId") REFERENCES "Drafter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DraftPick" ADD CONSTRAINT "DraftPick_draftPoolId_fkey" FOREIGN KEY ("draftPoolId") REFERENCES "DraftPool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
