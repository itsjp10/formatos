"use client";
import { useState, useEffect } from "react";

function FormatoMamposteria({ contenido, onGuardar, loading }) {
  const [data, setData] = useState(
    contenido || {
      columnas: [],
      filas: [],
      observaciones: "",
      firmadoPor: ""
    }
  );

  useEffect(() => {
    setData(
      contenido || { columnas: [], filas: [], observaciones: "", firmadoPor: "" }
    );
  }, [contenido]);

  // Añadir fila vacía
  const handleAddRow = () => {
    setData((prev) => ({
      ...prev,
      filas: [...prev.filas, Array(prev.columnas.length).fill("")]
    }));
  };

  // Editar celda
  const handleCellChange = (rowIdx, colIdx, value) => {
    const newFilas = data.filas.map((fila, i) =>
      i === rowIdx
        ? fila.map((cell, j) => (j === colIdx ? value : cell))
        : fila
    );
    setData((prev) => ({ ...prev, filas: newFilas }));
  };

  // Editar observaciones
  const handleObsChange = (e) => {
    setData((prev) => ({ ...prev, observaciones: e.target.value }));
  };

  // Guardar cambios
  const handleGuardar = () => {
    if (onGuardar) onGuardar(data);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-indigo-700">
          Liberación de actividades: Mampostería interna
        </h2>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition disabled:opacity-50"
          onClick={handleGuardar}
          disabled={loading}
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-indigo-100">
              <th className="p-2 border text-xs font-semibold">#</th>
              {data.columnas.map((col, idx) => (
                <th key={idx} className="p-2 border text-xs font-semibold">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.filas.map((fila, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-indigo-50">
                <td className="p-2 border text-xs text-gray-500">
                  {rowIdx + 1}
                </td>
                {fila.map((cell, colIdx) => (
                  <td key={colIdx} className="p-1 border">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) =>
                        handleCellChange(rowIdx, colIdx, e.target.value)
                      }
                      className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring focus:ring-indigo-200"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <button
          className="mt-3 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
          onClick={handleAddRow}
        >
          Añadir fila
        </button>
      </div>
      <div className="mt-6">
        <label className="block text-sm font-semibold mb-1 text-indigo-700">
          Observaciones:
        </label>
        <textarea
          value={data.observaciones}
          onChange={handleObsChange}
          rows={3}
          className="w-full border rounded p-2 text-sm focus:outline-none focus:ring focus:ring-indigo-200"
          placeholder="Escribe observaciones aquí..."
        />
      </div>
    </div>
  );
}

export default FormatoMamposteria;
                 