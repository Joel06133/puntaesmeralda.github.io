"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChevronLeft, Users, Search, Lock, Unlock, Download, Upload, UserCog } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useNotifications } from "@/components/notification-provider"
import { getRegisteredUsers, changeUserStatus } from "@/lib/data"
import { exportToCSV, importFromCSV } from "@/lib/export-utils"
// Importar el componente ResetPassword
import { ResetPassword } from "./reset-password"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { generateId } from "@/lib/utils"

export default function UsuariosPage() {
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

  const handleBloquearUsuario = (userId: string, userName: string) => {
    const success = changeUserStatus(userId, "blocked")

    if (success) {
      // Actualizar la lista de usuarios
      setRegisteredUsers(getRegisteredUsers())

      toast({
        title: "Usuario bloqueado",
        description: `El usuario ${userName} ha sido bloqueado correctamente.`,
      })

      addNotification({
        title: "Usuario bloqueado",
        message: `Has bloqueado al usuario ${userName}.`,
        type: "warning",
      })

      // Notificar al usuario
      const notificacionUsuario = {
        id: Date.now().toString(),
        title: "Cuenta bloqueada",
        message: "Tu cuenta ha sido bloqueada. Contacta con el administrador para más información.",
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
        description: "No se pudo bloquear al usuario. Intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  const handleDesbloquearUsuario = (userId: string, userName: string) => {
    const success = changeUserStatus(userId, "approved")

    if (success) {
      // Actualizar la lista de usuarios
      setRegisteredUsers(getRegisteredUsers())

      toast({
        title: "Usuario desbloqueado",
        description: `El usuario ${userName} ha sido desbloqueado correctamente.`,
      })

      addNotification({
        title: "Usuario desbloqueado",
        message: `Has desbloqueado al usuario ${userName}.`,
        type: "success",
      })

      // Notificar al usuario
      const notificacionUsuario = {
        id: Date.now().toString(),
        title: "Cuenta reactivada",
        message: "Tu cuenta ha sido reactivada. Ya puedes iniciar sesión y reservar canchas.",
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
        description: "No se pudo desbloquear al usuario. Intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  const handleCambiarRol = (userId: string, userName: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin"

    // Actualizar el rol en localStorage
    try {
      const usersStr = localStorage.getItem("esmeraldaPlayUsers")
      if (usersStr) {
        const users = JSON.parse(usersStr)
        const userIndex = users.findIndex((u: any) => u.id === userId)

        if (userIndex !== -1) {
          users[userIndex].role = newRole
          localStorage.setItem("esmeraldaPlayUsers", JSON.stringify(users))

          // Actualizar la lista de usuarios
          setRegisteredUsers(getRegisteredUsers())

          toast({
            title: "Rol actualizado",
            description: `El usuario ${userName} ahora es ${newRole === "admin" ? "administrador" : "usuario regular"}.`,
          })

          addNotification({
            title: "Rol de usuario actualizado",
            message: `Has cambiado el rol de ${userName} a ${newRole === "admin" ? "administrador" : "usuario regular"}.`,
            type: "info",
          })

          // Notificar al usuario
          const notificacionUsuario = {
            id: Date.now().toString(),
            title: "Cambio de rol",
            message: `Tu rol ha sido cambiado a ${newRole === "admin" ? "administrador" : "usuario regular"}.`,
            type: "info",
            read: false,
            date: new Date(),
            userId: userId,
          }

          const notificacionesUsuarioStr = localStorage.getItem(`esmeraldaPlayNotificaciones_${userId}`)
          const notificacionesUsuario = notificacionesUsuarioStr ? JSON.parse(notificacionesUsuarioStr) : []
          notificacionesUsuario.unshift(notificacionUsuario)
          localStorage.setItem(`esmeraldaPlayNotificaciones_${userId}`, JSON.stringify(notificacionesUsuario))
        }
      }
    } catch (error) {
      console.error("Error al cambiar el rol:", error)
      toast({
        title: "Error",
        description: "No se pudo cambiar el rol del usuario. Intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  const handleImportUsers = async (file: File) => {
    try {
      const importedUsers = await importFromCSV(file)

      // Actualizar usuarios en localStorage
      const usersStr = localStorage.getItem("esmeraldaPlayUsers")
      const existingUsers = usersStr ? JSON.parse(usersStr) : []

      // Actualizar usuarios existentes y añadir nuevos
      importedUsers.forEach((importedUser) => {
        const userIndex = existingUsers.findIndex((u: any) => u.email === importedUser.Email)

        if (userIndex !== -1) {
          // Actualizar usuario existente
          existingUsers[userIndex].name = importedUser.Nombre
          existingUsers[userIndex].manzana = importedUser.Manzana
          existingUsers[userIndex].villa = importedUser.Villa
          if (importedUser.Password) {
            existingUsers[userIndex].password = importedUser.Password
          }
          if (importedUser.Rol) {
            existingUsers[userIndex].role = importedUser.Rol.toLowerCase()
          }
          if (importedUser.Estado) {
            existingUsers[userIndex].status = importedUser.Estado === "Activo" ? "approved" : "blocked"
          }
        } else {
          // Añadir nuevo usuario
          existingUsers.push({
            id: generateId(),
            name: importedUser.Nombre,
            email: importedUser.Email,
            password: importedUser.Password || "password123", // Contraseña por defecto
            role: (importedUser.Rol || "user").toLowerCase(),
            status: importedUser.Estado === "Bloqueado" ? "blocked" : "approved",
            createdAt: new Date(),
            manzana: importedUser.Manzana,
            villa: importedUser.Villa,
          })
        }
      })

      // Guardar usuarios actualizados
      localStorage.setItem("esmeraldaPlayUsers", JSON.stringify(existingUsers))

      // Actualizar la lista de usuarios
      setRegisteredUsers(getRegisteredUsers())

      toast({
        title: "Importación exitosa",
        description: `Se han importado/actualizado ${importedUsers.length} usuarios.`,
      })
    } catch (error) {
      console.error("Error al importar usuarios:", error)
      toast({
        title: "Error",
        description: "No se pudieron importar los usuarios. Verifica el formato del archivo.",
        variant: "destructive",
      })
    }
  }

  const handleExportUsers = () => {
    // Preparar los datos para exportar
    const usersToExport = filteredUsers.map((user) => ({
      Nombre: user.name,
      Email: user.email,
      Password: user.password, // Incluir contraseña para permitir actualizaciones
      Rol: user.role,
      Estado: user.status === "approved" ? "Activo" : "Bloqueado",
      Manzana: user.manzana || "No especificada",
      Villa: user.villa || "No especificada",
      FechaRegistro: new Date(user.createdAt).toLocaleDateString(),
    }))

    // Exportar a CSV
    exportToCSV(usersToExport, "usuarios_esmeralda_play.csv")

    toast({
      title: "Exportación exitosa",
      description: "Los usuarios han sido exportados a Excel correctamente",
    })
  }

  // Filtrar usuarios por término de búsqueda y excluir los pendientes (que se muestran en otra página)
  const filteredUsers = registeredUsers
    .filter((user) => user.status !== "pending")
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
              <h1 className="text-xl font-bold">Gestión de Usuarios</h1>
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
              Usuarios Registrados
            </CardTitle>
            <CardDescription>Lista de usuarios registrados en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex justify-between items-center">
              <div className="relative w-full mr-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre o correo..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleExportUsers}
                  className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Importar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Importar Usuarios</DialogTitle>
                      <DialogDescription>
                        Selecciona un archivo CSV para importar o actualizar usuarios.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Input
                        type="file"
                        accept=".csv"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleImportUsers(e.target.files[0])
                          }
                        }}
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        El archivo debe tener las columnas: Nombre, Email, Password, Rol, Estado, Manzana, Villa
                      </p>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => document.querySelector("dialog")?.close()}>
                        Cancelar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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
                      Rol
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
                        <td className="px-6 py-4 whitespace-nowrap capitalize">{user.role}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.status === "approved" ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Activo
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Bloqueado
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap space-x-2">
                          {user.status === "approved" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50 flex items-center gap-1"
                              onClick={() => handleBloquearUsuario(user.id, user.name)}
                            >
                              <Lock className="h-4 w-4" /> Bloquear
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-600 hover:bg-green-50 flex items-center gap-1"
                              onClick={() => handleDesbloquearUsuario(user.id, user.name)}
                            >
                              <Unlock className="h-4 w-4" /> Desbloquear
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className={`${
                              user.role === "admin"
                                ? "text-amber-600 border-amber-600 hover:bg-amber-50"
                                : "text-blue-600 border-blue-600 hover:bg-blue-50"
                            } flex items-center gap-1`}
                            onClick={() => handleCambiarRol(user.id, user.name, user.role)}
                          >
                            <UserCog className="h-4 w-4" />
                            {user.role === "admin" ? "Hacer Usuario" : "Hacer Admin"}
                          </Button>
                          <ResetPassword userId={user.id} userName={user.name} userEmail={user.email} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-muted-foreground">
                        No hay usuarios registrados
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
