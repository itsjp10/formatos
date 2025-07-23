"use client"
import { useState, useEffect } from 'react'


function Dashboard({ user, logout }) {
    const [usuario, setUsuario] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
            setUsuario(JSON.parse(storedUser))
        }
        setLoading(false)
    }, [])

    if (loading) return null

    if (!usuario) return <p>No user was found</p>

    return (
        <div>
            <h2>Bienvenido, {usuario.name}</h2>
            <button onClick={logout}>Cerrar sesión</button>
        </div>
    )
}

export default Dashboard