import React from 'react';

export default function ConfirmDialog({ show, title, message, onConfirm, onCancel }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-[1px] bg-white/20 flex justify-center items-center">
      <div className="bg-white backdrop-blur-md border border-gray-200 p-6 rounded-xl shadow-xl w-[360px] text-black">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
