import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req) {
  const session = await getServerSession({ req, ...authOptions })

  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { publicLink } = await req.json()

  try {
    const formato = await prisma.formato.findUnique({
      where: { publicLink },
    })

    if (!formato) {
      return NextResponse.json({ error: 'Formato no encontrado' }, { status: 404 })
    }

    const userId = session.user.userID

    // Verifica si ya fue aceptado antes
    const yaExiste = await prisma.formatoUsuario.findFirst({
      where: {
        userId,
        formatoId: formato.formatoID,
      },
    })

    if (yaExiste) {
      return NextResponse.json({ success: true, mensaje: 'Ya tienes acceso a este formato.' })
    }

    // Crea relación en tabla intermedia
    await prisma.formatoUsuario.create({
      data: {
        userId,
        formatoId: formato.formatoID,
        creadoPor: false,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error al aceptar formato' }, { status: 500 })
  }
}
