import { defaultSystemConfig, saveSystemConfig as saveConfig, type SystemConfig } from "@/lib/data"

// Function to get the system configuration from localStorage
export function getSystemConfig(): SystemConfig {
  if (typeof window === "undefined") return defaultSystemConfig

  const storedConfig = localStorage.getItem("esmeraldaPlayConfig")
  if (!storedConfig) return defaultSystemConfig

  return JSON.parse(storedConfig)
}

// Function to save the system configuration to localStorage
export function saveSystemConfig(config: SystemConfig): void {
  if (typeof window === "undefined") return

  saveConfig(config)
}
