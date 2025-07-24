import prisma from '@/lib/prisma'

export async function PUT(req, { params }) {
  const { id } = params
  const body = await req.json()
  const { data } = body

  if (!id || !data) {
    return new Response(JSON.stringify({ error: 'ID y data son requeridos' }), { status: 400 })
  }

  try {
    // Si formatoID es UUID/string, no uses Number(id)
    const formatoActualizado = await prisma.formato.update({
      where: { formatoID: id },
      data: { data }
    })
    return Response.json(formatoActualizado)
  } catch (err) {
    console.error('Error al actualizar formato:', err)
    return new Response(JSON.stringify({ error: 'Error al actualizar formato' }), { status: 500 })
  }
}
