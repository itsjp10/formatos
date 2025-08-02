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
            const formatoIds = compartidos.map((f) => f.formatoId);
            const soloFormatos = await prisma.formato.findMany({
                where: { formatoID: { in: formatoIds } }
            });

            //const soloFormatos = compartidos.map((f) => f.formato)

            socket.emit('formatosData', { formatos, compartidos: soloFormatos })
        } catch (err) {
            socket.emit('error', err.message)
        }
    })

    socket.on('formatoActualizado', async ({ formatoID }) => {
        try {
            // Obtener el formato
            const formato = await prisma.formato.findUnique({
                where: { formatoID: formatoID },
            });

            if (!formato) return;

            // Usuarios compartidos
            const compartidoCon = await prisma.formatoUsuario.findMany({
                where: { formatoId: formatoID },
            });

            // Todos los usuarios que deben refrescar (creador + compartidos)
            const usuariosARefrescar = new Set([
                formato.usuarioId,
                ...compartidoCon.map(fu => fu.userId)
            ]);

            // Emitir a cada uno individualmente
            usuariosARefrescar.forEach((userId) => {
                io.emit('refrescarFormatosPara', userId);
            });
        } catch (err) {
            console.error('Error en formatoActualizado:', err);
        }
    });


})



const PORT = 4000
httpServer.listen(PORT, () => {
    console.log(`🚀 WebSocket server running on http://localhost:${PORT}`)
})
