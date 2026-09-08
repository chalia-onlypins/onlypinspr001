// og 카드 렌더 — _og카드.src.html(아트보드) → og-image.png (1200x630)
// 사용: node _og렌더.cjs
// ⚠️ 만든 뒤 실제 픽셀 규격을 되읽어 검증한다("생성 성공" 로그는 규격을 보장하지 않는다)
const fs = require('fs');
const path = require('path');
const puppeteer = require('G:/wisekss.ai/Antigravity/node_modules/puppeteer');

const here = __dirname;
const SRC = path.join(here, '_og카드.src.html');
const OUT = path.join(here, 'og-image.png');
const LOGO = path.join(here, '..', '광고카드_20260811', '_로고', 'favicon-onlipinsAPP_V2.0.png');

const W = 1200, H = 630;

(async () => {
  let html = fs.readFileSync(SRC, 'utf8');
  html = html.replaceAll('{{LOGO}}',
    'data:image/png;base64,' + fs.readFileSync(LOGO).toString('base64'));

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: W, height: H } });
  } finally { await browser.close(); }

  // 규격 검증 — PNG IHDR 에서 실제 폭·높이를 읽는다
  const buf = fs.readFileSync(OUT);
  const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
  console.log('생성:', OUT);
  console.log('규격:', `${w}x${h}`, w === W && h === H ? '✅ 일치' : `🔴 어긋남 (기대 ${W}x${H})`);
  console.log('용량:', (buf.length / 1024).toFixed(1), 'KB');
  if (w !== W || h !== H) process.exit(1);
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
