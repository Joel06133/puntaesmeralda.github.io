"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useNotifications } from "@/components/notification-provider"
import { getRegisteredUsers } from "@/lib/data"

interface ResetPasswordProps {
  userId: string
  userName: string
  userEmail: string
}

export function ResetPassword({ userId, userName, userEmail }: ResetPasswordProps) {
  const [open, setOpen] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [isResetting, setIsResetting] = useState(false)
  const { toast } = useToast()
  const { addNotification } = useNotifications()

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      })
      return
    }

    setIsResetting(true)

    try {
      // Obtener usuarios registrados
      const users = getRegisteredUsers()

      // Buscar el usuario por ID
      const userIndex = users.findIndex((u) => u.id === userId)

      if (userIndex === -1) {
        toast({
          title: "Error",
          description: "Usuario no encontrado",
          variant: "destructive",
        })
        return
      }

      // Actualizar la contraseña
      users[userIndex].password = newPassword

      // Guardar los cambios
      localStorage.setItem("esmeraldaPlayUsers", JSON.stringify(users))

      // Notificar al usuario
      const notificacionUsuario = {
        id: Date.now().toString(),
        title: "Contraseña restablecida",
        message:
          "Tu contraseña ha sido restablecida por un administrador. Por favor, cámbiala la próxima vez que inicies sesión.",
        type: "warning",
        read: false,
        date: new Date(),
        userId: userId,
      }

      try {
        const notificacionesUsuarioStr = localStorage.getItem(`esmeraldaPlayNotificaciones_${userId}`)
        const notificacionesUsuario = notificacionesUsuarioStr ? JSON.parse(notificacionesUsuarioStr) : []
        notificacionesUsuario.unshift(notificacionUsuario)
        localStorage.setItem(`esmeraldaPlayNotificaciones_${userId}`, JSON.stringify(notificacionesUsuario))
      } catch (error) {
        console.error("Error al guardar notificación para el usuario:", error)
      }

      toast({
        title: "Contraseña restablecida",
        description: `La contraseña de ${userName} ha sido restablecida correctamente`,
      })

      addNotification({
        title: "Contraseña restablecida",
        message: `Has restablecido la contraseña de ${userName}`,
        type: "success",
      })

      setNewPassword("")
      setOpen(false)
    } catch (error) {
      console.error("Error al restablecer contraseña:", error)
      toast({
        title: "Error",
        description: "No se pudo restablecer la contraseña. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50">
          Restablecer contraseña
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Restablecer contraseña</DialogTitle>
          <DialogDescription>
            Establece una nueva contraseña para {userName} ({userEmail})
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva contraseña</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Ingresa la nueva contraseña"
            />
            <p className="text-xs text-muted-foreground">La contraseña debe tener al menos 6 caracteres</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleResetPassword} disabled={isResetting}>
            {isResetting ? "Restableciendo..." : "Restablecer contraseña"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
