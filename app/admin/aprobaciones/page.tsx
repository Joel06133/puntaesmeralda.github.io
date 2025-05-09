"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChevronLeft, Users, Search, CheckCircle, XCircle } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useNotifications } from "@/components/notification-provider"
import { getRegisteredUsers, changeUserStatus } from "@/lib/data"

export default function AprobacionesPage() {
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { addNotification } = useNotifications()

  // Cargar usuarios registrados
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login")
        return
      }

      if (user.role !== "admin") {
        addNotification({
          title: "Acceso denegado",
          message: "Solo los administradores pueden acceder a esta página",
          type: "error",
        })
        router.push("/reservas")
        return
      }

      setRegisteredUsers(getRegisteredUsers())
    }
  }, [isLoading, user, router, addNotification])

  const handleAprobarUsuario = (userId: string, userName: string, userEmail: string) => {
    const success = changeUserStatus(userId, "approved")

    if (success) {
      // Actualizar la lista de usuarios
      setRegisteredUsers(getRegisteredUsers())

      toast({
        title: "Usuario aprobado",
        description: `El usuario ${userName} ha sido aprobado correctamente.`,
      })

      addNotification({
        title: "Usuario aprobado",
        message: `Has aprobado al usuario ${userName}.`,
        type: "success",
      })

      // Notificar al usuario
      const notificacionUsuario = {
        id: Date.now().toString(),
        title: "Cuenta aprobada",
        message: "Tu cuenta ha sido aprobada. Ya puedes iniciar sesión y reservar canchas.",
        type: "success",
        read: false,
        date: new Date(),
        userId: userId,
      }

      try {
        const notificacionesUsuarioStr = localStorage.getItem(`esmeraldaPlayNotificaciones_${userId}`)
        const notificacionesUsuario = notificacionesUsuarioStr ? JSON.parse(notificacionesUsuarioStr) : []
        notificacionesUsuario.unshift(notificacionUsuario)
        localStorage.setItem(`esmeraldaPlayNotificaciones_${userId}`, JSON.stringify(notificacionesUsuario))
      } catch (error) {
        console.error("Error al guardar notificación para el usuario:", error)
      }
    } else {
      toast({
        title: "Error",
        description: "No se pudo aprobar al usuario. Intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  const handleRechazarUsuario = (userId: string, userName: string, userEmail: string) => {
    const success = changeUserStatus(userId, "blocked")

    if (success) {
      // Actualizar la lista de usuarios
      setRegisteredUsers(getRegisteredUsers())

      toast({
        title: "Usuario rechazado",
        description: `El usuario ${userName} ha sido rechazado correctamente.`,
      })

      addNotification({
        title: "Usuario rechazado",
        message: `Has rechazado al usuario ${userName}.`,
        type: "warning",
      })

      // Notificar al usuario
      const notificacionUsuario = {
        id: Date.now().toString(),
        title: "Cuenta rechazada",
        message: "Tu solicitud de registro ha sido rechazada. Contacta con el administrador para más información.",
        type: "error",
        read: false,
        date: new Date(),
        userId: userId,
      }

      try {
        const notificacionesUsuarioStr = localStorage.getItem(`esmeraldaPlayNotificaciones_${userId}`)
        const notificacionesUsuario = notificacionesUsuarioStr ? JSON.parse(notificacionesUsuarioStr) : []
        notificacionesUsuario.unshift(notificacionUsuario)
        localStorage.setItem(`esmeraldaPlayNotificaciones_${userId}`, JSON.stringify(notificacionesUsuario))
      } catch (error) {
        console.error("Error al guardar notificación para el usuario:", error)
      }
    } else {
      toast({
        title: "Error",
        description: "No se pudo rechazar al usuario. Intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  // Filtrar usuarios por término de búsqueda y estado pendiente
  const filteredUsers = registeredUsers
    .filter((user) => user.status === "pending")
    .filter(
      (user) =>
        searchTerm === "" ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )

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
              <h1 className="text-xl font-bold">Aprobación de Usuarios</h1>
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
              <Users className="h-6 w-6" />
              Usuarios Pendientes de Aprobación
            </CardTitle>
            <CardDescription>Aprueba o rechaza las solicitudes de registro de nuevos usuarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre o correo..."
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
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Correo Electrónico
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha de Registro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pendiente
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600 hover:bg-green-50 flex items-center gap-1"
                            onClick={() => handleAprobarUsuario(user.id, user.name, user.email)}
                          >
                            <CheckCircle className="h-4 w-4" /> Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50 flex items-center gap-1"
                            onClick={() => handleRechazarUsuario(user.id, user.name, user.email)}
                          >
                            <XCircle className="h-4 w-4" /> Rechazar
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-muted-foreground">
                        No hay usuarios pendientes de aprobación
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
