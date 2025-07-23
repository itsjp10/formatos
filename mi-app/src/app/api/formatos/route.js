// src/app/api/formatos/route.js
import prisma from '@/lib/prisma'

export async function POST(req) {
  const body = await req.json()
  const { tipo, data: formData, name, usuarioId } = body

  try {
    const nuevoFormato = await prisma.formato.create({
      data: {
        tipo,
        data: formData,
        name,
        usuarioId, // Prisma relaciona automáticamente con Usuario
      },
    })

    return Response.json(nuevoFormato)
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Error al crear el formato' }), {
      status: 500,
    })
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const usuarioId = searchParams.get('usuarioId')

  if (!usuarioId) {
    return new Response(JSON.stringify({ error: 'usuarioId es requerido' }), {
      status: 400,
    })
  }

  try {
    const formatos = await prisma.formato.findMany({
      where: {
        ownerID: {
          userID: usuarioId
        }
      }
    })
    return Response.json(formatos)
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Error al obtener formatos' }), {
      status: 500,
    })
  }
}
