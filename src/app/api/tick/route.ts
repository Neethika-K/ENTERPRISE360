import { NextResponse } from 'next/server';
import { runTick } from '@/lib/sim/engine';

export async function POST() {
  const result = await runTick();
  return NextResponse.json(result);
}
