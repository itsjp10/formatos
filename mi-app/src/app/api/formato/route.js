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
            where: { formatoID }
        })

        if (!formato) {
            return new Response(JSON.stringify({ error: 'Formato no encontrado' }), {
                status: 404,
            })
        }

        // Parsear data si es string
        let parsedData = formato.data
        if (typeof parsedData === 'string') {
            try {
                parsedData = JSON.parse(parsedData)
            } catch (e) {
                console.error('Error parseando formato.data:', e)
            }
        }

        return new Response(JSON.stringify({
            ...formato,
            data: parsedData
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (err) {
        console.error('Error al obtener formato:', err)
        return new Response(JSON.stringify({ error: 'Error al obtener formato' }), {
            status: 500,
        })
    }
}
