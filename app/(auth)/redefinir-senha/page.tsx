"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react"

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
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations"
import { resetPassword } from "@/server/actions/auth"

function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || "",
    },
  })

  async function onSubmit(data: ResetPasswordInput) {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("token", data.token)
      formData.append("password", data.password)
      formData.append("confirmPassword", data.confirmPassword)

      const result = await resetPassword(formData)

      if (result.success) {
        setIsSuccess(true)
        toast.success(result.message || "Senha alterada com sucesso!")
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        toast.error(result.error || "Erro ao redefinir senha")
      }
    } catch {
      toast.error("Erro ao redefinir senha. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">Link inválido</CardTitle>
          <CardDescription>
            O link de redefinição de senha é inválido ou expirou.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Button variant="ghost" asChild>
            <Link href="/recuperar-senha">
              <ArrowLeft />
              Solicitar novo link
            </Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-semibold">
            Senha alterada!
          </CardTitle>
          <CardDescription>
            Sua senha foi alterada com sucesso. Você será redirecionado para o
            login.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold">
          Redefinir senha
        </CardTitle>
        <CardDescription>Digite sua nova senha abaixo</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="hidden" {...register("token")} />
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nova senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              {...register("password")}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="********"
              {...register("confirmPassword")}
              aria-invalid={!!errors.confirmPassword}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="animate-spin" />}
            Redefinir senha
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="animate-pulse">Carregando...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
