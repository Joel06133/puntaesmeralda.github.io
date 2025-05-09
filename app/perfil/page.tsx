"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { useNotifications } from "@/components/notification-provider"
import { NotificationBell } from "@/components/notification-bell"
import { ChevronLeft, User, Lock } from "lucide-react"

export default function PerfilPage() {
  const { user, isLoading, updateUserProfile, updateUserPassword, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { addNotification } = useNotifications()

  const [nombre, setNombre] = useState("")
  const [manzana, setManzana] = useState("")
  const [villa, setVilla] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    } else if (user) {
      setNombre(user.name)
      setManzana(user.manzana || "")
      setVilla(user.villa || "")
    }
  }, [user, isLoading, router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingProfile(true)

    try {
      const success = await updateUserProfile(nombre, manzana, villa)

      if (success) {
        toast({
          title: "Perfil actualizado",
          description: "Tu información ha sido actualizada correctamente",
        })

        addNotification({
          title: "Perfil actualizado",
          message: "Tu información de perfil ha sido actualizada correctamente.",
          type: "success",
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo actualizar tu perfil. Intenta nuevamente.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar tu perfil.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas nuevas no coinciden",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      })
      return
    }

    setIsUpdatingPassword(true)

    try {
      const success = await updateUserPassword(currentPassword, newPassword)

      if (success) {
        toast({
          title: "Contraseña actualizada",
          description: "Tu contraseña ha sido actualizada correctamente",
        })

        addNotification({
          title: "Contraseña actualizada",
          message: "Tu contraseña ha sido actualizada correctamente.",
          type: "success",
        })

        // Limpiar campos
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        toast({
          title: "Error",
          description: "La contraseña actual es incorrecta o no se pudo actualizar.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar tu contraseña.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-emerald-50">
      <header className="bg-emerald-600 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/reservas">
                <Button variant="ghost" size="icon" className="text-white hover:bg-emerald-700">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold">Mi Perfil</h1>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <div className="text-sm">
                <div className="font-medium">{user.name}</div>
                <div className="text-xs opacity-80">{user.email}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Tabs defaultValue="perfil" className="space-y-6">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="perfil" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Información Personal</span>
              </TabsTrigger>
              <TabsTrigger value="seguridad" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>Seguridad</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="perfil">
              <Card>
                <CardHeader>
                  <CardTitle className="text-emerald-800">Información Personal</CardTitle>
                  <CardDescription>Actualiza tu información personal</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre Completo</Label>
                      <Input
                        id="nombre"
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="manzana">Manzana</Label>
                        <Input
                          id="manzana"
                          type="text"
                          value={manzana}
                          onChange={(e) => setManzana(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="villa">Villa</Label>
                        <Input
                          id="villa"
                          type="text"
                          value={villa}
                          onChange={(e) => setVilla(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <Input id="email" type="email" value={user.email} disabled className="bg-gray-50" />
                      <p className="text-xs text-muted-foreground">El correo electrónico no se puede cambiar</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Rol de Usuario</Label>
                      <div className="p-2 bg-gray-50 rounded-md border">
                        {user.role === "admin" ? "Administrador" : "Usuario"}
                      </div>
                    </div>
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isUpdatingProfile}>
                      {isUpdatingProfile ? "Actualizando..." : "Actualizar Perfil"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seguridad">
              <Card>
                <CardHeader>
                  <CardTitle className="text-emerald-800">Cambiar Contraseña</CardTitle>
                  <CardDescription>Actualiza tu contraseña para mantener tu cuenta segura</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Contraseña Actual</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nueva Contraseña</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                      <p className="text-xs text-muted-foreground">La contraseña debe tener al menos 6 caracteres</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isUpdatingPassword}>
                      {isUpdatingPassword ? "Actualizando..." : "Cambiar Contraseña"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-emerald-800">Cerrar Sesión</CardTitle>
                  <CardDescription>Cierra tu sesión en todos los dispositivos</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleLogout} variant="destructive">
                    Cerrar Sesión
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
