export default function EncabezadoFormato({ tipoFormato, contenidoFormato, hoja }) {
    const titulos = contenidoFormato.titulos
    const columnas = contenidoFormato.columnas

    return (
        <div className="w-full relative text-sm">
            {/* Contenido visible del encabezado */}
            <div className="border border-black w-full">
                {/* Título y datos superiores */}
                <div className="p-2 relative pr-50">
                    {/* Logos a la derecha, altura completa del contenedor */}
                    <div className="absolute inset-y-0 right-15 flex items-center gap-7">
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

                    <h1 className="text-[18px] font-bold leading-tight text-left">{tipoFormato}</h1>

                    <div className="flex justify-between text-[10px] w-5/6 mt-1 font-semibold">
                        <div><span>COD. {titulos.cod}</span></div>
                        <div><span>APROBÓ: {titulos.aprobo}</span></div>
                        <div><span>FECHA DE EMISIÓN: {titulos.fechaEmision}</span></div>
                    </div>
                </div>


                {/* Campos tipo formulario */}
                <div className={`grid ${hoja ? "grid-cols-4" : "grid-cols-3"} border-t border-b border-black text-[11px]`}>
                    <div className="col-span-1 border-r border-black flex items-center p-1 font-semibold">OBRA:
                        <div className="ml-1">{titulos.obra || ''}</div>
                    </div>
                    <div className="col-span-1 border-r border-black flex items-center p-1 font-semibold">FECHA:
                        <div className="ml-1">{titulos.fecha || ''}</div>
                    </div>
                    {hoja && (
                        <div className="col-span-1 border-r border-black flex items-center p-1 font-semibold">HOJA:
                            <div className="ml-1">1</div>
                        </div>
                    )}
                    <div className="col-span-1 border-r border-black flex items-center p-1 font-semibold">ELABORADO POR:
                        <div className="ml-1">{titulos.elaboradoPor || ''}</div>
                    </div>
                </div>

                <div className="grid grid-cols-3 border-b border-black text-[11px]">
                    <div className="col-span-1 border-r border-black flex items-center p-1 font-semibold">TORRE:
                        <div className="ml-1">{titulos.torre || ''}</div>
                    </div>
                    <div className="col-span-1 border-r border-black flex items-center p-1 font-semibold">CONTRATISTA:
                        <div className="ml-1">{titulos.contratista || ''}</div>
                    </div>
                    <div className="col-span-1 border-r border-black flex items-center p-1 font-semibold">RESIDENTE DE OBRA:
                        <div className="ml-1">{titulos.residenteObra || ''}</div>

                    </div>
                </div>
            </div>
        </div>
    );
}
