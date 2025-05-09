"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import type { Notification } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"

type NotificationContextType = {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, "id" | "date" | "read">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { toast } = useToast()

  useEffect(() => {
    // Cargar notificaciones guardadas o inicializar con un array vacío
    const savedNotifications = localStorage.getItem("esmeraldaPlayNotifications")
    if (savedNotifications) {
      // Convertir las fechas de string a Date
      const parsedNotifications = JSON.parse(savedNotifications).map((n: any) => ({
        ...n,
        date: new Date(n.date),
      }))
      setNotifications(parsedNotifications)
    } else {
      // Inicializar con un array vacío en lugar de sampleNotifications
      setNotifications([])
    }
  }, [])

  // Guardar notificaciones en localStorage cuando cambien
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem("esmeraldaPlayNotifications", JSON.stringify(notifications))
    }
  }, [notifications])

  const unreadCount = notifications.filter((n) => !n.read).length

  const addNotification = (notification: Omit<Notification, "id" | "date" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      date: new Date(),
      read: false,
    }

    setNotifications((prev) => [newNotification, ...prev])

    // Mostrar toast para la nueva notificación
    toast({
      title: notification.title,
      description: notification.message,
      variant: notification.type === "error" ? "destructive" : "default",
    })
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const clearNotifications = () => {
    setNotifications([])
    localStorage.removeItem("esmeraldaPlayNotifications")
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications debe ser usado dentro de un NotificationProvider")
  }
  return context
}
