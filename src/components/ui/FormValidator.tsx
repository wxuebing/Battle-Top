"use client"

import { useState, useEffect } from "react"
import { Check, X, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ValidationRule {
  test: (value: string) => boolean
  message: string
}

interface FormValidatorProps {
  value: string
  rules: ValidationRule[]
  showOnEmpty?: boolean
}

export function FormValidator({ value, rules, showOnEmpty = false }: FormValidatorProps) {
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (value) setTouched(true)
  }, [value])

  if (!touched && !showOnEmpty) return null
  if (!value && !showOnEmpty) return null

  const results = rules.map((rule) => ({
    valid: rule.test(value),
    message: rule.message,
  }))

  return (
    <div className="mt-1 space-y-1">
      {results.map((result, index) => (
        <div
          key={index}
          className={cn(
            "flex items-center gap-1.5 text-xs",
            result.valid ? "text-green-400" : "text-gray-500"
          )}
        >
          {result.valid ? (
            <Check className="h-3 w-3" />
          ) : (
            <AlertCircle className="h-3 w-3" />
          )}
          <span>{result.message}</span>
        </div>
      ))}
    </div>
  )
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validatePhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone)
}

export function validatePassword(password: string): {
  length: boolean
  hasNumber: boolean
  hasLetter: boolean
} {
  return {
    length: password.length >= 6,
    hasNumber: /\d/.test(password),
    hasLetter: /[a-zA-Z]/.test(password),
  }
}

export function getPasswordStrength(password: string): {
  score: number
  label: string
  color: string
} {
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 10) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++

  if (score <= 2) return { score, label: "弱", color: "bg-red-500" }
  if (score <= 4) return { score, label: "中", color: "bg-yellow-500" }
  return { score, label: "强", color: "bg-green-500" }
}

export function PasswordStrengthIndicator({ password }: { password: string }) {
  const strength = getPasswordStrength(password)

  if (!password) return null

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-1">
        <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={cn("h-full transition-all duration-300", strength.color)}
            style={{ width: `${(strength.score / 6) * 100}%` }}
          />
        </div>
        <span className={cn(
          "text-xs font-medium",
          strength.label === "弱" && "text-red-400",
          strength.label === "中" && "text-yellow-400",
          strength.label === "强" && "text-green-400"
        )}>
          {strength.label}
        </span>
      </div>
    </div>
  )
}

interface InputFeedbackProps {
  isValid?: boolean
  message?: string
}

export function InputFeedback({ isValid, message }: InputFeedbackProps) {
  if (!message) return null

  return (
    <div className={cn(
      "flex items-center gap-1.5 text-xs mt-1",
      isValid ? "text-green-400" : "text-red-400"
    )}>
      {isValid ? (
        <Check className="h-3 w-3" />
      ) : (
        <X className="h-3 w-3" />
      )}
      <span>{message}</span>
    </div>
  )
}
