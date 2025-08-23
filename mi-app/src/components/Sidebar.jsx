import { ChevronLast, ChevronFirst, Menu } from "lucide-react"
import { useContext, createContext, useState, useRef, useEffect } from "react"
import { LogOut, MoreHorizontal, Trash, Pencil, ChartNoAxesGantt } from "lucide-react"
import Portal from "../utils/Portal"

const SidebarContext = createContext()

export function SidebarSection({ title, children }) {
  const { expanded } = useContext(SidebarContext)
  return (
    <div className="flex flex-col min-h-0 group/section">
      {/* Título solo cuando está expandido */}
      <div className={`text-black font-inter text-sm font-bold px-3 ${expanded ? "block" : "hidden"}`}>
        {title}
      </div>

      {/* Contenedor que NO fuerza altura: solo limita con max-h y hace scroll si excede */}
      <div className="mt-1 px-3 max-h-[28vh] overflow-y-auto
          scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent
          scrollbar-thumb-rounded-full
          hover:scrollbar-thumb-gray-400
          [&::-webkit-scrollbar]:w-1
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:bg-transparent
          group-hover/section:[&::-webkit-scrollbar-thumb]:bg-gray-300">
        <ul className="space-y-1">{children}</ul>
      </div>
    </div>
  )
}


export default function Sidebar({
  children,
  nombre,
  rol,
  logout,
  expanded,
  setExpanded,
  showMobileToggle = true
}) {
  // Ocultar por defecto en pantallas pequeñas
  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 767px)").matches
    if (isMobile) setExpanded(false)
  }, [setExpanded])

  // Cerrar con ESC en móvil
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setExpanded(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [setExpanded])

  const partes = nombre.trim().split(" ")

  // Toma primer y segundo nombre (si existe)
  const displayName = partes.length > 1 ? `${partes[0]} ${partes[1]}` : partes[0]

  return (
    <>
      {/* Botón flotante de apertura en móvil */}
      {(showMobileToggle && !expanded) && (
        <button
          type="button"
          aria-label="Abrir menú"
          className="md:hidden fixed top-3 left-3 z-[60] p-2 rounded-xl bg-white/90 border shadow hover:bg-white transition"
          onClick={() => setExpanded(true)}
        >
          <ChartNoAxesGantt className="text-black" size={20} />
        </button>
      )}

      {/* Overlay en móvil */}
      {/* Solo visible cuando el panel está abierto en móvil */}
      <div
        onClick={() => setExpanded(false)}
        className={`md:hidden fixed inset-0 z-40 bg-black/30 transition-opacity ${expanded ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      <aside
        aria-label="Barra lateral"
        className={`
          fixed top-0 left-0 z-50 h-screen bg-white
          transform transition-all duration-300 will-change-transform
          ${expanded ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${expanded ? "w-64" : "w-18"} md:${expanded ? "w-64" : "w-18"}
          border-r shadow-sm
        `}
      >
        <nav className="h-full flex flex-col bg-white">
          {/* Header */}
          <div className="p-4 pb-2 flex justify-between items-center">
            <img
              src="/images/vive_rio_img.png"
              className={`overflow-hidden transition-all ${expanded ? "w-25" : "w-0"}`}
              alt="Logo"
            />
            {/* En desktop: botón colapsar/expandir; en móvil: cierra */}
            <button
              onClick={() => {
                const isMobile = window.matchMedia("(max-width: 767px)").matches
                if (isMobile) setExpanded(false)
                else setExpanded(!expanded)
              }}
              className="text-black p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
              aria-label={expanded ? "Colapsar" : "Expandir"}
            >
              {expanded ? <ChevronFirst /> : <ChevronLast />}
            </button>
          </div>

          {/* Items */}
          <SidebarContext.Provider value={{ expanded, setExpanded }}>
            <ul className="flex-1 px-3">{children}</ul>
          </SidebarContext.Provider>

          {/* Footer usuario */}
          <div className="border-t flex p-3">
            <img
              src={`https://ui-avatars.com/api/?background=c7d2fe&color=3730a3&bold=true&name=${encodeURIComponent(
                displayName
              )}`}
              alt="Avatar"
              className="w-10 h-10 rounded-md"
            />
            <div
              className={`flex justify-between items-center overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}
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
    </>
  )
}

export function SidebarItem({
  icon,
  text,
  active,
  alert,
  tipo,
  onClick,
  formatoID,
  onRenombrar,
  editar = true
}) {
  const { expanded, setExpanded } = useContext(SidebarContext)

  // Helper: al hacer click en cualquier item, si es móvil, cerrar sidebar
  const handleNavigate = (e, extraFn) => {
    extraFn?.(e)
    const isMobile = window.matchMedia("(max-width: 767px)").matches
    if (isMobile) setExpanded(false)
  }

  if (tipo === "formatoItem" && expanded) {
    return (
      <SidebarFormatoItem
        text={text}
        active={active}
        onClick={(e) => handleNavigate(e, onClick)}
        formatoID={formatoID}
        onRenombrar={onRenombrar}
        editar={editar}
      />
    )
  }

  // Label sin icono
  if (!icon) {
    return (
      <li
        className={`py-2 my-1 ${expanded ? "pl-3" : "pl-0"}`}
      >
        <span
          className={`text-black font-inter text-sm font-bold transition-all ${expanded ? "block" : "hidden"}`}
        >
          {text}
        </span>
      </li>
    )
  }

  // Item normal
  return (
    <li
      className={`
        relative flex items-center py-2 px-3 my-1 h-10
        font-medium rounded-md cursor-pointer transition-colors group
        text-black font-inter
        ${active ? "bg-gradient-to-tr from-indigo-200 to-indigo-100" : "hover:bg-indigo-50"}
      `}
      onClick={(e) => handleNavigate(e, onClick)}
    >
      {icon}
      <span
        className={`overflow-hidden transition-all text-black font-inter ${expanded ? "w-52 ml-3" : "w-0"}`}
      >
        {text}
      </span>
      {alert && (
        <div className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 ${expanded ? "" : "top-2"}`} />
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

function SidebarFormatoItem({ text, active, onClick, formatoID, onRenombrar, editar = true }) {
  const { expanded } = useContext(SidebarContext)
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [nombreEditado, setNombreEditado] = useState(text)
  const inputRef = useRef(null)
  const menuRef = useRef()
  const triggerRef = useRef(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  const canEdit = !!onRenombrar && editar === true

  useEffect(() => {
    setNombreEditado(text)
  }, [text])

  // Posición del menú
  useEffect(() => {
    if (!showMenu) return
    const updatePos = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return
      const gap = 8
      const menuW = 176
      let top = rect.bottom + gap
      let left = rect.right - menuW
      left = Math.min(Math.max(8, left), window.innerWidth - menuW - 8)
      setPos({ top, left })
    }
    updatePos()
    window.addEventListener("scroll", updatePos, true)
    window.addEventListener("resize", updatePos)
    return () => {
      window.removeEventListener("scroll", updatePos, true)
      window.removeEventListener("resize", updatePos)
    }
  }, [showMenu])

  // Cerrar al hacer click fuera / ESC
  useEffect(() => {
    if (!showMenu) return
    const handleClickOutside = (e) => {
      const t = e.target
      if (menuRef.current && menuRef.current.contains(t)) return
      if (triggerRef.current && triggerRef.current.contains(t)) return
      setShowMenu(false)
    }
    const handleEsc = (e) => {
      if (e.key === "Escape") setShowMenu(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEsc)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEsc)
    }
  }, [showMenu])

  // Focus al empezar edición
  useEffect(() => {
    if (!isEditing) return
    requestAnimationFrame(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    })
  }, [isEditing])

  const finalizarEdicion = () => {
    if (!isEditing) return
    setIsEditing(false)
    const nuevo = nombreEditado.trim()
    if (nuevo && nuevo !== text) {
      setNombreEditado(nuevo)
      onRenombrar?.(formatoID, nuevo)
    }
  }

  // Si no está expandido, no mostramos este layout (defensivo)
  if (!expanded) return null

  return (
    <li
      className={`
        relative group/item flex items-center justify-between py-2 px-3 my-1 h-10
        font-medium rounded-md cursor-pointer transition-colors
        text-black font-inter
        ${active ? "bg-gradient-to-tr from-indigo-200 to-indigo-100" : "hover:bg-indigo-50"}
      `}
      onClick={onClick}
    >
      <span className="overflow-hidden text-black font-inter w-52 truncate group-hover/item:w-35 text-sm">
        {isEditing ? (
          <input
            ref={inputRef}
            value={nombreEditado}
            onChange={(e) => setNombreEditado(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && finalizarEdicion()}
            onBlur={finalizarEdicion}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-transparent px-0 py-0 text-sm focus:outline-none"
          />
        ) : (
          nombreEditado
        )}
      </span>

      <button
        ref={triggerRef}
        className="relative z-10 p-1"
        onClick={(e) => {
          e.stopPropagation()
          setShowMenu((p) => !p)
        }}
        aria-haspopup="menu"
        aria-expanded={showMenu}
      >
        <MoreHorizontal className="w-4 h-4 text-gray-500 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 hover:cursor-pointer" />
      </button>

      {showMenu && (
        <Portal>
          <div
            ref={menuRef}
            role="menu"
            className="fixed z-[1000] w-44 bg-white border border-gray-200 rounded-lg shadow-lg"
            style={{ top: pos.top, left: pos.left }}
          >
            {canEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(false)
                  setIsEditing(true)
                }}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-semibold"
              >
                <Pencil size={16} />
                Cambiar nombre
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(false)
                setTimeout(() => {
                  window.dispatchEvent(
                    new CustomEvent("solicitar-eliminacion-formato", { detail: formatoID })
                  )
                }, 0)
              }}
              className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100 font-semibold"
            >
              <Trash size={16} />
              Eliminar
            </button>
          </div>
        </Portal>
      )}
    </li>
  )
}
