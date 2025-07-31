import { ChevronLast, ChevronFirst } from "lucide-react"
import { useContext, createContext, useState, useRef, useEffect } from "react"
import {
  LogOut,
  MoreHorizontal,
  Trash,
  Pencil
} from "lucide-react"

const SidebarContext = createContext()

export default function Sidebar({ children, nombre, rol, logout }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <aside className={`h-screen transition-all duration-300 ${expanded ? "w-64" : "w-18"} font-inter`}>
      <nav className="h-full flex flex-col bg-white border-r shadow-sm">
        <div className="p-4 pb-2 flex justify-between items-center">
          <img
            src="/images/vive_rio_img.png" // <-- fixed path for public folder
            className={`overflow-hidden transition-all ${expanded ? "w-25" : "w-0"
              }`}
            alt="Logo"
          />
          <button
            onClick={() => setExpanded((curr) => !curr)}
            className="text-black p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
          >
            {expanded ? <ChevronFirst /> : <ChevronLast />}
          </button>
        </div>

        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex-1 px-3">{children}</ul>
        </SidebarContext.Provider>



        <div className="border-t flex p-3">
          <img
            src="https://ui-avatars.com/api/?background=c7d2fe&color=3730a3&bold=true"
            alt=""
            className="w-10 h-10 rounded-md"
          />
          <div
            className={`
              flex justify-between items-center
              overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}
          `}
          >
            <div className="leading-4">
              <h4 className="font-semibold text-black">{nombre}</h4>
              <span className="text-xs text-gray-600 color-black">{rol}</span>

            </div>
            <button
              className="flex items-center justify-center px-4 py-2 font-medium text-gray-700 bg-gray-100 rounded-xl shadow-sm hover:bg-gray-200 hover:text-black transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
              onClick={logout}
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>
    </aside>
  )
}

export function SidebarItem({ icon, text, active, alert, tipo, onClick, formatoID, onRenombrar }) {
  const { expanded } = useContext(SidebarContext)

  // Si es formatoItem, renderiza como SidebarItem normal pero sin icono
  if (tipo === "formatoItem" && expanded) {
    const [showMenu, setShowMenu] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [nombreEditado, setNombreEditado] = useState(text)
    const inputRef = useRef(null)
    const menuRef = useRef()

    // 1️⃣ sincroniza solo cuando no editas
    useEffect(() => {
      if (!isEditing) {
        setNombreEditado(text);
      }
    }, [text, isEditing]);

    // 2️⃣ listener global
    useEffect(() => {
      function handleClickOutside(e) {
        const fueraInput = inputRef.current && !inputRef.current.contains(e.target);
        const fueraMenu = menuRef.current && !menuRef.current.contains(e.target);

        if (fueraInput) finalizarEdicion();      // siempre cierra la edición
        if (fueraMenu) setShowMenu(false);      // abre/cierra menú sin depender de isEditing
      }

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []); // ⬅️ sin dependencias; no vuelve a registrarse en cada render


    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, [isEditing]);

    // 3️⃣ finaliza la edición
    const finalizarEdicion = () => {
      if (!isEditing) return;                   // evita dobles llamadas
      setIsEditing(false);

      const nuevo = nombreEditado.trim();
      if (nuevo && nuevo !== text) {
        setNombreEditado(nuevo);                // actualización optimista
        onRenombrar?.(formatoID, nuevo);        // llama al padre => PUT + setFormatos
      }
    };
    return (
      <li
        className={`
        relative group flex items-center justify-between py-2 px-3 my-1 h-10
        font-medium rounded-md cursor-pointer
        transition-colors
        text-black font-inter
        ${active
            ? "bg-gradient-to-tr from-indigo-200 to-indigo-100"
            : "hover:bg-indigo-50"
          }
      `}
        onClick={onClick}
      >
        <span className="overflow-hidden transition-all text-black font-inter w-52">
          {isEditing ? (
            <input
              ref={inputRef}
              value={nombreEditado}
              onChange={(e) => setNombreEditado(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  finalizarEdicion();
                }
              }}
              onBlur={finalizarEdicion}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-transparent px-0 py-0 text-sm focus:outline-none"
            />


          ) : (
            nombreEditado
          )}
        </span>

        <div className="relative" ref={menuRef}>
          <MoreHorizontal
            className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu((prev) => !prev)
            }}
          />

          {showMenu && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(false)
                  setIsEditing(true)
                }}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Pencil size={16} />
                Cambiar nombre
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  // Esperamos a que el menú se cierre para activar la edición
                  setTimeout(() => setIsEditing(true), 0);
                }}

                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100"
              >
                <Trash size={16} />
                Eliminar
              </button>
            </div>
          )}
        </div>
      </li>
    )
  }
  // Si no hay icono, renderiza como label
  if (!icon) {
    return (
      <li
        className={`
          py-2 my-1
          ${expanded ? "pl-3" : "pl-0"}
        `}
        onClick={onClick}
      >
        <span
          className={`text-black font-inter text-sm font-semibold transition-all ${expanded ? "block" : "hidden"}`}
        >
          {text}
        </span>
      </li>
    )
  }

  return (
    <li
      className={`
        relative flex items-center py-2 px-3 my-1 h-10
        font-medium rounded-md cursor-pointer
        transition-colors group
        text-black font-inter
        ${active
          ? "bg-gradient-to-tr from-indigo-200 to-indigo-100"
          : "hover:bg-indigo-50"
        }
    `}
      onClick={onClick}
    >
      {icon}
      <span
        className={`overflow-hidden transition-all text-black font-inter ${expanded ? "w-52 ml-3" : "w-0"
          }`}
      >
        {text}
      </span>
      {alert && (
        <div
          className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 ${expanded ? "" : "top-2"
            }`}
        />
      )}
      {!expanded && (
        <div
          className={`
          absolute left-full rounded-md px-2 py-1 ml-6 w-max
          bg-indigo-100 text-black text-sm font-inter
          invisible opacity-20 -translate-x-3 transition-all
          group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
      `}
        >
          {text}
        </div>
      )}
    </li>
  )
}