/*
  Warnings:

  - Made the column `publicLink` on table `Formato` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Formato" ALTER COLUMN "publicLink" SET NOT NULL;
