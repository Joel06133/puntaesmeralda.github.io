"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { getAppLogo, getAppName } from "@/lib/theme-utils"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showName?: boolean
  className?: string
  textColor?: string
}

export function Logo({ size = "md", showName = true, className = "", textColor = "text-white" }: LogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [appName, setAppName] = useState("Esmeralda Play")

  // Tamaños predefinidos
  const sizes = {
    sm: { width: 24, height: 24, textSize: "text-sm" },
    md: { width: 32, height: 32, textSize: "text-base" },
    lg: { width: 48, height: 48, textSize: "text-xl" },
  }

  // Cargar logo y nombre de la aplicación
  useEffect(() => {
    // Obtener logo de la configuración
    const logo = getAppLogo()
    setLogoUrl(logo)

    // Obtener nombre de la aplicación
    const name = getAppName()
    setAppName(name)

    // Suscribirse a cambios en la configuración
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "esmeraldaPlayConfig") {
        const logo = getAppLogo()
        setLogoUrl(logo)
        const name = getAppName()
        setAppName(name)
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  // Obtener iniciales para el fallback
  const getInitials = () => {
    return appName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {logoUrl ? (
        <div className="relative" style={{ width: sizes[size].width, height: sizes[size].height }}>
          <Image
            src={logoUrl || "/placeholder.svg"}
            alt={appName}
            width={sizes[size].width}
            height={sizes[size].height}
            className="object-contain"
          />
        </div>
      ) : (
        <div
          className={`flex items-center justify-center rounded-full bg-white`}
          style={{ width: sizes[size].width, height: sizes[size].height }}
        >
          <span className={`font-bold ${sizes[size].textSize} text-emerald-600`}>{getInitials()}</span>
        </div>
      )}
      {showName && <span className={`font-bold ${sizes[size].textSize} ${textColor}`}>{appName}</span>}
    </div>
  )
}
