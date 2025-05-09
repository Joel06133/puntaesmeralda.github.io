"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, BarChart, Calendar } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useNotifications } from "@/components/notification-provider"
import { getRegisteredUsers } from "@/lib/data"

export default function EstadisticasPage() {
  const [activeTab, setActiveTab] = useState("diario")
  const [reservas, setReservas] = useState<any[]>([])
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [estadisticasDiarias, setEstadisticasDiarias] = useState<any[]>([])
  const [estadisticasSemanales, setEstadisticasSemanales] = useState<any[]>([])
  const [estadisticasMensuales, setEstadisticasMensuales] = useState<any[]>([])
  const [canchasMasReservadas, setCanchasMasReservadas] = useState<any[]>([])

  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { addNotification } = useNotifications()

  // Redireccionar si no hay usuario autenticado o no es administrador
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login")
      } else if (user.role !== "admin") {
        addNotification({
          title: "Acceso denegado",
          message: "No tienes permisos para acceder al panel de administración.",
          type: "error",
        })
        router.push("/reservas")
      }
    }
  }, [user, isLoading, router, addNotification])

  // Cargar datos para estadísticas
  useEffect(() => {
    if (!isLoading && user?.role === "admin") {
      // Cargar usuarios
      const registeredUsers = getRegisteredUsers()
      setUsuarios(registeredUsers)

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
        setReservas(todasLasReservas)

        // Generar estadísticas
        generarEstadisticas(todasLasReservas)
      } catch (error) {
        console.error("Error al cargar reservas:", error)
      }
    }
  }, [isLoading, user])

  // Función para generar estadísticas
  const generarEstadisticas = (reservas: any[]) => {
    // Estadísticas diarias (últimos 14 días)
    const estadisticasDiarias = generarEstadisticasPorPeriodo(reservas, 14, "dia")
    setEstadisticasDiarias(estadisticasDiarias)

    // Estadísticas semanales (últimas 8 semanas)
    const estadisticasSemanales = generarEstadisticasPorPeriodo(reservas, 8, "semana")
    setEstadisticasSemanales(estadisticasSemanales)

    // Estadísticas mensuales (últimos 6 meses)
    const estadisticasMensuales = generarEstadisticasPorPeriodo(reservas, 6, "mes")
    setEstadisticasMensuales(estadisticasMensuales)

    // Canchas más reservadas
    const canchasStats = generarEstadisticasPorCancha(reservas)
    setCanchasMasReservadas(canchasStats)
  }

  // Función para generar estadísticas por período
  const generarEstadisticasPorPeriodo = (reservas: any[], cantidad: number, periodo: "dia" | "semana" | "mes") => {
    const stats: any[] = []
    const today = new Date()

    for (let i = cantidad - 1; i >= 0; i--) {
      const date = new Date(today)

      if (periodo === "dia") {
        date.setDate(date.getDate() - i)
      } else if (periodo === "semana") {
        date.setDate(date.getDate() - i * 7)
      } else if (periodo === "mes") {
        date.setMonth(date.getMonth() - i)
      }

      const startDate = new Date(date)
      let endDate = new Date(date)

      if (periodo === "dia") {
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)
      } else if (periodo === "semana") {
        // Inicio de la semana (domingo)
        const dayOfWeek = date.getDay()
        startDate.setDate(date.getDate() - dayOfWeek)
        startDate.setHours(0, 0, 0, 0)

        // Fin de la semana (sábado)
        endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + 6)
        endDate.setHours(23, 59, 59, 999)
      } else if (periodo === "mes") {
        startDate.setDate(1)
        startDate.setHours(0, 0, 0, 0)

        endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)
        endDate.setHours(23, 59, 59, 999)
      }

      const reservasDelPeriodo = reservas.filter((r) => {
        const fechaReserva = new Date(r.fecha)
        return fechaReserva >= startDate && fechaReserva <= endDate
      })

      let etiqueta = ""
      if (periodo === "dia") {
        etiqueta = date.toLocaleDateString()
      } else if (periodo === "semana") {
        etiqueta = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
      } else if (periodo === "mes") {
        etiqueta = date.toLocaleDateString("default", { month: "long", year: "numeric" })
      }

      stats.push({
        periodo: etiqueta,
        total: reservasDelPeriodo.length,
        confirmadas: reservasDelPeriodo.filter((r) => r.estado === "confirmada").length,
        pendientes: reservasDelPeriodo.filter((r) => r.estado === "pendiente").length,
        canceladas: reservasDelPeriodo.filter((r) => r.estado !== "confirmada" && r.estado !== "pendiente").length,
      })
    }

    return stats
  }

  // Función para generar estadísticas por cancha
  const generarEstadisticasPorCancha = (reservas: any[]) => {
    const canchas = [
      { id: "tenis", nombre: "Cancha de Tenis" },
      { id: "futbol", nombre: "Cancha de Fútbol" },
      { id: "basquet", nombre: "Cancha de Básquet" },
      { id: "voley", nombre: "Cancha de Vóley" },
    ]

    return canchas
      .map((cancha) => {
        const reservasCancha = reservas.filter((r) => r.cancha === cancha.id)
        return {
          cancha: cancha.nombre,
          total: reservasCancha.length,
          confirmadas: reservasCancha.filter((r) => r.estado === "confirmada").length,
          pendientes: reservasCancha.filter((r) => r.estado === "pendiente").length,
        }
      })
      .sort((a, b) => b.total - a.total)
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
              <h1 className="text-xl font-bold">Estadísticas</h1>
            </div>
            <div className="text-sm">
              <div className="font-medium">{user?.name}</div>
              <div className="text-xs opacity-80">{user?.email}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-emerald-800 flex items-center gap-2">
              <BarChart className="h-6 w-6" />
              Estadísticas de Reservas
            </CardTitle>
            <CardDescription>Visualiza las estadísticas de reservas por día, semana y mes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-emerald-800">Reservas Hoy</CardTitle>
                  <CardDescription>Total de reservas para hoy</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {reservas.filter((r) => new Date(r.fecha).toDateString() === new Date().toDateString()).length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-emerald-800">Pendientes</CardTitle>
                  <CardDescription>Reservas pendientes de aprobación</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{reservas.filter((r) => r.estado === "pendiente").length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-emerald-800">Usuarios</CardTitle>
                  <CardDescription>Total de usuarios registrados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{usuarios.length}</div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="diario" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="diario">Diario</TabsTrigger>
                <TabsTrigger value="semanal">Semanal</TabsTrigger>
                <TabsTrigger value="mensual">Mensual</TabsTrigger>
              </TabsList>

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
                      {estadisticasDiarias.map((dia, index) => (
                        <tr key={index} className={index === estadisticasDiarias.length - 1 ? "bg-emerald-50" : ""}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {dia.periodo}
                            {index === estadisticasDiarias.length - 1 && " (Hoy)"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{dia.total}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{dia.confirmadas}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{dia.pendientes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="semanal" className="mt-4">
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Semana
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
                      {estadisticasSemanales.map((semana, index) => (
                        <tr key={index} className={index === estadisticasSemanales.length - 1 ? "bg-emerald-50" : ""}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {semana.periodo}
                            {index === estadisticasSemanales.length - 1 && " (Actual)"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{semana.total}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{semana.confirmadas}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{semana.pendientes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="mensual" className="mt-4">
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mes
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
                      {estadisticasMensuales.map((mes, index) => (
                        <tr key={index} className={index === estadisticasMensuales.length - 1 ? "bg-emerald-50" : ""}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {mes.periodo}
                            {index === estadisticasMensuales.length - 1 && " (Actual)"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{mes.total}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{mes.confirmadas}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{mes.pendientes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-emerald-800 flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Canchas Más Reservadas
            </CardTitle>
            <CardDescription>Estadísticas de reservas por tipo de cancha</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cancha
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
                  {canchasMasReservadas.map((cancha, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">{cancha.cancha}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{cancha.total}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{cancha.confirmadas}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{cancha.pendientes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
