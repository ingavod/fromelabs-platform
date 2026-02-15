const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function crearUsuario() {
  console.log('\n==========================================');
  console.log('🚀 FROM E LABS - CREAR USUARIO');
  console.log('==========================================\n');

  const email = 'j.esteban@davitagroup.com';
  const password = 'JuanEsteban2026!'; // Contraseña temporal
  const nombre = 'Juan Esteban Castellví';
  const plan = 'ENTERPRISE';
  const mensajesLimite = 999999;

  try {
    // Verificar si ya existe
    const existente = await prisma.user.findUnique({
      where: { email: email }
    });

    if (existente) {
      console.log('⚠️  Usuario ya existe. Actualizando plan...');
      
      // Actualizar usuario existente
      const usuarioActualizado = await prisma.user.update({
        where: { email: email },
        data: {
          plan: plan,
          messagesLimit: mensajesLimite,
          messagesUsed: 0, // Resetear contador
          updatedAt: new Date().toISOString(),
        }
      });
      
      console.log('\n==========================================');
      console.log('✅ USUARIO ACTUALIZADO EXITOSAMENTE');
      console.log('==========================================');
      console.log('Nombre:', usuarioActualizado.name);
      console.log('Email:', usuarioActualizado.email);
      console.log('Plan actualizado a:', usuarioActualizado.plan);
      console.log('Límite de mensajes:', usuarioActualizado.messagesLimit);
      console.log('Mensajes usados: RESETEADO a 0');
      console.log('==========================================\n');
      
      await prisma.$disconnect();
      process.exit(0);
    }

    // Hashear contraseña
    console.log('⏳ Creando usuario...');
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario
    const usuario = await prisma.user.create({
      data: {
        email: email,
        name: nombre,
        passwordHash: passwordHash,
        plan: plan,
        messagesLimit: mensajesLimite,
        messagesUsed: 0,
        tokensUsed: 0,
        emailVerified: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    });

    console.log('\n==========================================');
    console.log('✅ USUARIO CREADO EXITOSAMENTE');
    console.log('==========================================');
    console.log('Nombre:', usuario.name);
    console.log('Email:', usuario.email);
    console.log('Contraseña temporal:', password);
    console.log('Plan:', usuario.plan);
    console.log('Límite de mensajes:', usuario.messagesLimit);
    console.log('==========================================');
    console.log('\n⚠️  IMPORTANTE: Cambia la contraseña después del primer login');
    console.log('\n🌐 Accede en: http://localhost:3000/login');
    console.log('   (o en tu servidor cuando esté configurado)\n');

  } catch (error) {
    console.error('\n❌ Error al crear usuario:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

crearUsuario();
