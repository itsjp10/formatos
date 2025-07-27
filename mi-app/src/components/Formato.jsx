import { useState } from 'react';
import React from 'react';

function Formato({ tipoFormato, contenidoFormato, onGuardar, loading }) {
    const [data, setData] = useState(contenidoFormato || {});
    const [headers, setHeaders] = useState(contenidoFormato.columnas || []);
    const [rows, setRows] = useState(contenidoFormato.filas || []);
    const [numSubfilas, setNumSubfilas] = useState(contenidoFormato.numSubfilas || 3);

    const handleGuardar = () => {
        setData({ filas: rows, columnas: headers, numSubfilas });
        onGuardar(data);
    };

    const addRow = () => {
        const newRow = {};
        headers.forEach((header) => {
            const subkeys = header.subheaders?.length > 0 ? header.subheaders : [header.label];
            subkeys.forEach((key) => {
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

    const isSimpleField = (label) => ['APTO', 'OBSERVACIONES'].includes(label);
    const isDateField = (label) => label === 'FECHA';
    const isSignatureField = (label) => label === 'FIRMA';

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
                    {/* Fila 1: labels principales */}
                    <tr>
                        {contenidoFormato.columnas.map((col, colIndex) => {
                            if (col.fixed) {
                                return (
                                    <th
                                        key={colIndex}
                                        rowSpan={3}
                                        className="bg-gray-200 border px-2 py-1 text-center align-middle"
                                    >
                                        {col.label}
                                    </th>
                                );
                            } else if (col.subheaders && col.subheaders.length > 0) {
                                return (
                                    <th
                                        key={colIndex}
                                        colSpan={col.subheaders.length * 2}
                                        className="bg-gray-200 border px-2 py-1 text-center"
                                    >
                                        {col.label}
                                    </th>
                                );
                            } else {
                                return (
                                    <th
                                        key={colIndex}
                                        colSpan={2}
                                        rowSpan={2}
                                        className="bg-gray-200 border px-2 py-1 text-center align-middle"
                                    >
                                        {col.label}
                                    </th>
                                );
                            }
                        })}
                    </tr>

                    {/* Fila 2: subheaders (solo si los hay) */}
                    <tr>
                        {contenidoFormato.columnas.map((col, colIndex) => {
                            if (col.fixed) return null;

                            if (col.subheaders && col.subheaders.length > 0) {
                                return col.subheaders.map((sub, subIndex) => (
                                    <th
                                        key={`${colIndex}-${subIndex}`}
                                        colSpan={2}
                                        className="bg-gray-200 border px-2 py-1 text-center"
                                    >
                                        {sub}
                                    </th>
                                ));
                            }

                            return null;
                        })}
                    </tr>

                    {/* Fila 3: C / NC headers */}
                    <tr>
                        {contenidoFormato.columnas.map((col, colIndex) => {
                            if (col.fixed) return null;

                            if (col.subheaders && col.subheaders.length > 0) {
                                return col.subheaders.map((_, subIndex) => (
                                    <React.Fragment key={`${colIndex}-nc-${subIndex}`}>
                                        <th className="bg-gray-200 border px-2 py-1 text-center">C</th>
                                        <th className="bg-gray-300 border px-2 py-1 text-center">NC</th>
                                    </React.Fragment>
                                ));
                            } else {
                                // columna sin subheaders (no fija)
                                return (
                                    <React.Fragment key={`${colIndex}-nocols`}>
                                        <th className="bg-gray-200 border px-2 py-1 text-center">C</th>
                                        <th className="bg-gray-300 border px-2 py-1 text-center">NC</th>
                                    </React.Fragment>
                                );
                            }
                        })}
                    </tr>
                </thead>



                <tbody>
                    {rows.map((row, rowIndex) =>
                        [...Array(numSubfilas)].map((_, subIndex) => (
                            <tr key={`${rowIndex}-${subIndex}`}>
                                {headers.map((header, hIndex) => {
                                    const keys = header.subheaders?.length ? header.subheaders : [header.label];

                                    return keys.map((key, kIndex) => {
                                        const fullKey = `${header.label}-${key}-${subIndex}`;

                                        if (isSimpleField(header.label) && subIndex === 0) {
                                            return (
                                                <td
                                                    key={`${hIndex}-${kIndex}`}
                                                    rowSpan={numSubfilas}
                                                    className="border px-2 py-1 text-center align-top"
                                                >
                                                    <textarea
                                                        value={row[`${header.label}-${key}-0`] || ''}
                                                        onChange={(e) =>
                                                            updateCell(
                                                                rowIndex,
                                                                `${header.label}-${key}-0`,
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full h-full min-h-[60px] border-none outline-none resize-none"
                                                        placeholder={`Escriba ${header.label.toLowerCase()}...`}
                                                    />
                                                </td>
                                            );
                                        }

                                        if (isSimpleField(header.label)) return null;

                                        if (isDateField(header.label) || isSignatureField(header.label)) {
                                            return (
                                                <td
                                                    key={`${hIndex}-${kIndex}`}
                                                    className="border px-2 py-1 text-center"
                                                >
                                                    <input
                                                        type="text"
                                                        value={row[fullKey] || ''}
                                                        onChange={(e) => updateCell(rowIndex, fullKey, e.target.value)}
                                                        className="w-full border-none outline-none"
                                                    />
                                                </td>
                                            );
                                        }

                                        // Render C / NC cells
                                        return [
                                            <td
                                                key={`c-${hIndex}-${kIndex}`}
                                                className="border px-2 py-1 text-center cursor-pointer w-7"
                                                onClick={() => toggleCheckbox(rowIndex, fullKey, 'C')}
                                            >
                                                {row[fullKey] === 'C' ? '✔' : ''}
                                            </td>,
                                            <td
                                                key={`nc-${hIndex}-${kIndex}`}
                                                className="border px-2 py-1 text-center cursor-pointer w-7 bg-gray-300"
                                                onClick={() => toggleCheckbox(rowIndex, fullKey, 'NC')}
                                            >
                                                {row[fullKey] === 'NC' ? '✘' : ''}
                                            </td>
                                        ];
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
