export const DEFAULT_PROFIT_PERCENT = 30;

/**
 * Unit price for a catalog product at the quotation's profit %: the profit is
 * added on top of the product's catalog selling price.
 */
export function productPriceWithProfit(
  product: { sellingPrice?: number },
  profitPercent: number,
): number {
  const base = product.sellingPrice || 0;
  // Three decimals: KWD, the default currency, is priced in fils.
  return Math.round(base * (1 + profitPercent / 100) * 1000) / 1000;
}

/**
 * Re-prices every catalog product line in `items` at `profitPercent`. Lines
 * that are not catalog products are returned unchanged.
 */
export function applyProfitToItems(
  items: any[],
  products: any[],
  profitPercent: number,
): any[] {
  const productById = new Map(products.map((p) => [p.id, p]));
  return items.map((item) => {
    if (item.itemType !== "PRODUCT" || !item.productId) return item;
    const product = productById.get(item.productId);
    if (!product) return item;
    return { ...item, unitPrice: productPriceWithProfit(product, profitPercent) };
  });
}
