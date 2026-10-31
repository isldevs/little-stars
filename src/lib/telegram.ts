import {config,money} from './config';
import type {Order,ResolvedLine,Totals} from './types';

/** Opens a customer-controlled draft; never sends a Telegram message. */
export function telegramUrl(message?:string):string {
  const url=new URL(`https://t.me/${config.telegramUsername}`);
  if(message?.trim())url.searchParams.set('text',message);
  return url.toString();
}
export function bagTelegramMessage(lines:ResolvedLine[],totals:Totals):string {
  return ["Hi Little Stars! I'd like some help with my shopping bag.",'',...lines.map(line=>`${line.quantity} × ${line.product.name} — ${line.variant.color} / ${line.variant.size}`),'',`Estimated total: ${money(totals.total)} USD`,'This is a demo shopping bag; no payment has been collected.'].join('\n');
}
export function orderTelegramMessage(order:Order):string {
  return [`Hi Little Stars! I have a question about demo order ${order.reference}.`,'',...order.items.map(item=>`${item.quantity} × ${item.name} — ${item.color} / ${item.size}`),'',`Order total: ${money(order.totals.total)} USD`,'This is a demo order; no payment has been collected.'].join('\n');
}
