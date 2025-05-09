"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NotificationBell } from "@/components/notification-bell"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import { getThemeConfig } from "@/lib/theme-utils"
import { User, LogOut, Calendar, Users, BookOpen } from "lucide-react"

export default function HomePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [themeConfig, setThemeConfig] = useState<any>({})
  const [carouselImages, setCarouselImages] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Cargar configuración del tema
  useEffect(() => {
    const config = getThemeConfig()
    setThemeConfig(config)

    // Cargar imágenes del carrusel
    try {
      const configStr = localStorage.getItem("esmeraldaPlayConfig")
      if (configStr) {
        const config = JSON.parse(configStr)
        if (config.carouselImages && Array.isArray(config.carouselImages)) {
          setCarouselImages(config.carouselImages)
        }
      }
    } catch (error) {
      console.error("Error al cargar imágenes del carrusel:", error)
    }

    // Suscribirse a cambios en la configuración
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "esmeraldaPlayConfig") {
        const config = getThemeConfig()
        setThemeConfig(config)

        try {
          const configStr = e.newValue
          if (configStr) {
            const config = JSON.parse(configStr)
            if (config.carouselImages && Array.isArray(config.carouselImages)) {
              setCarouselImages(config.carouselImages)
            }
          }
        } catch (error) {
          console.error("Error al cargar imágenes del carrusel:", error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  // Cambiar imagen del carrusel cada 5 segundos
  useEffect(() => {
    if (carouselImages.length <= 1) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % carouselImages.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [carouselImages.length])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: themeConfig.bgColor || "#ecfdf5" }}>
      <header style={{ backgroundColor: themeConfig.primaryColor || "#10b981" }} className="text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <NotificationBell />
                  <div className="flex items-center gap-2">
                    <div className="text-sm hidden sm:block">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs opacity-80">{user.email}</div>
                    </div>
                    <div className="flex gap-1">
                      <Link href="/perfil">
                        <Button variant="ghost" size="icon" className="text-white hover:bg-opacity-20">
                          <User className="h-5 w-5" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-opacity-20"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  {user.role === "admin" && (
                    <Link href="/admin">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white hover:bg-opacity-90"
                        style={{ color: themeConfig.primaryColor || "#10b981" }}
                      >
                        Panel Admin
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white hover:bg-opacity-90"
                    style={{ color: themeConfig.primaryColor || "#10b981" }}
                  >
                    Iniciar Sesión
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Carrusel de imágenes */}
        {carouselImages.length > 0 && (
          <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
            <div
              className="absolute inset-0 transition-opacity duration-1000"
              style={{
                backgroundImage: `url(${carouselImages[currentImageIndex]})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            ></div>
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <h1 className="text-white text-3xl md:text-5xl font-bold text-center px-4">
                {themeConfig.appName || "Esmeralda Play"}
              </h1>
            </div>
            {/* Indicadores del carrusel */}
            {carouselImages.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {carouselImages.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index === currentImageIndex ? "bg-white" : "bg-white bg-opacity-50"
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  ></button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle style={{ color: themeConfig.secondaryColor || "#065f46" }}>Reservas</CardTitle>
              <CardDescription>Reserva canchas deportivas</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-10 w-10" style={{ color: themeConfig.primaryColor || "#10b981" }} />
              </div>
              <p className="text-center mb-6">
                Reserva canchas de tenis, fútbol, básquet, vóley y picketball de manera fácil y rápida.
              </p>
              <Link href={user ? "/reservas" : "/login"} className="w-full">
                <Button className="w-full" style={{ backgroundColor: themeConfig.primaryColor || "#10b981" }}>
                  {user ? "Hacer Reserva" : "Iniciar Sesión para Reservar"}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle style={{ color: themeConfig.secondaryColor || "#065f46" }}>Mis Reservas</CardTitle>
              <CardDescription>Gestiona tus reservas</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-10 w-10" style={{ color: themeConfig.primaryColor || "#10b981" }} />
              </div>
              <p className="text-center mb-6">
                Consulta, modifica o cancela tus reservas existentes. Mantén un registro de tus actividades deportivas.
              </p>
              <Link href={user ? "/reservas" : "/login"} className="w-full">
                <Button className="w-full" style={{ backgroundColor: themeConfig.primaryColor || "#10b981" }}>
                  {user ? "Ver Mis Reservas" : "Iniciar Sesión"}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle style={{ color: themeConfig.secondaryColor || "#065f46" }}>Reglamento</CardTitle>
              <CardDescription>Normas de uso de las instalaciones</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-10 w-10" style={{ color: themeConfig.primaryColor || "#10b981" }} />
              </div>
              <p className="text-center mb-6">
                Conoce las normas y reglamentos para el uso adecuado de las instalaciones deportivas de Punta Esmeralda.
              </p>
              <Link href="/reglas" className="w-full">
                <Button className="w-full" style={{ backgroundColor: themeConfig.primaryColor || "#10b981" }}>
                  Ver Reglamento
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer style={{ backgroundColor: themeConfig.secondaryColor || "#065f46" }} className="text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">{themeConfig.appName || "Esmeralda Play"}</h3>
              <p className="text-emerald-100">
                Sistema de reservas de canchas deportivas para la urbanización Punta Esmeralda.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Enlaces Rápidos</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/reservas" className="text-emerald-100 hover:text-white">
                    Reservar Cancha
                  </Link>
                </li>
                <li>
                  <Link href="/reglas" className="text-emerald-100 hover:text-white">
                    Reglas y Políticas
                  </Link>
                </li>
                <li>
                  <Link href="/contacto" className="text-emerald-100 hover:text-white">
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contacto</h3>
              <p className="text-emerald-100">
                Urbanización Punta Esmeralda
                <br />
                Email: aso.urbpuntaesmeralda@gmail.com
                <br />
                Teléfono: +593 968838776
              </p>
            </div>
          </div>
          <div className="border-t border-emerald-700 mt-8 pt-6 text-center text-emerald-100">
            <p>
              &copy; {new Date().getFullYear()} {themeConfig.appName || "Esmeralda Play"}. Todos los derechos
              reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
