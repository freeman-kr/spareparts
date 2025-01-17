import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 인증되지 않은 사용자는 로그인 페이지로
  if (!session) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // admin 전용 페이지 체크
  const adminOnlyPaths = ['/admin', '/reports'];
  if (adminOnlyPaths.some(path => req.nextUrl.pathname.startsWith(path))) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (userData?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/parts/:path*',
    '/requests/:path*',
    '/users/:path*',
    '/admin/:path*',
    '/reports/:path*'
  ]
};