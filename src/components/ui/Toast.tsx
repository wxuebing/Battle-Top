"use client"

import { createContext, useContext, useState, useCallback } from "react"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface Toast {
  id: string
  message: string
  type: "success" | "error" | "info"
}

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info") => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-slide-in",
              "bg-white border",
              toast.type === "success" && "border-green-200 bg-green-50",
              toast.type === "error" && "border-red-200 bg-red-50",
              toast.type === "info" && "border-blue-200 bg-blue-50"
            )}
          >
            {toast.type === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
            {toast.type === "error" && <AlertCircle className="h-5 w-5 text-red-500" />}
            {toast.type === "info" && <Info className="h-5 w-5 text-blue-500" />}
            <span
              className={cn(
                "text-sm font-medium",
                toast.type === "success" && "text-green-700",
                toast.type === "error" && "text-red-700",
                toast.type === "info" && "text-blue-700"
              )}
            >
              {toast.message}
            </span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
