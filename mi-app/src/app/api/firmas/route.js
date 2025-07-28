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

// GET: Obtener todas las firmas de un usuario
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const usuarioId = searchParams.get('usuarioId');

    if (!usuarioId) {
      return NextResponse.json(
        { error: 'Falta el parámetro usuarioId' },
        { status: 400 }
      );
    }

    const firmas = await prisma.firma.findMany({
      where: {
        usuario: {
          userID: usuarioId
        }
      }
    });

    return NextResponse.json(firmas);
  } catch (error) {
    console.error('❌ Error en GET /api/firmas:', error);
    return NextResponse.json(
      { error: 'Error al obtener firmas' },
      { status: 500 }
    );
  }
}
