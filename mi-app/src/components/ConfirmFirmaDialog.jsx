"use client"
import { Dialog } from "@headlessui/react"
import { X } from "lucide-react"

export default function ConfirmFirmaDialog({ show, onConfirm, onCancel }) {
    return (
        <Dialog open={show} onClose={onCancel} className="relative z-50">
            {/* Fondo oscuro */}
            <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

            {/* Contenedor del modal */}
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-sm rounded-xl bg-white p-6 shadow-lg relative">
                    
                    {/* Botón de cierre con X */}
                    <button
                        onClick={onCancel}
                        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
                    >
                        <X size={20} />
                    </button>

                    {/* Título */}
                    <Dialog.Title className="text-base font-semibold text-gray-900">
                        Confirmar eliminación
                    </Dialog.Title>

                    {/* Texto */}
                    <Dialog.Description className="mt-2 text-sm text-gray-700">
                        ¿Estás seguro de que deseas eliminar esta firma?
                    </Dialog.Description>

                    {/* Botones */}
                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
                        >
                            Eliminar
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    )
}
