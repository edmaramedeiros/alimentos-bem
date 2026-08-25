// Depois do `expo export --platform web` (que sempre gera saída "plana" em dist/,
// mesmo com experiments.baseUrl configurado - baseUrl só prefixa os hrefs/assets
// gerados, não muda a estrutura de pastas), este script:
//   1) move tudo que acabou de ser exportado para dist/sistema/
//   2) copia a landing page estática (apps/mobile/landing/) para a raiz de dist/
// Resultado: "/" serve a landing page, "/sistema" serve o app (Expo Router).
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const distDir = path.join(root, 'dist');
const landingDir = path.join(root, 'landing');
const sistemaDir = path.join(distDir, 'sistema');

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

if (!fs.existsSync(distDir)) {
  throw new Error(`dist/ não encontrado em ${distDir} - rode "expo export --platform web" antes.`);
}

// Copia (em vez de renomear) porque no Windows fs.renameSync falha com EPERM
// para algumas pastas exportadas pelo Expo (ex.: "(app)", por causa dos parênteses).
fs.mkdirSync(sistemaDir, { recursive: true });
for (const entry of fs.readdirSync(distDir)) {
  if (entry === 'sistema') continue;
  const src = path.join(distDir, entry);
  copyRecursive(src, path.join(sistemaDir, entry));
  fs.rmSync(src, { recursive: true, force: true });
}

for (const entry of fs.readdirSync(landingDir)) {
  copyRecursive(path.join(landingDir, entry), path.join(distDir, entry));
}

console.log('Landing page copiada para a raiz de dist/; app movido para dist/sistema/');
