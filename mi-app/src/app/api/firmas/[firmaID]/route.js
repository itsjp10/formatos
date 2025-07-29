import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(req, { params }) {
  const { firmaID } = params;

  try {
    const firmaEliminada = await prisma.firma.delete({
      where: {
        firmaID: firmaID,
      },
    });

    return NextResponse.json({ success: true, firmaEliminada });
  } catch (error) {
    console.error('❌ Error al eliminar firma con ID:', firmaID, error);
    return NextResponse.json(
      { error: 'Error al eliminar la firma', detalle: error.message },
      { status: 500 }
    );
  }
}
