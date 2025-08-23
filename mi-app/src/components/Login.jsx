"use client"

import { useState } from "react"
import Dashboard from "./Dashboard"
import { Eye, EyeOff } from "lucide-react"

export default function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loggedUser, setLoggedUser] = useState(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("user")) || null
    }
    return null
  })

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      if (!res.ok) {
        const { message } = await res.json()
        throw new Error(message || "Credenciales inválidas")
      }

      const user = await res.json()
      localStorage.setItem("user", JSON.stringify(user))
      setLoggedUser(user)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("selectedFirmaId")
    setLoggedUser(null)
  }

  if (loggedUser) {
    return <Dashboard logout={logout} />
  }

  return (
    <div className="min-h-screen w-full bg-gray-200 from-white to-white/70 text-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <section className="bg-white/90 backdrop-blur rounded-2xl border border-gray-200 p-6 sm:p-8">
          {/* Header */}
          <header className="mb-6 text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Iniciar sesión</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Accede para gestionar tus formatos y firmas
            </p>
          </header>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="username">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                placeholder="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="password">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center rounded-xl border border-[#CDB4FF] bg-[#CDB4FF] text-slate-900 px-4 py-2.5 text-sm font-medium hover:bg-[#B79BFF] focus:outline-none focus:ring-2 focus:ring-[#CDB4FF]/50 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          {/* Footer helper */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              ¿Problemas para iniciar sesión? Contacta al administrador.
            </p>
          </div>
        </section>

        {/* Nota estética opcional */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-[#A0E7E5]" />
          <span className="inline-block h-2 w-2 rounded-full bg-[#B9FBC0]" />
          <span className="inline-block h-2 w-2 rounded-full bg-[#CDB4FF]" />
        </div>
      </div>
    </div>
  )
}
