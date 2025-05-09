"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft, Search, CalendarIcon, Filter, Download } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { getUserById, logSystemChange } from "@/lib/data"

export default function AdminReservasPage() {
  const [reservas, setReservas] = useState<any[]>([])
  const [filteredReservas, setFilteredReservas] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined)
  const [filterCancha, setFilterCancha] = useState("")
  const [filterEstado, setFilterEstado] = useState("")
  const [selectedReserva, setSelectedReserva] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { toast } = useToast()
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Redireccionar si no es administrador
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  // Cargar todas las reservas
  useEffect(() => {
    if (!isLoading && user?.role === "admin") {
      const allReservas: any[] = []
      try {
        // Buscar en localStorage todas las reservas
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith("esmeraldaPlayReservas_")) {
            const userId = key.replace("esmeraldaPlayReservas_", "")
            const reservasUsuario = JSON.parse(localStorage.getItem(key) || "[]")

            // Añadir información del usuario a cada reserva
            const reservasConUsuario = reservasUsuario.map((r: any) => {
              const userInfo = getUserById(userId)
              return {
                ...r,
                usuarioId: userId,
                usuarioEmail: userInfo?.email || "Usuario desconocido",
                usuarioManzana: userInfo?.manzana || "",
                usuarioVilla: userInfo?.villa || "",
              }
            })

            allReservas.push(...reservasConUsuario)
          }
        }

        // Ordenar por fecha (más recientes primero)
        allReservas.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

        setReservas(allReservas)
        setFilteredReservas(allReservas)
      } catch (error) {
        console.error("Error al cargar reservas:", error)
      }
    }
  }, [isLoading, user])

  // Filtrar reservas
  useEffect(() => {
    let filtered = [...reservas]

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.usuarioName?.toLowerCase().includes(term) ||
          r.usuarioEmail?.toLowerCase().includes(term) ||
          r.canchaName?.toLowerCase().includes(term) ||
          r.usuarioManzana?.toLowerCase().includes(term) ||
          r.usuarioVilla?.toLowerCase().includes(term),
      )
    }

    // Filtrar por fecha
    if (filterDate) {
      filtered = filtered.filter((r) => new Date(r.fecha).toDateString() === filterDate.toDateString())
    }

    // Filtrar por cancha
    if (filterCancha) {
      filtered = filtered.filter((r) => r.cancha === filterCancha)
    }

    // Filtrar por estado
    if (filterEstado) {
      filtered = filtered.filter((r) => r.estado === filterEstado)
    }

    setFilteredReservas(filtered)
  }, [searchTerm, filterDate, filterCancha, filterEstado, reservas])

  // Cambiar estado de una reserva
  const cambiarEstadoReserva = (reservaId: string, nuevoEstado: string) => {
    // Buscar la reserva en todas las reservas
    const reservaIndex = reservas.findIndex((r) => r.id === reservaId)
    if (reservaIndex === -1) return

    const reserva = reservas[reservaIndex]
    const userId = reserva.usuarioId

    // Obtener las reservas del usuario
    const reservasUsuarioStr = localStorage.getItem(`esmeraldaPlayReservas_${userId}`)
    if (!reservasUsuarioStr) return

    const reservasUsuario = JSON.parse(reservasUsuarioStr)
    const reservaUsuarioIndex = reservasUsuario.findIndex((r: any) => r.id === reservaId)
    if (reservaUsuarioIndex === -1) return

    // Actualizar el estado de la reserva
    reservasUsuario[reservaUsuarioIndex].estado = nuevoEstado
    localStorage.setItem(`esmeraldaPlayReservas_${userId}`, JSON.stringify(reservasUsuario))

    // Actualizar el estado local
    const updatedReservas = [...reservas]
    updatedReservas[reservaIndex].estado = nuevoEstado
    setReservas(updatedReservas)

    // Registrar el cambio
    logSystemChange(
      user?.id || "",
      user?.name || "",
      "Cambio de estado de reserva",
      `Cambió el estado de la reserva ${reservaId} a ${nuevoEstado}`,
    )

    // Notificar al usuario
    const notificacion = {
      id: Date.now().toString(),
      title: "Estado de reserva actualizado",
      message: `Tu reserva para ${reserva.canchaName} el ${new Date(reserva.fecha).toLocaleDateString()} ha sido ${
        nuevoEstado === "confirmada" ? "confirmada" : nuevoEstado === "pendiente" ? "puesta en espera" : "rechazada"
      }.`,
      type: nuevoEstado === "confirmada" ? "success" : nuevoEstado === "pendiente" ? "info" : "error",
      read: false,
      date: new Date(),
      userId: userId,
    }

    try {
      const notificacionesUsuarioStr = localStorage.getItem(`esmeraldaPlayNotificaciones_${userId}`)
      const notificacionesUsuario = notificacionesUsuarioStr ? JSON.parse(notificacionesUsuarioStr) : []
      notificacionesUsuario.unshift(notificacion)
      localStorage.setItem(`esmeraldaPlayNotificaciones_${userId}`, JSON.stringify(notificacionesUsuario))
    } catch (error) {
      console.error("Error al guardar notificación:", error)
    }

    toast({
      title: "Estado actualizado",
      description: `La reserva ha sido ${
        nuevoEstado === "confirmada" ? "confirmada" : nuevoEstado === "pendiente" ? "puesta en espera" : "rechazada"
      }.`,
    })

    // Cerrar el diálogo
    setIsDialogOpen(false)
  }

  // Exportar reservas a CSV
  const exportarReservasCSV = () => {
    const headers = ["ID", "Usuario", "Email", "Manzana", "Villa", "Cancha", "Fecha", "Horario", "Estado"]

    const csvData = filteredReservas.map((r) => [
      r.id,
      r.usuarioName,
      r.usuarioEmail,
      r.usuarioManzana,
      r.usuarioVilla,
      r.canchaName,
      new Date(r.fecha).toLocaleDateString(),
      r.horarioName,
      r.estado,
    ])

    const csvContent = [headers, ...csvData].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `reservas_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
              <h1 className="text-xl font-bold">Administración de Reservas</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-emerald-800">Reservas</CardTitle>
                <CardDescription>Gestiona las reservas de los usuarios</CardDescription>
              </div>
              <Button onClick={exportarReservasCSV} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span>Exportar CSV</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar por usuario, cancha, manzana o villa..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <span>Filtros</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Filtrar reservas</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Fecha</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            onClick={() => document.getElementById("filterCalendar")?.click()}
                          >
                            {filterDate ? filterDate.toLocaleDateString() : "Seleccionar fecha"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                          {filterDate && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setFilterDate(undefined)}
                              className="h-8 w-8 p-0"
                            >
                              &times;
                            </Button>
                          )}
                        </div>
                        <div className="hidden">
                          <Calendar id="filterCalendar" mode="single" selected={filterDate} onSelect={setFilterDate} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Cancha</Label>
                        <Select value={filterCancha} onValueChange={setFilterCancha}>
                          <SelectTrigger>
                            <SelectValue placeholder="Todas las canchas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas las canchas</SelectItem>
                            <SelectItem value="tenis">Cancha de Tenis</SelectItem>
                            <SelectItem value="futbol">Cancha de Fútbol</SelectItem>
                            <SelectItem value="basquet">Cancha de Básquet</SelectItem>
                            <SelectItem value="voley">Cancha de Vóley</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Estado</Label>
                        <Select value={filterEstado} onValueChange={setFilterEstado}>
                          <SelectTrigger>
                            <SelectValue placeholder="Todos los estados" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos los estados</SelectItem>
                            <SelectItem value="confirmada">Confirmada</SelectItem>
                            <SelectItem value="pendiente">Pendiente</SelectItem>
                            <SelectItem value="rechazada">Rechazada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={() => {
                          setFilterDate(undefined)
                          setFilterCancha("")
                          setFilterEstado("")
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        Limpiar filtros
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="border rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usuario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Manzana/Villa
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cancha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Horario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredReservas.map((reserva) => (
                        <tr key={reserva.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{reserva.usuarioName}</div>
                            <div className="text-sm text-gray-500">{reserva.usuarioEmail}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {reserva.usuarioManzana && reserva.usuarioVilla
                                ? `Manzana ${reserva.usuarioManzana}, Villa ${reserva.usuarioVilla}`
                                : "No especificado"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reserva.canchaName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(reserva.fecha).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {reserva.horarioName}
                            {reserva.duracion === "2" && " (2 horas)"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                reserva.estado === "confirmada"
                                  ? "bg-green-100 text-green-800"
                                  : reserva.estado === "pendiente"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {reserva.estado === "confirmada"
                                ? "Confirmada"
                                : reserva.estado === "pendiente"
                                  ? "Pendiente"
                                  : "Rechazada"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedReserva(reserva)
                                setIsDialogOpen(true)
                              }}
                            >
                              Gestionar
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {filteredReservas.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No hay reservas que coincidan con los filtros seleccionados</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Diálogo para gestionar reserva */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gestionar Reserva</DialogTitle>
          </DialogHeader>
          {selectedReserva && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h3 className="font-medium">Detalles de la reserva</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Usuario:</div>
                  <div>{selectedReserva.usuarioName}</div>
                  <div className="text-muted-foreground">Email:</div>
                  <div>{selectedReserva.usuarioEmail}</div>
                  <div className="text-muted-foreground">Cancha:</div>
                  <div>{selectedReserva.canchaName}</div>
                  <div className="text-muted-foreground">Fecha:</div>
                  <div>{new Date(selectedReserva.fecha).toLocaleDateString()}</div>
                  <div className="text-muted-foreground">Horario:</div>
                  <div>{selectedReserva.horarioName}</div>
                  <div className="text-muted-foreground">Estado:</div>
                  <div>
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        selectedReserva.estado === "confirmada"
                          ? "bg-green-100 text-green-800"
                          : selectedReserva.estado === "pendiente"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedReserva.estado === "confirmada"
                        ? "Confirmada"
                        : selectedReserva.estado === "pendiente"
                          ? "Pendiente"
                          : "Rechazada"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Cambiar estado</h3>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => cambiarEstadoReserva(selectedReserva.id, "confirmada")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Confirmar
                  </Button>
                  <Button
                    onClick={() => cambiarEstadoReserva(selectedReserva.id, "pendiente")}
                    variant="outline"
                    className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                  >
                    Pendiente
                  </Button>
                  <Button
                    onClick={() => cambiarEstadoReserva(selectedReserva.id, "rechazada")}
                    variant="outline"
                    className="border-red-500 text-red-700 hover:bg-red-50"
                  >
                    Rechazar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
