"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChevronLeft, History, Search } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useNotifications } from "@/components/notification-provider"
import { getSystemChanges, type SystemChange } from "@/lib/data"

export default function CambiosPage() {
  const [cambios, setCambios] = useState<SystemChange[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { addNotification } = useNotifications()

  // Redireccionar si no hay usuario autenticado o no es administrador
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login")
      } else if (user.role !== "admin") {
        addNotification({
          title: "Acceso denegado",
          message: "Solo los administradores pueden acceder a esta página",
          type: "error",
        })
        router.push("/reservas")
      }
    }
  }, [user, isLoading, router, addNotification])

  // Cargar cambios del sistema
  useEffect(() => {
    if (!isLoading && user?.role === "admin") {
      const systemChanges = getSystemChanges()
      setCambios(systemChanges)
    }
  }, [isLoading, user])

  // Filtrar cambios por término de búsqueda
  const filteredChanges = searchTerm
    ? cambios.filter(
        (cambio) =>
          cambio.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cambio.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cambio.details.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : cambios

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-emerald-600 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/admin">
                <Button variant="ghost" size="icon" className="text-white hover:bg-emerald-700">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold">Historial de Cambios</h1>
            </div>
            <div className="text-sm">
              <div className="font-medium">{user?.name}</div>
              <div className="text-xs opacity-80">{user?.email}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-emerald-800 flex items-center gap-2">
              <History className="h-6 w-6" />
              Historial de Cambios del Sistema
            </CardTitle>
            <CardDescription>Registro de todos los cambios realizados en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar por usuario, acción o detalles..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-md border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha y Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Detalles
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredChanges.length > 0 ? (
                    filteredChanges.map((cambio) => (
                      <tr key={cambio.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(cambio.date).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{cambio.userName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{cambio.action}</td>
                        <td className="px-6 py-4">{cambio.details}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-muted-foreground">
                        No hay cambios registrados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
