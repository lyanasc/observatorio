"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations"
import { forgotPassword } from "@/server/actions/auth"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  async function onSubmit(data: ForgotPasswordInput) {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("email", data.email)

      const result = await forgotPassword(formData)

      if (result.success) {
        setIsSubmitted(true)
        toast.success(result.message || "Verifique seu e-mail")
      } else {
        toast.error(result.error || "Erro ao processar solicitação")
      }
    } catch {
      toast.error("Erro ao processar solicitação. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">
            Verifique seu e-mail
          </CardTitle>
          <CardDescription>
            Se o e-mail informado estiver cadastrado, você receberá um link para
            redefinir sua senha.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Button variant="ghost" asChild>
            <Link href="/login">
              <ArrowLeft />
              Voltar para o login
            </Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold">
          Recuperar senha
        </CardTitle>
        <CardDescription>
          Digite seu e-mail para receber um link de recuperação
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              {...register("email")}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="animate-spin" />}
            Enviar link de recuperação
          </Button>
          <Button variant="ghost" asChild className="w-full">
            <Link href="/login">
              <ArrowLeft />
              Voltar para o login
            </Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
