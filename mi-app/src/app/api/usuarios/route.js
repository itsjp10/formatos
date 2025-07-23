// src/app/api/usuarios/route.js
import prisma from '@/lib/prisma'

export async function POST(req) {
  const data = await req.json()
  const { name, username, password, role } = data

  try {
    const usuario = await prisma.usuario.create({
      data: { name, username, password, role },
    })
    return Response.json(usuario)
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Error al crear usuario' }), {
      status: 500,
    })
  }
}

export async function GET() {
  try {
    const usuarios = await prisma.usuario.findMany()
    return Response.json(usuarios)
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Error al obtener usuarios' }), {
      status: 500,
    })
  }
}
// This file handles the API routes for user management, allowing creation and retrieval of users.