import EncabezadoFormatoPDF from "../../../../components/EncabezadoFormatoPDF";
import React from "react";
import { headers } from "next/headers";

export default async function PrintFormatoPage({ params }) {
    const { formatoID } = await params;

    const h = await headers();
    const host = h.get("x-forwarded-host") || h.get("host");
    const proto = h.get("x-forwarded-proto") || "http";
    const base = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;

    const res = await fetch(`${base}/api/formato?formatoID=${formatoID}`, {
        cache: "no-store",
        // Si /api/formato requiere sesión, propaga cookies:
        // headers: { cookie: h.get("cookie") || "" },
    });

    if (!res.ok) {
        return <div className="p-6 text-sm text-red-600">No se pudo cargar el formato.</div>;
    }

    const formato = await res.json();
    let data = typeof formato.data === "string" ? JSON.parse(formato.data) : formato.data;
    const rows = data.filas
    const cols = data.columnas
    const numSubfilas = data.numSubfilas
    const titulos = data.titulos
    const firmas = data.firmas
    const isFirmado = {
        contratista: !!firmas.firmaContra,
        residente: !!firmas.firmaRes,
        supervisor: !!firmas.firmaSup,
    }
    const tipoFormato = formato.tipo

    const isSimpleField = (label) => ['APTO', 'OBSERVACIONES'].includes(label);
    const isDateField = (label) => label === 'FECHA';
    const isSignatureField = (label) => label === 'FIRMA';


    const totalCols = cols.reduce((acc, col) => {
        if (col.fixed) return acc + 1;
        if (col.subheaders?.length) return acc + (col.subheaders.length * 2);
        return acc + 2;
    }, 0);
    return (

        <div className="w-full">
            <table className="table-auto border-collapse w-full text-xs">
                <thead className="p-0">
                    <tr>
                        <th colSpan={totalCols} className="p-0 border-0">
                            {/* Encabezado del formato */}
                            {titulos && (
                                <EncabezadoFormatoPDF
                                    contenidoFormato={data}
                                    tipoFormato={tipoFormato}
                                />
                            )}
                        </th>
                    </tr>
                    {/* Fila 1: labels principales */}
                    <tr>
                        {data.columnas?.map((col, colIndex) => {
                            if (col.fixed) {
                                return (
                                    <th
                                        key={colIndex}
                                        rowSpan={3}
                                        className="bg-gray-200 border px-2 text-center align-middle"
                                    >
                                        {col.label}
                                    </th>
                                );
                            } else if (col.subheaders && col.subheaders.length > 0) {
                                return (
                                    <th
                                        key={colIndex}
                                        colSpan={col.subheaders.length * 2}
                                        className="bg-gray-200 border px-2 text-center"
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
                                        className="bg-gray-200 border px-2 text-center align-middle"
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
                                        className="bg-gray-200 border px-2 text-center"
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
                                        <th className="bg-gray-200 border px-2 text-center">C</th>
                                        <th className="bg-gray-300 border px-2 text-center">NC</th>
                                    </React.Fragment>
                                ));
                            } else {
                                // columna sin subheaders (no fija)
                                return (
                                    <React.Fragment key={`${colIndex}-nocols`}>
                                        <th className="bg-gray-200 border px-2 text-center">C</th>
                                        <th className="bg-gray-300 border px-2 text-center">NC</th>
                                    </React.Fragment>
                                );
                            }
                        })}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIndex) =>
                        [...Array(numSubfilas)].map((_, subIndex) => {
                            return (
                                <tr key={`${rowIndex}-${subIndex}`}>
                                    {cols.map((header, hIndex) => {
                                        const keys = header.subheaders?.length ? header.subheaders : [header.label];

                                        return keys.map((key, kIndex) => {
                                            const fullKey = `${header.label}-${key}-${subIndex}`;

                                            if (isSimpleField(header.label) && subIndex === 0) {
                                                return (
                                                    <td
                                                        key={`${hIndex}-${kIndex}`}
                                                        rowSpan={numSubfilas}
                                                        className="border px-2 py-1 text-center align-top relative"
                                                        style={header.label === "APTO" ? { maxWidth: 40, width: 40 } : {}}
                                                    >
                                                        <textarea
                                                            readOnly
                                                            value={row[`${header.label}-${key}-0`] || ''}
                                                            className="w-full h-full min-h-[60px] border-none outline-none resize-none"
                                                            style={header.label === "APTO" ? { maxWidth: 40 } : {}}
                                                        />
                                                    </td>
                                                );
                                            }

                                            if (isSimpleField(header.label)) return null;

                                            if (isDateField(header.label)) {
                                                    const cellValue = row[fullKey] || '';

                                                    return (
                                                        <td
                                                            key={`${hIndex}-${kIndex}`}
                                                            className="border px-2 py-1 text-center"
                                                            style={{ width: 85, minWidth: 85 }}
                                                        >
                                                            {cellValue ? (
                                                                <input
                                                                    type="date"
                                                                    readOnly
                                                                    value={cellValue}
                                                                    className="w-full border-none outline-none"
                                                                />
                                                            ) : (
                                                                <input
                                                                    type="text"
                                                                    readOnly
                                                                    value=""
                                                                    className="w-full border-none outline-none"
                                                                />
                                                            )}
                                                        </td>
                                                    );
                                                }

                                            if (isSignatureField(header.label)) {
                                                return (
                                                    <td
                                                        key={`${hIndex}-${kIndex}`}
                                                        className="border text-center"
                                                        style={{ width: 60, minWidth: 60 }}
                                                    >
                                                        {row[fullKey] ? (
                                                            <div className="relative flex items-center justify-center leading-none">
                                                                <img
                                                                    src={row[fullKey]}
                                                                    alt="Firma"
                                                                    className="block object-contain max-w-[60px] max-h-[18px] pointer-events-none"
                                                                />
                                                            </div>
                                                        ) : null}
                                                    </td>
                                                );
                                            }


                                            return [
                                                <td
                                                    key={`c-${hIndex}-${kIndex}`}
                                                    className="border px-2 text-center cursor-pointer w-7"
                                                >
                                                    {row[fullKey] === 'C' ? '✔' : ''}
                                                </td>,
                                                <td
                                                    key={`nc-${hIndex}-${kIndex}`}
                                                    className="border px-2 text-center cursor-pointer w-7 bg-gray-300"
                                                >
                                                    {row[fullKey] === 'NC' ? '✘' : ''}
                                                </td>
                                            ];
                                        });
                                    })}
                                </tr>
                            );
                        })
                    )}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={totalCols} className="p-0">
                            <div className="flex w-full justify-between items-start px-2 max-w-2xl mx-auto mt-4">
                                {/* CONTRATISTA */}
                                <div className="flex flex-col items-center w-1/3">
                                    <div className="h-12 mb-1 flex items-center justify-center">
                                        <div>
                                            {isFirmado.contratista ? (
                                                <img
                                                    src={firmas.firmaContra}
                                                    alt="Firma contratista"
                                                    className="h-full object-contain"
                                                />
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="w-32 border-t border-black mb-1"></div>
                                    <span className="text-xs font-medium text-center">CONTRATISTA</span>
                                </div>

                                {/* RESIDENTE DE TORRE */}
                                <div className="flex flex-col items-center w-1/3">
                                    <div className="h-12 mb-1 flex items-center justify-center">
                                        <div>
                                            {isFirmado.residente ? (
                                                <img
                                                    src={firmas.firmaRes}
                                                    alt="Firma residente"
                                                    className="h-full object-contain"
                                                />
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="w-32 border-t border-black mb-1"></div>
                                    <span className="text-xs font-medium text-center">RESIDENTE DE TORRE</span>
                                </div>

                                {/* SUPERVISIÓN TÉCNICA */}
                                <div className="flex flex-col items-center w-1/3">
                                    <div className="h-12 mb-1 flex items-center justify-center">
                                        <div>
                                            {isFirmado.supervisor ? (
                                                <img
                                                    src={firmas.firmaSup}
                                                    alt="Firma sup"
                                                    className="h-full object-contain"
                                                />
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="w-32 border-t border-black mb-1"></div>
                                    <span className="text-xs font-medium text-center">SUPERVISIÓN TÉCNICA</span>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tfoot>

            </table>


            <style
                media="print"
                // usamos dangerouslySetInnerHTML para evitar que Next lo trate como styled-jsx
                dangerouslySetInnerHTML={{
                    __html: `
      thead { display: table-header-group !important; }
      tfoot { display: table-footer-group !important; }
      .fila-group { break-inside: avoid; page-break-inside: avoid; }
      tr { break-inside: avoid; page-break-inside: avoid; }
      table { page-break-inside: auto; }
      .page { break-after: page; page-break-after: always; }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    `
                }}
            />
        </div>
    );
}