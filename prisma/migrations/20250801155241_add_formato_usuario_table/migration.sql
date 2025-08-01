-- CreateTable
CREATE TABLE "FormatoUsuario" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "formatoId" TEXT NOT NULL,
    "creadoPor" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FormatoUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FormatoUsuario_userId_formatoId_key" ON "FormatoUsuario"("userId", "formatoId");

-- AddForeignKey
ALTER TABLE "FormatoUsuario" ADD CONSTRAINT "FormatoUsuario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Usuario"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormatoUsuario" ADD CONSTRAINT "FormatoUsuario_formatoId_fkey" FOREIGN KEY ("formatoId") REFERENCES "Formato"("formatoID") ON DELETE RESTRICT ON UPDATE CASCADE;
