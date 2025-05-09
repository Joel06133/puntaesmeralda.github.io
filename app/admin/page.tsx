"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// Agregar el import para UserCheck
import {
  Calendar,
  Clock,
  Home,
  LogOut,
  Users,
  Shield,
  Palette,
  Bot,
  DollarSign,
  BarChart,
  UserCheck,
  History,
  GraduationCap,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { NotificationBell } from "@/components/notification-bell"
import { useNotifications } from "@/components/notification-provider"
import { getRegisteredUsers } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
// Importar el componente de estadísticas
import { AdminStats } from "@/components/admin-stats"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([])
  const [pendingUsers, setPendingUsers] = useState<number>(0)
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const { addNotification } = useNotifications()
  const { toast } = useToast()

  // Estados para configuración del sistema
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [appName, setAppName] = useState("Esmeralda Play")
  const [contactEmail, setContactEmail] = useState("aso.urbpuntaesmeralda@gmail.com")
  const [contactPhone, setContactPhone] = useState("+593 968838776")
  const [primaryColor, setPrimaryColor] = useState("#10b981") // emerald-600
  const [secondaryColor, setSecondaryColor] = useState("#065f46") // emerald-800
  const [bgColor, setBgColor] = useState("#ecfdf5") // emerald-50

  // Estados para configuración de horarios
  const [horaInicio, setHoraInicio] = useState("06:00")
  const [horaFin, setHoraFin] = useState("22:00")
  const [duracionReserva, setDuracionReserva] = useState(60) // en minutos
  const [reservasPorDia, setReservasPorDia] = useState(1)
  const [requierePagoNocturno, setRequierePagoNocturno] = useState(true)
  const [horaNocturnaInicio, setHoraNocturnaInicio] = useState("19:00")

  // Estados para precios
  const [precioNocturnoTenis, setPrecioNocturnoTenis] = useState("15.00")
  const [precioNocturnoFutbol, setPrecioNocturnoFutbol] = useState("20.00")
  const [precioNocturnoBasquet, setPrecioNocturnoBasquet] = useState("15.00")
  const [precioNocturnoVoley, setPrecioNocturnoVoley] = useState("15.00")

  // Estados para reglamento
  const [reglamentoFile, setReglamentoFile] = useState<File | null>(null)
  const [reglamentoPreview, setReglamentoPreview] = useState<string | null>(null)
  const [reglamentoTexto, setReglamentoTexto] = useState(
    "1. Cada usuario puede realizar máximo 1 reserva por día.\n" +
      "2. Las reservas tienen una duración máxima de 1 hora.\n" +
      "3. Las reservas nocturnas requieren pago adicional.\n" +
      "4. Se debe respetar el horario reservado.\n" +
      "5. Cualquier daño a las instalaciones será responsabilidad del usuario.",
  )

  // Estados para integración con ChatGPT
  const [chatGptApiKey, setChatGptApiKey] = useState("")
  const [chatGptIntegrado, setChatGptIntegrado] = useState(false)

  // Cargar usuarios registrados
  useEffect(() => {
    if (!isLoading && user?.role === "admin") {
      const users = getRegisteredUsers()
      setRegisteredUsers(users)

      // Contar usuarios pendientes
      const pending = users.filter((u) => u.status === "pending").length
      setPendingUsers(pending)
    }
  }, [isLoading, user])

  // Redireccionar si no hay usuario autenticado o no es administrador
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login")
      } else if (user.role !== "admin") {
        addNotification({
          title: "Acceso denegado",
          message: "No tienes permisos para acceder al panel de administración.",
          type: "error",
        })
        router.push("/reservas")
      }
    }
  }, [user, isLoading, router, addNotification])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setLogoFile(file)

      // Crear una URL para previsualizar la imagen
      const reader = new FileReader()
      reader.onload = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleReglamentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setReglamentoFile(file)

      // Si es un PDF, solo guardamos el archivo
      if (file.type === "application/pdf") {
        setReglamentoPreview("PDF cargado: " + file.name)
      } else {
        // Si es una imagen, creamos una URL para previsualizar
        const reader = new FileReader()
        reader.onload = () => {
          setReglamentoPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const handleSaveConfig = () => {
    // Guardar configuración en localStorage
    const config = {
      appName,
      contactEmail,
      contactPhone,
      primaryColor,
      secondaryColor,
      bgColor,
      horaInicio,
      horaFin,
      duracionReserva,
      reservasPorDia,
      requierePagoNocturno,
      horaNocturnaInicio,
      precioNocturnoTenis,
      precioNocturnoFutbol,
      precioNocturnoBasquet,
      precioNocturnoVoley,
      reglamentoTexto,
    }

    localStorage.setItem("esmeraldaPlayConfig", JSON.stringify(config))

    toast({
      title: "Configuración guardada",
      description: "Los cambios en la configuración se han guardado correctamente.",
    })

    addNotification({
      title: "Configuración actualizada",
      message: "Has actualizado la configuración general de la aplicación.",
      type: "success",
    })
  }

  const handleSaveHorarios = () => {
    // Guardar configuración en localStorage
    const config = {
      appName,
      contactEmail,
      contactPhone,
      primaryColor,
      secondaryColor,
      bgColor,
      horaInicio,
      horaFin,
      duracionReserva,
      reservasPorDia,
      requierePagoNocturno,
      horaNocturnaInicio,
      precioNocturnoTenis,
      precioNocturnoFutbol,
      precioNocturnoBasquet,
      precioNocturnoVoley,
      reglamentoTexto,
    }

    localStorage.setItem("esmeraldaPlayConfig", JSON.stringify(config))

    toast({
      title: "Horarios actualizados",
      description: "Los horarios y reglas de reserva se han actualizado correctamente.",
    })

    addNotification({
      title: "Horarios actualizados",
      message: "Has modificado los horarios y reglas de reserva de las canchas.",
      type: "success",
    })
  }

  const handleSavePrecios = () => {
    // Guardar configuración en localStorage
    const config = {
      appName,
      contactEmail,
      contactPhone,
      primaryColor,
      secondaryColor,
      bgColor,
      horaInicio,
      horaFin,
      duracionReserva,
      reservasPorDia,
      requierePagoNocturno,
      horaNocturnaInicio,
      precioNocturnoTenis,
      precioNocturnoFutbol,
      precioNocturnoBasquet,
      precioNocturnoVoley,
      reglamentoTexto,
    }

    localStorage.setItem("esmeraldaPlayConfig", JSON.stringify(config))

    toast({
      title: "Precios actualizados",
      description: "Los precios de las canchas se han actualizado correctamente.",
    })

    addNotification({
      title: "Precios actualizados",
      message: "Has modificado los precios de las canchas para horarios nocturnos.",
      type: "success",
    })
  }

  const handleSaveReglamento = () => {
    // Guardar configuración en localStorage
    const config = {
      appName,
      contactEmail,
      contactPhone,
      primaryColor,
      secondaryColor,
      bgColor,
      horaInicio,
      horaFin,
      duracionReserva,
      reservasPorDia,
      requierePagoNocturno,
      horaNocturnaInicio,
      precioNocturnoTenis,
      precioNocturnoFutbol,
      precioNocturnoBasquet,
      precioNocturnoVoley,
      reglamentoTexto,
    }

    localStorage.setItem("esmeraldaPlayConfig", JSON.stringify(config))

    toast({
      title: "Reglamento actualizado",
      description: "El reglamento ha sido actualizado correctamente.",
    })

    addNotification({
      title: "Reglamento actualizado",
      message: "Has actualizado el reglamento de uso de las canchas deportivas.",
      type: "success",
    })
  }

  const handleIntegrarChatGPT = () => {
    if (!chatGptApiKey) {
      toast({
        title: "Error",
        description: "Debes ingresar una API Key válida para integrar con ChatGPT.",
        variant: "destructive",
      })
      return
    }

    setChatGptIntegrado(true)
    toast({
      title: "Integración exitosa",
      description: "La integración con ChatGPT se ha configurado correctamente.",
    })

    addNotification({
      title: "ChatGPT integrado",
      message: "Has integrado tu cuenta de administrador con ChatGPT.",
      type: "success",
    })
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (isLoading || !user || user.role !== "admin") {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-emerald-600 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <span className="text-emerald-600 font-bold text-xl">EP</span>
              </div>
              <h1 className="text-xl font-bold">Panel de Administración</h1>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <div className="text-sm">
                <div className="font-medium">{user.name}</div>
                <div className="text-xs opacity-80">{user.email}</div>
              </div>
              <Button variant="ghost" size="icon" className="text-white hover:bg-emerald-700" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Panel de Control</h2>

        <AdminStats />

        <h2 className="text-xl font-bold mb-4">Gestión del Sistema</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/reservas">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <Calendar className="h-6 w-6 text-emerald-600 mb-2" />
                <CardTitle className="text-lg">Reservas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Gestiona las reservas y aprueba solicitudes pendientes</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/aprobaciones">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer bg-amber-50 border-amber-200">
              <CardHeader className="pb-2">
                <UserCheck className="h-6 w-6 text-amber-600 mb-2" />
                <CardTitle className="text-lg text-amber-800">Aprobaciones</CardTitle>
                {pendingUsers > 0 && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                    {pendingUsers}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-amber-700">Aprueba o rechaza solicitudes de registro de usuarios</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/horarios">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <Clock className="h-6 w-6 text-emerald-600 mb-2" />
                <CardTitle className="text-lg">Horarios</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Configura los horarios disponibles para reservas</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/precios">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <DollarSign className="h-6 w-6 text-emerald-600 mb-2" />
                <CardTitle className="text-lg">Precios Nocturnos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Configura los precios para horarios nocturnos por cancha
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/usuarios">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <Users className="h-6 w-6 text-emerald-600 mb-2" />
                <CardTitle className="text-lg">Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Administra los usuarios registrados en el sistema</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/reglamento">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <Shield className="h-6 w-6 text-emerald-600 mb-2" />
                <CardTitle className="text-lg">Reglamento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Actualiza el reglamento de uso de las canchas</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/diseno">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <Palette className="h-6 w-6 text-emerald-600 mb-2" />
                <CardTitle className="text-lg">Diseño</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Personaliza la apariencia de la aplicación</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/integraciones">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <Bot className="h-6 w-6 text-emerald-600 mb-2" />
                <CardTitle className="text-lg">Integraciones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Configura integraciones con servicios externos</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/estadisticas">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <BarChart className="h-6 w-6 text-emerald-600 mb-2" />
                <CardTitle className="text-lg">Estadísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Visualiza estadísticas detalladas de reservas y usuarios
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/reservas">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <Home className="h-6 w-6 text-emerald-600 mb-2" />
                <CardTitle className="text-lg">Volver a Reservas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Regresa a la vista de usuario para reservar canchas</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/reserva-admin">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <Calendar className="h-6 w-6 text-emerald-600 mb-2" />
                <CardTitle className="text-lg">Reserva Administrativa</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Crea reservas para cualquier usuario en cualquier horario
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/cambios">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <History className="h-6 w-6 text-emerald-600 mb-2" />
                <CardTitle className="text-lg">Historial de Cambios</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Ver el registro de todos los cambios realizados en el sistema
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/reserva-profesor">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <GraduationCap className="h-6 w-6 text-emerald-600 mb-2" />
                <CardTitle className="text-lg">Reserva de Profesores</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Gestiona las reservas para profesores con límites especiales
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  )
}
