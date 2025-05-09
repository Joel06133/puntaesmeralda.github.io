// Utilidades para manejar el tema de la aplicación

// Obtener el color primario de la configuración
export function getPrimaryColor(): string {
  if (typeof window === "undefined") return "#10b981" // emerald-600 por defecto

  try {
    const configStr = localStorage.getItem("esmeraldaPlayConfig")
    if (configStr) {
      const config = JSON.parse(configStr)
      return config.primaryColor || "#10b981"
    }
  } catch (error) {
    console.error("Error al obtener color primario:", error)
  }

  return "#10b981" // emerald-600 por defecto
}

// Obtener el color secundario de la configuración
export function getSecondaryColor(): string {
  if (typeof window === "undefined") return "#065f46" // emerald-800 por defecto

  try {
    const configStr = localStorage.getItem("esmeraldaPlayConfig")
    if (configStr) {
      const config = JSON.parse(configStr)
      return config.secondaryColor || "#065f46"
    }
  } catch (error) {
    console.error("Error al obtener color secundario:", error)
  }

  return "#065f46" // emerald-800 por defecto
}

// Obtener el color de fondo de la configuración
export function getBgColor(): string {
  if (typeof window === "undefined") return "#ecfdf5" // emerald-50 por defecto

  try {
    const configStr = localStorage.getItem("esmeraldaPlayConfig")
    if (configStr) {
      const config = JSON.parse(configStr)
      return config.bgColor || "#ecfdf5"
    }
  } catch (error) {
    console.error("Error al obtener color de fondo:", error)
  }

  return "#ecfdf5" // emerald-50 por defecto
}

// Obtener el nombre de la aplicación
export function getAppName(): string {
  if (typeof window === "undefined") return "Esmeralda Play"

  try {
    const configStr = localStorage.getItem("esmeraldaPlayConfig")
    if (configStr) {
      const config = JSON.parse(configStr)
      return config.appName || "Esmeralda Play"
    }
  } catch (error) {
    console.error("Error al obtener nombre de la aplicación:", error)
  }

  return "Esmeralda Play"
}

// Obtener el logo de la aplicación
export function getAppLogo(): string | null {
  if (typeof window === "undefined") return null

  try {
    const configStr = localStorage.getItem("esmeraldaPlayConfig")
    if (configStr) {
      const config = JSON.parse(configStr)
      return config.logoUrl || null
    }
  } catch (error) {
    console.error("Error al obtener logo de la aplicación:", error)
  }

  return null
}

// Obtener la configuración completa del tema
export function getThemeConfig() {
  if (typeof window === "undefined") {
    return {
      primaryColor: "#10b981",
      secondaryColor: "#065f46",
      bgColor: "#ecfdf5",
      appName: "Esmeralda Play",
      logoUrl: null,
    }
  }

  try {
    const configStr = localStorage.getItem("esmeraldaPlayConfig")
    if (configStr) {
      const config = JSON.parse(configStr)
      return {
        primaryColor: config.primaryColor || "#10b981",
        secondaryColor: config.secondaryColor || "#065f46",
        bgColor: config.bgColor || "#ecfdf5",
        appName: config.appName || "Esmeralda Play",
        logoUrl: config.logoUrl || null,
      }
    }
  } catch (error) {
    console.error("Error al obtener configuración del tema:", error)
  }

  return {
    primaryColor: "#10b981",
    secondaryColor: "#065f46",
    bgColor: "#ecfdf5",
    appName: "Esmeralda Play",
    logoUrl: null,
  }
}
