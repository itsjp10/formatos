"use client"
import { useState, useEffect } from 'react'
import Sidebar, { SidebarItem } from './Sidebar'
import { Signature, Plus } from "lucide-react"
import Formato from './Formato'


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

    const tipos_formatos = [
        "Mampostería interna", "Mampostería fachada", "Durapanel-Zafarreo",
        "Instalaciones hidro-san", "Plantilla", "Pañete", "Cielo raso",
        "Estuco", "Pisos", "Enchapes"
    ]

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
        const storedUser = localStorage.getItem("user")
        if (storedUser) setUsuario(JSON.parse(storedUser))
        setLoading(false)
    }, [])

    async function handleCrearFormato(tipoSeleccionado) {
        setError('')
        setLoading(true)
        const dataMamposteria = {
            tipo: "Mampostería interna",
            columnas: [
                "CIMBRA", "ANCLAJE", "REF. NO ESTRUCTURAL - UBIC.", "REF. NO ESTRUCTURAL - TRASLAPO",
                "REF. NO ESTRUCTURAL - DIAM.", "VIGA DINTEL - UBIC.", "VIGA DINTEL - TRASLAPO",
                "VIGA DINTEL - DIAM.", "ALFAJIA - UBIC.", "ALFAJIA - TRASLAPO", "ALFAJIA - DIAM.",
                "RELLENO DOVELAS", "DILATACIÓN", "ESPESOR JUNTAS", "EMBOQUILLADO",
                "PLOMO Y HORIZONTALIDAD", "ESCUADRA", "TRABA"
            ],
            filas: [],
            observaciones: "",
            firmadoPor: ""
        }
        const nuevoFormato = {
            tipo: tipoSeleccionado,
            data: JSON.stringify(dataMamposteria),
            name: tipoSeleccionado,
            usuarioId: usuario.userID,
        }
        try {
            const res = await fetch('/api/formatos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoFormato),
            })
            if (!res.ok) {
                const { error } = await res.json()
                throw new Error(error || 'Error al crear formato')
            }
            const formatoCreado = await res.json()
            setFormatos(prev => [...prev, formatoCreado])
            setSelectedIdFormato(formatoCreado.formatoID)
            setActiveSidebarItem(formatoCreado.formatoID)
            setFormatoData(JSON.parse(formatoCreado.data))
            setTipoFormato(formatoCreado.tipo)
            setPantalla("Formato")
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
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
            setFormatoData(dataActualizada)
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
                    onClick={() => setActiveSidebarItem("Mis firmas")}
                />
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
                    <div className="flex flex-col items-center">
                        <h1 className='text-black text-[26px] '>Seleccione un formato para empezar</h1>
                        <select
                            className="mt-6 p-2 border rounded text-black"
                            value=""
                            onChange={e => handleCrearFormato(e.target.value)}
                        >
                            <option value="" disabled>Elige un formato...</option>
                            {tipos_formatos.map((tipo, index) => (
                                <option key={index} value={tipo}>{tipo}</option>
                            ))}
                        </select>
                    </div>
                )}
                {pantalla === "Formato" && (
                    <div className="p-4 text-black w-full max-w-5xl">
                        <h1 className="mb-4 text-2xl font-bold">Formato: {tipoFormato}</h1>
                        <Formato
                            tipoFormato={tipoFormato}
                            contenidoFormato={formatoData}
                            onGuardar={handleGuardarFormato}
                            loading={loading}
                        />
                        {error && <div className="mt-2 text-red-500">{error}</div>}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Dashboard