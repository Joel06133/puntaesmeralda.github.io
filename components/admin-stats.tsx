"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Users, Clock } from "lucide-react"
import { getRegisteredUsers } from "@/lib/data"

export function AdminStats() {
  const [totalUsers, setTotalUsers] = useState(0)
  const [todayReservations, setTodayReservations] = useState(0)
  const [pendingReservations, setPendingReservations] = useState(0)
  const [dailyStats, setDailyStats] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("general")

  useEffect(() => {
    // Cargar usuarios registrados
    const users = getRegisteredUsers()
    setTotalUsers(users.length)

    // Cargar todas las reservas
    const todasLasReservas: any[] = []
    try {
      // Buscar en localStorage todas las reservas
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith("esmeraldaPlayReservas_")) {
          const reservasUsuario = JSON.parse(localStorage.getItem(key) || "[]")
          todasLasReservas.push(...reservasUsuario)
        }
      }

      // Filtrar reservas de hoy
      const today = new Date().toDateString()
      const reservasHoy = todasLasReservas.filter((r) => new Date(r.fecha).toDateString() === today)
      setTodayReservations(reservasHoy.length)

      // Filtrar reservas pendientes
      const reservasPendientes = todasLasReservas.filter((r) => r.estado === "pendiente")
      setPendingReservations(reservasPendientes.length)

      // Generar estadísticas diarias
      const stats = generateDailyStats(todasLasReservas)
      setDailyStats(stats)
    } catch (error) {
      console.error("Error al cargar reservas:", error)
    }
  }, [])

  // Función para generar estadísticas diarias
  const generateDailyStats = (reservas: any[]) => {
    const stats: any[] = []
    const today = new Date()

    // Generar estadísticas para los últimos 7 días
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateString = date.toDateString()

      const reservasDelDia = reservas.filter((r) => new Date(r.fecha).toDateString() === dateString)

      stats.push({
        fecha: date.toLocaleDateString(),
        total: reservasDelDia.length,
        confirmadas: reservasDelDia.filter((r) => r.estado === "confirmada").length,
        pendientes: reservasDelDia.filter((r) => r.estado === "pendiente").length,
      })
    }

    return stats
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-emerald-800">Reservas Hoy</CardTitle>
            <CardDescription>Total de reservas para hoy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todayReservations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-emerald-800">Pendientes</CardTitle>
            <CardDescription>Reservas pendientes de aprobación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingReservations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-emerald-800">Usuarios</CardTitle>
            <CardDescription>Total de usuarios registrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-emerald-800 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Estadísticas
          </CardTitle>
          <CardDescription>Visualiza las estadísticas de reservas y usuarios</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="diario">Diario</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-4">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Users className="h-5 w-5 text-emerald-600" />
                    Resumen de Usuarios
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Total de usuarios:</p>
                      <p className="font-medium">{totalUsers}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Nuevos hoy:</p>
                      <p className="font-medium">0</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-emerald-600" />
                    Resumen de Reservas
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Reservas hoy:</p>
                      <p className="font-medium">{todayReservations}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pendientes:</p>
                      <p className="font-medium">{pendingReservations}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total semana:</p>
                      <p className="font-medium">{dailyStats.reduce((sum, day) => sum + day.total, 0)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="diario" className="mt-4">
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Reservas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Confirmadas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pendientes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dailyStats.map((day, index) => (
                      <tr key={index} className={index === dailyStats.length - 1 ? "bg-emerald-50" : ""}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {day.fecha}
                          {index === dailyStats.length - 1 && " (Hoy)"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{day.total}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{day.confirmadas}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{day.pendientes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
