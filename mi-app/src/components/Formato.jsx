import { useState, useEffect, useRef } from 'react';
import { io } from "socket.io-client";
import React from 'react';
import { Signature, Trash2, Plus } from "lucide-react"
import EncabezadoFormato from './EncabezadoFormato';

const socket = io("http://localhost:3001");

function Formato({ formatoID, tipoFormato, onGuardar, rol, firma, publicLink }) {
    //vamos a obtener la informacion de contenidoFormato de un fetch para no depender de params, también evitamos la desincronizacion con los datos al editar
    const [data, setData] = useState({
        columnas: [],
        filas: [],
        numSubfilas: 3,
        titulos: '',
        firmas: {}
    });

    // referencia para evitar bucles infinitos
    const isRemoteUpdate = useRef(false);

    useEffect(() => {
        socket.emit("join-formato", formatoID);

        socket.on("formato-actualizado", (newData) => {
            isRemoteUpdate.current = true;
            setData(newData);
            setHeaders(newData.columnas || []);
            setRows(newData.filas || []);
            setNumSubfilas(newData.numSubfilas || 3);
            setFirmas(newData.firmas || {});
            setTitulos(newData.titulos || '');
            setIsFirmado({
                contratista: !!(newData.firmas && newData.firmas.firmaContra),
                residente: !!(newData.firmas && newData.firmas.firmaRes),
                supervisor: !!(newData.firmas && newData.firmas.firmaSup),
            });
            requestAnimationFrame(() => {
                isRemoteUpdate.current = false;
            });
        });

        return () => {
            socket.off("formato-actualizado");
        };
    }, [formatoID]);

    const syncAndSave = (newData) => {
        setData(newData);
        setHeaders(newData.columnas || []);
        setRows(newData.filas || []);
        setNumSubfilas(newData.numSubfilas || 3);
        setFirmas(newData.firmas || {});
        setTitulos(newData.titulos || '');
        setIsFirmado({
            contratista: !!(newData.firmas && newData.firmas.firmaContra),
            residente: !!(newData.firmas && newData.firmas.firmaRes),
            supervisor: !!(newData.firmas && newData.firmas.firmaSup),
        });
        requestAnimationFrame(() => {
            isRemoteUpdate.current = false;
        });
        onGuardar(newData);

        if (!isRemoteUpdate.current) {
            socket.emit("update-formato", { formatoID, data: newData });
        }
        isRemoteUpdate.current = false;
    };

    const [headers, setHeaders] = useState(data.columnas || []);
    const [rows, setRows] = useState(data.filas || []);
    const [numSubfilas, setNumSubfilas] = useState(data.numSubfilas || 3);
    const [firmas, setFirmas] = useState(data.firmas || '');
    const [isFirmado, setIsFirmado] = useState({
        contratista: !!firmas.firmaContra,
        residente: !!firmas.firmaRes,
        supervisor: !!firmas.firmaSup,
    })

    const [titulos, setTitulos] = useState(data.titulos || '')

    const fetchFormato = async () => {
        console.log("Haciendo fetch de formatoID unico: ", formatoID)
        try {
            const res = await fetch(`/api/formato?formatoID=${formatoID}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            })

            if (!res.ok) {
                const { error } = await res.json()
                throw new Error(error || 'Error al obtener el formato')
            }

            const formato = await res.json()
            const formatoFiltrado = formato.data
            setData(formatoFiltrado)
            setHeaders(formatoFiltrado.columnas || [])
            setRows(formatoFiltrado.filas || [])
            setNumSubfilas(formatoFiltrado.numSubfilas || 3)
            setFirmas(formatoFiltrado.firmas || '')
            setIsFirmado({
                contratista: !!formatoFiltrado.firmas.firmaContra,
                residente: !!formatoFiltrado.firmas.firmaRes,
                supervisor: !!formatoFiltrado.firmas.firmaSup,
            })
            setTitulos(formatoFiltrado.titulos || '')
            await new Promise(resolve => requestAnimationFrame(resolve));
            console.log("Resultado de formatoFiltrado", formatoFiltrado)
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        if (formatoID) {
            fetchFormato()
        }

    }, [formatoID])



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
        const nuevasFilas = [...rows, newRow]; // usamos este nuevasFilas porque React no actualiza el estado inmediatamente

        setRows(nuevasFilas);

        const nuevoData = {
            filas: nuevasFilas,
            columnas: headers,
            numSubfilas,
            titulos: titulos,
            firmas: firmas,
        };
        syncAndSave(nuevoData);
    };

    const deleteRow = (index) => {
        const updatedRows = rows.filter((_, i) => i !== index);
        setRows(updatedRows);

        const nuevoData = {
            filas: updatedRows,
            columnas: headers,
            numSubfilas,
            titulos: titulos,
            firmas: firmas,
        };
        syncAndSave(nuevoData);
    };

    const updateCell = (rowIndex, key, value) => {
        const updated = [...rows];
        updated[rowIndex][key] = value;
        setRows(updated);

        const nuevoData = {
            filas: updated,
            columnas: headers,
            numSubfilas,
            titulos: titulos,
            firmas: firmas,
        };
        syncAndSave(nuevoData);
    };


    const toggleCheckbox = (rowIndex, key, value) => {
        const updated = [...rows];
        updated[rowIndex][key] = updated[rowIndex][key] === value ? '' : value;
        setRows(updated);

        const nuevoData = {
            filas: updated,
            columnas: headers,
            numSubfilas,
            titulos: titulos,
            firmas: firmas,
        };
        syncAndSave(nuevoData);
    };


    const isSimpleField = (label) => ['APTO', 'OBSERVACIONES'].includes(label);
    const isDateField = (label) => label === 'FECHA';
    const isSignatureField = (label) => label === 'FIRMA';

    return (
        <div className="w-full overflow-x-auto">
            <button
                type="button"
                onClick={async () => {
                    try {
                        const res = await fetch(`/api/formatos/${formatoID}/pdf`, {
                            method: 'GET',
                            credentials: 'include',
                        });
                        if (!res.ok) throw new Error('No se pudo generar el PDF');
                        const blob = await res.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `formato-${formatoID}.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        URL.revokeObjectURL(url);
                    } catch (e) {
                        alert('Error descargando PDF: ' + e.message);
                    }
                }}
                className="no-print mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-1 text-sm"
            >
                Descargar PDF
            </button>
            {/* Encabezado del formato */}
            {titulos && (
                <EncabezadoFormato
                    contenidoFormato={data}
                    tipoFormato={tipoFormato}
                    hayFilas={rows.length > 0}
                    onTitulosChange={(titulosActualizados) => {
                        const nuevoData = {
                            filas: rows,
                            columnas: headers,
                            numSubfilas,
                            titulos: titulosActualizados,
                            firmas: firmas,
                        };
                        syncAndSave(nuevoData);
                    }}
                    editar={true}
                />
            )}

            <table className="table-auto border-collapse w-full text-xs">
                <thead>
                    {/* Fila 1: labels principales */}
                    <tr>
                        {data.columnas?.map((col, colIndex) => {
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
                        {data.columnas?.map((col, colIndex) => {
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
                        {data.columnas?.map((col, colIndex) => {
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
                    {rows?.map((row, rowIndex) =>
                        [...Array(numSubfilas)].map((_, subIndex) => {
                            return (
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
                                                        className="border px-2 py-1 text-center align-top relative"
                                                    >
                                                        <textarea
                                                            value={row[`${header.label}-${key}-0`] || ''}
                                                            onChange={(e) =>
                                                                updateCell(rowIndex, `${header.label}-${key}-0`, e.target.value)
                                                            }
                                                            className="w-full h-full min-h-[60px] border-none outline-none resize-none"
                                                            placeholder={`Escriba ${header.label.toLowerCase()}...`}
                                                        />
                                                    </td>
                                                );
                                            }

                                            if (isSimpleField(header.label)) return null;



                                            if (isDateField(header.label)) {
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

                                            if (isSignatureField(header.label)) {
                                                return (
                                                    <td
                                                        key={`${hIndex}-${kIndex}`}
                                                        className="border text-center h-[40px]"
                                                    >
                                                        {row[fullKey] ? (
                                                            <div className="relative h-10 flex items-center justify-center">
                                                                <img
                                                                    src={row[fullKey]}
                                                                    alt="Firma"
                                                                    className="inset-0 mx-auto my-auto object-contain max-w-[90px] max-h-[36px] pointer-events-none"
                                                                />
                                                                {rol === "supervisor" && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const updated = [...rows];
                                                                            updated[rowIndex][fullKey] = "";

                                                                            const nuevoData = {
                                                                                filas: updated,
                                                                                columnas: headers,
                                                                                numSubfilas,
                                                                                titulos,
                                                                                firmas,
                                                                            };
                                                                            syncAndSave(nuevoData);
                                                                        }}
                                                                        className="absolute top-0 right-0 p-1 bg-white hover:bg-gray-100 rounded-full shadow-sm"
                                                                        title="Eliminar firma"
                                                                    >
                                                                        <Trash2 className="w-3 h-3 text-gray-700" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ) : rol === "supervisor" ? (
                                                            <button
                                                                type="button"
                                                                className="px-2 py-1 border border-dashed border-gray-400 rounded text-xs text-gray-700 hover:bg-gray-100 transition-all flex items-center gap-1 mx-auto"
                                                                onClick={() => {
                                                                    const updated = [...rows];
                                                                    updated[rowIndex][fullKey] = firma.imagenUrl;

                                                                    const nuevoData = {
                                                                        filas: updated,
                                                                        columnas: headers,
                                                                        numSubfilas,
                                                                        titulos,
                                                                        firmas,
                                                                    };
                                                                    syncAndSave(nuevoData);
                                                                }}
                                                            >
                                                                <Signature className="w-3 h-3" />
                                                                Firmar
                                                            </button>
                                                        ) : null}
                                                    </td>
                                                );
                                            }


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

                                    {/* Botón eliminar fila solo en la primera subfila */}
                                    {subIndex === 0 && (
                                        <td
                                            rowSpan={numSubfilas}
                                            className="px-1 py-1 text-center align-middle"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => deleteRow(rowIndex)}
                                                className="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full p-1 shadow-sm transition-colors"
                                                title="Eliminar fila"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            );
                        })
                    )}
                </tbody>


            </table>
            {publicLink && (
                <div className="mb-4 flex items-center justify-between px-2">
                    <span className="text-xs text-gray-600">
                        Enlace público:
                        <span className="font-mono ml-1 text-blue-600 underline">
                            {`${window.location.origin}/formato/${publicLink}`}
                        </span>
                    </span>
                    <button
                        onClick={() =>
                            navigator.clipboard.writeText(`${window.location.origin}/formato/${publicLink}`)
                        }
                        className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded text-xs transition"
                    >
                        Copiar enlace
                    </button>
                </div>
            )}


            {/* Botón anclado abajo a la izquierda */}
            <button
                type="button"
                onClick={addRow}
                className="mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full p-1 shadow-sm transition-colors"
                title="Insertar fila debajo"
            >
                <Plus className="w-4 h-4" />
            </button>

            <div className="flex w-full justify-between items-start px-4 max-w-4xl mx-auto mt-8">
                {/* CONTRATISTA */}

                <div className="flex flex-col items-center w-1/3">
                    <div className="h-20 mb-2 flex items-center justify-center">
                        <div>
                            {isFirmado.contratista ? (
                                <img
                                    src={firmas.firmaContra}
                                    alt={`Firma ${firma.firmaID}`}
                                    className="h-full object-contain"
                                />
                            ) : rol === "contratista" ? (
                                <button
                                    type="button"
                                    className="px-4 py-2 border-2 border-dashed border-gray-400 rounded-md text-sm text-gray-700 hover:bg-gray-100 active:scale-95 transition-all duration-200 flex items-center gap-2 font-semibold"
                                    onClick={() => {
                                        setIsFirmado(prev => ({ ...prev, contratista: true }));
                                        const nuevasFirmas = {
                                            ...firmas,
                                            firmaContra: firma.imagenUrl,
                                        };
                                        setFirmas(nuevasFirmas);

                                        const nuevoData = {
                                            filas: rows,
                                            columnas: headers,
                                            numSubfilas,
                                            titulos,
                                            firmas: nuevasFirmas,
                                        };
                                        syncAndSave(nuevoData);
                                    }}
                                >
                                    <Signature className="w-4 h-4" />
                                    Firmar
                                </button>
                            ) : null}
                        </div>
                    </div>

                    <div className="w-48 border-t-2 border-black mb-1"></div>
                    <span className="text-sm font-semibold text-center">CONTRATISTA</span>
                    {(isFirmado.contratista && rol == "contratista") && (
                        <button
                            onClick={() => {
                                setIsFirmado(prev => ({ ...prev, contratista: false }));
                                const nuevasFirmas = {
                                    ...firmas,
                                    firmaContra: "",
                                };
                                setFirmas(nuevasFirmas);

                                const nuevoData = { //Esto se hace para que el formato se actualice sin depender de SetData
                                    filas: rows,
                                    columnas: headers,
                                    numSubfilas,
                                    titulos: titulos,
                                    firmas: nuevasFirmas,
                                };
                                syncAndSave(nuevoData);
                            }}
                            className="mb-2 mt-2 p-1 bg-gray-200 hover:bg-gray-300 rounded"
                        >
                            <Trash2 className="w-5 h-5 text-gray-700" />
                        </button>
                    )}
                </div>

                {/* RESIDENTE DE TORRE */}
                <div className="flex flex-col items-center w-1/3">
                    <div className="h-20 mb-2 flex items-center justify-center">
                        <div>
                            {isFirmado.residente ? (
                                <img
                                    src={firmas.firmaRes}
                                    alt={`Firma ${firma.firmaID}`}
                                    className="h-full object-contain"
                                />
                            ) : rol === "residente" ? (
                                <button
                                    type="button"
                                    className="px-4 py-2 border-2 border-dashed border-gray-400 rounded-md text-sm text-gray-700 hover:bg-gray-100 active:scale-95 transition-all duration-200 flex items-center gap-2 font-semibold"
                                    onClick={() => {
                                        setIsFirmado(prev => ({ ...prev, residente: true }));
                                        const nuevasFirmas = {
                                            ...firmas,
                                            firmaRes: firma.imagenUrl,
                                        };
                                        setFirmas(nuevasFirmas);

                                        const nuevoData = {
                                            filas: rows,
                                            columnas: headers,
                                            numSubfilas,
                                            titulos,
                                            firmas: nuevasFirmas,
                                        };
                                        syncAndSave(nuevoData);
                                    }}
                                >
                                    <Signature className="w-4 h-4" />
                                    Firmar
                                </button>
                            ) : null}
                        </div>
                    </div>

                    <div className="w-48 border-t-2 border-black mb-1"></div>
                    <span className="text-sm font-semibold text-center">RESIDENTE DE TORRE</span>
                    {(isFirmado.residente && rol == "residente") && (
                        <button
                            onClick={() => {
                                setIsFirmado(prev => ({ ...prev, residente: false }));
                                const nuevasFirmas = {
                                    ...firmas,
                                    firmaRes: "",
                                };
                                setFirmas(nuevasFirmas);

                                const nuevoData = { //Esto se hace para que el formato se actualice sin depender de SetData
                                    filas: rows,
                                    columnas: headers,
                                    numSubfilas,
                                    titulos: titulos,
                                    firmas: nuevasFirmas,
                                };
                                syncAndSave(nuevoData);
                            }}
                            className="mb-2 mt-2 p-1 bg-gray-200 hover:bg-gray-300 rounded"
                        >
                            <Trash2 className="w-5 h-5 text-gray-700" />
                        </button>
                    )}
                </div>

                {/* SUPERVISIÓN TÉCNICA */}
                <div className="flex flex-col items-center w-1/3">
                    <div className="h-20 mb-2 flex items-center justify-center">
                        <div>
                            {isFirmado.supervisor ? (
                                <img
                                    src={firmas.firmaSup}
                                    alt={`Firma ${firma.firmaID}`}
                                    className="h-full object-contain"
                                />
                            ) : rol === "supervisor" ? (
                                <button
                                    type="button"
                                    className="px-4 py-2 border-2 border-dashed border-gray-400 rounded-md text-sm text-gray-700 hover:bg-gray-100 active:scale-95 transition-all duration-200 flex items-center gap-2 font-semibold"
                                    onClick={() => {
                                        setIsFirmado(prev => ({ ...prev, supervisor: true }));
                                        const nuevasFirmas = {
                                            ...firmas,
                                            firmaSup: firma.imagenUrl,
                                        };
                                        setFirmas(nuevasFirmas);

                                        const nuevoData = {
                                            filas: rows,
                                            columnas: headers,
                                            numSubfilas,
                                            titulos,
                                            firmas: nuevasFirmas,
                                        };
                                        syncAndSave(nuevoData);
                                    }}
                                >
                                    <Signature className="w-4 h-4" />
                                    Firmar
                                </button>
                            ) : null}
                        </div>
                    </div>

                    <div className="w-48 border-t-2 border-black mb-1"></div>
                    <span className="text-sm font-semibold text-center">SUPERVISIÓN TÉCNICA</span>
                    {(isFirmado.supervisor && rol == "supervisor") && (
                        <button
                            onClick={() => {

                                setIsFirmado(prev => ({ ...prev, supervisor: false }));
                                const nuevasFirmas = {
                                    ...firmas,
                                    firmaSup: "",
                                };
                                setFirmas(nuevasFirmas);

                                const nuevoData = { //Esto se hace para que el formato se actualice sin depender de SetData
                                    filas: rows,
                                    columnas: headers,
                                    numSubfilas,
                                    titulos: titulos,
                                    firmas: nuevasFirmas,
                                };
                                syncAndSave(nuevoData);
                            }}
                            className="mb-2 mt-2 p-1 bg-gray-200 hover:bg-gray-300 rounded"
                        >
                            <Trash2 className="w-5 h-5 text-gray-700" />
                        </button>
                    )}
                </div>
            </div>

        </div>
    );
}

export default Formato;
