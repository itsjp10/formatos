import { useState } from 'react'

function EditorPlantilla() {
  const [headers, setHeaders] = useState([
    { label: 'APTO', subheaders: [] },
    { label: 'FECHA', subheaders: [] }
  ])
  const [rows, setRows] = useState([{}])
  const [newHeader, setNewHeader] = useState('')
  const [newSubheader, setNewSubheader] = useState('')

  const addColumn = () => {
    if (newHeader.trim() === '') return
    setHeaders([...headers, { label: newHeader, subheaders: [] }])
    setNewHeader('')
  }

  const addSubcolumn = (index) => {
    if (newSubheader.trim() === '') return
    const updatedHeaders = [...headers]
    updatedHeaders[index].subheaders.push(newSubheader)
    setHeaders(updatedHeaders)
    setNewSubheader('')
  }

  const addRow = () => {
    setRows([...rows, {}])
  }

  const updateCheckbox = (rowIndex, colKey, value) => {
    const updatedRows = [...rows]

    // Si se selecciona "C", desactiva "NC" y viceversa
    if (value === 'C') {
      updatedRows[rowIndex][`${colKey}_C`] = !updatedRows[rowIndex][`${colKey}_C`]
      updatedRows[rowIndex][`${colKey}_NC`] = false
    } else {
      updatedRows[rowIndex][`${colKey}_NC`] = !updatedRows[rowIndex][`${colKey}_NC`]
      updatedRows[rowIndex][`${colKey}_C`] = false
    }

    setRows(updatedRows)
  }

  const exportStructure = () => {
    const structure = { headers, rows }
    console.log('Estructura exportada:', structure)
    alert('¡Estructura exportada a consola como JSON!')
  }

  return (
    <div className="p-4 text-black">
      <h2 className="text-xl font-bold mb-4">Editor de Plantilla de Formato</h2>

      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Nombre de columna"
          value={newHeader}
          onChange={(e) => setNewHeader(e.target.value)}
          className="border px-2 py-1"
        />
        <button onClick={addColumn} className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600">
          Añadir columna
        </button>
      </div>

      <table className="w-full border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100">
            {headers.map((header, i) => (
              <th
                key={i}
                colSpan={header.subheaders.length > 0 ? header.subheaders.length : 1}
                className="border border-gray-300 px-2 py-1 text-center"
              >
                <div className="flex flex-col items-center">
                  <span className="font-semibold">{header.label}</span>
                  <div className="flex mt-1">
                    <input
                      type="text"
                      placeholder="Subcolumna"
                      value={i === 0 ? '' : newSubheader}
                      onChange={(e) => setNewSubheader(e.target.value)}
                      className="border px-1 py-0.5 text-xs"
                    />
                    <button
                      onClick={() => addSubcolumn(i)}
                      className="ml-1 px-2 text-xs bg-green-500 text-white rounded"
                    >
                      +
                    </button>
                  </div>
                </div>
              </th>
            ))}
          </tr>
          <tr className="bg-gray-200">
            {headers.map((header, i) =>
              header.subheaders.length > 0
                ? header.subheaders.map((sub, j) => (
                    <th key={j} className="border border-gray-300 px-2 py-1 text-center">
                      {sub}
                    </th>
                  ))
                : (
                    <th key={i} className="border border-gray-300 px-2 py-1 text-center">
                      {/* espacio vacío si no hay subcolumnas */}
                    </th>
                  )
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {headers.map((header, hi) => {
                const keys = header.subheaders.length > 0 ? header.subheaders : [header.label]
                return keys.map((sub, si) => {
                  const colKey = `${header.label}-${sub}`
                  return (
                    <td key={`${hi}-${si}`} className="border border-gray-300 px-2 py-1 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <label className="flex items-center space-x-1">
                          <input
                            type="checkbox"
                            checked={row[`${colKey}_C`] || false}
                            onChange={() => updateCheckbox(ri, colKey, 'C')}
                            className="form-checkbox"
                          />
                          <span>C</span>
                        </label>
                        <label className="flex items-center space-x-1">
                          <input
                            type="checkbox"
                            checked={row[`${colKey}_NC`] || false}
                            onChange={() => updateCheckbox(ri, colKey, 'NC')}
                            className="form-checkbox"
                          />
                          <span>NC</span>
                        </label>
                      </div>
                    </td>
                  )
                })
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex gap-4 mt-4">
        <button onClick={addRow} className="bg-gray-700 text-white px-4 py-1 rounded hover:bg-gray-800">
          Añadir fila
        </button>
        <button onClick={exportStructure} className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700">
          Exportar JSON
        </button>
      </div>
    </div>
  )
}

export default EditorPlantilla
