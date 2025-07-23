"use client"
import { useState, useEffect } from 'react'
import Sidebar, { SidebarItem } from './Sidebar' // <-- Fix import
import {
    LifeBuoy,
    Receipt,
    Boxes,
    Package,
    UserCircle,
    BarChart3,
    Settings,
    Plus,
} from "lucide-react"


function Dashboard({ logout }) {
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
            <Sidebar>
                <SidebarItem icon={<Plus size={20} />} text="Nuevo formato" />
                <SidebarItem icon={<BarChart3 size={20} />} text="Statistics" active />
                <SidebarItem icon={<UserCircle size={20} />} text="Users" />
                <SidebarItem icon={<Boxes size={20} />} text="Inventory" />
                <SidebarItem icon={<Package size={20} />} text="Orders" />
                <SidebarItem icon={<Receipt size={20} />} text="Billings" />
                <hr className="my-3" />
                <SidebarItem icon={<Settings size={20} />} text="Settings" />
                <SidebarItem icon={<LifeBuoy size={20} />} text="Help" />
            </Sidebar>
            <h2>Bienvenido, {usuario.name}</h2>
            <button onClick={logout}>Cerrar sesión</button>


        </div>
    )
}

export default Dashboard