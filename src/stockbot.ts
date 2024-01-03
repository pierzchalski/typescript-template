import { NS } from "@ns";
import {
  StockInfo,
  get_stock_info,
  kill_any_other_copies,
  tlogf,
} from "./utils";

function score(stock: StockInfo): number {
  return (stock.volatility * (stock.forecast - 0.5)) / 2;
}

function cost_table(
  ns: NS,
  symbol: string,
  iter: number,
  stride: number = 1
): number[] {
  const costs = [];
  for (let i = 1; i <= iter; i++) {
    costs.push(ns.stock.getPurchaseCost(symbol, i * stride, "Long"));
  }
  return costs;
}

function delta_table(input: number[]): number[] {
  const out = [];
  for (let i = 0; i < input.length - 1; i++) {
    out.push(input[i + 1] - input[i]);
  }
  return out;
}

function trade(ns: NS): void {
  const stock_info = get_stock_info(ns);
  stock_info.sort((a, b) => score(b) - score(a));

  const max_position_value = 1e11;
  const max_order_value = 1e10;
  const min_order_value = 1e7;
  const commission = 1e5;
  const money_available = ns.getServerMoneyAvailable("home") - commission;

  tlogf(ns, "TICK");
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
    if (
      stock.forecast >= 0.6 &&
      stock.spread_vol < 2 &&
      max_position_value - stock.position.long * stock.ask > min_order_value
    ) {
      tlogf(ns, "%j", stock);
      const max_position = Math.min(
        stock.position.max_position,
        Math.floor(max_position_value / stock.ask)
      );
      const max_order_size = Math.floor(max_order_value / stock.ask);
      const min_order_size = Math.ceil(min_order_value / stock.ask);
      const order_size = Math.max(
        min_order_size,
        Math.min(
          max_position - stock.position.long,
          max_order_size,
          money_available / stock.ask
        )
      );
      tlogf(
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

  await ns.stock.nextUpdate();
  trade(ns);
  ns.spawn(ns.getScriptName(), 1, ...ns.args);
}
