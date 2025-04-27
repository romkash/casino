import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Установка CORS заголовков
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

  // Обработка OPTIONS запросов для CORS
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204 });
  }

  return response;
}

export const config = {
  matcher: '/api/:path*', // Применять middleware только к API-роутам
};