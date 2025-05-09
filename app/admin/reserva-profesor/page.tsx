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
import { ChevronLeft, GraduationCap } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useNotifications } from "@/components/notification-provider"
import { logSystemChange } from "@/lib/data"

export default function ReservaProfesorPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [cancha, setCancha] = useState<string>("")
  const [nombreProfesor, setNombreProfesor] = useState<string>("")
  const [horaInicio, setHoraInicio] = useState<string>("")
  const [duracion, setDuracion] = useState<string>("60")
  const [canchasDisponibles, setCanchasDisponibles] = useState<any[]>([])
  const [reservasProfesor, setReservasProfesor] = useState<any[]>([])

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
      // Cargar configuración de canchas
      try {
        const configStr = localStorage.getItem("esmeraldaPlayConfig")
        if (configStr) {
          const config = JSON.parse(configStr)

          // Configurar canchas disponibles
          setCanchasDisponibles([
            {
              id: "tenis",
              nombre: "Cancha de Tenis",
              precioNocturno: config.precioNocturnoTenis || "15.00",
              limiteHoras: 2,
            },
            {
              id: "futbol",
              nombre: "Cancha de Fútbol",
              precioNocturno: config.precioNocturnoFutbol || "20.00",
              limiteHoras: 3,
            },
            {
              id: "basquet",
              nombre: "Cancha de Básquet",
              precioNocturno: config.precioNocturnoBasquet || "15.00",
              limiteHoras: 2,
            },
            {
              id: "voley",
              nombre: "Cancha de Vóley",
              precioNocturno: config.precioNocturnoVoley || "15.00",
              limiteHoras: 2,
            },
          ])
        }
      } catch (error) {
        console.error("Error al cargar configuración:", error)
      }

      // Cargar reservas de profesores
      try {
        const reservasStr = localStorage.getItem("esmeraldaPlayReservasProfesores")
        if (reservasStr) {
          setReservasProfesor(JSON.parse(reservasStr))
        }
      } catch (error) {
        console.error("Error al cargar reservas de profesores:", error)
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

    if (!nombreProfesor) {
      toast({
        title: "Nombre del profesor requerido",
        description: "Por favor ingresa el nombre del profesor",
        variant: "destructive",
      })
      return
    }

    if (!horaInicio) {
      toast({
        title: "Hora de inicio requerida",
        description: "Por favor ingresa la hora de inicio de la clase",
        variant: "destructive",
      })
      return
    }

    // Convertir hora de inicio a formato HH:MM
    const horaPartes = horaInicio.split(":")
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
    const duracionMinutos = Number.parseInt(duracion)
    const inicioMinutos = hora * 60 + minutos
    const finMinutos = inicioMinutos + duracionMinutos

    const horaFin = Math.floor(finMinutos / 60)
    const minutosFin = finMinutos % 60

    const horaInicioStr = `${hora.toString().padStart(2, "0")}:${minutos.toString().padStart(2, "0")}`
    const horaFinStr = `${horaFin.toString().padStart(2, "0")}:${minutosFin.toString().padStart(2, "0")}`
    const horarioStr = `${horaInicioStr} - ${horaFinStr}`

    // Verificar límite de horas por tipo de cancha para profesores
    const fechaSeleccionada = date.toDateString()
    const reservasDelDia = reservasProfesor.filter(
      (r) => r.cancha === cancha && new Date(r.fecha).toDateString() === fechaSeleccionada,
    )

    // Calcular horas ya reservadas para esta cancha
    const horasReservadas = reservasDelDia.reduce((total, r) => {
      return total + r.duracionMinutos / 60
    }, 0)

    // Obtener límite de horas según tipo de cancha
    const canchaSeleccionada = canchasDisponibles.find((c) => c.id === cancha)
    const limiteHoras = canchaSeleccionada?.limiteHoras || 2

    if (horasReservadas + duracionMinutos / 60 > limiteHoras) {
      toast({
        title: "Límite de reserva excedido",
        description: `Solo puedes reservar máximo ${limiteHoras} horas para profesores en esta cancha por día`,
        variant: "destructive",
      })
      return
    }

    // Crear nueva reserva de profesor
    const nuevaReserva = {
      id: Date.now().toString(),
      fecha: date,
      cancha,
      canchaName: canchaSeleccionada?.nombre,
      horario: `${horaInicioStr}-${horaFinStr}`,
      horarioName: horarioStr,
      nombreProfesor,
      duracionMinutos,
      creadoPor: user?.id,
      creadoPorName: user?.name,
      fechaCreacion: new Date(),
    }

    // Guardar la reserva en localStorage
    const reservasActuales = [...reservasProfesor, nuevaReserva]
    localStorage.setItem("esmeraldaPlayReservasProfesores", JSON.stringify(reservasActuales))
    setReservasProfesor(reservasActuales)

    // Registrar el cambio en el sistema
    logSystemChange(
      user?.id || "",
      user?.name || "",
      "Reserva de profesor",
      `Creó una reserva para el profesor ${nombreProfesor} en ${canchaSeleccionada?.nombre} el ${date.toLocaleDateString()} a las ${horarioStr}`,
    )

    toast({
      title: "Reserva creada",
      description: `La reserva para el profesor ${nombreProfesor} ha sido creada correctamente`,
    })

    addNotification({
      title: "Reserva de profesor creada",
      message: `Has creado una reserva para el profesor ${nombreProfesor} en ${canchaSeleccionada?.nombre}`,
      type: "success",
    })

    // Limpiar formulario
    setNombreProfesor("")
    setHoraInicio("")
    setDuracion("60")
  }

  const handleEliminarReserva = (reservaId: string) => {
    const reserva = reservasProfesor.find((r) => r.id === reservaId)

    if (!reserva) {
      toast({
        title: "Error",
        description: "No se encontró la reserva",
        variant: "destructive",
      })
      return
    }

    // Eliminar la reserva
    const nuevasReservas = reservasProfesor.filter((r) => r.id !== reservaId)
    localStorage.setItem("esmeraldaPlayReservasProfesores", JSON.stringify(nuevasReservas))
    setReservasProfesor(nuevasReservas)

    // Registrar el cambio
    logSystemChange(
      user?.id || "",
      user?.name || "",
      "Eliminación de reserva de profesor",
      `Eliminó la reserva del profesor ${reserva.nombreProfesor} en ${reserva.canchaName} el ${new Date(reserva.fecha).toLocaleDateString()} a las ${reserva.horarioName}`,
    )

    toast({
      title: "Reserva eliminada",
      description: "La reserva del profesor ha sido eliminada correctamente",
    })

    addNotification({
      title: "Reserva de profesor eliminada",
      message: `Has eliminado la reserva del profesor ${reserva.nombreProfesor}`,
      type: "info",
    })
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
              <h1 className="text-xl font-bold">Reserva de Profesores</h1>
            </div>
            <div className="text-sm">
              <div className="font-medium">{user?.name}</div>
              <div className="text-xs opacity-80">{user?.email}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="max-w-full">
            <CardHeader>
              <CardTitle className="text-emerald-800 flex items-center gap-2">
                <GraduationCap className="h-6 w-6" />
                Crear Reserva para Profesor
              </CardTitle>
              <CardDescription>
                Como administrador, puedes crear reservas para profesores con límites especiales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nombreProfesor">Nombre del Profesor</Label>
                <Input
                  id="nombreProfesor"
                  type="text"
                  placeholder="Ej: Juan Martínez"
                  value={nombreProfesor}
                  onChange={(e) => setNombreProfesor(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Fecha de la Clase</Label>
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
                        {c.nombre} (Máx. {c.limiteHoras} horas)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="horaInicio">Hora de inicio (formato 24h)</Label>
                <Input
                  id="horaInicio"
                  type="text"
                  placeholder="HH:MM"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duracion">Duración (minutos)</Label>
                <Select value={duracion} onValueChange={setDuracion}>
                  <SelectTrigger id="duracion">
                    <SelectValue placeholder="Selecciona la duración" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="45">45 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="90">1 hora y 30 minutos</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                    <SelectItem value="180">3 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h3 className="font-medium text-amber-800 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Límites para profesores
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  Cancha de Fútbol: máximo 3 horas diarias
                  <br />
                  Cancha de Tenis: máximo 2 horas diarias
                  <br />
                  Otras canchas: máximo 2 horas diarias
                </p>
              </div>

              <Button onClick={handleReservar} className="w-full bg-emerald-600 hover:bg-emerald-700 mt-4">
                Crear Reserva para Profesor
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-emerald-800">Reservas de Profesores</CardTitle>
              <CardDescription>Listado de reservas para profesores</CardDescription>
            </CardHeader>
            <CardContent>
              {reservasProfesor.length > 0 ? (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {reservasProfesor
                    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
                    .map((reserva) => (
                      <div key={reserva.id} className="bg-white p-4 rounded-lg border">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{reserva.nombreProfesor}</h4>
                            <p className="text-sm text-gray-600">
                              {new Date(reserva.fecha).toLocaleDateString()} • {reserva.horarioName}
                            </p>
                            <p className="text-sm text-gray-600">{reserva.canchaName}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => handleEliminarReserva(reserva.id)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No hay reservas de profesores</p>
                  <p className="text-sm mt-2">Las reservas de profesores aparecerán aquí</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
