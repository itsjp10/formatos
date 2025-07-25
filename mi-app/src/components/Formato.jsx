import { useState } from 'react';

function Formato({ tipoFormato, contenidoFormato, onGuardar, loading }) {
    const [data, setData] = useState(contenidoFormato || {});
    const [observaciones, setObservaciones] = useState(data.observaciones || "");

    const handleCheckboxChange = (filaIndex, colKey, subfilaIndex, value) => {
        const updated = { ...data };
        updated.filas[filaIndex].celdas[colKey][subfilaIndex] = value;
        setData(updated);
    };

    const handleGuardar = () => {
        const actualizado = { ...data, observaciones };
        onGuardar(actualizado);
    };

    if (!data || !data.columnas || !data.filas) {
        console.log("Estructura recibida en Formato.jsx:", data);
        return <div className='text-black'>No hay estructura cargada para este formato.</div>;
    }

    return (
        <div className="bg-white text-black p-4 border rounded-md">
            <h2 className="text-xl font-bold mb-4">{tipoFormato}</h2>
            <table className="w-full border border-gray-300">
                <thead>
                    <tr>
                        {data.columnas.map((col, i) => (
                            <th key={i} className="border px-2 py-1 text-sm">{col.nombre}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.filas.map((fila, filaIndex) => (
                        <tr key={filaIndex}>
                            {data.columnas.map((col, colIndex) => {
                                const celda = fila.celdas[col.nombre];

                                // Celdas con subfilas (array de objetos)
                                if (Array.isArray(celda)) {
                                    return (
                                        <td key={colIndex} className="border px-2 py-1">
                                            {celda.map((item, subfilaIndex) => (
                                                <div key={subfilaIndex} className="flex gap-1 items-center mb-1">
                                                    <label className="flex items-center gap-1 text-xs">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.C}
                                                            onChange={() => {
                                                                const updated = [...celda];
                                                                updated[subfilaIndex] = {
                                                                    ...updated[subfilaIndex],
                                                                    C: !item.C,
                                                                };
                                                                handleCheckboxChange(filaIndex, col.nombre, subfilaIndex, updated[subfilaIndex]);
                                                            }}
                                                        />
                                                        C
                                                    </label>
                                                    <label className="flex items-center gap-1 text-xs">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.NC}
                                                            onChange={() => {
                                                                const updated = [...celda];
                                                                updated[subfilaIndex] = {
                                                                    ...updated[subfilaIndex],
                                                                    NC: !item.NC,
                                                                };
                                                                handleCheckboxChange(filaIndex, col.nombre, subfilaIndex, updated[subfilaIndex]);
                                                            }}
                                                        />
                                                        NC
                                                    </label>
                                                </div>
                                            ))}
                                        </td>
                                    );
                                }

                                // Celdas de texto o fecha
                                return (
                                    <td key={colIndex} className="border px-2 py-1">
                                        <input
                                            className="w-full text-xs border p-1"
                                            type={col.tipo === "fecha" ? "date" : "text"}
                                            value={celda}
                                            onChange={(e) => {
                                                const updated = { ...data };
                                                updated.filas[filaIndex].celdas[col.nombre] = e.target.value;
                                                setData(updated);
                                            }}
                                        />
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="mt-4">
                <label className="block text-sm mb-1">Observaciones:</label>
                <textarea
                    className="w-full border text-sm p-2"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    rows={3}
                />
            </div>

            <button
                onClick={handleGuardar}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                disabled={loading}
            >
                {loading ? "Guardando..." : "Guardar formato"}
            </button>
        </div>
    );
}

export default Formato;
