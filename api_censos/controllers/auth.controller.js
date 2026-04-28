import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import Community from '../models/community.model.js';
import PasswordReset from '../models/passwordReset.model.js';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';

// Generar access token
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
      communityId: user.communityId
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '15m' }
  );
};

// Generar refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario por email
    const user = await User.findOne({ email: email.toLowerCase(), isActive: true });
    if (!user) {
      return res.status(401).json({
        message: 'Credenciales inválidas'
      });
    }

    // Verificar que tenga comunidad asignada
    if (!user.communityId) {
      return res.status(403).json({
        message: 'Usuario sin comunidad asignada. Contacte al administrador.'
      });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        message: 'Credenciales inválidas'
      });
    }

    // Generar tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          communityId: user.communityId
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      message: 'Error al iniciar sesión'
    });
  }
};

/**
 * Registro público de residente
 * El usuario se registra a sí mismo seleccionando una comunidad
 */
export const register = async (req, res) => {
  try {
    const { fullName, documentNumber, email, password, phone, communityCode } = req.body;

    // Validar campos requeridos
    if (!fullName || !documentNumber || !email || !password || !communityCode) {
      return res.status(400).json({
        message: 'Todos los campos son requeridos'
      });
    }

    // Buscar comunidad por código
    const community = await Community.findOne({ code: communityCode, isActive: true });

    if (!community) {
      return res.status(404).json({
        message: 'Código de comunidad inválido'
      });
    }

    // Verificar que no exista usuario con ese email
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      isActive: true
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'Ya existe un usuario con este email'
      });
    }

    // Verificar que no exista usuario con ese documento en la comunidad
    const existingDocument = await User.findOne({
      documentNumber,
      communityId: community._id,
      isActive: true
    });

    if (existingDocument) {
      return res.status(409).json({
        message: 'Ya existe un usuario con este documento en esta comunidad'
      });
    }

    // Hash de contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear usuario sin rol (pendiente de aprobación como residente)
    const user = await User.create({
      fullName,
      documentNumber,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      digitalSignature: req.body.digitalSignature || null,
      role: null,
      communityId: community._id
    });

    // Generar tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          communityId: user.communityId
        },
        accessToken,
        refreshToken
      },
      message: 'Registro exitoso. Un censista te asignará a una vivienda para completar tu registro como residente.'
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      message: 'Error al registrar usuario'
    });
  }
};

/**
 * Refresh de token de acceso
 */
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: 'Refresh token es requerido'
      });
    }

    // Verificar refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Buscar usuario
    const user = await User.findOne({ _id: decoded.userId, isActive: true });
    if (!user) {
      return res.status(401).json({
        message: 'Refresh token inválido'
      });
    }

    // Generar nuevo access token
    const accessToken = generateAccessToken(user);

    res.json({
      success: true,
      data: { accessToken }
    });
  } catch (error) {
    console.error('Error al refrescar token:', error);
    res.status(401).json({
      message: 'Refresh token inválido o expirado'
    });
  }
};

/**
 * Logout (en el cliente se elimina el token)
 */
export const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logout exitoso'
  });
};

/**
 * Obtener información del usuario actual
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-password')
      .populate('communityId', 'neighborhood city code');

    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      message: 'Error al obtener perfil'
    });
  }
};

/**
 * Solicitar recuperación de contraseña
 * Envía email con token de recuperación
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Email es requerido'
      });
    }

    // Buscar usuario
    const user = await User.findOne({ email: email.toLowerCase(), isActive: true });

    if (!user) {
      // No revelar si el usuario existe o no
      return res.json({
        success: true,
        message: 'Si el email está registrado, recibirás instrucciones para restablecer tu contraseña'
      });
    }

    // Generar token único
    const token = uuidv4();

    // Establecer expiración (1 hora)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Guardar token en base de datos
    await PasswordReset.create({
      userId: user._id,
      token,
      expiresAt
    });

    // Configurar transporter de email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // URL de recuperación
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    // Enviar email
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: user.email,
      subject: 'Recuperación de contraseña - Censos Veredales',
      html: `
        <h1>Recuperación de contraseña</h1>
        <p>Hola ${user.fullName},</p>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
      `
    });

    res.json({
      success: true,
      message: 'Si el email está registrado, recibirás instrucciones para restablecer tu contraseña'
    });
  } catch (error) {
    console.error('Error al solicitar recuperación de contraseña:', error);
    res.status(500).json({
      message: 'Error al procesar la solicitud'
    });
  }
};

/**
 * Restablecer contraseña con token
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: 'Token y nueva contraseña son requeridos'
      });
    }

    // Validar longitud de contraseña
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Buscar token válido
    const resetRequest = await PasswordReset.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() }
    }).populate('userId');

    if (!resetRequest) {
      return res.status(400).json({
        message: 'Token inválido o expirado'
      });
    }

    // Hash de nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Actualizar contraseña del usuario
    await User.findByIdAndUpdate(resetRequest.userId._id, {
      password: hashedPassword
    });

    // Marcar token como usado
    resetRequest.used = true;
    await resetRequest.save();

    res.json({
      success: true,
      message: 'Contraseña restablecida exitosamente'
    });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    res.status(500).json({
      message: 'Error al restablecer contraseña'
    });
  }
};
