"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { generateId, isEmailRegistered, saveUser } from "@/lib/data"

export default function RegistroPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [manzana, setManzana] = useState("")
  const [villa, setVilla] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validaciones básicas
    if (!name || !email || !password || !confirmPassword || !manzana || !villa) {
      toast({
        title: "Error en el formulario",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error en el formulario",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Verificar si el correo ya está registrado
    if (isEmailRegistered(email)) {
      toast({
        title: "Error en el registro",
        description: "Este correo electrónico ya está registrado",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Crear nuevo usuario
    const newUser = {
      id: generateId(),
      name,
      email,
      password, // En una aplicación real, la contraseña debería hashearse
      role: "user",
      status: "pending", // Los usuarios nuevos comienzan con estado pendiente
      createdAt: new Date(),
      manzana,
      villa,
    }

    // Guardar usuario
    saveUser(newUser)

    toast({
      title: "Registro exitoso",
      description: "Tu cuenta ha sido creada y está pendiente de aprobación",
    })

    // Redireccionar al login
    setTimeout(() => {
      router.push("/login")
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-emerald-800">Crear cuenta</CardTitle>
          <CardDescription>Ingresa tus datos para registrarte en Esmeralda Play</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ingresa tu nombre completo"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manzana">Manzana</Label>
                <Input
                  id="manzana"
                  type="text"
                  value={manzana}
                  onChange={(e) => setManzana(e.target.value)}
                  placeholder="Ej: A, B, C..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="villa">Villa</Label>
                <Input
                  id="villa"
                  type="text"
                  value={villa}
                  onChange={(e) => setVilla(e.target.value)}
                  placeholder="Ej: 1, 2, 3..."
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Crea una contraseña segura"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
              {isSubmitting ? "Registrando..." : "Registrarse"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="text-emerald-600 hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
