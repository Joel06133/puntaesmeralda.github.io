"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { isEmailRegistered } from "@/lib/data"

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  // Modificar la función handleSubmit para enviar notificación al administrador

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Verificar si el correo existe
      if (!isEmailRegistered(email)) {
        toast({
          title: "Correo no encontrado",
          description: "No existe una cuenta asociada a este correo electrónico",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Simulación de envío de correo de recuperación
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Enviar notificación al administrador
      const adminId = "1" // ID predefinido del administrador
      const notificacionAdmin = {
        id: Date.now().toString(),
        title: "Solicitud de recuperación de contraseña",
        message: `El usuario con correo ${email} ha solicitado recuperar su contraseña.`,
        type: "warning",
        read: false,
        date: new Date(),
        userId: adminId,
      }

      try {
        const notificacionesAdminStr = localStorage.getItem(`esmeraldaPlayNotificaciones_${adminId}`)
        const notificacionesAdmin = notificacionesAdminStr ? JSON.parse(notificacionesAdminStr) : []
        notificacionesAdmin.unshift(notificacionAdmin)
        localStorage.setItem(`esmeraldaPlayNotificaciones_${adminId}`, JSON.stringify(notificacionesAdmin))
      } catch (error) {
        console.error("Error al guardar notificación para el administrador:", error)
      }

      setIsSubmitted(true)

      toast({
        title: "Correo enviado",
        description: "Se ha enviado un correo con instrucciones para recuperar tu contraseña",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar tu solicitud. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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
          <CardTitle className="text-2xl font-bold text-center text-emerald-800">Recuperar Contraseña</CardTitle>
          <CardDescription className="text-center">
            {isSubmitted
              ? "Te hemos enviado instrucciones para recuperar tu contraseña"
              : "Ingresa tu correo electrónico para recuperar tu contraseña"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="text-center space-y-4">
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                <p className="text-emerald-800">
                  Se ha enviado una notificación al administrador para que pueda realizar la actualización de tu
                  contraseña.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Por favor, contacta con el administrador vía WhatsApp al número:
                </p>
                <a
                  href="https://wa.me/593968838776"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md"
                >
                  +593 968838776
                </a>
              </div>
            </div>
          ) : (
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
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Enviar Instrucciones"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            <Link href="/login" className="text-emerald-600 hover:underline font-medium">
              Volver a Iniciar Sesión
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
