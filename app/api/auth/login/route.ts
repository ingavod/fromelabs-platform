import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña requeridos" },
        { status: 400 }
      );
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Email o contraseña incorrectos" },
        { status: 401 }
      );
    }

    // Verificar contraseña
    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: "Email o contraseña incorrectos" },
        { status: 401 }
      );
    }

    // Actualizar último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date().toISOString() }
    });

    // Crear token simple (en producción usar JWT)
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

    return NextResponse.json({
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        messagesUsed: user.messagesUsed,
        messagesLimit: user.messagesLimit
      }
    });

  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { error: "Error al iniciar sesión" },
      { status: 500 }
    );
  }
}
