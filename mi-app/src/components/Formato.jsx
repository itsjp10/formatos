import { useState, useEffect, useRef } from 'react';
import { io } from "socket.io-client";
import React from 'react';
import { Download, Loader2, Check, Signature, Trash2, Plus, Share2, Copy, X } from "lucide-react"
import EncabezadoFormato from './EncabezadoFormato';

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
    transports: ["websocket"],   // o ["websocket","polling"] si quieres fallback
    path: "/socket.io",
});

function Formato({ formatoID, tipoFormato, onGuardar, rol, firma, publicLink }) {
    //vamos a obtener la informacion de contenidoFormato de un fetch para no depender de params, también evitamos la desincronizacion con los datos al editar    
    const [data, setData] = useState({
        columnas: [],
        filas: [],
        numSubfilas: 3,
        titulos: '',
        firmas: {}
    });

    const [showNoFirma, setShowNoFirma] = useState(false);

    //Para la descarga:
    const [downloading, setDownloading] = useState(false);
    const [done, setDone] = useState(false);
    const [progress, setProgress] = useState(0);
    const abortRef = useRef(null);

    const handleDownload = async () => {
        if (downloading) return;
        setDone(false);
        setProgress(0);
        setDownloading(true);

        const ctrl = new AbortController();
        abortRef.current = ctrl;

        try {
            const res = await fetch(`/api/formatos/${formatoID}/pdf`, {
                method: "GET",
                credentials: "include",
                signal: ctrl.signal,
            });
            if (!res.ok) throw new Error("No se pudo generar el PDF.");

            // Intentamos leer como stream para progreso
            const contentLength = Number(res.headers.get("Content-Length")) || 0;

            if (res.body && res.body.getReader) {
                const reader = res.body.getReader();
                const chunks = [];
                let received = 0;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    chunks.push(value);
                    received += value.length;
                    if (contentLength) {
                        setProgress(Math.round((received / contentLength) * 100));
                    }
                }

                const blob = new Blob(chunks, { type: "application/pdf" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `formato-${formatoID}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
            } else {
                // Fallback sin streams
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `formato-${formatoID}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
            }

            setDone(true);
            // Resetea el estado “done” tras 1.2s para volver al icono normal
            setTimeout(() => setDone(false), 1200);
        } catch (e) {
            if (e.name !== "AbortError") {
                console.error(e);
                alert("Hubo un problema descargando el PDF.");
            }
        } finally {
            setDownloading(false);
            abortRef.current = null;
        }
    };

    const cancelDownload = () => {
        if (abortRef.current) abortRef.current.abort();
    };

    // Share modal
    const [shareOpen, setShareOpen] = useState(false);
    const [shareLink, setShareLink] = useState('');
    const [copyStatus, setCopyStatus] = useState('idle');

    const openShare = () => {
        // construye el link público
        const link = `${window.location.origin}/formato/${publicLink}`;
        setShareLink(link);
        setCopyStatus('idle');
        setShareOpen(true);
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareLink);
            setCopyStatus('ok');
            setTimeout(() => setCopyStatus('idle'), 1200);
        } catch (e) {
            console.error(e);
            setCopyStatus('err');
            setTimeout(() => setCopyStatus('idle'), 1500);
        }
    };

    // cerrar con ESC
    useEffect(() => {
        if (!shareOpen) return;
        const onKey = (e) => e.key === 'Escape' && setShareOpen(false);
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [shareOpen]);


    const ensureFirmaOrWarn = () => {
        const ok = !!(firma && firma.imagenUrl);
        if (!ok) setShowNoFirma(true);
        return ok;
    };

    // referencia para evitar bucles infinitos
    const isRemoteUpdate = useRef(false);

    // Crea el socket dentro del componente
    const socketRef = useRef(null);

    useEffect(() => {
        // Solo crea el socket si no existe
        if (!socketRef.current) {
            socketRef.current = io("http://localhost:3001");
        }
        const socket = socketRef.current;
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
            // Desconecta el socket al desmontar el componente
            socket.disconnect();
            socketRef.current = null;
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
        <div className="w-full overflow-x-hidden">
            <div className="flex justify-end md:mr-10 gap-2">
                {publicLink && (
                    <button
                        type="button"
                        onClick={openShare}
                        className="no-print mt-2 inline-flex items-center gap-2 bg-gray-200 hover:bg-gray-300 
                 text-gray-800 rounded-full px-3 py-1 shadow-sm transition-colors 
                 disabled:opacity-60 mb-2 text-sm"
                        title="Compartir enlace"
                    >
                        <Share2 className="w-4 h-4" />
                        Compartir
                    </button>
                )}
                <button
                    type="button"
                    onClick={handleDownload}
                    className="no-print mt-2 inline-flex items-center gap-2 bg-gray-200 hover:bg-gray-300 
               text-gray-800 rounded-full px-3 py-1 shadow-sm transition-colors 
               disabled:opacity-60 mb-2 text-sm"
                    disabled={downloading}
                    title="Descargar"
                >
                    {downloading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {progress > 0 ? `${progress}%` : "Generando..."}
                        </>
                    ) : done ? (
                        <>
                            <Check className="w-4 h-4" />
                            ¡Listo!
                        </>
                    ) : (
                        <>
                            <Download className="w-4 h-4" />
                            Descargar
                        </>
                    )}
                </button>
            </div>

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

            <div className="relative overflow-auto md:px-0 max-h-[70vh] md:max-h-[53vh]">
                <table className="table-auto border-separate border-spacing-0 w-full text-xs">
                    <thead className="sticky top-0 z-40">
                        {/* Fila 1: labels principales */}
                        <tr>
                            {data.columnas?.map((col, colIndex) => {
                                const esAPTO = col.label === 'APTO';
                                if (col.fixed || esAPTO) {
                                    return (
                                        <th
                                            key={colIndex}
                                            rowSpan={3}
                                            className={`border px-2 py-1 text-center align-middle bg-gray-200 ${esAPTO
                                                ? "sticky left-0 top-0 z-50"       // <- columna y header fijos
                                                : "sticky top-0 z-40"              // <- headers fijos arriba
                                                }`}
                                        >
                                            {col.label}
                                        </th>
                                    );
                                } else if (col.subheaders && col.subheaders.length > 0) {
                                    return (
                                        <th
                                            key={colIndex}
                                            colSpan={col.subheaders.length * 2}
                                            className="bg-gray-200 border px-2 py-1 text-center sticky top-0 z-40"
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
                                            className="bg-gray-200 border px-2 py-1 text-center align-middle sticky top-0 z-40"
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
                                                    const esAPTO = header.label === 'APTO'
                                                    return (
                                                        <td
                                                            key={`${hIndex}-${kIndex}`}
                                                            rowSpan={numSubfilas}
                                                            className={`border px-2 py-1 text-center align-top relative ${esAPTO ? "min-w-20 sticky left-0 z-20 bg-white" : ""}`}
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
                                                                type="date" // 👈 aquí el cambio
                                                                value={row[fullKey] || ''}
                                                                onChange={(e) => updateCell(rowIndex, fullKey, e.target.value)}
                                                                className="w-full min-w-[65px] border-none outline-none"
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
                                                                        if (!ensureFirmaOrWarn()) return;
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
                                                        className="border px-1 py-1 text-center cursor-pointer w-7 min-w-[28px] max-w-[28px]"
                                                        onClick={() => toggleCheckbox(rowIndex, fullKey, 'C')}
                                                    >
                                                        {row[fullKey] === 'C' ? '✔' : ''}
                                                    </td>,
                                                    <td
                                                        key={`nc-${hIndex}-${kIndex}`}
                                                        className="border px-1 py-1 text-center cursor-pointer w-7 min-w-[28px] max-w-[28px] bg-gray-300"
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
            </div>

            {/* Botón anclado abajo a la izquierda */}
            <button
                type="button"
                onClick={addRow}
                className="mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full p-1 shadow-sm transition-colors"
                title="Insertar fila debajo"
            >
                <Plus className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full px-4 max-w-5xl mx-auto mt-5 mb-10 sm:mb-0">
                {/* CONTRATISTA */}

                <div className="min-w-0 flex flex-col items-center">
                    <div className="h-20 mb-2 flex items-center justify-center w-full">
                        <div className="max-w-full">
                            {isFirmado.contratista ? (
                                <img
                                    src={firmas.firmaContra}
                                    alt="Firma contratista"
                                    className="h-full max-h-20 object-contain max-w-full"
                                />
                            ) : rol === "contratista" ? (
                                <button
                                    type="button"
                                    className="px-4 py-2 border-2 border-dashed border-gray-400 rounded-md text-sm text-gray-700 hover:bg-gray-100 active:scale-95 transition-all duration-200 flex items-center gap-2 font-semibold"
                                    onClick={() => {
                                        if (!ensureFirmaOrWarn()) return;
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
                <div className="min-w-0 flex flex-col items-center">
                    <div className="h-20 mb-2 flex items-center justify-center w-full">
                        <div className="max-w-full">
                            {isFirmado.residente ? (
                                <img
                                    src={firmas.firmaRes}
                                    alt="Firma residente"
                                    className="h-full max-h-20 object-contain max-w-full"
                                />
                            ) : rol === "residente" ? (
                                <button
                                    type="button"
                                    className="px-4 py-2 border-2 border-dashed border-gray-400 rounded-md text-sm text-gray-700 hover:bg-gray-100 active:scale-95 transition-all duration-200 flex items-center gap-2 font-semibold"
                                    onClick={() => {
                                        if (!ensureFirmaOrWarn()) return;
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
                <div className="min-w-0 flex flex-col items-center">
                    <div className="h-20 mb-2 flex items-center justify-center w-full">
                        <div className="max-w-full">
                            {isFirmado.supervisor ? (
                                <img
                                    src={firmas.firmaSup}
                                    alt="Firma supervisor"
                                    className="h-full max-h-20 object-contain max-w-full"
                                />
                            ) : rol === "supervisor" ? (
                                <button
                                    type="button"
                                    className="px-4 py-2 border-2 border-dashed border-gray-400 rounded-md text-sm text-gray-700 hover:bg-gray-100 active:scale-95 transition-all duration-200 flex items-center gap-2 font-semibold"
                                    onClick={() => {
                                        if (!ensureFirmaOrWarn()) return;
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
            {showNoFirma && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl shadow-xl p-5 w-[90%] max-w-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">No hay firma creada</h2>
                        <p className="text-sm text-gray-700 mb-4">
                            Debes crear una firma primero para poder firmar este formato.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800"
                                onClick={() => setShowNoFirma(false)}
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {shareOpen && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShareOpen(false);
                    }}
                    aria-modal="true"
                    role="dialog"
                >
                    <div className="bg-white rounded-xl shadow-xl p-5 w-[90%] max-w-md">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-semibold text-gray-900">Compartir formato</h2>
                            <button
                                className="p-1 rounded hover:bg-gray-100"
                                onClick={() => setShareOpen(false)}
                                title="Cerrar"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <label className="block text-sm text-gray-600 mb-1">Enlace</label>
                        <div className="flex items-center gap-2">
                            <input
                                readOnly
                                value={shareLink}
                                className="flex-1 px-3 py-2 border rounded-md text-sm bg-gray-50 overflow-x-auto"
                                onFocus={(e) => e.target.select()}
                            />
                            <button
                                type="button"
                                onClick={copyToClipboard}
                                className="inline-flex items-center gap-1 px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm"
                                title="Copiar al portapapeles"
                            >
                                <Copy className="w-4 h-4" />
                                Copiar
                            </button>
                        </div>

                        {/* Mensaje de estado de copiado */}
                        {copyStatus === 'ok' && (
                            <p className="mt-2 text-xs text-green-600">¡Copiado!</p>
                        )}
                        {copyStatus === 'err' && (
                            <p className="mt-2 text-xs text-red-600">No se pudo copiar. Intenta seleccionar y copiar manualmente.</p>
                        )}
                    </div>
                </div>
            )}


        </div>
    );
}

export default Formato;
