"use client"
import { useState, useEffect } from 'react'
import Sidebar, { SidebarItem } from './Sidebar'
import {
    Signature,
    Settings,
    Plus,
} from "lucide-react"


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

    const tipos_formatos = ["Mampostería interna", "Mampostería fachada", "Durapanel-Zafarreo", "Instalaciones hidro-san", "Plantilla", "Pañete", "Cielo raso", "Estuco", "Pisos", "Enchapes"]

    useEffect(() => {
        const fetchFormatos = async () => {
            setError('')
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
    }, [usuario, pantalla])

    useEffect(() => {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
            setUsuario(JSON.parse(storedUser))
        }
        setLoading(false)
    }, [])

    if (loading) return null

    if (!usuario) return <p>No user was found</p>

    async function handleCrearFormato(tipoSeleccionado) {
        setError('')
        setLoading(true)
        console.log(tipoSeleccionado)
        const nuevoFormato = {
            tipo: tipoSeleccionado,
            data: `Este es el contenido del formato para ${tipoSeleccionado}`,
            name: tipoSeleccionado,
            usuarioId: usuario.userID, // O desde localStorage si es necesario
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
            console.log('Formato creado:', formatoCreado)    
            setFormatos(prev => [...prev, formatoCreado])
            setSelectedIdFormato(formatoCreado.formatoID)
            setActiveSidebarItem(formatoCreado.formatoID)       
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSeleccionarFormato = (formatoID) => {
        setSelectedIdFormato(formatoID)
        setActiveSidebarItem(formatoID)
        setPantalla("Formato")
    }

    return (
        <div className="flex bg-white min-h-screen">
            <Sidebar nombre={usuario.name} rol={usuario.role} logout={logout}>
                <SidebarItem
                    icon={<Plus size={20} />}
                    text="Nuevo formato"
                    active={activeSidebarItem === "Nuevo formato"}
                    onClick={() => setPantalla("")}
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
                            value={activeSidebarItem || ""}
                            onChange={e => {
                                const tipo = e.target.value
                                setTipoFormato(tipo)
                                handleCrearFormato(tipo)                                
                                {/*setActiveSidebarItem(e.target.value)*/}
                                setPantalla("Formato")

                            }}
                        >
                            <option value="" disabled>Elige un formato...</option>
                            {tipos_formatos.map((tipo, index) => (
                                <option key={index} value={tipo}>
                                    {tipo}
                                </option>
                            ))}


                        </select>
                    </div>
                )}
                {pantalla === "Formato" && (
                    <h1 className='text-black'>This is Formato's screen</h1>
                )}
            </div>
        </div>
    )
}

export default Dashboard