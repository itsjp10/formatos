"use client"
import { useState, useEffect } from 'react'
import Sidebar, { SidebarItem } from './Sidebar'
import { Signature, Plus, LayoutTemplate, Info } from "lucide-react"
import Formato from './Formato'
import EditorPlantilla from './EditorPlantilla' //Para crear plantillas
import FirmaUploader from './FirmaUploader';
import Firma from './Firma';



function Dashboard({ logout }) {
    const [usuario, setUsuario] = useState(null)
    const [loading, setLoading] = useState(true)
    const [formatos, setFormatos] = useState([])
    const [error, setError] = useState('')
    const [activeSidebarItem, setActiveSidebarItem] = useState(null)
    const [pantalla, setPantalla] = useState('')
    const [tipoFormato, setTipoFormato] = useState('')
    const [selectedIdFormato, setSelectedIdFormato] = useState(null)
    const [formatoData, setFormatoData] = useState(null)
    const [firmas, setFirmas] = useState([])
    const [selectedFirma, setSelectedFirma] = useState(null)

    // Firma seleccionada
    const firmaSeleccionada = firmas.find((firma) => firma.firmaID === selectedFirma);

    // Tipos de formatos disponibles
    const [tiposFormatos, setTiposFormatos] = useState([])
    const handleSelectFirma = (firma) => {
        setSelectedFirma(firma);
        console.log('Firma seleccionada:', firma);
    }

    const handleUpload = async (dataUrl) => {
        try {
            // Subir a Cloudinary
            const formData = new FormData();
            formData.append('file', dataUrl);
            formData.append('upload_preset', 'firmas');
            const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/dttndicib/image/upload`, {
                method: 'POST',
                body: formData,
            });

            const cloudData = await cloudRes.json();
            const imageUrl = cloudData.secure_url;
            console.log('Firma subida a Cloudinary:', imageUrl);

            // Guardar en la base de datos
            const firmaPayload = {
                tipo: "residente",
                imagenUrl: imageUrl,
                usuarioId: usuario.userID,
                formatoId: null,
            };

            const dbRes = await fetch('/api/firmas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(firmaPayload),
            });

            if (!dbRes.ok) {
                let errorMsg = 'Error al guardar firma en la base de datos';
                try {
                    const data = await dbRes.json();
                    errorMsg = data?.error || errorMsg;
                } catch (err) {
                    console.warn('Respuesta sin JSON en dbRes');
                }
                throw new Error(errorMsg);
            }
            const nuevaFirma = await dbRes.json();
            setFirmas(prev => [...prev, nuevaFirma]);

            alert('Firma guardada con éxito');
        } catch (err) {
            console.error(err);
            alert('Error al subir la firma: ' + err.message);
        }
    };

    const handleEliminarFirma = async (firmaID) => {
        try {
            const res = await fetch(`/api/firmas/${firmaID}`, { method: 'DELETE' });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Error desconocido al eliminar la firma');
            }

            // Elimina la firma del estado local
            setFirmas((prevFirmas) => prevFirmas.filter((firma) => firma.firmaID !== firmaID));
        } catch (err) {
            console.error('❌ Error al eliminar firma:', err);
            alert('No se pudo eliminar la firma. Intenta nuevamente.');
        }
    };

    useEffect(() => {
        const fetchFormatos = async () => {
            setError('')
            if (!usuario) return
            try {
                const res = await fetch(`/api/formatos?usuarioId=${usuario.userID}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                })
                if (!res.ok) {
                    const { error } = await res.json()
                    throw new Error(error || 'Error desconocido')
                }
                const formats = await res.json()
                setFormatos(formats)
            } catch (err) {
                setError(err.message)
            }
        }

        fetchFormatos()
    }, [usuario])

    useEffect(() => {
        const fetchFirmas = async () => {
            setError('')
            if (!usuario) return
            try {
                const res = await fetch(`/api/firmas?usuarioId=${usuario.userID}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                })
                if (!res.ok) {
                    const { error } = await res.json()
                    throw new Error(error || 'Error desconocido')
                }
                const signatures = await res.json()
                setFirmas(signatures)
            } catch (err) {
                setError(err.message)
            }
        }

        fetchFirmas()
    }, [usuario])

    useEffect(() => {
        const storedUser = localStorage.getItem("user")
        if (storedUser) setUsuario(JSON.parse(storedUser))
        setLoading(false)
    }, [])

    useEffect(() => {
        const fetchTipoFormatos = async () => {
            setError('')
            if (!usuario) return
            try {
                const res = await fetch('/api/plantillas')
                if (!res.ok) {
                    const { error } = await res.json()
                    throw new Error(error || 'Error desconocido')
                }
                console.log('Fetching tipos de formatos...')
                const plantillas = await res.json()
                setTiposFormatos(plantillas)
                console.log('Tipos de formatos:', tiposFormatos)
            } catch (err) {
                setError(err.message)
            }
        }
        fetchTipoFormatos()
    }, [usuario])

    async function handleCrearFormato(tipoSeleccionado) {
        setError('');
        setLoading(true);

        try {
            const plantilla = tiposFormatos.find(p => p.nombre === tipoSeleccionado);

            if (!plantilla) {
                throw new Error('No se encontró la plantilla seleccionada');
            }

            // Construye la estructura base del formato
            const columnas = plantilla.estructura.headers
            const filas = plantilla.estructura.filas
            const numSubfilas = plantilla.estructura.numSubfilas || 3;

            const estructuraCompleta = {
                columnas,
                filas,
                numSubfilas,
            };

            const nuevoFormato = {
                tipo: plantilla.nombre,
                data: JSON.stringify(estructuraCompleta),
                name: plantilla.nombre,
                usuarioId: usuario.userID,
            };

            const res = await fetch('/api/formatos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoFormato),
            });

            if (!res.ok) {
                const { error } = await res.json();
                throw new Error(error || 'Error al crear formato');
            }

            const formatoCreado = await res.json();

            setFormatos(prev => [...prev, formatoCreado]);
            setSelectedIdFormato(formatoCreado.formatoID);
            setActiveSidebarItem(formatoCreado.formatoID);
            setFormatoData(JSON.parse(formatoCreado.data));
            setTipoFormato(formatoCreado.tipo);
            setPantalla("Formato");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }


    const handleSeleccionarFormato = (formatoID) => {
        const formato = formatos.find(f => f.formatoID === formatoID)
        if (formato) {
            setFormatoData(JSON.parse(formato.data))
            setTipoFormato(formato.tipo)
            setSelectedIdFormato(formatoID)
            setActiveSidebarItem(formatoID)
            setPantalla("Formato")
        }
    }

    async function handleGuardarFormato(dataActualizada) {
        setLoading(true)
        setError('')
        try {
            const res = await fetch(`/api/formatos/${selectedIdFormato}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: JSON.stringify(dataActualizada) }),
            })
            if (!res.ok) {
                const { error } = await res.json()
                throw new Error(error || 'Error al guardar formato')
            }
            // Actualiza el formato en el estado local
            setFormatoData(dataActualizada)
            setFormatos(prev =>
                prev.map(f =>
                    f.formatoID === selectedIdFormato
                        ? { ...f, data: JSON.stringify(dataActualizada) }
                        : f
                )
            )
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (!usuario) return <p>No user was found</p>

    return (
        <div className="flex bg-white min-h-screen">
            <Sidebar nombre={usuario.name} rol={usuario.role} logout={logout}>
                <SidebarItem
                    icon={<Plus size={20} />}
                    text="Nuevo formato"
                    active={activeSidebarItem === "Nuevo formato"}
                    onClick={() => { setPantalla(""); setActiveSidebarItem("Nuevo formato"); }}
                />
                <SidebarItem
                    icon={<Signature size={20} />}
                    text="Mis firmas"
                    active={activeSidebarItem === "Mis firmas"}
                    onClick={() => { setPantalla("Mis firmas"); setActiveSidebarItem("Mis firmas") }}
                />
                {usuario.role === 'residente' && (<SidebarItem
                    icon={<LayoutTemplate size={20} />}
                    text="Crear plantilla"
                    active={activeSidebarItem === "Crear plantilla"}
                    onClick={() => { setPantalla("Crear plantilla"); setActiveSidebarItem("Crear plantilla"); }}
                />)

                }
                <hr className="my-3" />
                <SidebarItem
                    text="Formatos"
                    active={activeSidebarItem === "Formatos"}
                    onClick={() => setActiveSidebarItem("Formatos")}
                />
                {(formatos || []).map((formato) => (
                    <SidebarItem
                        key={formato.formatoID}
                        text={formato.name}
                        tipo="formatoItem"
                        active={activeSidebarItem === formato.formatoID}
                        onClick={() => handleSeleccionarFormato(formato.formatoID)}
                    />
                ))}
            </Sidebar>
            <div className="flex-1 flex items-center justify-center">
                {pantalla === "" && (
                    console.log('FormatosPlantillas:', tiposFormatos) ||
                    <div className="flex flex-col items-center">
                        <h1 className='text-black text-[26px] '>Seleccione un formato para empezar</h1>
                        <select
                            className="mt-6 p-2 border rounded text-black"
                            value=""
                            onChange={e => handleCrearFormato(e.target.value)}
                        >
                            <option value="" disabled>Elige un formato...</option>
                            {tiposFormatos.map((tipo, index) => (
                                <option key={tipo.plantillaID} value={tipo.nombre}>{tipo.nombre}</option>
                            ))}
                        </select>
                    </div>
                )}
                {pantalla === "Formato" && (
                    <div className="p-4 text-black w-full max-w-5xl">
                        <h1 className="mb-4 text-2xl font-bold">Formato: {tipoFormato}</h1>
                        <Formato
                            key={selectedIdFormato}
                            tipoFormato={tipoFormato}
                            contenidoFormato={formatoData}
                            onGuardar={handleGuardarFormato}
                            loading={loading}
                        />
                        {error && <div className="mt-2 text-red-500">{error}</div>}
                    </div>
                )}
                {pantalla === "Crear plantilla" && (
                    <EditorPlantilla usuarioId={usuario.userID} onCrearPlantilla={async (plantilla) => {
                        try {
                            const res = await fetch('/api/plantillas', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ ...plantilla, creadoPorId: usuario.userID }),
                            });

                            if (!res.ok) {
                                const { error } = await res.json();
                                throw new Error(error || 'Error al crear plantilla');
                            }

                            const data = await res.json();
                            alert('Plantilla creada correctamente');
                        } catch (err) {
                            alert(`Error: ${err.message}`);
                        }
                    }} />
                )}
                {pantalla === "Mis firmas" && (
                    <div className="text-black max-w-3xl p-6">
                        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            Mis firmas
                            <div className="relative group">
                                <Info className="w-5 h-5 cursor-pointer text-gray-500" />
                                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 hidden group-hover:block bg-white border border-gray-300 text-xs text-gray-800 p-2 rounded shadow-md z-10 w-48">
                                    Selecciona una firma para usarla en los formatos.
                                </div>
                            </div>
                        </h1>

                        <div className="max-h-[340px] overflow-y-auto space-y-4 w-full">
                            {firmaSeleccionada && (
                                <Firma
                                    key={firmaSeleccionada.firmaID}
                                    firma={firmaSeleccionada}
                                    onDelete={handleEliminarFirma}
                                    onSelect={handleSelectFirma}
                                    selected={true}
                                />
                            )}

                            {firmas
                                .filter((firma) => firma.firmaID !== selectedFirma)
                                .map((firma) => (
                                    <Firma
                                        key={firma.firmaID}
                                        firma={firma}
                                        onDelete={handleEliminarFirma}
                                        onSelect={handleSelectFirma}
                                        selected={false}
                                    />
                                ))}
                        </div>

                        <h2 className="text-xl font-bold mt-8 mb-2">Firmar</h2>
                        <FirmaUploader onUpload={handleUpload} />
                    </div>
                )}

            </div>
        </div>
    )
}

export default Dashboard