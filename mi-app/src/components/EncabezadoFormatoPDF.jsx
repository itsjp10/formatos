export default function EncabezadoFormato({ tipoFormato, contenidoFormato, hayFilas }) {
    const titulos = contenidoFormato.titulos
    const columnas = contenidoFormato.columnas

    return (
        <div className="w-full relative text-sm">
            {/* Tabla invisible para igualar estructura de columnas */}
            <table className="absolute opacity-0 pointer-events-none table-fixed w-full border-collapse">
                <thead>
                    <tr>
                        {columnas.map((col, idx) => {
                            if (col.fixed) {
                                return (
                                    <th
                                        key={idx}
                                        rowSpan={3}
                                        className="border px-2 py-1"
                                    >
                                        {col.label}
                                    </th>
                                );
                            } else if (col.subheaders?.length > 0) {
                                return col.subheaders.map((sub, subIdx) => (
                                    <th
                                        key={`${idx}-${subIdx}`}
                                        colSpan={2}
                                        className="border px-2 py-1"
                                    >
                                        {sub}
                                    </th>
                                ));
                            } else {
                                return (
                                    <th
                                        key={idx}
                                        colSpan={2}
                                        rowSpan={2}
                                        className="border px-2 py-1"
                                    >
                                        {col.label}
                                    </th>
                                );
                            }
                        })}
                        {/* Columna oculta para simular la celda del botón eliminar */}

                    </tr>
                </thead>
            </table>

            {/* Contenido visible del encabezado */}
            <div className="border border-black"
                style={{ width: hayFilas ? 'calc(100% - 40px)' : '100%' }}>
                {/* Título y datos superiores */}
                <div className="p-2">
                    <h1 className='text-[24px] font-bold'>{tipoFormato}</h1>
                    <div className="flex justify-between text-xs w-full mt-1 font-semibold">
                        <div className="flex-1 text-left">
                            <span>COD. {titulos.cod}</span>
                        </div>
                        <div className="flex-1 text-center">
                            <span>APROBÓ: {titulos.aprobo}</span>
                        </div>
                        <div className="flex-1 text-right">
                            <span>FECHA DE EMISIÓN: {titulos.fechaEmision}</span>
                        </div>
                    </div>
                </div>

                {/* Campos tipo formulario */}
                <div className="grid grid-cols-4 border-t border-b border-black text-xs">
                    <div className="col-span-1 border-r border-black flex items-center p-1 font-semibold">OBRA:</div>
                    <div className="col-span-1 border-r border-black">
                        <input
                            readOnly
                            name="obra"
                            value={titulos.obra || ''}
                            className={`w-full p-1 outline-none `}
                        />
                    </div>
                    <div className="col-span-1 border-r border-black flex items-center p-1 font-semibold">FECHA:</div>
                    <div className="col-span-1">
                        <input
                            readOnly
                            name="fecha"
                            type="date"
                            value={titulos.fecha || ''}
                            className={`w-full p-1 outline-none `}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-4 border-b border-black text-xs">
                    <div className="col-span-1 border-r border-black flex items-center p-1 font-semibold">TORRE:</div>
                    <div className="col-span-1 border-r border-black">
                        <input
                            readOnly
                            name="torre"
                            value={titulos.torre || ''}
                            className={`w-full p-1 outline-none `}
                        />
                    </div>
                    <div className="col-span-1 border-r border-black flex items-center p-1 font-semibold">CONTRATISTA:</div>
                    <div className="col-span-1">
                        <input
                            readOnly
                            name="contratista"
                            value={titulos.contratista || ''}
                            className={`w-full p-1 outline-none `}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-4 text-xs">
                    <div className="col-span-1 border-r border-black flex items-center p-1 font-semibold">ELABORADO POR:</div>
                    <div className="col-span-1 border-r border-black">
                        <input
                            readOnly
                            name="elaboradoPor"
                            value={titulos.elaboradoPor || ''}
                            className={`w-full p-1 outline-none `}
                        />
                    </div>
                    <div className="col-span-1 border-r border-black flex items-center p-1 font-semibold">RESIDENTE DE OBRA:</div>
                    <div className="col-span-1">
                        <input
                            readOnly
                            name="residenteObra"
                            value={titulos.residenteObra || ''}
                            className={`w-full p-1 outline-none `}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
