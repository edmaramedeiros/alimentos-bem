// Importa o catalogo real de produtos da Edmara Medeiros (cardapio 2024) via API.
// Uso: node import-products.js
// Variaveis de ambiente opcionais (defaults apontam para o backend local em dev):
//   API_BASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD

const API = process.env.API_BASE_URL ?? 'http://localhost:8080';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@edmaramedeiros.com.br';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'troque-esta-senha-123';

const PRODUCTS_BY_CATEGORY = {
  Castanhas: [
    ['Castanha do Pará Inteira', '1kg', 105],
    ['Castanha do Pará Inteira', '500g', 55],
    ['Castanha de Caju W1 Torrada', '1kg', 120],
    ['Castanha de Caju W1 Torrada', '500g', 63],
    ['Castanha de Caju W1 Crua', '1kg', 120],
    ['Castanha de Caju W1 Crua', '500g', 63],
    ['Castanha de Caju Caramelizada', '500g', 45],
    ['Castanha de Caju Caramelizada', '250g', 25],
    ['Nozes Mariposa', '500g', 60],
    ['Amêndoas Crua', '1kg', 118],
    ['Amêndoas Crua', '500g', 63],
    ['Amêndoas Laminadas', '500g', 70],
    ['Amêndoas Laminadas', '250g', 37],
    ['Amêndoas Defumada', '500g', 65],
    ['Amêndoas Defumada', '250g', 35],
    ['Farinha de Amêndoas', '1kg', 135],
    ['Farinha de Amêndoas', '500g', 70],
    ['Mix de Castanhas (Pará, Caju, Amêndoas & Nozes)', '500g', 65, 'Pará, caju, amêndoas & nozes'],
    ['Combo 1kg Caju + 1kg Pará', '2kg', 220],
    ['Mix de Castanhas (Pará & Caju)', '500g', 65, 'Pará & caju'],
    ['Pistache', '250g', 85],
  ],
  Sementes: [
    ['Semente de Abóbora Crua sem Casca', '500g', 55],
    ['Semente de Abóbora Crua sem Casca', '250g', 30],
    ['Pepita de Girassol Crua sem Casca', '500g', 13],
    ['Pepita de Girassol Crua sem Casca', '250g', 7],
    ['Gergelim Branco sem Casca', '250g', 10],
    ['Gergelim Preto sem Casca', '250g', 12],
    ['Linhaça Dourada', '500g', 10],
    ['Linhaça Dourada', '250g', 6],
    ['Chia', '500g', 20],
    ['Chia', '250g', 11],
  ],
  'Frutas Secas': [
    ['Uva Passa', '500g', 20],
    ['Tâmara Jumbo', '500g', 40],
    ['Damasco', '500g', 85],
    ['Ameixa Preta sem Caroço', '500g', 35],
    ['Cranberry', '500g', 35],
    ['Blueberry', '250g', 60],
    ['Cereja', '250g', 30],
    ['Morango', '250g', 35],
    ['Mix de Frutas', '500g', 50, 'Uva passa, damasco, tâmara jumbo, ameixa & cranberry'],
    ['Mix de Frutas Vermelhas', '400g', 60, 'Morango, cereja, blueberry & cranberry'],
  ],
  Granola: [
    ['Granola Premium', '500g', 55, 'Caju, cranberry & canela'],
    ['Granola Low', '500g', 65, 'Chia & cranberry'],
    ['Granola Salgada', '250g', 45, 'Levedura nutricional & ervas'],
  ],
  Outros: [
    ['Leite de Coco em Pó Vegan', '1kg', 70],
    ['Leite de Coco em Pó Vegan', '500g', 37],
    ['Xylitol Cristal', '1kg', 55],
    ['Xylitol Cristal', '500g', 30],
    ['Coco em Flocos sem Açúcar', '500g', 30],
    ['Coco em Flocos sem Açúcar', '250g', 17],
    ['Levedura Nutricional', '250g', 45],
    ['Aveia em Flocos Fino sem Glúten', '500g', 10],
  ],
};

async function main() {
  const loginRes = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!loginRes.ok) {
    throw new Error(`Login falhou: ${loginRes.status} ${await loginRes.text()}`);
  }
  const { token } = await loginRes.json();
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  let created = 0;
  let failed = 0;

  for (const [category, products] of Object.entries(PRODUCTS_BY_CATEGORY)) {
    for (const [name, unit, price, description] of products) {
      const res = await fetch(`${API}/api/products`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name, unit, price, category, description: description ?? null }),
      });
      if (res.ok) {
        created++;
      } else {
        failed++;
        console.error(`FALHOU: ${name} (${unit}) -> ${res.status} ${await res.text()}`);
      }
    }
  }

  console.log(`Produtos criados: ${created}, falhas: ${failed}`);
}

main().catch((err) => {
  console.error('ERRO GERAL', err);
  process.exit(1);
});
