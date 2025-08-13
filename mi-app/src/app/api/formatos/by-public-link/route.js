// app/api/formatos/by-public-link/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const publicLink = searchParams.get('publicLink');
  if (!publicLink) {
    return NextResponse.json({ error: 'publicLink requerido' }, { status: 400 });
  }

  const formato = await prisma.formato.findUnique({
    where: { publicLink },
    select: { formatoID: true, usuarioId: true, data: true, tipo: true, name: true },
  });

  if (!formato) {
    return NextResponse.json({ error: 'Formato no encontrado' }, { status: 404 });
  }

  return NextResponse.json(formato);
}
