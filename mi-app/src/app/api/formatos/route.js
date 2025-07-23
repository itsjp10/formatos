// src/app/api/formatos/route.js
import prisma from '@/lib/prisma'

export async function POST(req) {
  const data = await req.json()
  const { tipo, data: formData, usuarioId } = data

  try {
    const formato = await prisma.formato.create({
      data: {
        tipo,
        data: formData,
        ownerID: {
          connect: { userID: usuarioId }
        }
      }
    })
    return Response.json(formato)
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Error al crear formato' }), {
      status: 500,
    })
  }
}

export async function GET() {
  try {
    const formatos = await prisma.formato.findMany()
    return Response.json(formatos)
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Error al obtener formatos' }), {
      status: 500,
    })
  }
}
