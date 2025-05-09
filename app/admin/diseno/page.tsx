"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, Palette, Save, Upload, X, ImageIcon } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useNotifications } from "@/components/notification-provider"

export default function DisenoPage() {
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [appName, setAppName] = useState("Esmeralda Play")
  const [contactEmail, setContactEmail] = useState("aso.urbpuntaesmeralda@gmail.com")
  const [contactPhone, setContactPhone] = useState("+593 968838776")
  const [primaryColor, setPrimaryColor] = useState("#10b981") // emerald-600
  const [secondaryColor, setSecondaryColor] = useState("#065f46") // emerald-800
  const [bgColor, setBgColor] = useState("#ecfdf5") // emerald-50

  // Carrusel de imágenes
  const [carouselImages, setCarouselImages] = useState<string[]>([])
  const [newImageFile, setNewImageFile] = useState<File | null>(null)

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
          setAppName(config.appName || "Esmeralda Play")
          setContactEmail(config.contactEmail || "aso.urbpuntaesmeralda@gmail.com")
          setContactPhone(config.contactPhone || "+593 968838776")
          setPrimaryColor(config.primaryColor || "#10b981")
          setSecondaryColor(config.secondaryColor || "#065f46")
          setBgColor(config.bgColor || "#ecfdf5")

          // Cargar logo si existe
          if (config.logoUrl) {
            setLogoPreview(config.logoUrl)
          }

          // Cargar imágenes del carrusel
          if (config.carouselImages && Array.isArray(config.carouselImages)) {
            setCarouselImages(config.carouselImages)
          }
        }
      } catch (error) {
        console.error("Error al cargar configuración:", error)
      }
    }
  }, [isLoading, user, router, addNotification])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setLogoFile(file)

      // Crear una URL para previsualizar la imagen
      const reader = new FileReader()
      reader.onload = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setNewImageFile(file)

      // Convertir la imagen a base64 para guardarla en localStorage
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        if (carouselImages.length < 3) {
          setCarouselImages([...carouselImages, result])
        } else {
          toast({
            title: "Límite alcanzado",
            description: "Solo puedes subir un máximo de 3 imágenes para el carrusel",
            variant: "destructive",
          })
        }
        setNewImageFile(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeCarouselImage = (index: number) => {
    setCarouselImages(carouselImages.filter((_, i) => i !== index))
  }

  const handleSaveConfig = () => {
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
      appName,
      contactEmail,
      contactPhone,
      primaryColor,
      secondaryColor,
      bgColor,
      carouselImages,
    }

    // Si hay un nuevo logo, guardarlo
    if (logoPreview) {
      updatedConfig.logoUrl = logoPreview
    }

    // Guardar configuración
    localStorage.setItem("esmeraldaPlayConfig", JSON.stringify(updatedConfig))

    // Disparar evento para que otros componentes se actualicen
    window.dispatchEvent(new Event("storage"))

    toast({
      title: "Diseño actualizado",
      description: "La configuración de diseño se ha guardado correctamente",
    })

    addNotification({
      title: "Diseño actualizado",
      message: "Has actualizado la configuración de diseño de la aplicación",
      type: "success",
    })

    // Mostrar confirmación visual
    const confirmationElement = document.createElement("div")
    confirmationElement.className = "fixed top-4 right-4 bg-green-100 text-green-800 p-4 rounded-md shadow-md z-50"
    confirmationElement.textContent = "Diseño guardado correctamente"
    document.body.appendChild(confirmationElement)

    setTimeout(() => {
      document.body.removeChild(confirmationElement)
    }, 3000)
  }

  // Función específica para actualizar solo el logo
  const handleUpdateLogo = () => {
    if (!logoPreview) {
      toast({
        title: "Error",
        description: "No hay un nuevo logo para actualizar",
        variant: "destructive",
      })
      return
    }

    // Obtener configuración actual
    let config = {}
    try {
      const configStr = localStorage.getItem("esmeraldaPlayConfig")
      if (configStr) {
        config = JSON.parse(configStr)
      }
    } catch (error) {
      console.error("Error al cargar configuración:", error)
    }

    // Actualizar solo el logo
    const updatedConfig = {
      ...config,
      logoUrl: logoPreview,
    }

    // Guardar configuración
    localStorage.setItem("esmeraldaPlayConfig", JSON.stringify(updatedConfig))

    // Disparar evento para que otros componentes se actualicen
    window.dispatchEvent(new Event("storage"))

    toast({
      title: "Logo actualizado",
      description: "El logo se ha actualizado correctamente en toda la aplicación",
    })

    addNotification({
      title: "Logo actualizado",
      message: "Has actualizado el logo de la aplicación",
      type: "success",
    })
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-emerald-600 text-white" style={{ backgroundColor: primaryColor }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/admin">
                <Button variant="ghost" size="icon" className="text-white hover:bg-opacity-20">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold">Diseño de la Aplicación</h1>
            </div>
            <div className="text-sm">
              <div className="font-medium">{user?.name}</div>
              <div className="text-xs opacity-80">{user?.email}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto mb-8">
          <CardHeader>
            <CardTitle className="text-emerald-800 flex items-center gap-2" style={{ color: secondaryColor }}>
              <Palette className="h-6 w-6" />
              Personalización
            </CardTitle>
            <CardDescription>Personaliza la apariencia de la aplicación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="logoFile">Logo de la Aplicación</Label>
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <img
                    src={logoPreview || "/placeholder.svg"}
                    alt="Logo preview"
                    className="w-16 h-16 object-contain"
                  />
                ) : (
                  <div
                    className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <span className="text-white font-bold text-xl">{appName.substring(0, 2).toUpperCase()}</span>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <Button variant="outline" onClick={() => document.getElementById("logoFile")?.click()}>
                    Cambiar Logo
                  </Button>
                  <Input id="logoFile" type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                  <Button variant="secondary" className="flex items-center gap-2" onClick={handleUpdateLogo}>
                    <ImageIcon className="h-4 w-4" />
                    Actualizar Logo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Recomendado: PNG o SVG con fondo transparente, 512x512px
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="appName">Nombre de la Aplicación</Label>
              <Input id="appName" value={appName} onChange={(e) => setAppName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Correo Electrónico de Contacto</Label>
              <Input
                id="contactEmail"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Teléfono de Contacto</Label>
              <Input id="contactPhone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Colores del Tema</Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="primaryColor" className="text-xs">
                    Color Principal
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded border" style={{ backgroundColor: primaryColor }}></div>
                    <Input
                      id="primaryColor"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-full h-8 p-0"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="secondaryColor" className="text-xs">
                    Color Secundario
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded border" style={{ backgroundColor: secondaryColor }}></div>
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-full h-8 p-0"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="bgColor" className="text-xs">
                    Color de Fondo
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded border" style={{ backgroundColor: bgColor }}></div>
                    <Input
                      id="bgColor"
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-full h-8 p-0"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Vista Previa</h3>
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-emerald-600 text-white p-4" style={{ backgroundColor: primaryColor }}>
                  <div className="flex items-center gap-2">
                    {logoPreview ? (
                      <img src={logoPreview || "/placeholder.svg"} alt="Logo" className="w-8 h-8 object-contain" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                        <span style={{ color: primaryColor }} className="font-bold text-sm">
                          {appName.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <h3 className="font-bold">{appName}</h3>
                  </div>
                </div>
                <div className="p-4" style={{ backgroundColor: bgColor }}>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-medium mb-2" style={{ color: secondaryColor }}>
                      Reserva de Canchas
                    </h4>
                    <p className="text-sm text-gray-600">
                      Sistema de reservas para las canchas deportivas de la Urbanización Punta Esmeralda
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSaveConfig}
              className="w-full hover:opacity-90 mt-4 flex items-center justify-center gap-2"
              style={{ backgroundColor: primaryColor }}
            >
              <Save className="h-5 w-5" />
              Guardar Cambios
            </Button>
          </CardContent>
        </Card>

        {/* Carrusel de imágenes */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-emerald-800 flex items-center gap-2" style={{ color: secondaryColor }}>
              <Upload className="h-6 w-6" />
              Imágenes del Carrusel
            </CardTitle>
            <CardDescription>Sube hasta 3 imágenes para mostrar en el carrusel de la página principal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {[0, 1, 2].map((index) => (
                <div key={index} className="relative">
                  {carouselImages[index] ? (
                    <div className="relative h-40 border rounded-md overflow-hidden">
                      <img
                        src={carouselImages[index] || "/placeholder.svg"}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 rounded-full"
                        onClick={() => removeCarouselImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="h-40 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
                      onClick={() => document.getElementById(`carouselImage${index}`)?.click()}
                    >
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-xs text-gray-500">Subir imagen</p>
                      <Input
                        id={`carouselImage${index}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleNewImageChange}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Formatos recomendados: JPG, PNG. Tamaño recomendado: 1200x600px
            </p>

            <Button
              onClick={handleSaveConfig}
              className="w-full hover:opacity-90 mt-4 flex items-center justify-center gap-2"
              style={{ backgroundColor: primaryColor }}
            >
              <Save className="h-5 w-5" />
              Guardar Imágenes
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
