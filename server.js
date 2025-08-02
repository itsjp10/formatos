import { createServer } from 'http'
import { Server } from 'socket.io'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const httpServer = createServer()
const io = new Server(httpServer, {
    cors: {
        origin: '*',
    },
})

io.on('connection', (socket) => {
    console.log('🟢 Usuario conectado')

    socket.on('getFormatos', async (usuarioId) => {
        try {
            const formatos = await prisma.formato.findMany({
                where: { usuarioId },
            })

            const compartidos = await prisma.formatoUsuario.findMany({
                where: {
                    userId: usuarioId,
                    creadoPor: false,
                },
                include: {
                    formato: true,
                },
            })

            const soloFormatos = compartidos.map((f) => f.formato)

            socket.emit('formatosData', { formatos, compartidos: soloFormatos })
        } catch (err) {
            socket.emit('error', err.message)
        }
    })

})

const PORT = 4000
httpServer.listen(PORT, () => {
    console.log(`🚀 WebSocket server running on http://localhost:${PORT}`)
})
