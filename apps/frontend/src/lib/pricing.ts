export const DEFAULT_PROFIT_PERCENT = 30;

/**
 * Unit price for a catalog product at the quotation's profit %: a markup on
 * the product's cost price. Products without a cost price keep their catalog
 * selling price, since a markup on zero would quote them for free.
 */
export function productPriceWithProfit(
  product: { costPrice?: number; sellingPrice?: number },
  profitPercent: number,
): number {
  const cost = product.costPrice || 0;
  if (cost <= 0) return product.sellingPrice || 0;
  // Three decimals: KWD, the default currency, is priced in fils.
  return Math.round(cost * (1 + profitPercent / 100) * 1000) / 1000;
}

/**
 * Re-prices every catalog product line in `items` at `profitPercent`. Lines
 * that are not catalog products, or whose product has no cost price, are
 * returned unchanged.
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
    if (!product || !(product.costPrice > 0)) return item;
    return { ...item, unitPrice: productPriceWithProfit(product, profitPercent) };
  });
}
