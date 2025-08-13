import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const usuarioId = searchParams.get('usuarioId')

  if (!usuarioId) {
    return NextResponse.json({ error: 'usuarioId es requerido' }, { status: 400 })
  }

  try {
    const relaciones  = await prisma.formatoUsuario.findMany({
      where: {
        userId: usuarioId,
        creadoPor: false
      },
      include: {
        formato: true
      }
    })

    // Extraer solo el formato
    const formatos = relaciones.map(rel => rel.formato)

    return NextResponse.json(formatos)
  } catch (error) {
    console.error('Error cargando formatos compartidos:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(req) {
  const { userId, formatoId } = await req.json()
  if (!userId || !formatoId) {
    return new Response(JSON.stringify({ error: 'userId y formatoId son requeridos' }), { status: 400 })
  }

  await prisma.formatoUsuario.upsert({
    where: { userId_formatoId: { userId, formatoId } },
    update: {},
    create: { userId, formatoId, creadoPor: false }
  })

  const formato = await prisma.formato.findUnique({
    where: { formatoID: formatoId },
    select: { formatoID: true, usuarioId: true, data: true, tipo: true, name: true, publicLink: true }
  })

  if (!formato) {
    return new Response(JSON.stringify({ error: 'Formato no encontrado' }), { status: 404 })
  }

  return Response.json(formato)
}