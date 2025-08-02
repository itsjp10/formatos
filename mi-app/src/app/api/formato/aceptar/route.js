import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req) {
  try {
    const userId = cookies().get('userId')?.value

    if (!userId) {
      console.log('❌ Usuario no autenticado')
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { publicLink } = body

    console.log('📨 PublicLink recibido:', publicLink)

    if (!publicLink || typeof publicLink !== 'string') {
      console.log('⚠️ publicLink ausente o inválido')
      return NextResponse.json({ error: 'publicLink requerido' }, { status: 400 })
    }

    const formato = await prisma.formato.findUnique({
      where: { publicLink },
    })

    if (!formato) {
      console.log('❌ Formato no encontrado con ese publicLink')
      return NextResponse.json({ error: 'Formato no encontrado' }, { status: 404 })
    }

    console.log('✅ Formato encontrado:', formato.formatoID)

    const existente = await prisma.formatoUsuario.findUnique({
      where: {
        userId_formatoId: {
          userId,
          formatoId: formato.formatoID,
        },
      },
    })

    if (existente) {
      console.log('⚠️ Ya existe relación FormatoUsuario')
      return NextResponse.json({ error: 'Ya tienes este formato' }, { status: 400 })
    }

    const formatoRecibido = await prisma.formatoUsuario.create({
      data: {
        userId,
        formatoId: formato.formatoID,
        creadoPor: false,
      },
    })

    console.log('✅ Formato vinculado con éxito')
    return NextResponse.json({ success: true, formato: formatoRecibido })
  } catch (err) {
    console.error('❌ Error al aceptar formato:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
