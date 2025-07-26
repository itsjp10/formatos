import { useState } from 'react';

function Formato({ tipoFormato, contenidoFormato, onGuardar, loading }) {
    const [data, setData] = useState(contenidoFormato || {});
    const [headers, setHeaders] = useState(contenidoFormato.columnas || []);
    const [rows, setRows] = useState(contenidoFormato.filas || []);
    const [numSubfilas, setNumSubfilas] = useState(contenidoFormato.numSubfilas || 3);

    const handleGuardar = () => {
        setData({ filas: rows, columnas: headers, numSubfilas: numSubfilas });
        onGuardar(data);
    };

    const addRow = () => {
        const newRow = {};
        headers.forEach((header) => {
            const keys = header.subheaders?.length > 0 ? header.subheaders : [header.label];
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
                    <tr>
                        {headers.map((header, i) => {
                            if (header.subheaders?.length > 0) {
                                return (
                                    <th
                                        key={i}
                                        colSpan={header.subheaders.length * 2}
                                        className="border bg-gray-200 px-2 py-1 text-center"
                                    >
                                        {header.label}
                                    </th>
                                );
                            }
                            return (
                                <th
                                    key={i}
                                    rowSpan={3}
                                    className="border bg-gray-200 px-2 py-1 text-center"
                                >
                                    {header.label}
                                </th>
                            );
                        })}
                    </tr>
                    <tr>
                        {headers.map((header, i) =>
                            header.subheaders?.length > 0
                                ? header.subheaders.map((sub, j) => (
                                    <th
                                        key={`sub-${i}-${j}`}
                                        colSpan={2}
                                        className="border bg-gray-100 px-2 py-1 text-center"
                                    >
                                        {sub}
                                    </th>
                                ))
                                : null
                        )}
                    </tr>
                    <tr>
                        {headers.map((header, i) =>
                            header.subheaders?.length > 0
                                ? header.subheaders.flatMap((sub, j) => [
                                    <th key={`c-${i}-${j}`} className="border text-center bg-gray-50">
                                        C
                                    </th>,
                                    <th key={`nc-${i}-${j}`} className="border text-center bg-gray-300">
                                        NC
                                    </th>
                                ])
                                : null
                        )}
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

                                        // APTO y OBSERVACIONES: solo en subIndex === 0
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

                                        // C / NC checkboxes
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
