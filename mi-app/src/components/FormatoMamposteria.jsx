"use client"
import { useState } from 'react'
import React from 'react';

export default function FormatoMamposteria({ rol }) {
  const [filas, setFilas] = useState(Array(7).fill({
    espacio: '',
    fecha: '',
    criterios: Array(10).fill({ c: false, nc: false }),
    observaciones: '',
    firma: ''
  }))

  const agregarFila = () => {
    setFilas(prev => [...prev, {
      espacio: '',
      fecha: '',
      criterios: Array(10).fill({ c: false, nc: false }),
      observaciones: '',
      firma: ''
    }])
  }

  return (
    <div className="p-6 bg-white text-black max-w-full overflow-x-auto text-sm">
      <h2 className="text-xl font-bold text-center mb-6">
        FORMATO DE LIBERACIÓN DE ACTIVIDADES - MAMPOSTERÍA INTERNA
      </h2>

      {/* Encabezado */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <input placeholder="OBRA" className="border p-2" />
        <input placeholder="FECHA" className="border p-2" />
        <input placeholder="HOJA Nº" className="border p-2" />
        <input placeholder="ELABORADO POR" className="border p-2" />
        <input placeholder="TORRE" className="border p-2" />
        <input placeholder="PISO" className="border p-2" />
        <input placeholder="CONTRATISTA" className="border p-2" />
        <input placeholder="RESIDENTE DE OBRA" className="border p-2" />
      </div>

      {/* Tabla */}
      <table className="w-full border text-center text-xs">
        <thead>
          <tr className="bg-gray-200">
            <th rowSpan={2} className="border px-2 py-1">ESPACIO</th>
            <th rowSpan={2} className="border px-2 py-1">FECHA - RECIBIDO</th>
            {[
              "1. CIMBRA", "2. ANCLAJE", "3. REFUERZO NO ESTRUCTURAL",
              "4. VIGA DINTEL", "5. ALFAJÍA", "6. RELLENO DOVELAS",
              "7. DILATACIÓN", "8. ESPESOR DE JUNTAS", "9. EMBOQUILLADO",
              "10. PLOMO Y HORIZONTALIDAD"
            ].map((criterio, i) => (
              <th key={i} colSpan={2} className="border px-2 py-1">{criterio}</th>
            ))}
            <th rowSpan={2} className="border px-2 py-1">OBSERVACIONES</th>
            <th rowSpan={2} className="border px-2 py-1">FIRMA</th>
          </tr>
          <tr className="bg-gray-100">
            {Array(10).fill(null).flatMap((_, i) => [
              <th key={`c-${i}`} className="border px-2 py-1">C</th>,
              <th key={`nc-${i}`} className="border px-2 py-1">NC</th>
            ])}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, rowIndex) => (
            <tr key={rowIndex}>
              <td className="border p-1">
                <input className="w-full p-1" placeholder="Espacio" />
              </td>
              <td className="border p-1">
                <input className="w-full p-1" placeholder="Fecha" />
              </td>
              {fila.criterios.map((_, i) => (
                <React.Fragment key={i}>
                  <td className="border p-1">
                    <input type="checkbox" className="mx-auto" />
                  </td>
                  <td className="border p-1">
                    <input type="checkbox" className="mx-auto" />
                  </td>
                </React.Fragment>
              ))}
              <td className="border p-1">
                <input className="w-full p-1" placeholder="Observaciones" />
              </td>
              <td className="border p-1">
                <input className="w-full p-1" placeholder="Firma" disabled />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Botón para agregar fila */}
      <div className="mt-4 text-right">
        <button
          onClick={agregarFila}
          className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 transition"
        >
          + Agregar fila
        </button>
      </div>

      {/* Sección de firmas */}
      <div className="grid grid-cols-3 gap-4 mt-10 text-center">
        <div className="border-t pt-2">
          {rol === 'contratista' && (
            <button className="bg-blue-600 text-white px-4 py-1 rounded mb-2">Firmar</button>
          )}
          <div>CONTRATISTA</div>
        </div>
        <div className="border-t pt-2">
          {rol === 'residente' && (
            <button className="bg-blue-600 text-white px-4 py-1 rounded mb-2">Firmar</button>
          )}
          <div>RESIDENTE DE TORRE</div>
        </div>
        <div className="border-t pt-2">
          {rol === 'supervisor' && (
            <button className="bg-blue-600 text-white px-4 py-1 rounded mb-2">Firmar</button>
          )}
          <div>SUPERVISIÓN TÉCNICA</div>
        </div>
      </div>
    </div>
  )
}
