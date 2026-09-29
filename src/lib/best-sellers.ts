import type { Product } from "./data";

export type ProductSale = {
  productSlug: string;
  quantity: number;
};

export function rankProductsBySales(sales: ProductSale[], productList: Product[]): Product[] {
  const totals = sales.reduce<Map<string, number>>((result, sale) => {
    result.set(sale.productSlug, (result.get(sale.productSlug) ?? 0) + sale.quantity);
    return result;
  }, new Map());

  if (totals.size === 0) return productList;

  return [...productList].sort((left, right) => {
    const salesDifference = (totals.get(right.slug) ?? 0) - (totals.get(left.slug) ?? 0);
    return salesDifference || productList.indexOf(left) - productList.indexOf(right);
  });
}
