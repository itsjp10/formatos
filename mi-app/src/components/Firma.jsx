import { useState, useRef, useEffect } from 'react';
import { Copy, Trash2, MoreHorizontal } from 'lucide-react';

function Firma({ firma, onDelete, onSelect, selected }) {
    const fechaFormateada = new Date(firma.createdAt).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    const [menuAbierto, setMenuAbierto] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuAbierto(false);
            }
        }

        if (menuAbierto) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuAbierto]);

    const handleEliminar = () => {
        setMenuAbierto(false);
        if (confirm('¿Estás seguro de eliminar esta firma?')) {
            onDelete?.(firma.firmaID);
        }
    };

    return (
        <div onClick={() => onSelect(firma.firmaID)}
            className={selected ? "relative flex items-center justify-between border-2 border-yellow-500 rounded-2xl shadow-md p-4 mb-4 max-w-md bg-yellow-50"
                : "relative flex items-center justify-between border border-gray-300 rounded-2xl shadow-sm p-4 mb-4 max-w-md bg-white hover:border-2 hover:border-blue-500 hover:border-dashed hover:cursor-pointer"}>
            <div className="flex items-center space-x-4">
                <img
                    src={firma.imagenUrl}
                    alt={`Firma ${firma.firmaID}`}
                    className="w-16 h-16 object-contain rounded-md border"
                />
                <div>
                    <div className="flex items-center text-xs text-gray-800 font-medium mb-1">
                        <span>ID: {firma.firmaID}</span>
                    </div>
                    <p className="text-gray-500 text-sm">Fecha: {fechaFormateada}</p>
                </div>
            </div>

            {/* Botón de menú */}
            <div className="relative" ref={menuRef}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setMenuAbierto(!menuAbierto);
                    }}
                    className="p-2 text-gray-600 hover:text-gray-900"
                >
                    <MoreHorizontal size={20} />
                </button>

                {menuAbierto && (
                    <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-md z-10">
                        <button
                            onClick={handleEliminar}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                            <Trash2 size={16} className="mr-2" />
                            Eliminar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Firma;
