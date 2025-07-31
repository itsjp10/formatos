import prisma from '@/lib/prisma'

export async function PUT(req, { params }) {
  const { id } = params
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

export async function DELETE(req, { params }) {
  const { id } = params;

  if (!id) {
    return new Response(JSON.stringify({ error: 'Falta el ID del formato a eliminar' }), { status: 400 })
  }

  try {
    await prisma.formato.delete({ 
      where: { formatoID: id },
    })

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (err) {
    console.error('Error al eliminar formato:', err)
    return new Response(JSON.stringify({ error: 'Error al eliminar formato' }), { status: 500 })
  }
}
