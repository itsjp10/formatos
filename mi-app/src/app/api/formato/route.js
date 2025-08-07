import prisma from '@/lib/prisma'

export async function GET(req) {
    const { searchParams } = new URL(req.url)
    const formatoID = searchParams.get('formatoID')

    if (!formatoID) {
        return new Response(JSON.stringify({ error: 'formatoID es requerido' }), {
            status: 400,
        })
    }

    try {
        const formato = await prisma.formato.findUnique({
            where: {
                formatoID, // busca por ID único
            }
        })

        if (!formato) {
            return new Response(JSON.stringify({ error: 'Formato no encontrado' }), {
                status: 404,
            })
        }

        return new Response(JSON.stringify(formato), {
            status: 200,
        })
    } catch (err) {
        console.error('Error al obtener formato:', err)
        return new Response(JSON.stringify({ error: 'Error al obtener formato' }), {
            status: 500,
        })
    }
}
