-- CreateTable
CREATE TABLE "Usuario" (
    "userID" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("userID")
);

-- CreateTable
CREATE TABLE "Formato" (
    "formatoID" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "Formato_pkey" PRIMARY KEY ("formatoID")
);

-- CreateTable
CREATE TABLE "Firma" (
    "firmaID" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "imagenUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT NOT NULL,
    "formatoId" TEXT NOT NULL,

    CONSTRAINT "Firma_pkey" PRIMARY KEY ("firmaID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_username_key" ON "Usuario"("username");

-- AddForeignKey
ALTER TABLE "Formato" ADD CONSTRAINT "Formato_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Firma" ADD CONSTRAINT "Firma_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Firma" ADD CONSTRAINT "Firma_formatoId_fkey" FOREIGN KEY ("formatoId") REFERENCES "Formato"("formatoID") ON DELETE RESTRICT ON UPDATE CASCADE;
