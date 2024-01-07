import { NS } from "@ns";
import {
  StockInfo,
  available_funds,
  get_stock_info,
  kill_any_other_copies,
  logf,
  tlogf,
} from "./utils";

function score(stock: StockInfo): number {
  return (stock.volatility * (stock.forecast - 0.5)) / stock.spread_vol;
}

function trade(ns: NS): void {
  const stock_info = get_stock_info(ns);
  stock_info.sort((a, b) => score(b) - score(a));

  const max_position_value = 1e20;
  const max_order_value = 1e12;
  const min_order_value = 1e7;
  const commission = 1e5;

  logf(ns, "TICK");
  for (const stock of stock_info) {
    if (stock.forecast < 0.5 && stock.position.long > 0) {
      tlogf(ns, "%j", stock);
      const max_order_size = Math.floor(max_order_value / stock.bid);
      const order_size = Math.min(stock.position.long, max_order_size);
      tlogf(
        ns,
        "sellStock(%s, %d) = %v",
        stock.symbol,
        order_size,
        ns.stock.sellStock(stock.symbol, order_size)
      );
    }
  }

  for (const stock of stock_info) {
    const money_available = available_funds(ns) - commission;
    if (min_order_value > money_available) {
      break;
    }
    if (stock.position.long >= stock.position.max_position) {
      continue;
    }
    if (
      stock.forecast >= 0.55 &&
      stock.spread_vol < 2 &&
      max_position_value - stock.position.long * stock.ask > min_order_value
    ) {
      const max_position = Math.min(
        stock.position.max_position,
        Math.floor(max_position_value / stock.ask)
      );
      const max_order_size = Math.floor(max_order_value / stock.ask);
      const min_order_size = Math.ceil(min_order_value / stock.ask);
      const order_size = Math.min(
        max_position - stock.position.long,
        max_order_size,
        money_available / stock.ask
      );
      logf(ns, "%j", stock);
      if (order_size < min_order_size) {
        tlogf(
          ns,
          "order_size < min_order_size (%d < %d)",
          order_size,
          min_order_size
        );
        continue;
      }
      logf(
        ns,
        "buyStock(%s, %d) = %v",
        stock.symbol,
        order_size,
        ns.stock.buyStock(stock.symbol, order_size)
      );
    }
  }
}

export async function main(ns: NS): Promise<void> {
  ns.enableLog("ALL");
  kill_any_other_copies(ns);

  trade(ns);
  await ns.stock.nextUpdate();
  ns.spawn(ns.getScriptName(), 1, ...ns.args);
}
