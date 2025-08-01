import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return new Response(JSON.stringify({ acceso: false }), { status: 401 })

  const userId = session.user.userID
  const { publicLink } = params

  try {
    const formato = await prisma.formato.findUnique({ where: { publicLink } })
    if (!formato) return new Response(JSON.stringify({ acceso: false }), { status: 404 })

    if (formato.usuarioId === userId) {
      return new Response(JSON.stringify({ acceso: true, formatoId: formato.formatoID }))
    }

    const rel = await prisma.formatoUsuario.findFirst({
      where: { userId, formatoId: formato.formatoID },
    })

    if (rel) { 
      return new Response(JSON.stringify({ acceso: true, formatoId: formato.formatoID }))
    }

    return new Response(JSON.stringify({ acceso: false }), { status: 200 })
  } catch (e) {
    return new Response(JSON.stringify({ acceso: false }), { status: 500 })
  }
}
