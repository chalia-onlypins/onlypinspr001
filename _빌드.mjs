// 온리핀스 상품권 4종 랜딩 — 자기완결 HTML 빌드
// .src.html 의 {{LOGO}} 를 로고 PNG 의 data URI 로 치환한다.
// 사용: node _빌드.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
// 배포본 이름은 index.html — GitHub Pages 루트에서 바로 열리게 한다.
const SRC = join(here, '온리핀스_상품권4종_간편결제_20260908.src.html');
const OUT = join(here, 'index.html');
const LOGO = join(here, '..', '광고카드_20260811', '_로고', 'favicon-onlipinsAPP_V2.0.png');

// ⚠️ 앱 캡처는 마스킹된 _웹용/ 만 쓴다. 원본(15·16)에는 실명·번호가 찍혀 있다.
const SHOTS = join(here, '..', '온리핀스가입순서', '_웹용');

const logoUri = 'data:image/png;base64,' + readFileSync(LOGO).toString('base64');
let html = readFileSync(SRC, 'utf8');

if (!html.includes('{{LOGO}}')) throw new Error('{{LOGO}} 자리표시자를 못 찾았다 — .src.html 을 확인할 것');
html = html.replaceAll('{{LOGO}}', logoUri);

// {{IMG:NN}} → _웹용/NN.jpg 의 data URI
let imgBytes = 0;
html = html.replace(/\{\{IMG:(\d{2})\}\}/g, (_, n) => {
  const buf = readFileSync(join(SHOTS, `${n}.jpg`));
  imgBytes += buf.length;
  return 'data:image/jpeg;base64,' + buf.toString('base64');
});

writeFileSync(OUT, html, 'utf8');
console.log('생성:', OUT);
console.log('크기:', (Buffer.byteLength(html) / 1024).toFixed(1), 'KB');
console.log('로고:', (logoUri.length / 1024).toFixed(1), 'KB (data URI)');
console.log('앱 캡처:', (imgBytes / 1024).toFixed(1), 'KB (원본 합계)');
console.log('남은 자리표시자:', (html.match(/\{\{[A-Z]+(:\d+)?\}\}/g) || []).length);
