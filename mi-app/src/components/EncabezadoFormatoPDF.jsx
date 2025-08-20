export default function EncabezadoFormato({ tipoFormato, contenidoFormato, hoja }) {
    const titulos = contenidoFormato.titulos;

    return (
        <div className="w-full text-sm">
            {/* Marco exterior */}
            <div className="border border-black w-full">

                {/* Fila superior: título + metadatos a la izquierda / logos a la derecha */}
                <div className="p-2">
                    <div className="flex items-start justify-between gap-4">
                        {/* Izquierda: título y metadatos */}
                        <div className="flex-1 min-w-0">
                            <h1 className="text-[18px] font-bold leading-tight text-left">{tipoFormato}</h1>

                            <div className="flex flex-wrap items-center gap-x-37 gap-y-1 text-[10px] mt-1 font-semibold">
                                <div><span>COD. {titulos.cod}</span></div>
                                <div><span>APROBÓ: {titulos.aprobo}</span></div>
                                <div><span>FECHA DE EMISIÓN: {titulos.fechaEmision}</span></div>
                            </div>
                        </div>

                        {/* Derecha: logos con flex (sin absolute/relative) */}
                        <div className="flex shrink-0 items-center gap-15 h-10 mr-20">
                            <img
                                className="h-full w-10 object-contain"
                                src="/images/vive_rio_img.png"
                                alt="vive rio"
                            />
                            <img
                                className="h-full w-10 object-contain"
                                src="/images/magdalena.png"
                                alt="magdalena"
                            />
                        </div>
                    </div>
                </div>

                <div className={`grid ${hoja ? "grid-cols-4" : "grid-cols-3"} border-t border-b border-black text-[11px]`}>
                    <div className="col-span-1 border-r border-black flex items-center p-1 font-semibold">
                        OBRA:<div className="ml-1">{titulos.obra || ''}</div>
                    </div>
                    <div className="col-span-1 border-r border-black flex items-center p-1 font-semibold">
                        FECHA:<div className="ml-1">{titulos.fecha || ''}</div>
                    </div>
                    {hoja && (
                        <div className="col-span-1 border-r border-black flex items-center p-1 font-semibold">
                            HOJA:<div className="ml-1">1</div>
                        </div>
                    )}
                    <div className="col-span-1 border-black flex items-center p-1 font-semibold">
                        ELABORADO POR:<div className="ml-1">{titulos.elaboradoPor || ''}</div>
                    </div>
                    
                </div>

                <div className="grid grid-cols-3 border-black text-[11px]">
                    <div className="col-span-1 border-r border-black flex items-center p-1 font-semibold">
                        TORRE:<div className="ml-1">{titulos.torre || ''}</div>
                    </div>
                    <div className="col-span-1 border-r border-black flex items-center p-1 font-semibold">
                        CONTRATISTA:<div className="ml-1">{titulos.contratista || ''}</div>
                    </div>
                    <div className="col-span-1 border-black flex items-center p-1 font-semibold">
                        RESIDENTE DE OBRA:<div className="ml-1">{titulos.residenteObra || ''}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
