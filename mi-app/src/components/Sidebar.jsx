import { ChevronLast, ChevronFirst } from "lucide-react"
import { useContext, createContext, useState } from "react"
import {
  LogOut
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

export function SidebarItem({ icon, text, active, alert, tipo, onClick }) {
  const { expanded } = useContext(SidebarContext)

  // Si es formatoItem, renderiza como SidebarItem normal pero sin icono
  if (tipo === "formatoItem" && expanded) {
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
        {/* No icon */}
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