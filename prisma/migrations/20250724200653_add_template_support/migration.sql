/*
  Warnings:

  - You are about to drop the column `templateID` on the `Formato` table. All the data in the column will be lost.
  - You are about to drop the `CampoTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FormatoTemplate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CampoTemplate" DROP CONSTRAINT "CampoTemplate_templateID_fkey";

-- DropForeignKey
ALTER TABLE "Formato" DROP CONSTRAINT "Formato_templateID_fkey";

-- AlterTable
ALTER TABLE "Formato" DROP COLUMN "templateID",
ADD COLUMN     "plantillaID" TEXT;

-- DropTable
DROP TABLE "CampoTemplate";

-- DropTable
DROP TABLE "FormatoTemplate";

-- CreateTable
CREATE TABLE "PlantillaFormato" (
    "plantillaID" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "estructura" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creadoPorId" TEXT NOT NULL,

    CONSTRAINT "PlantillaFormato_pkey" PRIMARY KEY ("plantillaID")
);

-- AddForeignKey
ALTER TABLE "Formato" ADD CONSTRAINT "Formato_plantillaID_fkey" FOREIGN KEY ("plantillaID") REFERENCES "PlantillaFormato"("plantillaID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantillaFormato" ADD CONSTRAINT "PlantillaFormato_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;
