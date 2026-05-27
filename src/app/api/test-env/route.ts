import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  const cfEnvKeys = Object.keys((request as any).cf?.env ?? {});
  const globalEnvKeys = Object.keys((globalThis as any).__env__ ?? {});
  const processEnvKeys = Object.keys(process.env ?? {});
  
  return NextResponse.json({
    cfEnvExists: !!(request as any).cf?.env,
    cfEnvKeys,
    globalEnvExists: !!(globalThis as any).__env__,
    globalEnvKeys,
    processEnvKeys,
    nodeEnv: process.env.NODE_ENV,
    hasAdminPassword: !!(
      ((request as any).cf?.env?.ADMIN_PASSWORD) ??
      ((globalThis as any).__env__?.ADMIN_PASSWORD) ??
      (process.env.ADMIN_PASSWORD)
    )
  });
}
