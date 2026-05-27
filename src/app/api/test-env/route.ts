import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET(request: Request) {
  let cfCtxEnvKeys: string[] = [];
  let hasAdminPassword = false;
  let cfCtxEnvExists = false;

  try {
    const cfEnv = getRequestContext().env;
    cfCtxEnvExists = !!cfEnv;
    cfCtxEnvKeys = Object.keys(cfEnv ?? {});
    hasAdminPassword = !!cfEnv.ADMIN_PASSWORD;
  } catch (err: any) {
    // Silent
  }

  const processEnvKeys = Object.keys(process.env ?? {});
  
  return NextResponse.json({
    cfCtxEnvExists,
    cfCtxEnvKeys,
    processEnvKeys,
    nodeEnv: process.env.NODE_ENV,
    hasAdminPassword: hasAdminPassword || !!process.env.ADMIN_PASSWORD
  });
}
