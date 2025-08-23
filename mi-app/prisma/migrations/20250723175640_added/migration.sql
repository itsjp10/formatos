/*
  Warnings:

  - Added the required column `name` to the `Formato` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Formato" ADD COLUMN     "name" TEXT NOT NULL;
