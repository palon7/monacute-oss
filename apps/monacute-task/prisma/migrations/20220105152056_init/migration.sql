-- CreateTable
CREATE TABLE "MonacuteName" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(128),
    "used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MonacuteName_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MonacuteName_name_key" ON "MonacuteName"("name");
