/*
  Warnings:

  - A unique constraint covering the columns `[publicLink]` on the table `Formato` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Formato" ADD COLUMN     "publicLink" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Formato_publicLink_key" ON "Formato"("publicLink");
