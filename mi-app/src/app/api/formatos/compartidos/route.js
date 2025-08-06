import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const usuarioId = searchParams.get('usuarioId')

  if (!usuarioId) {
    return NextResponse.json({ error: 'usuarioId es requerido' }, { status: 400 })
  }

  try {
    const formatos = await prisma.formatoUsuario.findMany({
      where: {
        userId: usuarioId,
        creadoPor: false
      },
      include: {
        formato: true
      }
    })

    return NextResponse.json(formatos)
  } catch (error) {
    console.error('Error cargando formatos compartidos:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}