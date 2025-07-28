// app/api/firmas/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // o '../../lib/prisma' si no usas alias

export async function POST(req) {
  try {
    const body = await req.json();
    const { tipo, imagenUrl, usuarioId, formatoId } = body;

    if (!tipo || !imagenUrl || !usuarioId) {
      return NextResponse.json(
        { error: 'Faltan datos obligatorios' },
        { status: 400 }
      );
    }

    const nuevaFirma = await prisma.firma.create({
      data: {
        tipo,
        imagenUrl,
        usuarioId,
        formatoId: formatoId || null,
      },
    });

    return NextResponse.json(nuevaFirma);
  } catch (error) {
    console.error('❌ Error en POST /api/firmas:', error);
    return NextResponse.json(
      { error: 'Error al guardar firma' },
      { status: 500 }
    );
  }
}
