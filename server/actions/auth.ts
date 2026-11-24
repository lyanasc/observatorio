"use server"

import prisma from "@/lib/prisma"
import {
  hashPassword,
  verifyPassword,
  createToken,
  setAuthCookie,
  removeAuthCookie,
  getSession,
  generateToken,
} from "@/lib/auth"
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations"
import type { ApiResponse, SessionUser } from "@/types"

// ============================================================================
// LOGIN
// ============================================================================

export async function login(formData: FormData): Promise<ApiResponse<SessionUser>> {
  try {
    const rawData = {
      email: formData.get("email"),
      password: formData.get("password"),
    }

    const validated = loginSchema.safeParse(rawData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const { email, password } = validated.data

    const user = await prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    })

    if (!user) {
      return { success: false, error: "Credenciais inválidas" }
    }

    if (!user.isActive) {
      return { success: false, error: "Conta desativada. Entre em contato com o suporte." }
    }

    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return { success: false, error: "Credenciais inválidas" }
    }

    const sessionUser: SessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      organizationSlug: user.organization?.slug,
    }

    const token = await createToken(sessionUser)
    await setAuthCookie(token)

    return { success: true, data: sessionUser }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "Erro ao fazer login. Tente novamente." }
  }
}

// ============================================================================
// REGISTER
// ============================================================================

export async function register(formData: FormData): Promise<ApiResponse<SessionUser>> {
  try {
    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    }

    const validated = registerSchema.safeParse(rawData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const { name, email, password } = validated.data

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { success: false, error: "Este e-mail já está em uso" }
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
      },
    })

    const sessionUser: SessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    }

    const token = await createToken(sessionUser)
    await setAuthCookie(token)

    return { success: true, data: sessionUser }
  } catch (error) {
    console.error("Register error:", error)
    return { success: false, error: "Erro ao criar conta. Tente novamente." }
  }
}

// ============================================================================
// LOGOUT
// ============================================================================

export async function logout(): Promise<ApiResponse> {
  try {
    await removeAuthCookie()
    return { success: true }
  } catch (error) {
    console.error("Logout error:", error)
    return { success: false, error: "Erro ao fazer logout" }
  }
}

// ============================================================================
// GET CURRENT USER
// ============================================================================

export async function getCurrentUser(): Promise<ApiResponse<SessionUser>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: "Não autenticado" }
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: { organization: true },
    })

    if (!user || !user.isActive) {
      await removeAuthCookie()
      return { success: false, error: "Sessão inválida" }
    }

    const sessionUser: SessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      organizationSlug: user.organization?.slug,
    }

    return { success: true, data: sessionUser }
  } catch (error) {
    console.error("Get current user error:", error)
    return { success: false, error: "Erro ao obter usuário" }
  }
}

// ============================================================================
// FORGOT PASSWORD
// ============================================================================

export async function forgotPassword(formData: FormData): Promise<ApiResponse> {
  try {
    const rawData = { email: formData.get("email") }

    const validated = forgotPasswordSchema.safeParse(rawData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const { email } = validated.data

    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return {
        success: true,
        message: "Se o e-mail existir, você receberá um link de recuperação.",
      }
    }

    // Delete existing tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    })

    // Create new token
    const token = generateToken()
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    })

    // TODO: Send email with reset link
    console.log(`Password reset token for ${email}: ${token}`)

    return {
      success: true,
      message: "Se o e-mail existir, você receberá um link de recuperação.",
    }
  } catch (error) {
    console.error("Forgot password error:", error)
    return { success: false, error: "Erro ao processar solicitação" }
  }
}

// ============================================================================
// RESET PASSWORD
// ============================================================================

export async function resetPassword(formData: FormData): Promise<ApiResponse> {
  try {
    const rawData = {
      token: formData.get("token"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    }

    const validated = resetPasswordSchema.safeParse(rawData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const { token, password } = validated.data

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return { success: false, error: "Token inválido ou expirado" }
    }

    const hashedPassword = await hashPassword(password)

    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    })

    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    })

    return { success: true, message: "Senha alterada com sucesso" }
  } catch (error) {
    console.error("Reset password error:", error)
    return { success: false, error: "Erro ao redefinir senha" }
  }
}
