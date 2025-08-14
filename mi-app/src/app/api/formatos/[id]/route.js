import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(req, { params }) {
  const { id } = await params
  const body = await req.json()
  const { data, name } = body

  if (!id || (!data && !name)) {
    return new Response(JSON.stringify({ error: 'Se requiere el ID y al menos un campo para actualizar (data o name)' }), {
      status: 400,
    })
  }

  const updateData = {}
  if (data !== undefined) updateData.data = data
  if (name !== undefined) updateData.name = name

  try {
    const formatoActualizado = await prisma.formato.update({
      where: { formatoID: id },
      data: updateData,
    })
    return Response.json(formatoActualizado)
  } catch (err) {
    console.error('Error al actualizar formato:', err)
    return new Response(JSON.stringify({ error: 'Error al actualizar formato' }), { status: 500 })
  }
}

export async function DELETE(req, context) {
  const { id } = await context.params;
  const url = new URL(req.url)
  const isShared = url.searchParams.get('shared') === '1'
  const userId = url.searchParams.get('userId') || undefined

  if (!id) {
    return NextResponse.json({ error: 'Falta el ID del formato a eliminar' }, { status: 400 })
  }

  try {
    if (isShared) {
      if (!userId) {
        return NextResponse.json({ error: 'Falta userId para eliminar formato compartido' }, { status: 400 })
      }

      await prisma.formatoUsuario.delete({
        where: {
          userId_formatoId: {
            userId,
            formatoId: id,
          },
        },
      })

      return NextResponse.json({ success: true, removed: 'shared' }, { status: 200 })
    }

    // PROPIO: primero borra los FormatoUsuario que referencian el formato, luego el Formato.
    await prisma.$transaction(async (tx) => {
      await tx.formatoUsuario.deleteMany({ where: { formatoId: id } })
      await tx.formato.delete({ where: { formatoID: id } })
    })

    return NextResponse.json({ success: true, removed: 'owned' }, { status: 200 })
  } catch (err) {
    console.error('Error al eliminar formato:', err)
    return NextResponse.json({ error: 'Error al eliminar formato' }, { status: 500 })
  }
}