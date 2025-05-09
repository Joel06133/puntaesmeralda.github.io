"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { ChevronLeft, CalendarIcon, User } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useNotifications } from "@/components/notification-provider"
import { getRegisteredUsers, logSystemChange } from "@/lib/data"

export default function ReservaAdminPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [cancha, setCancha] = useState<string>("")
  const [horario, setHorario] = useState<string>("")
  const [usuario, setUsuario] = useState<string>("")
  const [horariosDisponibles, setHorariosDisponibles] = useState<any[]>([])
  const [canchasDisponibles, setCanchasDisponibles] = useState<any[]>([])
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [horaPersonalizada, setHoraPersonalizada] = useState<string>("")
  const [duracionPersonalizada, setDuracionPersonalizada] = useState<string>("60")
  const [modoPersonalizado, setModoPersonalizado] = useState<boolean>(false)

  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
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

  // Cargar datos necesarios
  useEffect(() => {
    if (!isLoading && user?.role === "admin") {
      // Cargar usuarios
      const registeredUsers = getRegisteredUsers()
      setUsuarios(registeredUsers.filter((u) => u.status === "approved"))

      // Cargar configuración de horarios
      try {
        const configStr = localStorage.getItem("esmeraldaPlayConfig")
        if (configStr) {
          const config = JSON.parse(configStr)

          // Generar horarios disponibles basados en la configuración
          const horaInicio = config.horaInicio || "06:00"
          const horaFin = config.horaFin || "22:00"
          const duracionReserva = config.duracionReserva || 60
          const horaNocturnaInicio = config.horaNocturnaInicio || "19:00"

          // Convertir horas a minutos para facilitar cálculos
          const inicioMinutos =
            Number.parseInt(horaInicio.split(":")[0]) * 60 + Number.parseInt(horaInicio.split(":")[1] || "0")
          const finMinutos = Number.parseInt(horaFin.split(":")[0]) * 60 + Number.parseInt(horaFin.split(":")[1] || "0")
          const nocturnaMinutos =
            Number.parseInt(horaNocturnaInicio.split(":")[0]) * 60 +
            Number.parseInt(horaNocturnaInicio.split(":")[1] || "0")

          const horarios = []
          for (let i = inicioMinutos; i < finMinutos; i += duracionReserva) {
            const horaInicio = `${Math.floor(i / 60)
              .toString()
              .padStart(2, "0")}:${(i % 60).toString().padStart(2, "0")}`
            const horaFin = `${Math.floor((i + duracionReserva) / 60)
              .toString()
              .padStart(2, "0")}:${((i + duracionReserva) % 60).toString().padStart(2, "0")}`

            horarios.push({
              id: `${horaInicio}-${horaFin}`,
              hora: `${horaInicio} - ${horaFin}`,
              nocturno: i >= nocturnaMinutos,
            })
          }

          setHorariosDisponibles(horarios)

          // Configurar canchas disponibles
          setCanchasDisponibles([
            { id: "tenis", nombre: "Cancha de Tenis", precioNocturno: config.precioNocturnoTenis || "15.00" },
            { id: "futbol", nombre: "Cancha de Fútbol", precioNocturno: config.precioNocturnoFutbol || "20.00" },
            { id: "basquet", nombre: "Cancha de Básquet", precioNocturno: config.precioNocturnoBasquet || "15.00" },
            { id: "voley", nombre: "Cancha de Vóley", precioNocturno: config.precioNocturnoVoley || "15.00" },
          ])
        }
      } catch (error) {
        console.error("Error al cargar configuración:", error)
      }
    }
  }, [isLoading, user])

  const handleReservar = () => {
    if (!date) {
      toast({
        title: "Fecha requerida",
        description: "Por favor selecciona una fecha para la reserva",
        variant: "destructive",
      })
      return
    }

    if (!cancha) {
      toast({
        title: "Cancha requerida",
        description: "Por favor selecciona una cancha para la reserva",
        variant: "destructive",
      })
      return
    }

    if (!usuario) {
      toast({
        title: "Usuario requerido",
        description: "Por favor selecciona un usuario para la reserva",
        variant: "destructive",
      })
      return
    }

    let horarioReserva = horario
    let horarioNombre = ""

    if (modoPersonalizado) {
      if (!horaPersonalizada) {
        toast({
          title: "Hora requerida",
          description: "Por favor ingresa una hora para la reserva personalizada",
          variant: "destructive",
        })
        return
      }

      // Convertir hora personalizada a formato HH:MM
      const horaPartes = horaPersonalizada.split(":")
      const hora = Number.parseInt(horaPartes[0])
      const minutos = Number.parseInt(horaPartes[1] || "0")

      // Validar hora
      if (hora < 0 || hora > 23 || minutos < 0 || minutos > 59) {
        toast({
          title: "Hora inválida",
          description: "Por favor ingresa una hora válida en formato HH:MM",
          variant: "destructive",
        })
        return
      }

      // Calcular hora de fin
      const duracion = Number.parseInt(duracionPersonalizada)
      const inicioMinutos = hora * 60 + minutos
      const finMinutos = inicioMinutos + duracion

      const horaFin = Math.floor(finMinutos / 60)
      const minutosFin = finMinutos % 60

      const horaInicioStr = `${hora.toString().padStart(2, "0")}:${minutos.toString().padStart(2, "0")}`
      const horaFinStr = `${horaFin.toString().padStart(2, "0")}:${minutosFin.toString().padStart(2, "0")}`

      horarioReserva = `${horaInicioStr}-${horaFinStr}`
      horarioNombre = `${horaInicioStr} - ${horaFinStr}`
    } else {
      if (!horario) {
        toast({
          title: "Horario requerido",
          description: "Por favor selecciona un horario para la reserva",
          variant: "destructive",
        })
        return
      }

      const horarioSeleccionado = horariosDisponibles.find((h) => h.id === horario)
      horarioNombre = horarioSeleccionado?.hora || ""
    }

    // Buscar información de la cancha y usuario
    const canchaSeleccionada = canchasDisponibles.find((c) => c.id === cancha)
    const usuarioSeleccionado = usuarios.find((u) => u.id === usuario)

    // Crear nueva reserva
    const nuevaReserva = {
      id: Date.now().toString(),
      fecha: date,
      cancha,
      canchaName: canchaSeleccionada?.nombre,
      horario: horarioReserva,
      horarioName: horarioNombre,
      estado: "confirmada",
      usuario: usuarioSeleccionado?.id,
      usuarioName: usuarioSeleccionado?.name,
      creadaPor: user?.id,
      creadaPorName: user?.name,
      esReservaAdmin: true,
    }

    // Guardar la reserva en localStorage
    try {
      const reservasStr = localStorage.getItem(`esmeraldaPlayReservas_${usuarioSeleccionado?.id}`)
      const reservas = reservasStr ? JSON.parse(reservasStr) : []
      reservas.push(nuevaReserva)
      localStorage.setItem(`esmeraldaPlayReservas_${usuarioSeleccionado?.id}`, JSON.stringify(reservas))

      // Registrar el cambio en el sistema
      logSystemChange(
        user?.id || "",
        user?.name || "",
        "Reserva administrativa",
        `Creó una reserva para ${usuarioSeleccionado?.name} en ${canchaSeleccionada?.nombre} el ${date.toLocaleDateString()} a las ${horarioNombre}`,
      )

      toast({
        title: "Reserva creada",
        description: `La reserva para ${usuarioSeleccionado?.name} ha sido creada correctamente`,
      })

      addNotification({
        title: "Reserva administrativa creada",
        message: `Has creado una reserva para ${usuarioSeleccionado?.name} en ${canchaSeleccionada?.nombre}`,
        type: "success",
      })

      // Notificar al usuario
      const notificacionUsuario = {
        id: Date.now().toString(),
        title: "Nueva reserva",
        message: `El administrador ha creado una reserva para ti en ${canchaSeleccionada?.nombre} el ${date.toLocaleDateString()} a las ${horarioNombre}`,
        type: "info",
        read: false,
        date: new Date(),
        userId: usuarioSeleccionado?.id,
      }

      try {
        const notificacionesUsuarioStr = localStorage.getItem(`esmeraldaPlayNotificaciones_${usuarioSeleccionado?.id}`)
        const notificacionesUsuario = notificacionesUsuarioStr ? JSON.parse(notificacionesUsuarioStr) : []
        notificacionesUsuario.unshift(notificacionUsuario)
        localStorage.setItem(
          `esmeraldaPlayNotificaciones_${usuarioSeleccionado?.id}`,
          JSON.stringify(notificacionesUsuario),
        )
      } catch (error) {
        console.error("Error al guardar notificación para el usuario:", error)
      }

      // Limpiar formulario
      setCancha("")
      setHorario("")
      setUsuario("")
      setHoraPersonalizada("")
      setDuracionPersonalizada("60")
    } catch (error) {
      console.error("Error al crear reserva:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la reserva. Intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

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
              <h1 className="text-xl font-bold">Crear Reserva Administrativa</h1>
            </div>
            <div className="text-sm">
              <div className="font-medium">{user?.name}</div>
              <div className="text-xs opacity-80">{user?.email}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-emerald-800 flex items-center gap-2">
              <CalendarIcon className="h-6 w-6" />
              Crear Reserva Administrativa
            </CardTitle>
            <CardDescription>
              Como administrador, puedes crear reservas en cualquier horario para cualquier usuario
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="usuario">Usuario</Label>
              <Select value={usuario} onValueChange={setUsuario}>
                <SelectTrigger id="usuario">
                  <SelectValue placeholder="Selecciona un usuario" />
                </SelectTrigger>
                <SelectContent>
                  {usuarios.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fecha de la Reserva</Label>
              <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cancha">Cancha</Label>
              <Select value={cancha} onValueChange={setCancha}>
                <SelectTrigger id="cancha">
                  <SelectValue placeholder="Selecciona una cancha" />
                </SelectTrigger>
                <SelectContent>
                  {canchasDisponibles.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="modoPersonalizado"
                checked={modoPersonalizado}
                onChange={() => setModoPersonalizado(!modoPersonalizado)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="modoPersonalizado">Usar horario personalizado</Label>
            </div>

            {modoPersonalizado ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="horaPersonalizada">Hora de inicio (formato 24h)</Label>
                  <Input
                    id="horaPersonalizada"
                    type="text"
                    placeholder="HH:MM"
                    value={horaPersonalizada}
                    onChange={(e) => setHoraPersonalizada(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duracionPersonalizada">Duración (minutos)</Label>
                  <Select value={duracionPersonalizada} onValueChange={setDuracionPersonalizada}>
                    <SelectTrigger id="duracionPersonalizada">
                      <SelectValue placeholder="Selecciona la duración" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="45">45 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="90">1 hora y 30 minutos</SelectItem>
                      <SelectItem value="120">2 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="horario">Horario</Label>
                <Select value={horario} onValueChange={setHorario}>
                  <SelectTrigger id="horario">
                    <SelectValue placeholder="Selecciona un horario" />
                  </SelectTrigger>
                  <SelectContent>
                    {horariosDisponibles.map((h) => (
                      <SelectItem key={h.id} value={h.id}>
                        {h.hora} {h.nocturno && "🌙"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="font-medium text-amber-800 flex items-center gap-2">
                <User className="h-5 w-5" />
                Información importante
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                Como administrador, puedes crear reservas en cualquier horario, incluso fuera del horario regular o en
                fechas pasadas. El usuario recibirá una notificación sobre esta reserva.
              </p>
            </div>

            <Button onClick={handleReservar} className="w-full bg-emerald-600 hover:bg-emerald-700 mt-4">
              Crear Reserva
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
