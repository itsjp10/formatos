-- AlterTable
ALTER TABLE "Formato" ADD COLUMN     "templateID" TEXT;

-- CreateTable
CREATE TABLE "FormatoTemplate" (
    "templateID" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormatoTemplate_pkey" PRIMARY KEY ("templateID")
);

-- CreateTable
CREATE TABLE "CampoTemplate" (
    "campoID" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "templateID" TEXT NOT NULL,

    CONSTRAINT "CampoTemplate_pkey" PRIMARY KEY ("campoID")
);

-- AddForeignKey
ALTER TABLE "Formato" ADD CONSTRAINT "Formato_templateID_fkey" FOREIGN KEY ("templateID") REFERENCES "FormatoTemplate"("templateID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampoTemplate" ADD CONSTRAINT "CampoTemplate_templateID_fkey" FOREIGN KEY ("templateID") REFERENCES "FormatoTemplate"("templateID") ON DELETE RESTRICT ON UPDATE CASCADE;
