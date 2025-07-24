"use client"
import { useState, useEffect } from 'react'
import FormatoMamposteria from './FormatoMamposteria'

function Formato({ tipoFormato, contenidoFormato, onGuardar, loading }) {
    return (
        <>
            {tipoFormato === "Mampostería interna" && (                
                <FormatoMamposteria
                    contenido={contenidoFormato}
                    onGuardar={onGuardar}
                    loading={loading}
                />
            )}
            {/* Agrega aquí otros formatos si es necesario */}
        </>
    )
}

export default Formato