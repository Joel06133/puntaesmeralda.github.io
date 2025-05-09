"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { users as predefinedUsers, getRegisteredUsers } from "@/lib/data"

export type User = {
  id: string
  name: string
  email: string
  role: "user" | "admin"
  status?: "pending" | "approved" | "blocked"
  manzana?: string
  villa?: string
} | null

type AuthContextType = {
  user: User
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  updateUserProfile: (name: string, manzana: string, villa: string) => Promise<boolean>
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay un usuario guardado en localStorage
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem("esmeraldaPlayUser")
        if (savedUser) {
          setUser(JSON.parse(savedUser))
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Error al verificar autenticación:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Modificar el método login para incluir manzana y villa en el objeto de usuario
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      // Primero buscar en usuarios predefinidos (admin)
      const adminUser = predefinedUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
      )

      if (adminUser) {
        const userInfo = {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role as "user" | "admin",
          status: "approved", // Los administradores siempre están aprobados
          manzana: adminUser.manzana || "",
          villa: adminUser.villa || "",
        }

        localStorage.setItem("esmeraldaPlayUser", JSON.stringify(userInfo))
        setUser(userInfo)
        return true
      }

      // Si no es admin, buscar en usuarios registrados
      const registeredUsers = getRegisteredUsers()
      const foundUser = registeredUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
      )

      if (foundUser) {
        // Verificar si el usuario está aprobado
        if (foundUser.status === "blocked") {
          return false // Usuario bloqueado
        }

        if (foundUser.status === "pending") {
          return false // Usuario pendiente de aprobación
        }

        const userInfo = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role as "user" | "admin",
          status: foundUser.status,
          manzana: foundUser.manzana || "",
          villa: foundUser.villa || "",
        }

        localStorage.setItem("esmeraldaPlayUser", JSON.stringify(userInfo))
        setUser(userInfo)
        return true
      }

      return false
    } catch (error) {
      console.error("Error al iniciar sesión:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("esmeraldaPlayUser")
    setUser(null)
  }

  const updateUserProfile = async (name: string, manzana: string, villa: string): Promise<boolean> => {
    try {
      const usersStr = localStorage.getItem("esmeraldaPlayUsers")
      if (!usersStr) return false

      const users = JSON.parse(usersStr)
      const userIndex = users.findIndex((u: User) => u.id === user?.id)

      if (userIndex === -1) return false

      // Actualizar nombre, manzana y villa
      users[userIndex].name = name
      users[userIndex].manzana = manzana
      users[userIndex].villa = villa

      // Guardar usuarios actualizados
      localStorage.setItem("esmeraldaPlayUsers", JSON.stringify(users))

      // Actualizar el usuario en el estado
      setUser({
        ...user!,
        name,
        manzana,
        villa,
      })

      return true
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
      return false
    }
  }

  const updateUserPassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false

    try {
      // Para el administrador, verificar contra los usuarios predefinidos
      if (user.role === "admin") {
        const adminUser = predefinedUsers.find((u) => u.id === user.id)
        if (!adminUser || adminUser.password !== currentPassword) {
          return false
        }

        // En una aplicación real, aquí actualizaríamos la contraseña en la base de datos
        // Para esta demo, no podemos cambiar la contraseña del admin predefinido
        return false
      }

      // Para usuarios normales, verificar y actualizar en localStorage
      const registeredUsers = getRegisteredUsers()
      const index = registeredUsers.findIndex((u) => u.id === user.id)

      if (index === -1 || registeredUsers[index].password !== currentPassword) {
        return false
      }

      // Actualizar la contraseña
      registeredUsers[index].password = newPassword
      localStorage.setItem("esmeraldaPlayUsers", JSON.stringify(registeredUsers))

      return true
    } catch (error) {
      console.error("Error al actualizar contraseña:", error)
      return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoading,
        updateUserProfile,
        updateUserPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}
