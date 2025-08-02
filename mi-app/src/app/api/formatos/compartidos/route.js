import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const usuarioId = searchParams.get('usuarioId')

  if (!usuarioId) {
    return NextResponse.json({ error: 'usuarioId es requerido' }, { status: 400 })
  }

  try {
    const formatosCompartidos = await prisma.formatoUsuario.findMany({
      where: {
        userId: usuarioId,
        creadoPor: false, // solo los que le compartieron
      },
      include: {
        formato: true, // trae los datos del formato
      },
    })

    const soloFormatos = formatosCompartidos.map((f) => f.formato)

    return NextResponse.json(soloFormatos)
  } catch (err) {
    console.error('❌ Error al obtener formatos compartidos:', err)
    return NextResponse.json({ error: 'Error al obtener formatos compartidos' }, { status: 500 })
  }
}
