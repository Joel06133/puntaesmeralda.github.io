"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, Clock, Save } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useNotifications } from "@/components/notification-provider"

export default function HorariosPage() {
  const [horaInicio, setHoraInicio] = useState("06:00")
  const [horaFin, setHoraFin] = useState("22:00")
  const [duracionReserva, setDuracionReserva] = useState(60) // en minutos
  const [reservasPorDia, setReservasPorDia] = useState(1)
  const [requierePagoNocturno, setRequierePagoNocturno] = useState(true)
  const [horaNocturnaInicio, setHoraNocturnaInicio] = useState("19:00")

  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { addNotification } = useNotifications()

  // Cargar configuración guardada
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

      // Cargar configuración guardada
      try {
        const configStr = localStorage.getItem("esmeraldaPlayConfig")
        if (configStr) {
          const config = JSON.parse(configStr)
          setHoraInicio(config.horaInicio || "06:00")
          setHoraFin(config.horaFin || "22:00")
          setDuracionReserva(config.duracionReserva || 60)
          setReservasPorDia(config.reservasPorDia || 1)
          setRequierePagoNocturno(config.requierePagoNocturno !== undefined ? config.requierePagoNocturno : true)
          setHoraNocturnaInicio(config.horaNocturnaInicio || "19:00")
        }
      } catch (error) {
        console.error("Error al cargar configuración:", error)
      }
    }
  }, [isLoading, user, router, addNotification])

  const handleSaveHorarios = () => {
    // Obtener configuración actual o crear una nueva
    let config = {}
    try {
      const configStr = localStorage.getItem("esmeraldaPlayConfig")
      if (configStr) {
        config = JSON.parse(configStr)
      }
    } catch (error) {
      console.error("Error al cargar configuración:", error)
    }

    // Actualizar horarios
    const updatedConfig = {
      ...config,
      horaInicio,
      horaFin,
      duracionReserva,
      reservasPorDia,
      requierePagoNocturno,
      horaNocturnaInicio,
    }

    // Guardar configuración
    localStorage.setItem("esmeraldaPlayConfig", JSON.stringify(updatedConfig))

    toast({
      title: "Horarios actualizados",
      description: "Los horarios y reglas de reserva se han actualizado correctamente",
    })

    addNotification({
      title: "Horarios actualizados",
      message: "Has modificado los horarios y reglas de reserva de las canchas",
      type: "success",
    })

    // Mostrar confirmación visual
    const confirmationElement = document.createElement("div")
    confirmationElement.className = "fixed top-4 right-4 bg-green-100 text-green-800 p-4 rounded-md shadow-md z-50"
    confirmationElement.textContent = "Configuración guardada correctamente"
    document.body.appendChild(confirmationElement)

    setTimeout(() => {
      document.body.removeChild(confirmationElement)
    }, 3000)
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
              <h1 className="text-xl font-bold">Configuración de Horarios</h1>
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
              <Clock className="h-6 w-6" />
              Horarios de Disponibilidad
            </CardTitle>
            <CardDescription>Define los horarios en que las canchas estarán disponibles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="horaInicio">Hora de inicio</Label>
                <Select value={horaInicio} onValueChange={setHoraInicio}>
                  <SelectTrigger id="horaInicio">
                    <SelectValue placeholder="Selecciona hora de inicio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="06:00">06:00 AM</SelectItem>
                    <SelectItem value="07:00">07:00 AM</SelectItem>
                    <SelectItem value="08:00">08:00 AM</SelectItem>
                    <SelectItem value="09:00">09:00 AM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="horaFin">Hora de cierre</Label>
                <Select value={horaFin} onValueChange={setHoraFin}>
                  <SelectTrigger id="horaFin">
                    <SelectValue placeholder="Selecciona hora de cierre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20:00">08:00 PM</SelectItem>
                    <SelectItem value="21:00">09:00 PM</SelectItem>
                    <SelectItem value="22:00">10:00 PM</SelectItem>
                    <SelectItem value="23:00">11:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duracionReserva">Duración de cada reserva (minutos)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="duracionReserva"
                  min={30}
                  max={120}
                  step={15}
                  value={[duracionReserva]}
                  onValueChange={(value) => setDuracionReserva(value[0])}
                  className="flex-1"
                />
                <span className="w-12 text-center">{duracionReserva}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reservasPorDia">Reservas permitidas por usuario por día</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="reservasPorDia"
                  min={1}
                  max={5}
                  step={1}
                  value={[reservasPorDia]}
                  onValueChange={(value) => setReservasPorDia(value[0])}
                  className="flex-1"
                />
                <span className="w-12 text-center">{reservasPorDia}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="requierePagoNocturno"
                checked={requierePagoNocturno}
                onCheckedChange={setRequierePagoNocturno}
              />
              <Label htmlFor="requierePagoNocturno">Requerir pago para horarios nocturnos</Label>
            </div>

            {requierePagoNocturno && (
              <div className="space-y-2">
                <Label htmlFor="horaNocturnaInicio">Hora de inicio para horario nocturno</Label>
                <Select value={horaNocturnaInicio} onValueChange={setHoraNocturnaInicio}>
                  <SelectTrigger id="horaNocturnaInicio">
                    <SelectValue placeholder="Selecciona hora" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="18:00">06:00 PM</SelectItem>
                    <SelectItem value="19:00">07:00 PM</SelectItem>
                    <SelectItem value="20:00">08:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
              <h3 className="font-medium text-blue-800 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Configuración actual
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                <div className="text-sm font-medium text-blue-700">Horario de operación:</div>
                <div className="text-sm">
                  {horaInicio} - {horaFin}
                </div>
                <div className="text-sm font-medium text-blue-700">Duración de reserva:</div>
                <div className="text-sm">{duracionReserva} minutos</div>
                <div className="text-sm font-medium text-blue-700">Reservas por día:</div>
                <div className="text-sm">{reservasPorDia}</div>
                <div className="text-sm font-medium text-blue-700">Pago nocturno:</div>
                <div className="text-sm">{requierePagoNocturno ? "Requerido" : "No requerido"}</div>
                {requierePagoNocturno && (
                  <>
                    <div className="text-sm font-medium text-blue-700">Inicio horario nocturno:</div>
                    <div className="text-sm">{horaNocturnaInicio}</div>
                  </>
                )}
              </div>
            </div>

            <Button
              onClick={handleSaveHorarios}
              className="w-full bg-emerald-600 hover:bg-emerald-700 mt-4 flex items-center justify-center gap-2"
            >
              <Save className="h-5 w-5" />
              Guardar Configuración
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
