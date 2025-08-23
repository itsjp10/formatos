-- CreateTable
CREATE TABLE "_FormatosRecibidos" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FormatosRecibidos_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_FormatosRecibidos_B_index" ON "_FormatosRecibidos"("B");

-- AddForeignKey
ALTER TABLE "_FormatosRecibidos" ADD CONSTRAINT "_FormatosRecibidos_A_fkey" FOREIGN KEY ("A") REFERENCES "Formato"("formatoID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FormatosRecibidos" ADD CONSTRAINT "_FormatosRecibidos_B_fkey" FOREIGN KEY ("B") REFERENCES "Usuario"("userID") ON DELETE CASCADE ON UPDATE CASCADE;
