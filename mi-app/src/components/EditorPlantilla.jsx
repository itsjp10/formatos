import React, { memo, useState } from 'react';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/solid';

const Card = memo(function Card({ title, subtitle, right, children }) {
  return (
    <section className="bg-white/90 backdrop-blur rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
      <header className="flex items-start justify-between gap-4 mb-4">
        <div>
          {title && <h2 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h2>}
          {subtitle && <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {right}
      </header>
      {children}
    </section>
  );
});

export default function EditorPlantilla({ onCrearPlantilla }) {
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
  const [titulos, setTitulos] = useState({
    cod: '',
    aprobo: '',
    fechaEmision: '',
    obra: '',
    fecha: '',
    elaboradoPor: '',
    torre: '',
    contratista: '',
    residenteObra: '',
  });

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
      const keys = header.subheaders && header.subheaders.length > 0 ? header.subheaders : [header.label];
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
    const count = Math.max(1, parseInt(e.target.value) || 1);
    setNumSubfilas(count);
    const updated = rows.map((row) => {
      const newRow = {};
      headers.forEach((header) => {
        const keys = header.subheaders && header.subheaders.length > 0 ? header.subheaders : [header.label];
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
    if (!nombreFormato.trim() || !titulos.cod.trim() || !titulos.aprobo.trim() || !titulos.fechaEmision.trim()) {
      alert('Debes completar los campos obligatorios: Nombre del formato, Código, Aprobó y Fecha de emisión.');
      return;
    }

    const estructura = {
      headers: headers,
      filas: rows,
      numSubfilas: numSubfilas,
      titulos: titulos,
    };

    const plantilla = {
      nombre: nombreFormato.trim(),
      descripcion: descripcionFormato.trim(),
      estructura,
      numSubfilas: numSubfilas,
    };

    onCrearPlantilla?.(plantilla);
    console.log('Plantilla creada:', plantilla);
    alert('Plantilla creada (ver consola para estructura JSON)');
  };

  return (
    <div className="text-black">
      {/* Toolbar pegajosa */}
      <div className="sticky top-0 z-20 -mx-4 sm:mx-0 mb-4 bg-gradient-to-b from-white to-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-gray-200">
        <div className="px-4 sm:px-0 py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Editor de plantillas</h1>
            <p className="text-xs sm:text-sm text-gray-500">Define cabeceras, subfilas y meta‑datos para generar un formato reutilizable.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={crearPlantilla}
              className="inline-flex items-center justify-center rounded-xl border border-purple-600 bg-purple-600 text-white px-4 py-2 text-sm font-medium shadow hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              <PlusIcon className="h-4 w-4 mr-2" /> Crear plantilla
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Card: Información general */}
        <Card
          title="Información del formato"
          subtitle="Nombre, descripción y campos superiores que aparecerán en el encabezado."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nombre del formato *</label>
              <input
                type="text"
                value={nombreFormato}
                onChange={(e) => setNombreFormato(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Ej. Lista de chequeo de acabados"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Descripción</label>
              <input
                type="text"
                value={descripcionFormato}
                onChange={(e) => setDescripcionFormato(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Uso interno o notas para identificar la plantilla"
              />
            </div>
          </div>

          {/* Títulos del encabezado */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Campos del encabezado</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              {[
                { key: 'cod', label: 'Código *', type: 'text' },
                { key: 'aprobo', label: 'Aprobó *', type: 'text' },
                { key: 'fechaEmision', label: 'Fecha de emisión *', type: 'date' },
                { key: 'obra', label: 'Obra', type: 'text' },
                { key: 'fecha', label: 'Fecha', type: 'date' },
                { key: 'elaboradoPor', label: 'Elaborado por', type: 'text' },
                { key: 'torre', label: 'Torre', type: 'text' },
                { key: 'contratista', label: 'Contratista', type: 'text' },
                { key: 'residenteObra', label: 'Residente de obra', type: 'text' },
              ].map(({ key, label, type }) => (
                <div key={key} className="space-y-2">
                  <label className="block font-medium text-gray-700">{label}</label>
                  <input
                    type={type}
                    value={titulos[key]}
                    onChange={(e) => setTitulos({ ...titulos, [key]: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Card: Estructura de columnas y filas */}
        <Card
          title="Estructura de la tabla"
          subtitle="Crea columnas con subcolumnas, define subfilas por fila y agrega filas al cuerpo."
          right={
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm text-gray-600">Subfilas por fila</span>
                <input
                  type="number"
                  value={numSubfilas}
                  onChange={handleNumSubfilasChange}
                  min={1}
                  className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button
                onClick={addRow}
                className="inline-flex items-center rounded-xl bg-green-600 text-white px-3 py-2 text-sm font-medium shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <PlusIcon className="h-4 w-4 mr-1" /> Añadir fila
              </button>
            </div>
          }
        >
          {/* Controles columnas */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-gray-700">Nombre columna</label>
              <input
                type="text"
                placeholder="Ej. MUROS, PISOS, PUERTAS"
                value={newColumnLabel}
                onChange={(e) => setNewColumnLabel(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-gray-700">Subcolumnas (separadas por coma)</label>
              <input
                type="text"
                placeholder="Ej. Sala, Comedor, Cocina"
                value={newColumnSubheaders}
                onChange={(e) => setNewColumnSubheaders(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex gap-3">
              <div className="sm:hidden flex-1 space-y-2">
                <label className="text-sm font-medium text-gray-700">Subfilas por fila</label>
                <input
                  type="number"
                  value={numSubfilas}
                  onChange={handleNumSubfilasChange}
                  min={1}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button
                onClick={addColumn}
                className="h-10 sm:h-[42px] self-end inline-flex items-center justify-center rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-medium shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Añadir columna
              </button>
            </div>
          </div>

          {/* Tabla */}
          <div className="mt-5 border border-gray-200 overflow-hidden">
            <div className="w-full overflow-x-auto">
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
        </Card>
      </div>
    </div>
  );
}
