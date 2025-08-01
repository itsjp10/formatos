import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verificarToken } from '@/lib/auth'

export async function POST(req) {
  const body = await req.json()
  const token = req.headers.get('authorization')?.split(' ')[1]
  const user = verificarToken(token)

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { formatoID } = body

  try {
    // Puedes clonar o simplemente referenciar el formato original
    const nuevo = await prisma.formato.create({
      data: {
        tipo: 'Recibido',
        name: 'Formato compartido',
        data: '{}', // o puedes copiar data del original si quieres
        usuarioId: user.userID,
        plantillaID: null, // opcional
      },
    })

    return NextResponse.json({ success: true, formato: nuevo })
  } catch (error) {
    return NextResponse.json({ error: 'Error al recibir formato' }, { status: 500 })
  }
}
