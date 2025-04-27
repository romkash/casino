import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../../../lib/db';
import {UserModel} from '../../../models/User';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    if (!body) {
      return NextResponse.json(
        { error: 'Тело запроса пусто' },
        { status: 400 }
      );
    }

    const { email, password } = JSON.parse(body);
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    await connectToDatabase();

    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь с таким email не найден' },
        { status: 404 }
      );
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json(
        { error: 'Неверный пароль' },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { email: user.email }, 
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    return NextResponse.json(
      { message: 'Вход выполнен успешно', token },
      { status: 200 }
    );
  } catch (error) {
    console.error('Ошибка API логина:', error);
    return NextResponse.json(
      { error: 'Произошла ошибка сервера' },
      { status: 500 }
    );
  }
}