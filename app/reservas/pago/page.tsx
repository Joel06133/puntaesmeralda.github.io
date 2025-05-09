"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft, Upload } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useNotifications } from "@/components/notification-provider"
import { NotificationBell } from "@/components/notification-bell"
import { useRouter } from "next/navigation"

export default function PagoPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  const { user, isLoading } = useAuth()
  const { addNotification } = useNotifications()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Obtener parámetros de la URL
  const fecha = searchParams.get("fecha") ? new Date(searchParams.get("fecha") as string) : new Date()
  const canchaId = searchParams.get("cancha") || ""
  const horarioId = searchParams.get("horario") || ""

  // Datos de la reserva
  const [reservaInfo, setReservaInfo] = useState({
    fecha: fecha.toLocaleDateString(),
    cancha: "Cargando...",
    horario: "Cargando...",
    precio: "15.00",
  })

  // Redireccionar si no hay usuario autenticado
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Cargar información de la cancha y horario
  useEffect(() => {
    // Intentar cargar la configuración de precios del localStorage
    let precioNocturnoTenis = "15.00"
    let precioNocturnoFutbol = "20.00"
    let precioNocturnoBasquet = "15.00"
    let precioNocturnoVoley = "15.00"

    // Intentar cargar la configuración guardada
    try {
      const configStr = localStorage.getItem("esmeraldaPlayConfig")
      if (configStr) {
        const config = JSON.parse(configStr)
        precioNocturnoTenis = config.precioNocturnoTenis || precioNocturnoTenis
        precioNocturnoFutbol = config.precioNocturnoFutbol || precioNocturnoFutbol
        precioNocturnoBasquet = config.precioNocturnoBasquet || precioNocturnoBasquet
        precioNocturnoVoley = config.precioNocturnoVoley || precioNocturnoVoley
      }
    } catch (error) {
      console.error("Error al cargar configuración:", error)
    }

    // Simulación de canchas disponibles
    const canchasDisponibles = [
      { id: "tenis", nombre: "Cancha de Tenis", precioNocturno: precioNocturnoTenis },
      { id: "futbol", nombre: "Cancha de Fútbol", precioNocturno: precioNocturnoFutbol },
      { id: "basquet", nombre: "Cancha de Básquet", precioNocturno: precioNocturnoBasquet },
      { id: "voley", nombre: "Cancha de Vóley", precioNocturno: precioNocturnoVoley },
    ]

    // Simulación de horarios disponibles
    const horariosDisponibles = [
      { id: "1", hora: "08:00 - 09:00" },
      { id: "2", hora: "09:00 - 10:00" },
      { id: "3", hora: "10:00 - 11:00" },
      { id: "4", hora: "16:00 - 17:00" },
      { id: "5", hora: "17:00 - 18:00" },
      { id: "6", hora: "18:00 - 19:00" },
      { id: "7", hora: "19:00 - 20:00", nocturno: true },
      { id: "8", hora: "20:00 - 21:00", nocturno: true },
    ]

    const cancha = canchasDisponibles.find((c) => c.id === canchaId)
    const horario = horariosDisponibles.find((h) => h.id === horarioId)

    setReservaInfo({
      ...reservaInfo,
      cancha: cancha?.nombre || "Cancha no encontrada",
      horario: horario?.hora || "Horario no encontrado",
      precio: cancha?.precioNocturno || "15.00",
    })
  }, [canchaId, horarioId])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast({
        title: "Error",
        description: "Por favor sube un comprobante de pago",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // Simulación de carga de archivo
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Crear nueva reserva
      const nuevaReserva = {
        id: Date.now().toString(),
        fecha: fecha,
        cancha: canchaId,
        canchaName: reservaInfo.cancha,
        horario: horarioId,
        horarioName: reservaInfo.horario,
        estado: "pendiente",
        usuario: user?.id,
        usuarioName: user?.name,
      }

      // Guardar la reserva en localStorage
      try {
        const reservasStr = localStorage.getItem(`esmeraldaPlayReservas_${user?.id}`)
        const reservas = reservasStr ? JSON.parse(reservasStr) : []
        reservas.push(nuevaReserva)
        localStorage.setItem(`esmeraldaPlayReservas_${user?.id}`, JSON.stringify(reservas))
      } catch (error) {
        console.error("Error al guardar reserva:", error)
      }

      toast({
        title: "Comprobante subido",
        description: "Tu reserva está pendiente de aprobación por un administrador",
      })

      addNotification({
        title: "Comprobante recibido",
        message: "Tu comprobante de pago ha sido recibido y está pendiente de aprobación.",
        type: "success",
      })

      // Notificación para el administrador
      if (user?.email !== "aso.urbpuntaesmeralda@gmail.com") {
        // Buscar el ID del administrador
        const adminId = "1" // ID predefinido del administrador

        // Crear notificación para el administrador
        const notificacionAdmin = {
          id: Date.now().toString(),
          title: "Nueva reserva pendiente",
          message: `${user?.name} ha realizado una reserva nocturna para ${reservaInfo.cancha} que requiere aprobación.`,
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

      // Redirección a la página de reservas
      router.push("/reservas")
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo subir el comprobante. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoading) {
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
              <h1 className="text-xl font-bold">Pago de Reserva</h1>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <div className="text-sm">
                <div className="font-medium">{user?.name}</div>
                <div className="text-xs opacity-80">{user?.email}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-emerald-800">Subir Comprobante de Pago</CardTitle>
              <CardDescription>Para completar tu reserva nocturna, sube un comprobante de pago</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <h3 className="font-medium text-emerald-800 mb-2">Detalles de la Reserva</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-600">Fecha:</div>
                    <div>{reservaInfo.fecha}</div>
                    <div className="text-gray-600">Cancha:</div>
                    <div>{reservaInfo.cancha}</div>
                    <div className="text-gray-600">Horario:</div>
                    <div>{reservaInfo.horario}</div>
                    <div className="text-gray-600">Precio:</div>
                    <div>${reservaInfo.precio}</div>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <h3 className="font-medium text-amber-800 mb-2">Datos para transferencia</h3>
                  <div className="grid grid-cols-1 gap-1 text-sm">
                    <div className="font-medium">Banco Guayaquil</div>
                    <div>Cuenta corriente # 45953750</div>
                    <div>RUC: 0993132977001</div>
                    <div>Razón social: Asociación de Propietarios de la Urbanización Punta Esmeralda</div>
                    <div>Correo: aso.urbpuntaesmeralda@gmail.com</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comprobante">Comprobante de Pago</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {file ? (
                      <div className="space-y-2">
                        <p className="text-sm text-emerald-600 font-medium">{file.name}</p>
                        <Button variant="outline" size="sm" onClick={() => setFile(null)}>
                          Cambiar archivo
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="text-sm text-gray-500">Arrastra y suelta tu comprobante aquí o</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById("comprobante")?.click()}
                        >
                          Seleccionar archivo
                        </Button>
                      </div>
                    )}
                    <Input
                      id="comprobante"
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <p className="text-xs text-gray-500 mt-2">Formatos aceptados: JPG, PNG, PDF (máx. 5MB)</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSubmit}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={!file || isUploading}
              >
                {isUploading ? "Subiendo..." : "Completar Reserva"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
