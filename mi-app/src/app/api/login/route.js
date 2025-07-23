import prisma from '@/lib/prisma'

export async function POST(req) {
  try {
    const body = await req.json()
    const { username, password } = body

    const user = await prisma.usuario.findUnique({
      where: { username },
    })

    if (!user || user.password !== password) {
      return Response.json({ message: 'Credenciales inválidas' }, { status: 401 })
    }

    // No retornamos la contraseña
    const { password: _, ...userWithoutPassword } = user

    return Response.json(userWithoutPassword)
  } catch (error) {
    console.error('Login error:', error)
    return Response.json({ message: 'Error interno' }, { status: 500 })
  }
}
