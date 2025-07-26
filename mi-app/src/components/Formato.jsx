import { set } from 'date-fns';
import { useState } from 'react';

function Formato({ tipoFormato, contenidoFormato, onGuardar, loading }) {
    const [data, setData] = useState(contenidoFormato || {});

    const [headers, setHeaders] = useState(contenidoFormato.columnas || []);
    const [rows, setRows] = useState(contenidoFormato.filas || []);
    const [numSubfilas, setNumSubfilas] = useState(contenidoFormato.numSubfilas || 3);


    const handleGuardar = () => {
        //const actualizado = { ...data, observaciones };
        setData({ filas: rows, columnas: headers, numSubfilas: numSubfilas });
        onGuardar(data);
    };

    if (!data || !data.columnas || !data.filas) {
        console.log("Estructura recibida en Formato.jsx:", data);
        return <div className='text-black'>No hay estructura cargada para este formato.</div>;
    }

    const addRow = () => {
        const newRow = {};
        headers.forEach((header) => {
            const keys =
                header.subheaders && header.subheaders.length > 0
                    ? header.subheaders
                    : [header.label];
            keys.forEach((key) => {
                for (let i = 0; i < numSubfilas; i++) {
                    const fullKey = `${header.label}-${key}-${i}`;
                    newRow[fullKey] = '';
                }
            });
        });
        setRows([...rows, newRow]);
    };

    const updateCell = (rowIndex, key, value) => {
        const updated = [...rows];
        updated[rowIndex][key] = value;
        setRows(updated);
    };

    const toggleCheckbox = (rowIndex, key, value) => {
        const updated = [...rows];
        updated[rowIndex][key] = updated[rowIndex][key] === value ? '' : value;
        setRows(updated);
    };

    return (
        <div className="overflow-auto">
            <button
                type="button"
                className="bg-green-500 text-white px-3 py-1 rounded text-sm cursor-pointer mb-4"
                onClick={handleGuardar}
            >
                Guardar cambios
            </button>
            <table className="table-auto border-collapse w-full text-xs">
                <thead>
                    <tr>
                        {headers.map((header, i) =>
                            header.subheaders?.length > 0 ? (
                                <th
                                    key={i}
                                    colSpan={header.subheaders.length}
                                    className="border bg-gray-200 px-2 py-1 text-center"
                                >
                                    <div className="flex justify-between items-center gap-1">
                                        <span className="flex-1">{header.label}</span>
                                    </div>
                                </th>
                            ) : (
                                <th
                                    key={i}
                                    rowSpan={2}
                                    className="border bg-gray-200 px-2 py-1 text-center"
                                >
                                    <div className="flex justify-between items-center gap-1">
                                        <span className="flex-1">{header.label}</span>
                                    </div>
                                </th>
                            )
                        )}
                    </tr>
                    <tr>
                        {headers.map((header) =>
                            header.subheaders?.length > 0
                                ? header.subheaders.map((sub, i) => (
                                    <th
                                        key={i}
                                        className="border bg-gray-100 px-2 py-1 text-center"
                                    >
                                        {sub}
                                    </th>
                                ))
                                : null
                        )}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIndex) =>
                        [...Array(numSubfilas)].map((_, subIndex) => (
                            <tr key={`${rowIndex}-${subIndex}`}>
                                {headers.map((header, hIndex) => {
                                    const isTextField = ['APTO', 'OBSERVACIONES'].includes(header.label);
                                    const isDateField = header.label === 'FECHA';
                                    const keys = header.subheaders?.length
                                        ? header.subheaders
                                        : [header.label];

                                    return keys.map((key, kIndex) => {
                                        const fullKey = `${header.label}-${key}-${subIndex}`;

                                        if (isTextField && subIndex === 0) {
                                            return (
                                                <td
                                                    key={`${hIndex}-${kIndex}`}
                                                    rowSpan={numSubfilas}
                                                    className="border px-2 py-1 text-center align-top"
                                                >
                                                    <input
                                                        type="text"
                                                        value={row[`${header.label}-${key}-0`] || ''}
                                                        onChange={(e) =>
                                                            updateCell(
                                                                rowIndex,
                                                                `${header.label}-${key}-0`,
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full border-none outline-none"
                                                    />
                                                </td>
                                            );
                                        }

                                        if (isTextField) return null;

                                        return (
                                            <td key={`${hIndex}-${kIndex}`} className="border px-2 py-1 text-center">
                                                {isDateField || header.label === 'FIRMA' ? (
                                                    <input
                                                        type="text"
                                                        value={row[fullKey] || ''}
                                                        onChange={(e) => updateCell(rowIndex, fullKey, e.target.value)}
                                                        className="w-full border-none outline-none"
                                                    />
                                                ) : (
                                                    <div className="flex justify-center gap-2">
                                                        <label className="flex items-center text-sm">
                                                            <input
                                                                type="checkbox"
                                                                checked={row[fullKey] === 'C'}
                                                                onChange={() => toggleCheckbox(rowIndex, fullKey, 'C')}
                                                            />
                                                            <span className="ml-1">C</span>
                                                        </label>
                                                        <label className="flex items-center text-sm">
                                                            <input
                                                                type="checkbox"
                                                                checked={row[fullKey] === 'NC'}
                                                                onChange={() => toggleCheckbox(rowIndex, fullKey, 'NC')}
                                                            />
                                                            <span className="ml-1">NC</span>
                                                        </label>
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    });
                                })}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            <button
                type="button"
                onClick={addRow}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm cursor-pointer mt-4"
            >
                Añadir fila
            </button>

        </div>
    );
}

export default Formato;
