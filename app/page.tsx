"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function Home() {
  const router = useRouter()
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [password, setPassword] = useState("")

  // Redirect to cliente page on mount
  useEffect(() => {
    router.push("/cliente")
  }, [router])

  const handleBusinessAccess = () => {
    if (password === "chocoydani") {
      setShowPasswordDialog(false)
      setPassword("")
      router.push("/negocio")
    } else {
      toast.error("Contraseña incorrecta")
      setPassword("")
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-50 to-white p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900">
          Orden<span className="text-sky-500">Eya</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Redirigiendo al menú...
        </p>

        {/* Discrete business link */}
        <div className="mt-8">
          <button
            onClick={() => setShowPasswordDialog(true)}
            className="text-xs text-slate-700 hover:text-slate-900 transition-colors flex items-center gap-1 mx-auto"
          >
            <Store className="w-3 h-3" />
            Panel de negocio
          </button>
        </div>
      </motion.div>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Acceso al Panel de Negocio</DialogTitle>
            <DialogDescription>
              Ingresa la contraseña para acceder al panel de administración
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleBusinessAccess()
                }
              }}
              className="w-full"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowPasswordDialog(false)
              setPassword("")
            }}>
              Cancelar
            </Button>
            <Button onClick={handleBusinessAccess}>
              Acceder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
