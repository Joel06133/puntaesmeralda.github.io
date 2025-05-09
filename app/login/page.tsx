"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { useNotifications } from "@/components/notification-provider"
import { Eye, EyeOff } from "lucide-react"
import { getUserByEmail } from "@/lib/data"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { toast } = useToast()
  const { login } = useAuth()
  const { addNotification } = useNotifications()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Verificar el estado del usuario antes de intentar iniciar sesión
      const user = getUserByEmail(email)

      if (user && user.status === "pending") {
        toast({
          title: "Cuenta pendiente de aprobación",
          description: "Tu cuenta está pendiente de aprobación por un administrador.",
          variant: "warning",
        })
        setIsLoading(false)
        return
      }

      if (user && user.status === "blocked") {
        toast({
          title: "Cuenta bloqueada",
          description: "Tu cuenta ha sido bloqueada. Contacta con el administrador para más información.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const success = await login(email, password)

      if (success) {
        toast({
          title: "Inicio de sesión exitoso",
          description: "Bienvenido a Esmeralda Play",
        })

        addNotification({
          title: "Inicio de sesión exitoso",
          message: "Has iniciado sesión correctamente en Esmeralda Play.",
          type: "success",
        })

        // Redirección a la página de reservas
        router.push("/reservas")
      } else {
        toast({
          title: "Error al iniciar sesión",
          description: "Credenciales incorrectas. Intenta nuevamente.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error al iniciar sesión",
        description: "Verifica tus credenciales e intenta nuevamente",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleShowPassword = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">EP</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-emerald-800">Iniciar Sesión</CardTitle>
          <CardDescription className="text-center">
            Ingresa tus credenciales para acceder a Esmeralda Play
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Link href="/recuperar-password" className="text-sm text-emerald-600 hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-label="Ocultar contraseña" />
                  ) : (
                    <Eye className="h-5 w-5" aria-label="Ver contraseña" />
                  )}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            ¿No tienes una cuenta?{" "}
            <Link href="/registro" className="text-emerald-600 hover:underline font-medium">
              Regístrate aquí
            </Link>
          </div>
          <Link href="/" className="text-emerald-600 hover:underline text-sm text-center">
            Volver al inicio
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
