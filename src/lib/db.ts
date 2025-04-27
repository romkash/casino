import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Пожалуйста, добавьте MONGODB_URI в .env.local');
}

export async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  await mongoose.connect(MONGODB_URI);
  console.log('Подключение к базе данных успешно');
}