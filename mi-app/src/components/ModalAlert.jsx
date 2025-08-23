"use client"
import { Dialog } from "@headlessui/react"
import { X } from "lucide-react"

export default function ModalAlert({ show, title, message, onClose }) {
    return (
        <Dialog open={show} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-sm rounded-xl bg-white p-5 shadow-lg relative">
                    
                    {/* Botón de cierre con X */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
                    >
                        <X size={20} />
                    </button>

                    {/* Título */}
                    <Dialog.Title className="text-base font-semibold text-gray-900">
                        {title}
                    </Dialog.Title>

                    {/* Mensaje */}
                    <Dialog.Description className="mt-2 text-sm text-gray-700">
                        {message}
                    </Dialog.Description>
                </Dialog.Panel>
            </div>
        </Dialog>
    )
}
