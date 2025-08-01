'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function FormatoPublico({ params }) {
  const router = useRouter()
  const { publicLink } = params
  const [mostrarDialogo, setMostrarDialogo] = useState(false)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const verificarAcceso = async () => {
      const res = await fetch(`/api/formato/publico/${publicLink}`)
      const data = await res.json()

      if (res.status === 200 && data.acceso === true) {
        // Ya tiene acceso, mostrar directamente
        router.push(`/dashboard/formato/${data.formatoId}`)
      } else {
        // Mostrar el diálogo
        setMostrarDialogo(true)
      }

      setCargando(false)
    }

    verificarAcceso()
  }, [publicLink, router])

  const aceptarFormato = async () => {
    const res = await fetch('/api/formato/aceptar', {
      method: 'POST',
      body: JSON.stringify({ publicLink }),
      headers: { 'Content-Type': 'application/json' },
    })

    if (res.ok) {
      const data = await res.json()
      router.push('/dashboard') // lo verá como suyo
    }
  }

  if (cargando) return <p>Cargando...</p>

  if (mostrarDialogo) {
    return (
      <div className="p-6">
        <p>¿Deseas recibir este formato en tu dashboard?</p>
        <button onClick={aceptarFormato} className="bg-blue-500 text-white p-2 rounded mt-4">
          Sí, aceptar
        </button>
      </div>
    )
  }

  return null
}
