// app/api/plantillas/route.js
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma' // Ajusta esta ruta si es diferente

export async function POST(req) {
  try {
    const body = await req.json()
    const { nombre, descripcion, estructura, creadoPorId } = body

    // Verifica que el usuario exista y sea "residente"
    const user = await prisma.usuario.findUnique({
      where: { userID: creadoPorId },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    if (user.role !== 'residente') {
      return NextResponse.json({ error: 'No autorizado para crear plantillas' }, { status: 403 })
    }

    // Crear la plantilla
    const plantilla = await prisma.plantillaFormato.create({
      data: {
        nombre,
        descripcion,
        estructura,
        creadoPorId,
      },
    })

    return NextResponse.json(plantilla, { status: 201 })
  } catch (error) {
    console.error('Error al crear plantilla:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
