import prisma from '@/lib/prisma'

export async function PUT(req, context) {
  const { id } = await context.params
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
