"use client"
import { useState, useEffect } from 'react'
import Sidebar, { SidebarItem } from './Sidebar'
import { Signature, Plus, LayoutTemplate, Info } from "lucide-react"
import Formato from './Formato'
import FormatoCompartido from './FormatoCompartido'
import EditorPlantilla from './EditorPlantilla' //Para crear plantillas
import FirmaUploader from './FirmaUploader';
import Firma from './Firma';
import ConfirmDialog from './ConfirmDialog';



function Dashboard({ logout }) {
    const [usuario, setUsuario] = useState(null)
    const [loading, setLoading] = useState(true)
    const [formatos, setFormatos] = useState([])
    const [formatosCompartidos, setFormatosCompartidos] = useState([])
    const [error, setError] = useState('')
    const [activeSidebarItem, setActiveSidebarItem] = useState(null)
    const [pantalla, setPantalla] = useState('')
    const [tipoFormato, setTipoFormato] = useState('')
    const [selectedIdFormato, setSelectedIdFormato] = useState(null)
    const [formatoData, setFormatoData] = useState(null)
    const [firmas, setFirmas] = useState([])
    const [selectedFirma, setSelectedFirma] = useState(null)
    const [isCompartido, setIsCompartido] = useState(false);

    //Para saber si la sidebar está expanded o no
    const [expanded, setExpanded] = useState(false)
    const mainOffset = expanded ? "md:ml-64" : "md:ml-[72px]"

    useEffect(() => {
        // al montar verificamos si el usuario está en desktop, en ese caso seteamos expanded tru
        if (!window.matchMedia("(max-width: 767px)").matches) {
            setExpanded(true)
        }
    }, [])

    //Se busca en local storage si hay un usuario ya guardado y se carga, igualmente con la firma
    useEffect(() => {
        const storedUser = localStorage.getItem("user")
        if (storedUser) setUsuario(JSON.parse(storedUser))

        const storedFirmaId = localStorage.getItem("selectedFirmaId");
        if (storedFirmaId) {
            setSelectedFirma(storedFirmaId);
        }

        setLoading(false)
    }, [])


    // Firma seleccionada
    const firmaSeleccionada = firmas.find((firma) => firma.firmaID === selectedFirma);

    // Tipos de formatos disponibles, los que el usuario puede elegir
    const [tiposFormatos, setTiposFormatos] = useState([])
    const handleSelectFirma = (firma) => {
        setSelectedFirma(firma);
        localStorage.setItem('selectedFirmaId', firma); // 👈 Guarda en localStorage
        console.log('Firma seleccionada:', firma);

    }

    // Manejo de confirmación de eliminación
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [formatoToDelete, setFormatoToDelete] = useState(null);

    //primer fetch de formatos 
    useEffect(() => {
        if (!usuario) return

        const fetchDatos = async () => {
            setError('')

            try {
                // Fetch de formatos normales
                const resFormatos = await fetch(`/api/formatos?usuarioId=${usuario.userID}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                })

                if (!resFormatos.ok) {
                    const { error } = await resFormatos.json()
                    throw new Error(error || 'Error al obtener tus formatos')
                }

                const formatosData = await resFormatos.json()
                setFormatos(formatosData)

                // Fetch de formatos compartidos
                const resCompartidos = await fetch(`/api/formatos/compartidos?usuarioId=${usuario.userID}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                })

                if (!resCompartidos.ok) {
                    const { error } = await resCompartidos.json()
                    throw new Error(error || 'Error al obtener formatos compartidos')
                }

                const compartidosData = await resCompartidos.json()
                console.log("fetch de compartidos_: ", compartidosData)
                setFormatosCompartidos(compartidosData)

            } catch (err) {
                setError(err.message)
            }
        }

        fetchDatos()
    }, [usuario])


    useEffect(() => {
        if (!selectedIdFormato) return;
        const lista = isCompartido ? formatosCompartidos : formatos;
        const formatoActualizado = lista.find(f => f.formatoID === selectedIdFormato);
        console.log("se actualizaron los formato y formato compartido")

        if (formatoActualizado) {
            console.log("se actualizara formatoData de", selectedIdFormato)
            setFormatoData({ ...JSON.parse(formatoActualizado.data) });
            console.log("formatoDATA es", formatoData)

        }
    }, [formatos, formatosCompartidos, selectedIdFormato]);



    const handleDeleteFormato = async () => {
        if (!formatoToDelete) return;
        try {
            const res = await fetch(`/api/formatos/${formatoToDelete}`, { method: 'DELETE', credentials: 'include', });
            if (!res.ok) {
                const { error } = await res.json();
                throw new Error(error || 'Error al eliminar formato');
            }

            // Actualizar lista de formatos local
            setFormatos(prev => prev.filter(f => f.formatoID !== formatoToDelete));
            if (selectedIdFormato === formatoToDelete) {
                setSelectedIdFormato(null);
                setPantalla('');
            }
            setFormatoToDelete(null);
            setShowConfirmDelete(false);
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

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
                credentials: 'include',
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
            const res = await fetch(`/api/firmas/${firmaID}`, { method: 'DELETE', credentials: 'include', });

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
        const fetchFirmas = async () => {
            setError('')
            if (!usuario) return
            try {
                const res = await fetch(`/api/firmas?usuarioId=${usuario.userID}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
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

    useEffect(() => {
        const handleConfirmEvent = (e) => {
            setFormatoToDelete(e.detail);
            setShowConfirmDelete(true);
        };
        window.addEventListener('solicitar-eliminacion-formato', handleConfirmEvent);
        return () => window.removeEventListener('solicitar-eliminacion-formato', handleConfirmEvent);
    }, []);

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
            const titulos = plantilla.estructura.titulos || '';


            const estructuraCompleta = {
                columnas,
                filas,
                numSubfilas,
                firmas: {
                    firmaContra: "",
                    firmaRes: "",
                    firmaSup: ""
                },
                titulos
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
                credentials: 'include',
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

    const handleRenombrar = async (formatoID, nuevoNombre) => {
        try {
            const res = await fetch(`/api/formatos/${formatoID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: nuevoNombre }),
                credentials: 'include',
            })

            if (!res.ok) throw new Error('Error al actualizar el nombre')

            const formatoActualizado = await res.json()
            // Actualiza el estado local de `formatos` con la respuesta del backend
            setFormatos((prev) =>
                prev.map((f) =>
                    f.formatoID === formatoID ? { ...f, name: formatoActualizado.name } : f
                )
            )
        } catch (error) {
            console.error('Error al renombrar:', error)
        }
    }

    const handleSeleccionarFormato = (formatoID, esCompartido = false) => {
        const lista = esCompartido ? formatosCompartidos : formatos;
        setIsCompartido(esCompartido)
        console.log("iscompartido es: ", isCompartido)
        const formato = lista.find(f => f.formatoID === formatoID)
        if (formato) {
            setFormatoData(JSON.parse(formato.data))
            setTipoFormato(formato.tipo)
            setSelectedIdFormato(formatoID)
            setActiveSidebarItem(formatoID)
            setPantalla("Formato")
        }
    }

    async function handleGuardarFormato(dataActualizada) {
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/formatos/${selectedIdFormato}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: JSON.stringify(dataActualizada) }),
                credentials: 'include',
            });

            if (!res.ok) {
                const { error } = await res.json();
                throw new Error(error || 'Error al guardar formato');
            }

            // ✅ Actualiza el formato en el estado local
            setFormatoData(dataActualizada);

            if (isCompartido) {
                setFormatosCompartidos(prev =>
                    prev.map(f =>
                        f.formatoID === selectedIdFormato
                            ? { ...f, data: JSON.stringify(dataActualizada) }
                            : f
                    )
                );
            } else {
                setFormatos(prev =>
                    prev.map(f =>
                        f.formatoID === selectedIdFormato
                            ? { ...f, data: JSON.stringify(dataActualizada) }
                            : f
                    )
                );
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }


    if (!usuario) return <p>No user was found</p>

    return (
        <div className="flex bg-white min-h-screen w-full bg-white">
            <ConfirmDialog
                show={showConfirmDelete}
                title="¿Eliminar formato?"
                message="Esta acción eliminará el formato permanentemente."
                onConfirm={handleDeleteFormato}
                onCancel={() => setShowConfirmDelete(false)}
            />

            <Sidebar nombre={usuario.name} rol={usuario.role} logout={logout} expanded={expanded} setExpanded={setExpanded}>
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
                        formatoID={formato.formatoID}
                        onRenombrar={handleRenombrar}
                    />
                ))}
                <SidebarItem
                    text="Formatos compartidos conmigo"
                    active={activeSidebarItem === "Formatos"}
                    onClick={() => setActiveSidebarItem("Formatos")}
                />
                {(formatosCompartidos || []).map((compartido) => (
                    <SidebarItem
                        key={compartido.formatoID}
                        text={compartido.name}
                        tipo="formatoItem"
                        active={activeSidebarItem === compartido.formatoID}
                        onClick={() => {
                            handleSeleccionarFormato(compartido.formatoID, true); // true = es compartido
                            setActiveSidebarItem(compartido.formatoID);
                        }}
                    />
                ))}
            </Sidebar>


            <div className={`flex-1 ${mainOffset} ml-0 flex items-center justify-center transition-all duration-300 ease-in-out  min-h-dvh md:min-h-screen overflow-y-auto`}>
                {pantalla === "" && (
                    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto px-4 sm:px-6 py-8 text-black">
                        <h1 className="text-2xl sm:text-[26px] font-semibold text-center">
                            Seleccione un formato para empezar
                        </h1>
                        <select
                            className="mt-6 p-2 border rounded text-black"
                            defaultValue=""
                            onChange={(e) => handleCrearFormato(e.target.value)}
                        >
                            <option value="" disabled>Elige un formato...</option>
                            {tiposFormatos.map((tipo) => (
                                <option key={tipo.plantillaID} value={tipo.nombre}>{tipo.nombre}</option>
                            ))}
                        </select>
                    </div>
                )}


                {pantalla === "Formato" && (
                    <div className="w-full">
                        <div className="mx-auto w-full lg:max-w-9/10 px-4 sm:px-6 py-4 text-black">
                                {!isCompartido ? (
                                    <Formato
                                        formatoID={selectedIdFormato}
                                        key={selectedIdFormato}
                                        contenidoFormato={formatoData}
                                        onGuardar={handleGuardarFormato}
                                        rol={usuario.role}
                                        firma={firmaSeleccionada}
                                        tipoFormato={tipoFormato}
                                    />
                                ) : (
                                    <FormatoCompartido
                                        formatoID={selectedIdFormato}
                                        key={selectedIdFormato}
                                        contenidoFormato={formatoData}
                                        onGuardar={handleGuardarFormato}
                                        rol={usuario.role}
                                        firma={firmaSeleccionada}
                                        tipoFormato={tipoFormato}
                                    />
                                )}

                            {error && <div className="mt-2 text-red-500">{error}</div>}
                        </div>
                    </div>
                )}

                {pantalla === "Crear plantilla" && (
                    <EditorPlantilla usuarioId={usuario.userID} onCrearPlantilla={async (plantilla) => {
                        try {
                            const res = await fetch('/api/plantillas', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ ...plantilla, creadoPorId: usuario.userID }),
                                credentials: 'include',
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
                    <div className="text-black w-full max-w-4xl mx-auto px-4 sm:px-6 py-6">
                        <h1 className="mt-10 text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
                            Mis firmas
                            <div className="relative group">
                                <Info className="w-5 h-5 cursor-pointer text-gray-500" />
                                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 hidden group-hover:block bg-white border border-gray-300 text-xs text-gray-800 p-2 rounded shadow-md z-10 w-48">
                                    Selecciona una firma para usarla en los formatos.
                                </div>
                            </div>
                        </h1>

                        <div className="max-h-[50vh] md:max-h-[340px] overflow-y-auto space-y-4 max-w-120">

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

                        <h2 className="text-lg sm:text-xl font-bold mt-5 mb-2">Firmar</h2>
                        <FirmaUploader onUpload={handleUpload} />
                    </div>
                )}


            </div>
        </div>
    )
}

export default Dashboard