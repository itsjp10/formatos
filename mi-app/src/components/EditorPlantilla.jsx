import React, { useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/solid';

function EditorPlantilla({ onCrearPlantilla }) {
  const [headers, setHeaders] = useState([
    { label: 'APTO', type: 'text', fixed: true },
    { label: 'FECHA', type: 'date', fixed: true },
    { label: 'OBSERVACIONES', type: 'text', fixed: true },
    { label: 'FIRMA', type: 'text', fixed: true },
  ]);
  const [rows, setRows] = useState([]);
  const [numSubfilas, setNumSubfilas] = useState(3);

  const [newColumnLabel, setNewColumnLabel] = useState('');
  const [newColumnSubheaders, setNewColumnSubheaders] = useState('');

  const [nombreFormato, setNombreFormato] = useState('');
  const [descripcionFormato, setDescripcionFormato] = useState('');

  const addColumn = () => {
    if (!newColumnLabel.trim()) return;

    const newHeader = {
      label: newColumnLabel.trim(),
      type: 'checkbox',
      subheaders: newColumnSubheaders
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s),
    };

    const insertIndex = headers.findIndex((h) => h.label === 'OBSERVACIONES');
    const newHeaders = [...headers];
    newHeaders.splice(insertIndex, 0, newHeader);
    setHeaders(newHeaders);
    setNewColumnLabel('');
    setNewColumnSubheaders('');
  };

  const deleteColumn = (label) => {
    if (['APTO', 'FECHA', 'OBSERVACIONES', 'FIRMA'].includes(label)) return;
    setHeaders(headers.filter((h) => h.label !== label));
    setRows((prev) =>
      prev.map((row) => {
        const updatedRow = { ...row };
        Object.keys(updatedRow).forEach((key) => {
          if (key.startsWith(label)) delete updatedRow[key];
        });
        return updatedRow;
      })
    );
  };

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

  const handleNumSubfilasChange = (e) => {
    const count = parseInt(e.target.value) || 1;
    setNumSubfilas(count);
    const updated = rows.map((row) => {
      const newRow = {};
      headers.forEach((header) => {
        const keys =
          header.subheaders && header.subheaders.length > 0
            ? header.subheaders
            : [header.label];
        keys.forEach((key) => {
          for (let i = 0; i < count; i++) {
            const fullKey = `${header.label}-${key}-${i}`;
            newRow[fullKey] = row[fullKey] || '';
          }
        });
      });
      return newRow;
    });
    setRows(updated);
  };

  const crearPlantilla = () => {
    if (!nombreFormato.trim()) {
      alert("Debes ingresar un nombre para la plantilla.");
      return;
    }

    const estructura = headers.map((h) => ({
      label: h.label,
      type: h.type,
      subheaders: h.subheaders || [],
      fixed: h.fixed || false,
    }));

    const plantilla = {
      nombre: nombreFormato.trim(),
      descripcion: descripcionFormato.trim(),
      estructura,
      numSubfilas: numSubfilas,
    };

    // Callback para enviar al backend o a donde quieras
    onCrearPlantilla?.(plantilla);

    console.log('Plantilla creada:', plantilla);
    alert("Plantilla creada (ver consola para estructura JSON)");
  };

  return (
    <div className="p-4 space-y-4 text-black">
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Nombre del formato"
          value={nombreFormato}
          onChange={(e) => setNombreFormato(e.target.value)}
          className="border p-1 w-64"
        />
        <input
          type="text"
          placeholder="Descripción"
          value={descripcionFormato}
          onChange={(e) => setDescripcionFormato(e.target.value)}
          className="border p-1 w-full"
        />
        <button
          onClick={crearPlantilla}
          className="bg-purple-600 text-white px-4 py-1 rounded"
        >
          Crear plantilla
        </button>
      </div>

      <div className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="Nombre columna"
          value={newColumnLabel}
          onChange={(e) => setNewColumnLabel(e.target.value)}
          className="border p-1 text-sm"
        />
        <input
          type="text"
          placeholder="Subcolumnas (coma)"
          value={newColumnSubheaders}
          onChange={(e) => setNewColumnSubheaders(e.target.value)}
          className="border p-1 text-sm w-72"
        />
        <button
          onClick={addColumn}
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
        >
          Añadir columna
        </button>
        <input
          type="number"
          value={numSubfilas}
          onChange={handleNumSubfilasChange}
          min={1}
          className="border p-1 text-sm w-16"
        />
        <button
          onClick={addRow}
          className="bg-green-500 text-white px-3 py-1 rounded text-sm"
        >
          Añadir fila
        </button>
      </div>

      <div className="overflow-auto">
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
                      {!header.fixed && (
                        <TrashIcon
                          className="w-4 h-4 text-red-600 cursor-pointer"
                          onClick={() => deleteColumn(header.label)}
                        />
                      )}
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
                      {!header.fixed && (
                        <TrashIcon
                          className="w-4 h-4 text-red-600 cursor-pointer"
                          onClick={() => deleteColumn(header.label)}
                        />
                      )}
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
      </div>
    </div>
  );
}

export default EditorPlantilla;
