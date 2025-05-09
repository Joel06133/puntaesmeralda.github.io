"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Shield } from "lucide-react"
import { NotificationBell } from "@/components/notification-bell"
import { useAuth } from "@/components/auth-provider"

export default function ReglasPage() {
  const { user } = useAuth()
  const [reglamento, setReglamento] = useState(
    "1. Cada usuario puede realizar máximo 1 reserva por día.\n" +
      "2. Las reservas tienen una duración máxima de 1 hora.\n" +
      "3. Las reservas nocturnas requieren pago adicional.\n" +
      "4. Se debe respetar el horario reservado.\n" +
      "5. Cualquier daño a las instalaciones será responsabilidad del usuario.",
  )

  // Cargar reglamento desde localStorage
  useEffect(() => {
    try {
      const configStr = localStorage.getItem("esmeraldaPlayConfig")
      if (configStr) {
        const config = JSON.parse(configStr)
        if (config.reglamentoTexto) {
          setReglamento(config.reglamentoTexto)
        }
      }
    } catch (error) {
      console.error("Error al cargar reglamento:", error)
    }
  }, [])

  return (
    <div className="min-h-screen bg-emerald-50">
      <header className="bg-emerald-600 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href={user ? "/reservas" : "/"}>
                <Button variant="ghost" size="icon" className="text-white hover:bg-emerald-700">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold">Reglamento</h1>
            </div>
            {user && (
              <div className="flex items-center gap-4">
                <NotificationBell />
                <div className="text-sm">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs opacity-80">{user.email}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-emerald-800 flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Reglamento de Uso de Canchas Deportivas
            </CardTitle>
            <CardDescription>
              Normas y políticas para el uso de las instalaciones deportivas en Punta Esmeralda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg border">
                {reglamento.split("\n").map((line, index) => (
                  <p key={index} className="mb-3">
                    {line}
                  </p>
                ))}
              </div>

              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h3 className="font-medium text-amber-800 mb-2">Importante</h3>
                <p className="text-sm text-amber-700">
                  El incumplimiento de estas reglas puede resultar en la suspensión del acceso a las instalaciones
                  deportivas. Para cualquier consulta, contacta con la administración.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
