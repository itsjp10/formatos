// src/app/api/firmas/route.js
import prisma from '@/lib/prisma'

export async function POST(req) {
  const data = await req.json()
  const { tipo, usuarioId, formatoId, imagenUrl } = data

  try {
    const firma = await prisma.firma.create({
      data: {
        tipo,
        usuario: { connect: { userID: usuarioId } },
        formato: { connect: { formatoID: formatoId } },
        imagenUrl,
      },
    })

    return Response.json(firma)
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Error al crear firma' }), {
      status: 500,
    })
  }
}

export async function GET() {
  try {
    const firmas = await prisma.firma.findMany()
    return Response.json(firmas)
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Error al obtener firmas' }), {
      status: 500,
    })
  }
}
