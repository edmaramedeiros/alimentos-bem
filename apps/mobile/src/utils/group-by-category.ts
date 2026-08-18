import type { Product } from '@/api/types';

export const NO_CATEGORY_LABEL = 'Sem categoria';

export function groupByCategory(products: Product[]): { title: string; data: Product[] }[] {
  const groups = new Map<string, Product[]>();
  for (const product of products) {
    const key = product.category ?? NO_CATEGORY_LABEL;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(product);
  }
  return Array.from(groups.entries())
    .sort(([a], [b]) => {
      if (a === NO_CATEGORY_LABEL) return 1;
      if (b === NO_CATEGORY_LABEL) return -1;
      return a.localeCompare(b, 'pt-BR');
    })
    .map(([title, data]) => ({ title, data }));
}
