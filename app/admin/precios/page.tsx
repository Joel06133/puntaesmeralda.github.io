"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, DollarSign, Save } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useNotifications } from "@/components/notification-provider"

export default function PreciosPage() {
  const [precioNocturnoTenis, setPrecioNocturnoTenis] = useState("15.00")
  const [precioNocturnoFutbol, setPrecioNocturnoFutbol] = useState("20.00")
  const [precioNocturnoBasquet, setPrecioNocturnoBasquet] = useState("15.00")
  const [precioNocturnoVoley, setPrecioNocturnoVoley] = useState("15.00")

  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { addNotification } = useNotifications()

  // Cargar precios guardados
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
          setPrecioNocturnoTenis(config.precioNocturnoTenis || "15.00")
          setPrecioNocturnoFutbol(config.precioNocturnoFutbol || "20.00")
          setPrecioNocturnoBasquet(config.precioNocturnoBasquet || "15.00")
          setPrecioNocturnoVoley(config.precioNocturnoVoley || "15.00")
        }
      } catch (error) {
        console.error("Error al cargar configuración:", error)
      }
    }
  }, [isLoading, user, router, addNotification])

  const handleSavePrecios = () => {
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

    // Actualizar precios
    const updatedConfig = {
      ...config,
      precioNocturnoTenis,
      precioNocturnoFutbol,
      precioNocturnoBasquet,
      precioNocturnoVoley,
    }

    // Guardar configuración
    localStorage.setItem("esmeraldaPlayConfig", JSON.stringify(updatedConfig))

    toast({
      title: "Precios actualizados",
      description: "Los precios nocturnos han sido actualizados correctamente",
    })

    addNotification({
      title: "Precios actualizados",
      message: "Has actualizado los precios nocturnos de las canchas",
      type: "success",
    })

    // Mostrar confirmación visual
    const confirmationElement = document.createElement("div")
    confirmationElement.className = "fixed top-4 right-4 bg-green-100 text-green-800 p-4 rounded-md shadow-md z-50"
    confirmationElement.textContent = "Precios guardados correctamente"
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
              <h1 className="text-xl font-bold">Configuración de Precios Nocturnos</h1>
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
              <DollarSign className="h-6 w-6" />
              Precios para Horarios Nocturnos
            </CardTitle>
            <CardDescription>
              Configura el precio por hora para cada cancha en horario nocturno. Solo los administradores pueden
              modificar estos precios.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="precioNocturnoTenis">Cancha de Tenis ($)</Label>
                <Input
                  id="precioNocturnoTenis"
                  type="number"
                  min="0"
                  step="0.01"
                  value={precioNocturnoTenis}
                  onChange={(e) => setPrecioNocturnoTenis(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="precioNocturnoFutbol">Cancha de Fútbol ($)</Label>
                <Input
                  id="precioNocturnoFutbol"
                  type="number"
                  min="0"
                  step="0.01"
                  value={precioNocturnoFutbol}
                  onChange={(e) => setPrecioNocturnoFutbol(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="precioNocturnoBasquet">Cancha de Básquet ($)</Label>
                <Input
                  id="precioNocturnoBasquet"
                  type="number"
                  min="0"
                  step="0.01"
                  value={precioNocturnoBasquet}
                  onChange={(e) => setPrecioNocturnoBasquet(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="precioNocturnoVoley">Cancha de Vóley ($)</Label>
                <Input
                  id="precioNocturnoVoley"
                  type="number"
                  min="0"
                  step="0.01"
                  value={precioNocturnoVoley}
                  onChange={(e) => setPrecioNocturnoVoley(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mt-4">
              <h3 className="font-medium text-amber-800 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Precios actuales
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                <div className="text-sm font-medium text-amber-700">Cancha de Tenis:</div>
                <div className="text-sm">${precioNocturnoTenis}</div>
                <div className="text-sm font-medium text-amber-700">Cancha de Fútbol:</div>
                <div className="text-sm">${precioNocturnoFutbol}</div>
                <div className="text-sm font-medium text-amber-700">Cancha de Básquet:</div>
                <div className="text-sm">${precioNocturnoBasquet}</div>
                <div className="text-sm font-medium text-amber-700">Cancha de Vóley:</div>
                <div className="text-sm">${precioNocturnoVoley}</div>
              </div>
            </div>

            <Button
              onClick={handleSavePrecios}
              className="w-full bg-emerald-600 hover:bg-emerald-700 mt-4 flex items-center justify-center gap-2"
            >
              <Save className="h-5 w-5" />
              Guardar Precios
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
