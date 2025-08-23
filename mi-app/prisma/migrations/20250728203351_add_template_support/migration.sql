-- DropForeignKey
ALTER TABLE "Firma" DROP CONSTRAINT "Firma_formatoId_fkey";

-- AlterTable
ALTER TABLE "Firma" ALTER COLUMN "formatoId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Firma" ADD CONSTRAINT "Firma_formatoId_fkey" FOREIGN KEY ("formatoId") REFERENCES "Formato"("formatoID") ON DELETE SET NULL ON UPDATE CASCADE;
