import { MongoClient } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // Разрешить CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Обработка OPTIONS запросов
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') return res.status(405).end();

  const { token } = req.query as { token: string };

  if (!token) {
    return res.status(400).json({ message: 'Токен отсутствует' });
  }

  const client = new MongoClient(process.env.MONGODB_URI as string);

  try {
    await client.connect();
    const db = client.db('Data');

    const user = await db.collection('users').findOneAndUpdate(
      { verificationToken: token },
      { $set: { verified: true }, $unset: { verificationToken: 1 } },
      { returnDocument: 'after' }
    );

    if (!user || !user.value) {
      return res.status(404).json({ message: 'Неверный токен подтверждения' });
    }

    res.redirect('/auth/login?confirmed=1');
  } catch (error: unknown) {
    res.status(500).json({ message: 'Ошибка подтверждения' });
  } finally {
    await client.close();
  }
};