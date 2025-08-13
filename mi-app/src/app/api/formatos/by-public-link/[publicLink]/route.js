import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(_req, { params }) {
  let { publicLink } = params;                   // 👈 viene de la carpeta [publicLink]
  if (!publicLink) {
    return NextResponse.json({ error: 'publicLink requerido' }, { status: 400 });
  }

  publicLink = decodeURIComponent(publicLink).trim();

  const formato = await prisma.formato.findUnique({
    where: { publicLink },                       // publicLink es @unique en tu schema
    select: {
      formatoID: true,
      usuarioId: true,
      data: true,
      tipo: true,
      name: true,
      publicLink: true,
    },
  });

  if (!formato) {
    return NextResponse.json({ error: 'Formato no encontrado' }, { status: 404 });
  }

  return NextResponse.json(formato);
}