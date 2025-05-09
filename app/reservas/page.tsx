"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft, Info, User, CalendarIcon, Clock } from "lucide-react"
import { NotificationBell } from "@/components/notification-bell"
import { useAuth } from "@/components/auth-provider"
import { useNotifications } from "@/components/notification-provider"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getUserByManzanaVilla, getSystemConfig } from "@/lib/data"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Logo } from "@/components/logo"

export default function ReservasPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [cancha, setCancha] = useState<string>("")
  const [horario, setHorario] = useState<string>("")
  const [duracionReserva, setDuracionReserva] = useState<"1" | "2">("1") // Opción para duración
  const [horaInicio, setHoraInicio] = useState<string>("")
  const [horaFin, setHoraFin] = useState<string>("")
  const [horariosDisponibles, setHorariosDisponibles] = useState<any[]>([])
  const [canchasDisponibles, setCanchasDisponibles] = useState<any[]>([])
  const [misReservas, setMisReservas] = useState<any[]>([])
  const [disponibilidadAbierta, setDisponibilidadAbierta] = useState(false)
  const [disponibilidadCancha, setDisponibilidadCancha] = useState<string>("")
  const [disponibilidadFecha, setDisponibilidadFecha] = useState<Date>(new Date())
  const [tablaDisponibilidad, setTablaDisponibilidad] = useState<any[]>([])
  const [todasLasReservas, setTodasLasReservas] = useState<any[]>([])
  const [mostrarCalendarioDisponibilidad, setMostrarCalendarioDisponibilidad] = useState(false)
  const [appConfig, setAppConfig] = useState<any>({})

  // Añadir estado para el diálogo de anulación
  const [anularReservaDialogOpen, setAnularReservaDialogOpen] = useState(false)
  const [reservaAAnular, setReservaAAnular] = useState<any>(null)
  const [justificativoAnulacion, setJustificativoAnulacion] = useState("")

  const { toast } = useToast()
  const { user, isLoading } = useAuth()
  const { addNotification } = useNotifications()
  const router = useRouter()

  // Cargar configuración de la aplicación
  useEffect(() => {
    try {
      const configStr = localStorage.getItem("esmeraldaPlayConfig")
      if (configStr) {
        const config = JSON.parse(configStr)
        setAppConfig(config)
      }
    } catch (error) {
      console.error("Error al cargar configuración:", error)
    }

    // Escuchar cambios en la configuración
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "esmeraldaPlayConfig") {
        try {
          const configStr = localStorage.getItem("esmeraldaPlayConfig")
          if (configStr) {
            const config = JSON.parse(configStr)
            setAppConfig(config)
          }
        } catch (error) {
          console.error("Error al cargar configuración:", error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  // Redireccionar si no hay usuario autenticado
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Cargar todas las reservas
  useEffect(() => {
    if (!isLoading) {
      const allReservas: any[] = []
      try {
        // Buscar en localStorage todas las reservas
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith("esmeraldaPlayReservas_")) {
            const reservasUsuario = JSON.parse(localStorage.getItem(key) || "[]")
            allReservas.push(...reservasUsuario)
          }
        }
        setTodasLasReservas(allReservas)
      } catch (error) {
        console.error("Error al cargar todas las reservas:", error)
      }
    }
  }, [isLoading])

  // Cargar configuración de horarios
  useEffect(() => {
    if (!isLoading && user) {
      try {
        const config = getSystemConfig()

        // Generar horarios disponibles basados en la configuración
        const horaInicio = config.horaInicio || "06:00"
        const horaFin = config.horaFin || "22:00"
        const duracionReservaConfig = config.duracionReserva || 60
        const horaNocturnaInicio = config.horaNocturnaInicio || "19:00"

        // Convertir horas a minutos para facilitar cálculos
        const inicioMinutos =
          Number.parseInt(horaInicio.split(":")[0]) * 60 + Number.parseInt(horaInicio.split(":")[1] || "0")
        const finMinutos = Number.parseInt(horaFin.split(":")[0]) * 60 + Number.parseInt(horaFin.split(":")[1] || "0")
        const nocturnaMinutos =
          Number.parseInt(horaNocturnaInicio.split(":")[0]) * 60 +
          Number.parseInt(horaNocturnaInicio.split(":")[1] || "0")

        const horarios = []
        for (let i = inicioMinutos; i < finMinutos; i += duracionReservaConfig) {
          const horaInicio = `${Math.floor(i / 60)
            .toString()
            .padStart(2, "0")}:${(i % 60).toString().padStart(2, "0")}`
          const horaFin = `${Math.floor((i + duracionReservaConfig) / 60)
            .toString()
            .padStart(2, "0")}:${((i + duracionReservaConfig) % 60).toString().padStart(2, "0")}`

          horarios.push({
            id: `${horaInicio}-${horaFin}`,
            hora: `${horaInicio} - ${horaFin}`,
            horaInicio,
            horaFin,
            nocturno: i >= nocturnaMinutos,
          })
        }

        setHorariosDisponibles(horarios)

        // Configurar canchas disponibles - Eliminar cancha multiuso
        setCanchasDisponibles([
          { id: "tenis1", nombre: "Cancha de Tenis 1", precioNocturno: config.precioNocturnoTenis || "15.00" },
          { id: "tenis2", nombre: "Cancha de Tenis 2", precioNocturno: config.precioNocturnoTenis || "15.00" },
          { id: "futbol", nombre: "Cancha de Fútbol", precioNocturno: config.precioNocturnoFutbol || "20.00" },
        ])
      } catch (error) {
        console.error("Error al cargar configuración:", error)
      }

      // Cargar reservas del usuario
      try {
        const reservasStr = localStorage.getItem(`esmeraldaPlayReservas_${user.id}`)
        if (reservasStr) {
          const reservas = JSON.parse(reservasStr)
          setMisReservas(reservas)
        }
      } catch (error) {
        console.error("Error al cargar reservas:", error)
      }
    }
  }, [isLoading, user])

  // Verificar disponibilidad de horarios
  const verificarDisponibilidad = (canchaId: string, fecha: Date) => {
    setDisponibilidadCancha(canchaId)
    setDisponibilidadFecha(fecha)

    // Filtrar reservas para la cancha y fecha seleccionadas
    const fechaSeleccionada = fecha.toDateString()

    // Si es cancha multiuso, verificar todas las reservas de esa cancha
    let reservasCancha = []
    if (canchaId === "basquet" || canchaId === "voley" || canchaId === "picketball") {
      reservasCancha = todasLasReservas.filter(
        (r) =>
          (r.cancha === "basquet" || r.cancha === "voley" || r.cancha === "picketball") &&
          new Date(r.fecha).toDateString() === fechaSeleccionada,
      )
    } else {
      reservasCancha = todasLasReservas.filter(
        (r) => r.cancha === canchaId && new Date(r.fecha).toDateString() === fechaSeleccionada,
      )
    }

    // Crear tabla de disponibilidad
    const tabla = horariosDisponibles.map((horario) => {
      const reservado = reservasCancha.some((r) => r.horario === horario.id)
      return {
        ...horario,
        disponible: !reservado,
      }
    })

    setTablaDisponibilidad(tabla)
    setDisponibilidadAbierta(true)
  }

  // Verificar si es hora permitida para reservar (9am a 5pm)
  const esHoraPermitida = () => {
    // Si es administrador, permitir reservar a cualquier hora
    if (user?.role === "admin") return true

    const now = new Date()
    const hora = now.getHours()
    return hora >= 9 && hora < 17
  }

  // Verificar si la fecha está dentro del límite de 48 horas
  const esFechaPermitida = (fecha: Date | undefined) => {
    if (!fecha) return false

    const now = new Date()
    const limite = new Date(now.getTime() + 48 * 60 * 60 * 1000) // 48 horas en milisegundos

    return fecha <= limite
  }

  // Verificar si el usuario ya tiene una reserva para el día anterior o siguiente
  const tieneReservaConsecutiva = (fecha: Date | undefined) => {
    if (!fecha || !user) return false

    const fechaSeleccionada = new Date(fecha)

    // Crear fechas para el día anterior y siguiente
    const diaAnterior = new Date(fechaSeleccionada)
    diaAnterior.setDate(diaAnterior.getDate() - 1)

    const diaSiguiente = new Date(fechaSeleccionada)
    diaSiguiente.setDate(diaSiguiente.getDate() + 1)

    // Verificar si hay reservas en esos días
    return misReservas.some((reserva) => {
      const fechaReserva = new Date(reserva.fecha)
      return (
        fechaReserva.toDateString() === diaAnterior.toDateString() ||
        fechaReserva.toDateString() === diaSiguiente.toDateString()
      )
    })
  }

  // Verificar si el horario ya está reservado
  const horarioEstaReservado = (fecha: Date | undefined, canchaId: string, horarioId: string) => {
    if (!fecha) return false

    const fechaSeleccionada = fecha.toDateString()

    // Si es cancha compartida, verificar todas las reservas de deportes que comparten la cancha
    if (canchaId === "basquet" || canchaId === "voley" || canchaId === "picketball") {
      return todasLasReservas.some(
        (r) =>
          (r.cancha === "basquet" || r.cancha === "voley" || r.cancha === "picketball") &&
          new Date(r.fecha).toDateString() === fechaSeleccionada &&
          r.horario === horarioId,
      )
    }

    return todasLasReservas.some(
      (r) => r.cancha === canchaId && new Date(r.fecha).toDateString() === fechaSeleccionada && r.horario === horarioId,
    )
  }

  // Verificar si el rango de horarios está disponible
  const rangoHorariosDisponible = (fecha: Date | undefined, canchaId: string, horaInicio: string, horaFin: string) => {
    if (!fecha || !horaInicio || !horaFin) return false

    // Convertir horas a minutos para comparación
    const inicioMinutos = Number.parseInt(horaInicio.split(":")[0]) * 60 + Number.parseInt(horaInicio.split(":")[1])
    const finMinutos = Number.parseInt(horaFin.split(":")[0]) * 60 + Number.parseInt(horaFin.split(":")[1])

    // Verificar cada horario en el rango
    for (const horario of horariosDisponibles) {
      const horarioInicioMinutos =
        Number.parseInt(horario.horaInicio.split(":")[0]) * 60 + Number.parseInt(horario.horaInicio.split(":")[1])
      const horarioFinMinutos =
        Number.parseInt(horario.horaFin.split(":")[0]) * 60 + Number.parseInt(horario.horaFin.split(":")[1])

      // Si este horario está dentro del rango seleccionado
      if (
        (horarioInicioMinutos >= inicioMinutos && horarioInicioMinutos < finMinutos) ||
        (horarioFinMinutos > inicioMinutos && horarioFinMinutos <= finMinutos) ||
        (horarioInicioMinutos <= inicioMinutos && horarioFinMinutos >= finMinutos)
      ) {
        // Verificar si está reservado
        if (horarioEstaReservado(fecha, canchaId, horario.id)) {
          return false
        }
      }
    }

    return true
  }

  // Verificar si otro usuario de la misma manzana y villa ya tiene una reserva para ese día
  const otraReservaMismaVivienda = (fecha: Date | undefined) => {
    if (!fecha || !user || !user.manzana || !user.villa) return false

    const fechaSeleccionada = fecha.toDateString()

    // Buscar usuarios con la misma manzana y villa
    const usuariosMismaVivienda = getUserByManzanaVilla(user.manzana, user.villa)

    // Excluir al usuario actual
    const otrosUsuarios = usuariosMismaVivienda.filter((u) => u.id !== user.id)

    // Verificar si alguno de estos usuarios tiene una reserva para la fecha seleccionada
    for (const otroUsuario of otrosUsuarios) {
      const reservasStr = localStorage.getItem(`esmeraldaPlayReservas_${otroUsuario.id}`)
      if (reservasStr) {
        const reservas = JSON.parse(reservasStr)
        const tieneReserva = reservas.some((r: any) => new Date(r.fecha).toDateString() === fechaSeleccionada)
        if (tieneReserva) return true
      }
    }

    return false
  }

  // Verificar si se permite reserva nocturna en el día seleccionado
  const permiteReservaNocturna = (fecha: Date | undefined, esNocturno: boolean) => {
    if (!fecha || !esNocturno) return true

    // Las reservas nocturnas solo se permiten de lunes a viernes
    const diaSemana = fecha.getDay()
    return diaSemana >= 1 && diaSemana <= 5 // 0 es domingo, 6 es sábado
  }

  // Obtener horarios entre hora inicio y fin
  const obtenerHorariosEnRango = (horaInicio: string, horaFin: string) => {
    // Convertir horas a minutos para comparación
    const inicioMinutos = Number.parseInt(horaInicio.split(":")[0]) * 60 + Number.parseInt(horaInicio.split(":")[1])
    const finMinutos = Number.parseInt(horaFin.split(":")[0]) * 60 + Number.parseInt(horaFin.split(":")[1])

    return horariosDisponibles.filter((horario) => {
      const horarioInicioMinutos =
        Number.parseInt(horario.horaInicio.split(":")[0]) * 60 + Number.parseInt(horario.horaInicio.split(":")[1])
      const horarioFinMinutos =
        Number.parseInt(horario.horaFin.split(":")[0]) * 60 + Number.parseInt(horario.horaFin.split(":")[1])

      return (
        (horarioInicioMinutos >= inicioMinutos && horarioInicioMinutos < finMinutos) ||
        (horarioFinMinutos > inicioMinutos && horarioFinMinutos <= finMinutos) ||
        (horarioInicioMinutos <= inicioMinutos && horarioFinMinutos >= finMinutos)
      )
    })
  }

  // Verificar si el horario es nocturno
  const esHorarioNocturno = (horaInicio: string) => {
    const config = getSystemConfig()
    const horaNocturnaInicio = config.horaNocturnaInicio || "19:00"

    const inicioMinutos = Number.parseInt(horaInicio.split(":")[0]) * 60 + Number.parseInt(horaInicio.split(":")[1])
    const nocturnaMinutos =
      Number.parseInt(horaNocturnaInicio.split(":")[0]) * 60 + Number.parseInt(horaNocturnaInicio.split(":")[1])

    return inicioMinutos >= nocturnaMinutos
  }

  // Añadir función para anular reserva
  const anularReserva = () => {
    if (!reservaAAnular || !justificativoAnulacion.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un justificativo para anular la reserva",
        variant: "destructive",
      })
      return
    }

    try {
      // Filtrar la reserva a anular
      const nuevasReservas = misReservas.filter((r) => r.id !== reservaAAnular.id)

      // Si es una reserva de 2 horas, también eliminar la segunda hora
      if (reservaAAnular.duracion === "2") {
        const segundaHora = misReservas.find(
          (r) => r.fecha === reservaAAnular.fecha && r.cancha === reservaAAnular.cancha && r.esSegundaHora,
        )
        if (segundaHora) {
          const indexSegundaHora = nuevasReservas.findIndex((r) => r.id === segundaHora.id)
          if (indexSegundaHora !== -1) {
            nuevasReservas.splice(indexSegundaHora, 1)
          }
        }
      }

      // Guardar las reservas actualizadas
      localStorage.setItem(`esmeraldaPlayReservas_${user?.id}`, JSON.stringify(nuevasReservas))
      setMisReservas(nuevasReservas)

      // Actualizar todas las reservas
      setTodasLasReservas((prev) => prev.filter((r) => r.id !== reservaAAnular.id))

      // Registrar la anulación
      const anulacion = {
        id: Date.now().toString(),
        reservaId: reservaAAnular.id,
        usuarioId: user?.id,
        usuarioName: user?.name,
        fecha: new Date(),
        justificativo: justificativoAnulacion,
        canchaName: reservaAAnular.canchaName,
        fechaReserva: reservaAAnular.fecha,
        horarioName: reservaAAnular.horarioName,
      }

      // Guardar registro de anulación
      const anulacionesStr = localStorage.getItem("esmeraldaPlayAnulaciones")
      const anulaciones = anulacionesStr ? JSON.parse(anulacionesStr) : []
      anulaciones.push(anulacion)
      localStorage.setItem("esmeraldaPlayAnulaciones", JSON.stringify(anulaciones))

      // Notificar al administrador
      if (user?.email !== "aso.urbpuntaesmeralda@gmail.com") {
        const adminId = "1" // ID predefinido del administrador

        const notificacionAdmin = {
          id: Date.now().toString(),
          title: "Reserva anulada",
          message: `${user?.name} ha anulado su reserva para ${reservaAAnular.canchaName} el ${new Date(
            reservaAAnular.fecha,
          ).toLocaleDateString()} a las ${reservaAAnular.horarioName}. Justificativo: ${justificativoAnulacion}`,
          type: "warning",
          read: false,
          date: new Date(),
          userId: adminId,
        }

        const notificacionesAdminStr = localStorage.getItem(`esmeraldaPlayNotificaciones_${adminId}`)
        const notificacionesAdmin = notificacionesAdminStr ? JSON.parse(notificacionesAdminStr) : []
        notificacionesAdmin.unshift(notificacionAdmin)
        localStorage.setItem(`esmeraldaPlayNotificaciones_${adminId}`, JSON.stringify(notificacionesAdmin))
      }

      toast({
        title: "Reserva anulada",
        description: "Tu reserva ha sido anulada correctamente",
      })

      addNotification({
        title: "Reserva anulada",
        message: `Has anulado tu reserva para ${reservaAAnular.canchaName} el ${new Date(
          reservaAAnular.fecha,
        ).toLocaleDateString()} a las ${reservaAAnular.horarioName}`,
        type: "info",
      })

      // Cerrar el diálogo
      setAnularReservaDialogOpen(false)
      setReservaAAnular(null)
      setJustificativoAnulacion("")
    } catch (error) {
      console.error("Error al anular reserva:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al anular la reserva",
        variant: "destructive",
      })
    }
  }

  const handleReservar = () => {
    if (!date || !cancha) {
      toast({
        title: "Información incompleta",
        description: "Por favor selecciona fecha y cancha",
        variant: "destructive",
      })
      return
    }

    // Verificar si es hora permitida para reservar
    if (!esHoraPermitida()) {
      toast({
        title: "Horario no permitido",
        description: "Solo puedes realizar reservas entre las 9:00 AM y 5:00 PM (hora de Ecuador)",
        variant: "destructive",
      })
      return
    }

    // Verificar si la fecha está dentro del límite de 48 horas
    if (!esFechaPermitida(date)) {
      toast({
        title: "Fecha no permitida",
        description: "Solo puedes realizar reservas con un máximo de 48 horas de anticipación",
        variant: "destructive",
      })
      return
    }

    // Verificar si el usuario ya tiene una reserva para el día anterior o siguiente
    if (tieneReservaConsecutiva(date)) {
      toast({
        title: "Reserva no permitida",
        description: "No puedes reservar en días consecutivos",
        variant: "destructive",
      })
      return
    }

    // Verificar si otro usuario de la misma manzana y villa ya tiene una reserva para ese día
    if (otraReservaMismaVivienda(date)) {
      toast({
        title: "Reserva no permitida",
        description: "Ya existe una reserva para tu manzana y villa en esta fecha",
        variant: "destructive",
      })
      return
    }

    // Obtener la cancha seleccionada
    const canchaSeleccionada = canchasDisponibles.find((c) => c.id === cancha)

    // Verificar disponibilidad según el tipo de reserva
    let esReservaNocturna = false
    let horariosAReservar: any[] = []

    if (cancha === "futbol" && duracionReserva === "2") {
      // Reserva de 2 horas con horario personalizado
      if (!horaInicio || !horaFin) {
        toast({
          title: "Información incompleta",
          description: "Por favor selecciona hora de inicio y fin",
          variant: "destructive",
        })
        return
      }

      // Verificar que el rango sea de exactamente 2 horas
      const inicioMinutos = Number.parseInt(horaInicio.split(":")[0]) * 60 + Number.parseInt(horaInicio.split(":")[1])
      const finMinutos = Number.parseInt(horaFin.split(":")[0]) * 60 + Number.parseInt(horaFin.split(":")[1])
      const diferenciaMinutos = finMinutos - inicioMinutos

      if (diferenciaMinutos !== 120) {
        toast({
          title: "Duración inválida",
          description: "La reserva debe ser de exactamente 2 horas",
          variant: "destructive",
        })
        return
      }

      // Verificar disponibilidad del rango completo
      if (!rangoHorariosDisponible(date, cancha, horaInicio, horaFin)) {
        toast({
          title: "Horario no disponible",
          description: "Uno o más horarios en el rango seleccionado ya están reservados",
          variant: "destructive",
        })
        return
      }

      // Obtener todos los horarios en el rango
      horariosAReservar = obtenerHorariosEnRango(horaInicio, horaFin)

      // Verificar si alguno de los horarios es nocturno
      esReservaNocturna =
        esHorarioNocturno(horaInicio) || esHorarioNocturno(horariosAReservar[horariosAReservar.length - 1].horaInicio)
    } else {
      // Reserva normal de 1 hora
      if (!horario) {
        toast({
          title: "Información incompleta",
          description: "Por favor selecciona un horario",
          variant: "destructive",
        })
        return
      }

      // Verificar si el horario ya está reservado
      if (horarioEstaReservado(date, cancha, horario)) {
        toast({
          title: "Horario no disponible",
          description: "Este horario ya ha sido reservado. Por favor selecciona otro.",
          variant: "destructive",
        })
        return
      }

      const horarioSeleccionado = horariosDisponibles.find((h) => h.id === horario)
      if (!horarioSeleccionado) return

      horariosAReservar = [horarioSeleccionado]
      esReservaNocturna = horarioSeleccionado.nocturno
    }

    // Verificar restricciones para reservas nocturnas
    if (esReservaNocturna) {
      if (!permiteReservaNocturna(date, true)) {
        toast({
          title: "Reserva nocturna no permitida",
          description: "Las reservas nocturnas solo están disponibles de lunes a viernes",
          variant: "destructive",
        })
        return
      }

      // Redirección a la página de pago para horarios nocturnos
      const queryParams = new URLSearchParams({
        fecha: date.toISOString(),
        cancha: cancha,
        duracion: duracionReserva,
      })

      if (cancha === "futbol" && duracionReserva === "2") {
        queryParams.append("horaInicio", horaInicio)
        queryParams.append("horaFin", horaFin)
      } else {
        queryParams.append("horario", horario)
      }

      router.push(`/reservas/pago?${queryParams.toString()}`)

      addNotification({
        title: "Reserva nocturna",
        message: "Se requiere pago para reservas nocturnas. Por favor sube tu comprobante.",
        type: "info",
      })
    } else {
      // Crear reservas para todos los horarios seleccionados
      const reservasAGuardar = []

      for (let i = 0; i < horariosAReservar.length; i++) {
        const horarioActual = horariosAReservar[i]

        const nuevaReserva = {
          id: Date.now().toString() + i,
          fecha: date,
          cancha,
          canchaName: canchaSeleccionada?.nombre || cancha,
          horario: horarioActual.id,
          horarioName: horarioActual.hora,
          estado: "confirmada",
          usuario: user?.id,
          usuarioName: user?.name,
          duracion: duracionReserva,
          esSegundaHora: i > 0, // Marcar horarios adicionales
          deporte: cancha,
        }

        reservasAGuardar.push(nuevaReserva)
      }

      // Guardar las reservas en localStorage
      const reservasActuales = [...misReservas, ...reservasAGuardar]
      localStorage.setItem(`esmeraldaPlayReservas_${user?.id}`, JSON.stringify(reservasActuales))
      setMisReservas(reservasActuales)

      // Actualizar todas las reservas para reflejar inmediatamente en la disponibilidad
      setTodasLasReservas((prev) => [...prev, ...reservasAGuardar])

      // Notificar al administrador
      if (user?.email !== "aso.urbpuntaesmeralda@gmail.com") {
        // Buscar el ID del administrador
        const adminId = "1" // ID predefinido del administrador

        // Crear notificación para el administrador
        const notificacionAdmin = {
          id: Date.now().toString(),
          title: "Nueva reserva",
          message: `${user?.name} ha realizado una reserva para ${canchaSeleccionada?.nombre || cancha} el ${date.toLocaleDateString()} ${
            cancha === "futbol" && duracionReserva === "2"
              ? `de ${horaInicio} a ${horaFin}`
              : `a las ${horariosAReservar[0].hora}`
          }.`,
          type: "info",
          read: false,
          date: new Date(),
          userId: adminId,
        }

        // Guardar notificación para el administrador
        try {
          const notificacionesAdminStr = localStorage.getItem(`esmeraldaPlayNotificaciones_${adminId}`)
          const notificacionesAdmin = notificacionesAdminStr ? JSON.parse(notificacionesAdminStr) : []
          notificacionesAdmin.unshift(notificacionAdmin)
          localStorage.setItem(`esmeraldaPlayNotificaciones_${adminId}`, JSON.stringify(notificacionesAdmin))
        } catch (error) {
          console.error("Error al guardar notificación para el administrador:", error)
        }
      }

      toast({
        title: "Reserva exitosa",
        description: `Tu reserva ha sido registrada correctamente ${
          cancha === "futbol" && duracionReserva === "2" ? `de ${horaInicio} a ${horaFin}` : ""
        }`,
      })

      addNotification({
        title: "Reserva confirmada",
        message: `Has reservado la ${canchaSeleccionada?.nombre || cancha} para el ${date.toLocaleDateString()} ${
          cancha === "futbol" && duracionReserva === "2"
            ? `de ${horaInicio} a ${horaFin}`
            : `a las ${horariosAReservar[0].hora}`
        }.`,
        type: "success",
      })

      // Limpiar el formulario
      setCancha("")
      setHorario("")
      setDuracionReserva("1")
      setHoraInicio("")
      setHoraFin("")
    }
  }

  // Obtener el estilo de color primario de la configuración
  const getPrimaryColor = () => {
    return appConfig.primaryColor || "#10b981" // Color emerald-600 por defecto
  }

  // Obtener el estilo de color secundario de la configuración
  const getSecondaryColor = () => {
    return appConfig.secondaryColor || "#065f46" // Color emerald-800 por defecto
  }

  // Obtener el estilo de color de fondo de la configuración
  const getBgColor = () => {
    return appConfig.bgColor || "#ecfdf5" // Color emerald-50 por defecto
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: getBgColor() }}>
      <header style={{ backgroundColor: getPrimaryColor() }} className="text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="icon" className="text-white hover:bg-opacity-20">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </Link>
              <Logo showName={true} textColor="text-white" />
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <Link href="/perfil">
                <Button variant="ghost" size="icon" className="text-white hover:bg-opacity-20">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <div className="text-sm">
                <div className="font-medium">{user?.name}</div>
                <div className="text-xs opacity-80">{user?.email}</div>
              </div>
              {user?.role === "admin" && (
                <Link href="/admin">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white hover:bg-opacity-90"
                    style={{ color: getPrimaryColor() }}
                  >
                    Panel Admin
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardHeader>
                <CardTitle style={{ color: getSecondaryColor() }}>Selecciona una fecha</CardTitle>
                <CardDescription>Elige el día en que deseas hacer tu reserva</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                  disabled={(date) => {
                    // Deshabilitar fechas pasadas
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)

                    // Deshabilitar fechas más allá de 48 horas
                    const limite = new Date()
                    limite.setHours(limite.getHours() + 48)

                    return date < today || date > limite
                  }}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle style={{ color: getSecondaryColor() }}>Detalles de la reserva</CardTitle>
                <CardDescription>Selecciona la cancha y el horario que deseas reservar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cancha</label>
                  <Select
                    value={cancha}
                    onValueChange={(value) => {
                      setCancha(value)
                      // Resetear duración al cambiar de cancha
                      if (value !== "futbol") {
                        setDuracionReserva("1")
                      }
                      setHorario("")
                      setHoraInicio("")
                      setHoraFin("")
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una cancha" />
                    </SelectTrigger>
                    <SelectContent>
                      {canchasDisponibles.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nombre}
                        </SelectItem>
                      ))}
                      <SelectItem value="picketball">Picketball</SelectItem>
                      <SelectItem value="basquet">Básquet</SelectItem>
                      <SelectItem value="voley">Vóley</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Opción de duración para cancha de fútbol */}
                {cancha === "futbol" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Duración de la reserva</label>
                    <RadioGroup
                      value={duracionReserva}
                      onValueChange={(value) => {
                        setDuracionReserva(value as "1" | "2")
                        // Limpiar horarios al cambiar duración
                        setHorario("")
                        setHoraInicio("")
                        setHoraFin("")
                      }}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1" id="r1" />
                        <Label htmlFor="r1">1 hora</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="2" id="r2" />
                        <Label htmlFor="r2">2 horas</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {/* Selección de horario según el tipo de reserva */}
                {cancha && (
                  <>
                    {cancha === "futbol" && duracionReserva === "2" ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Horario personalizado (2 horas)</label>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <Label htmlFor="horaInicio" className="text-xs">
                                Hora de inicio
                              </Label>
                              <Select value={horaInicio} onValueChange={setHoraInicio}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona hora de inicio" />
                                </SelectTrigger>
                                <SelectContent>
                                  {horariosDisponibles.slice(0, -1).map((h) => {
                                    // No mostrar el último horario como inicio
                                    const esFinDeSemana = date ? date.getDay() === 0 || date.getDay() === 6 : false
                                    const noDisponible = h.nocturno && esFinDeSemana

                                    return (
                                      <SelectItem key={h.id} value={h.horaInicio} disabled={noDisponible}>
                                        {h.horaInicio} {h.nocturno && "🌙"}
                                      </SelectItem>
                                    )
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="horaFin" className="text-xs">
                                Hora de fin
                              </Label>
                              <Select value={horaFin} onValueChange={setHoraFin} disabled={!horaInicio}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona hora de fin" />
                                </SelectTrigger>
                                <SelectContent>
                                  {horariosDisponibles.map((h) => {
                                    if (!horaInicio) return null

                                    // Convertir horas a minutos para comparación
                                    const inicioMinutos =
                                      Number.parseInt(horaInicio.split(":")[0]) * 60 +
                                      Number.parseInt(horaInicio.split(":")[1])
                                    const finMinutos =
                                      Number.parseInt(h.horaFin.split(":")[0]) * 60 +
                                      Number.parseInt(h.horaFin.split(":")[1])
                                    const diferenciaMinutos = finMinutos - inicioMinutos

                                    // Solo mostrar horas que estén exactamente 2 horas después de la hora de inicio
                                    if (diferenciaMinutos !== 120) return null

                                    return (
                                      <SelectItem key={h.id} value={h.horaFin}>
                                        {h.horaFin}
                                      </SelectItem>
                                    )
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {horaInicio && horaFin && (
                            <div className="mt-2 p-2 bg-gray-50 rounded-md">
                              <p className="text-sm flex items-center">
                                <Clock className="h-4 w-4 mr-2" />
                                Reserva de 2 horas: {horaInicio} a {horaFin}
                              </p>
                              {!rangoHorariosDisponible(date, cancha, horaInicio, horaFin) && (
                                <p className="text-xs text-red-500 mt-1">
                                  ⚠️ Uno o más horarios en este rango ya están reservados
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Horario</label>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="flex items-center gap-1">
                                <CalendarIcon className="h-4 w-4" />
                                <span>Ver disponibilidad</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Disponibilidad de horarios</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Cancha</label>
                                    <Select value={disponibilidadCancha} onValueChange={setDisponibilidadCancha}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una cancha" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {canchasDisponibles.map((c) => (
                                          <SelectItem key={c.id} value={c.id}>
                                            {c.nombre}
                                          </SelectItem>
                                        ))}
                                        <SelectItem value="picketball">Picketball</SelectItem>
                                        <SelectItem value="basquet">Básquet</SelectItem>
                                        <SelectItem value="voley">Vóley</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Fecha</label>
                                    <div className="mt-1">
                                      <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                        onClick={() =>
                                          setMostrarCalendarioDisponibilidad(!mostrarCalendarioDisponibilidad)
                                        }
                                      >
                                        {disponibilidadFecha
                                          ? disponibilidadFecha.toLocaleDateString()
                                          : "Selecciona fecha"}
                                      </Button>
                                    </div>
                                  </div>
                                </div>

                                {mostrarCalendarioDisponibilidad && (
                                  <div className="border rounded-md p-3 bg-white">
                                    <Calendar
                                      mode="single"
                                      selected={disponibilidadFecha}
                                      onSelect={(date) => {
                                        if (date) {
                                          setDisponibilidadFecha(date)
                                          setMostrarCalendarioDisponibilidad(false)
                                        }
                                      }}
                                      className="rounded-md"
                                    />
                                  </div>
                                )}

                                <Button
                                  onClick={() => verificarDisponibilidad(disponibilidadCancha, disponibilidadFecha)}
                                  className="w-full"
                                  style={{ backgroundColor: getPrimaryColor() }}
                                >
                                  Verificar disponibilidad
                                </Button>

                                {tablaDisponibilidad.length > 0 && (
                                  <div className="border rounded-md overflow-hidden mt-4 max-h-64 overflow-y-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                      <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Horario
                                          </th>
                                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-200">
                                        {tablaDisponibilidad.map((h) => (
                                          <tr key={h.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                              {h.hora} {h.nocturno && "🌙"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                              {h.disponible ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                  Disponible
                                                </span>
                                              ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                  Reservado
                                                </span>
                                              )}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <Select value={horario} onValueChange={setHorario}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un horario" />
                          </SelectTrigger>
                          <SelectContent>
                            {horariosDisponibles.map((h) => {
                              // Verificar si el horario ya está reservado
                              const reservado = date ? horarioEstaReservado(date, cancha, h.id) : false

                              // Verificar si es un horario nocturno en fin de semana
                              const esFinDeSemana = date ? date.getDay() === 0 || date.getDay() === 6 : false
                              const noDisponible = reservado || (h.nocturno && esFinDeSemana)

                              return (
                                <SelectItem key={h.id} value={h.id} disabled={noDisponible}>
                                  {h.hora} {h.nocturno && "🌙"} {reservado && "(Reservado)"}
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                          <Info className="h-4 w-4" />
                          <span>
                            Los horarios marcados con 🌙 requieren pago adicional y solo están disponibles de lunes a
                            viernes
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <Button
                  onClick={handleReservar}
                  className="w-full mt-4 hover:opacity-90"
                  style={{ backgroundColor: getPrimaryColor() }}
                >
                  Reservar Cancha
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle style={{ color: getSecondaryColor() }}>Mis Reservas</CardTitle>
              </CardHeader>
              <CardContent>
                {misReservas.length > 0 ? (
                  <div className="space-y-4">
                    {misReservas
                      .filter((reserva) => !reserva.esSegundaHora) // Filtrar las segundas horas para no mostrarlas duplicadas
                      .map((reserva) => (
                        <div key={reserva.id} className="bg-white p-4 rounded-lg border">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{reserva.canchaName}</h4>
                              <p className="text-sm text-gray-600">
                                {new Date(reserva.fecha).toLocaleDateString()} •
                                {reserva.cancha === "futbol" &&
                                reserva.duracion === "2" &&
                                reserva.horaInicio &&
                                reserva.horaFin
                                  ? ` ${reserva.horaInicio} - ${reserva.horaFin}`
                                  : ` ${reserva.horarioName}`}
                                {reserva.cancha === "futbol" &&
                                  reserva.duracion === "2" &&
                                  !reserva.horaInicio &&
                                  " (2 horas)"}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  reserva.estado === "confirmada"
                                    ? "bg-green-100 text-green-800"
                                    : reserva.estado === "pendiente"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {reserva.estado === "confirmada"
                                  ? "Confirmada"
                                  : reserva.estado === "pendiente"
                                    ? "Pendiente"
                                    : "Rechazada"}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => {
                                  setReservaAAnular(reserva)
                                  setAnularReservaDialogOpen(true)
                                }}
                              >
                                Anular
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No tienes reservas activas</p>
                    <p className="text-sm mt-2">Tus reservas aparecerán aquí una vez que las hayas realizado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Diálogo para anular reserva */}
      <Dialog open={anularReservaDialogOpen} onOpenChange={setAnularReservaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anular Reserva</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {reservaAAnular && (
              <>
                <div className="space-y-2">
                  <h3 className="font-medium">Detalles de la reserva</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Cancha:</div>
                    <div>{reservaAAnular.canchaName}</div>
                    <div className="text-muted-foreground">Fecha:</div>
                    <div>{new Date(reservaAAnular.fecha).toLocaleDateString()}</div>
                    <div className="text-muted-foreground">Horario:</div>
                    <div>{reservaAAnular.horarioName}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="justificativo">Justificativo de anulación</Label>
                  <Textarea
                    id="justificativo"
                    className="w-full min-h-[100px] p-2 border rounded-md"
                    placeholder="Por favor, indica el motivo por el cual estás anulando esta reserva..."
                    value={justificativoAnulacion}
                    onChange={(e) => setJustificativoAnulacion(e.target.value)}
                  />
                </div>

                <div className="flex space-x-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAnularReservaDialogOpen(false)
                      setReservaAAnular(null)
                      setJustificativoAnulacion("")
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={anularReserva} className="bg-red-600 hover:bg-red-700 text-white">
                    Confirmar Anulación
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
