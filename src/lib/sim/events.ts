import type { TickContext, SimEventInput } from './types';

export function pushEvent(ctx: TickContext, e: SimEventInput): void {
  ctx.events.push(e);
}
