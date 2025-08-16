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

    return (
        <div className="w-full">
            {/* Encabezado del formato */}
            {titulos && (
                <EncabezadoFormatoPDF
                    contenidoFormato={data}
                    tipoFormato={tipoFormato}
                    hayFilas={false}
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
                                                    >
                                                        <textarea
                                                        readOnly
                                                            value={row[`${header.label}-${key}-0`] || ''}
                                                            className="w-full h-full min-h-[60px] border-none outline-none resize-none"
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
                                                            readOnly
                                                            type="text"
                                                            value={row[fullKey] || ''}
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
                                                        style={{ width: 100, minWidth: 100 }}
                                                    >
                                                        {row[fullKey] ? (
                                                            <div className="relative h-10 flex items-center justify-center">
                                                                <img
                                                                    src={row[fullKey]}
                                                                    alt="Firma"
                                                                    className="inset-0 mx-auto my-auto object-contain max-w-[90px] max-h-[36px] pointer-events-none"
                                                                />
                                                            </div>
                                                        ) : null}
                                                    </td>
                                                );
                                            }


                                            return [
                                                <td
                                                    key={`c-${hIndex}-${kIndex}`}
                                                    className="border px-2 py-1 text-center cursor-pointer w-7"
                                                >
                                                    {row[fullKey] === 'C' ? '✔' : ''}
                                                </td>,
                                                <td
                                                    key={`nc-${hIndex}-${kIndex}`}
                                                    className="border px-2 py-1 text-center cursor-pointer w-7 bg-gray-300"
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


            </table>

            <div className="flex w-full justify-between items-start px-4 max-w-4xl mx-auto mt-8">
                {/* CONTRATISTA */}

                <div className="flex flex-col items-center w-1/3">
                    <div className="h-20 mb-2 flex items-center justify-center">
                        <div>
                            {isFirmado.contratista ? (
                                <img
                                    src={firmas.firmaContra}
                                    alt={`Firma contratista`}
                                    className="h-full object-contain"
                                />
                            ) : null}
                        </div>
                    </div>

                    <div className="w-48 border-t-2 border-black mb-1"></div>
                    <span className="text-sm font-semibold text-center">CONTRATISTA</span>
                </div>

                {/* RESIDENTE DE TORRE */}
                <div className="flex flex-col items-center w-1/3">
                    <div className="h-20 mb-2 flex items-center justify-center">
                        <div>
                            {isFirmado.residente ? (
                                <img
                                    src={firmas.firmaRes}
                                    alt={`Firma residente`}
                                    className="h-full object-contain"
                                />
                            ) : null}
                        </div>
                    </div>

                    <div className="w-48 border-t-2 border-black mb-1"></div>
                    <span className="text-sm font-semibold text-center">RESIDENTE DE TORRE</span>
                </div>

                {/* SUPERVISIÓN TÉCNICA */}
                <div className="flex flex-col items-center w-1/3">
                    <div className="h-20 mb-2 flex items-center justify-center">
                        <div>
                            {isFirmado.supervisor ? (
                                <img
                                    src={firmas.firmaSup}
                                    alt={`Firma sup`}
                                    className="h-full object-contain"
                                />
                            ) : null}
                        </div>
                    </div>

                    <div className="w-48 border-t-2 border-black mb-1"></div>
                    <span className="text-sm font-semibold text-center">SUPERVISIÓN TÉCNICA</span>
                </div>
            </div>

        </div>
    );
}