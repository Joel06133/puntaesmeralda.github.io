// Usuarios predefinidos para la aplicación (solo para desarrollo)
// En una aplicación real, estos datos estarían en una base de datos segura
export const users = [
  {
    id: "1",
    name: "Administrador",
    email: "aso.urbpuntaesmeralda@gmail.com",
    password: "admin123", // En una aplicación real, las contraseñas estarían hasheadas
    role: "admin",
    manzana: "",
    villa: "",
  },
]

// Tipos de notificaciones
export type NotificationType = "info" | "success" | "warning" | "error"

// Estructura de una notificación
export type Notification = {
  id: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  date: Date
}

// Notificaciones de ejemplo (vacío por defecto)
export const sampleNotifications: Notification[] = []

// Estructura de un usuario
export type User = {
  id: string
  name: string
  email: string
  password: string
  role: "user" | "admin"
  status: "pending" | "approved" | "blocked" // Añadir estado del usuario
  createdAt: Date // Añadir fecha de creación
  manzana?: string // Añadir manzana
  villa?: string // Añadir villa
}

// Función para generar un ID único
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Función para obtener usuarios registrados del localStorage
export function getRegisteredUsers(): User[] {
  if (typeof window === "undefined") return []

  const storedUsers = localStorage.getItem("esmeraldaPlayUsers")
  if (!storedUsers) return []

  return JSON.parse(storedUsers)
}

// Función para guardar un nuevo usuario en localStorage
export function saveUser(user: User): void {
  if (typeof window === "undefined") return

  const users = getRegisteredUsers()
  users.push(user)
  localStorage.setItem("esmeraldaPlayUsers", JSON.stringify(users))
}

// Función para actualizar un usuario existente
export function updateUser(updatedUser: User): boolean {
  if (typeof window === "undefined") return false

  const users = getRegisteredUsers()
  const index = users.findIndex((u) => u.id === updatedUser.id)

  if (index === -1) return false

  users[index] = updatedUser
  localStorage.setItem("esmeraldaPlayUsers", JSON.stringify(users))
  return true
}

// Función para verificar si un correo ya está registrado
export function isEmailRegistered(email: string): boolean {
  if (typeof window === "undefined") return false

  const users = getRegisteredUsers()
  return users.some((u) => u.email.toLowerCase() === email.toLowerCase())
}

// Función para obtener un usuario por su ID
export function getUserById(id: string): User | null {
  if (typeof window === "undefined") return null

  const users = getRegisteredUsers()
  const user = users.find((u) => u.id === id)
  return user || null
}

// Función para obtener un usuario por su correo
export function getUserByEmail(email: string): User | null {
  if (typeof window === "undefined") return null

  const users = getRegisteredUsers()
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  return user || null
}

// Función para obtener usuarios por manzana y villa
export function getUserByManzanaVilla(manzana: string, villa: string): User[] {
  if (typeof window === "undefined") return []

  const users = getRegisteredUsers()
  return users.filter(
    (u) => u.manzana?.toLowerCase() === manzana.toLowerCase() && u.villa?.toLowerCase() === villa.toLowerCase(),
  )
}

// Función para cambiar el estado de un usuario
export function changeUserStatus(userId: string, status: "pending" | "approved" | "blocked"): boolean {
  if (typeof window === "undefined") return false

  const users = getRegisteredUsers()
  const index = users.findIndex((u) => u.id === userId)

  if (index === -1) return false

  users[index].status = status
  localStorage.setItem("esmeraldaPlayUsers", JSON.stringify(users))
  return true
}

// Estructura para la configuración del sistema
export type SystemConfig = {
  // Horarios
  horaInicio: string
  horaFin: string
  duracionReserva: number
  reservasPorDia: number
  requierePagoNocturno: boolean
  horaNocturnaInicio: string

  // Precios nocturnos
  precioNocturnoTenis: string
  precioNocturnoFutbol: string
  precioNocturnoBasquet: string
  precioNocturnoVoley: string

  // Diseño
  appName: string
  contactEmail: string
  contactPhone: string
  primaryColor: string
  secondaryColor: string
  bgColor: string

  // Reglamento
  reglamentoTexto: string
}

// Configuración por defecto
export const defaultSystemConfig: SystemConfig = {
  horaInicio: "06:00",
  horaFin: "22:00",
  duracionReserva: 60,
  reservasPorDia: 1,
  requierePagoNocturno: true,
  horaNocturnaInicio: "19:00",

  precioNocturnoTenis: "15.00",
  precioNocturnoFutbol: "20.00",
  precioNocturnoBasquet: "15.00",
  precioNocturnoVoley: "15.00",

  appName: "Esmeralda Play",
  contactEmail: "aso.urbpuntaesmeralda@gmail.com",
  contactPhone: "+593 968838776",
  primaryColor: "#10b981",
  secondaryColor: "#065f46",
  bgColor: "#ecfdf5",

  reglamentoTexto:
    "1. Cada usuario puede realizar máximo 1 reserva por día.\n2. Las reservas tienen una duración máxima de 1 hora.\n3. Las reservas nocturnas requieren pago adicional.\n4. Se debe respetar el horario reservado.\n5. Cualquier daño a las instalaciones será responsabilidad del usuario.",
}

// Función para guardar la configuración del sistema
export function saveSystemConfig(config: SystemConfig): void {
  if (typeof window === "undefined") return
  localStorage.setItem("esmeraldaPlayConfig", JSON.stringify(config))
}

// Función para obtener la configuración del sistema
export function getSystemConfig(): SystemConfig {
  if (typeof window === "undefined") return defaultSystemConfig

  const storedConfig = localStorage.getItem("esmeraldaPlayConfig")
  if (!storedConfig) return defaultSystemConfig

  return JSON.parse(storedConfig)
}

// Registro de cambios del sistema
export type SystemChange = {
  id: string
  userId: string
  userName: string
  action: string
  details: string
  date: Date
}

// Función para registrar un cambio en el sistema
export function logSystemChange(userId: string, userName: string, action: string, details: string): void {
  if (typeof window === "undefined") return

  const change: SystemChange = {
    id: generateId(),
    userId,
    userName,
    action,
    details,
    date: new Date(),
  }

  const changesStr = localStorage.getItem("esmeraldaPlaySystemChanges")
  const changes = changesStr ? JSON.parse(changesStr) : []
  changes.unshift(change)
  localStorage.setItem("esmeraldaPlaySystemChanges", JSON.stringify(changes))
}

// Función para obtener los cambios del sistema
export function getSystemChanges(): SystemChange[] {
  if (typeof window === "undefined") return []

  const changesStr = localStorage.getItem("esmeraldaPlaySystemChanges")
  if (!changesStr) return []

  return JSON.parse(changesStr)
}
