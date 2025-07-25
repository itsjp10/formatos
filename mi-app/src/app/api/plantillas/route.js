import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user?.email) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const { nombre, descripcion, estructura, numSubfilas } = req.body;

    try {
      const user = await prisma.usuario.findUnique({
        where: { email: session.user.email },
      });

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      const plantilla = await prisma.plantillaFormato.create({
        data: {
          nombre,
          descripcion,
          estructura,
          numSubfilas,
          creadoPorId: user.id,
        },
      });

      return res.status(201).json(plantilla);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error al crear plantilla' });
    }
  } else {
    return res.status(405).json({ message: 'Método no permitido' });
  }
}

//funcion para obtener todas las plantillas, esto se hace cuando el usuario quiere crear formato nuevo
export async function GET() {
  try {
    const plantillas = await prisma.plantillaFormato.findMany({
      orderBy: { createdAt: 'desc' } // opcional: para que aparezcan las más recientes primero
    })

    return new Response(JSON.stringify(plantillas), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error al obtener plantillas:', error)
    return new Response(JSON.stringify({ error: 'Error del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
