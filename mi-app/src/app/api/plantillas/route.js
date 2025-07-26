// app/api/plantillas/route.js
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req) {
  try {
    const body = await req.json();
    const { nombre, descripcion, estructura, numSubfilas, creadoPorId } = body;

    if (!creadoPorId) {
      return new Response(JSON.stringify({ error: 'Falta creadoPorId' }), { status: 400 });
    }

    const plantilla = await prisma.plantillaFormato.create({
      data: {
        nombre,
        descripcion,
        estructura,
        numSubfilas,
        creadoPorId,
      },
    });

    return new Response(JSON.stringify(plantilla), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al crear plantilla:', error);
    return new Response(JSON.stringify({ error: 'Error al crear plantilla' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET() {
  try {
    const plantillas = await prisma.plantillaFormato.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return new Response(JSON.stringify(plantillas), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al obtener plantillas:', error);
    return new Response(JSON.stringify({ error: 'Error del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
