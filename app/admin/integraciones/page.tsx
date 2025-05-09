"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ChevronLeft, Bot, Save } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useNotifications } from "@/components/notification-provider"

export default function IntegracionesPage() {
  const [chatGptApiKey, setChatGptApiKey] = useState("")
  const [chatGptIntegrado, setChatGptIntegrado] = useState(false)

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
          if (config.chatGptApiKey) {
            setChatGptApiKey(config.chatGptApiKey)
          }
          if (config.chatGptIntegrado !== undefined) {
            setChatGptIntegrado(config.chatGptIntegrado)
          }
        }
      } catch (error) {
        console.error("Error al cargar configuración:", error)
      }
    }
  }, [isLoading, user, router, addNotification])

  const handleIntegrarChatGPT = () => {
    if (!chatGptApiKey) {
      toast({
        title: "Error",
        description: "Debes ingresar una API Key válida para integrar con ChatGPT.",
        variant: "destructive",
      })
      return
    }

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

    // Actualizar configuración
    const updatedConfig = {
      ...config,
      chatGptApiKey,
      chatGptIntegrado: true,
    }

    // Guardar configuración
    localStorage.setItem("esmeraldaPlayConfig", JSON.stringify(updatedConfig))

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

    // Mostrar confirmación visual
    const confirmationElement = document.createElement("div")
    confirmationElement.className = "fixed top-4 right-4 bg-green-100 text-green-800 p-4 rounded-md shadow-md z-50"
    confirmationElement.textContent = "Integración guardada correctamente"
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
              <h1 className="text-xl font-bold">Integraciones</h1>
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
              <Bot className="h-6 w-6" />
              Integración con ChatGPT
            </CardTitle>
            <CardDescription>Conecta tu cuenta de administrador con ChatGPT</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="chatGptApiKey">API Key de OpenAI</Label>
              <Input
                id="chatGptApiKey"
                type="password"
                value={chatGptApiKey}
                onChange={(e) => setChatGptApiKey(e.target.value)}
                placeholder="sk-..."
              />
              <p className="text-xs text-muted-foreground">
                Puedes obtener tu API Key en la página de OpenAI: https://platform.openai.com/api-keys
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="chatGptIntegrado"
                checked={chatGptIntegrado}
                onCheckedChange={setChatGptIntegrado}
                disabled={!chatGptApiKey}
              />
              <Label htmlFor="chatGptIntegrado">Activar integración con ChatGPT</Label>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="font-medium mb-2">¿Qué puedes hacer con esta integración?</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Generar respuestas automáticas para preguntas frecuentes</li>
                <li>Obtener análisis de datos de reservas</li>
                <li>Crear descripciones y contenido para la aplicación</li>
                <li>Recibir sugerencias para mejorar la experiencia de usuario</li>
              </ul>
            </div>

            <Button
              onClick={handleIntegrarChatGPT}
              className="w-full bg-emerald-600 hover:bg-emerald-700 mt-4 flex items-center justify-center gap-2"
              disabled={!chatGptApiKey || chatGptIntegrado}
            >
              <Save className="h-5 w-5" />
              {chatGptIntegrado ? "Integración Activa" : "Integrar con ChatGPT"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
