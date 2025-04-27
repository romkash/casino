import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '../../../lib/db';
import {UserModel} from '../../../models/User';

export async function POST(request: Request) {
  try {
    console.log('Получен запрос на регистрацию');

    // Извлекаем данные из запроса
    const { name, email, password } = await request.json();

    // Проверяем наличие всех обязательных полей
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Все поля обязательны' },
        { status: 400 }
      );
    }

    // Приводим email к единому формату
    const normalizedEmail = email.trim().toLowerCase();

    // Подключаемся к базе данных
    await connectToDatabase();
    console.log('Подключение к базе данных успешно');

    // Проверяем, существует ли пользователь с таким email
    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      console.error('Ошибка: email уже зарегистрирован');
      return NextResponse.json(
        { error: 'Email уже зарегистрирован' },
        { status: 400 }
      );
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем нового пользователя
    const newUser = new UserModel({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      tickets: [], // Пустой массив для купленных билетов
    });

    // Сохраняем пользователя в базе данных
    const savedUser = await newUser.save();
    console.log('Пользователь успешно сохранен:', savedUser);

    // Отправляем ответ об успешной регистрации
    return NextResponse.json(
      { message: 'Регистрация успешна', user: { id: savedUser._id, email: savedUser.email } },
      { status: 201 }
    );
  } catch (error: unknown) {
    // Явное приведение типа
    if (error instanceof Error) {
      console.error('Ошибка на сервере:', error.message);
      return NextResponse.json(
        { error: 'Произошла ошибка сервера', details: error.message },
        { status: 500 }
      );
    } else {
      console.error('Неизвестная ошибка на сервере:', error);
      return NextResponse.json(
        { error: 'Произошла ошибка сервера', details: 'Неизвестная ошибка' },
        { status: 500 }
      );
    }
  }
}