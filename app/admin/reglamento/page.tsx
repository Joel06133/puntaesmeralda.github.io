"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, Shield, Upload, Save } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useNotifications } from "@/components/notification-provider"

export default function ReglamentoPage() {
  const [reglamentoFile, setReglamentoFile] = useState<File | null>(null)
  const [reglamentoPreview, setReglamentoPreview] = useState<string | null>(null)
  const [reglamentoTexto, setReglamentoTexto] = useState(
    "1. Cada usuario puede realizar máximo 1 reserva por día.\n" +
      "2. Las reservas tienen una duración máxima de 1 hora.\n" +
      "3. Las reservas nocturnas requieren pago adicional.\n" +
      "4. Se debe respetar el horario reservado.\n" +
      "5. Cualquier daño a las instalaciones será responsabilidad del usuario.",
  )

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
          if (config.reglamentoTexto) {
            setReglamentoTexto(config.reglamentoTexto)
          }
        }
      } catch (error) {
        console.error("Error al cargar configuración:", error)
      }
    }
  }, [isLoading, user, router, addNotification])

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

  const handleSaveReglamento = () => {
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

    // Actualizar reglamento
    const updatedConfig = {
      ...config,
      reglamentoTexto,
    }

    // Guardar configuración
    localStorage.setItem("esmeraldaPlayConfig", JSON.stringify(updatedConfig))

    toast({
      title: "Reglamento actualizado",
      description: "El reglamento ha sido actualizado correctamente",
    })

    addNotification({
      title: "Reglamento actualizado",
      message: "Has actualizado el reglamento de uso de las canchas deportivas",
      type: "success",
    })

    // Mostrar confirmación visual
    const confirmationElement = document.createElement("div")
    confirmationElement.className = "fixed top-4 right-4 bg-green-100 text-green-800 p-4 rounded-md shadow-md z-50"
    confirmationElement.textContent = "Reglamento guardado correctamente"
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
              <h1 className="text-xl font-bold">Reglamento</h1>
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
              <Shield className="h-6 w-6" />
              Reglamento de Uso
            </CardTitle>
            <CardDescription>Define las reglas para el uso de las canchas deportivas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="reglamentoTexto">Texto del Reglamento</Label>
              <Textarea
                id="reglamentoTexto"
                value={reglamentoTexto}
                onChange={(e) => setReglamentoTexto(e.target.value)}
                rows={10}
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reglamentoFile">Subir Documento de Reglamento (PDF o imagen)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {reglamentoPreview ? (
                  <div className="space-y-2">
                    {reglamentoPreview.startsWith("PDF") ? (
                      <p className="text-sm text-emerald-600 font-medium">{reglamentoPreview}</p>
                    ) : (
                      <img
                        src={reglamentoPreview || "/placeholder.svg"}
                        alt="Vista previa del reglamento"
                        className="max-h-40 mx-auto"
                      />
                    )}
                    <Button variant="outline" size="sm" onClick={() => setReglamentoPreview(null)}>
                      Cambiar archivo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-500">Arrastra y suelta tu documento aquí o</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("reglamentoFile")?.click()}
                    >
                      Seleccionar archivo
                    </Button>
                  </div>
                )}
                <Input
                  id="reglamentoFile"
                  type="file"
                  accept="application/pdf,image/*"
                  className="hidden"
                  onChange={handleReglamentoChange}
                />
                <p className="text-xs text-gray-500 mt-2">Formatos aceptados: PDF, JPG, PNG (máx. 5MB)</p>
              </div>
            </div>

            <Button
              onClick={handleSaveReglamento}
              className="w-full bg-emerald-600 hover:bg-emerald-700 mt-4 flex items-center justify-center gap-2"
            >
              <Save className="h-5 w-5" />
              Guardar Reglamento
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
