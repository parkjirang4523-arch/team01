/**
 * generator.js - 인쇄용 A4 실측 벡터(SVG) 전개도 생성기
 * 타공 구멍 위치, 접는 선(점선), 자르는 선(실선), 실 꿰는 경로 자동 렌더링
 */

class NetGenerator {
  constructor(previewContainerId) {
    this.container = document.getElementById(previewContainerId);
    this.currentShape = 'cube';
    this.showStrings = true;
    this.showMeasures = true;
  }

  init() {
    this.render();
    this.bindEvents();
  }

  setShape(shapeId) {
    this.currentShape = shapeId;
    this.render();
  }

  setOptions(showStrings, showMeasures) {
    this.showStrings = showStrings;
    this.showMeasures = showMeasures;
    this.render();
  }

  generateSVG() {
    const width = 600;
    const height = 500;

    let content = '';
    switch (this.currentShape) {
      case 'cube':
        content = this.generateCubeSVG();
        break;
      case 'triangular_prism':
        content = this.generatePrismSVG();
        break;
      case 'cylinder':
        content = this.generateCylinderSVG();
        break;
      case 'pyramid':
        content = this.generatePyramidSVG();
        break;
      default:
        content = this.generateCubeSVG();
    }

    const svg = `
      <svg id="net-svg-root" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="w-full h-full max-h-[400px]">
        <defs>
          <style>
            .cut-line { stroke: #0f172a; stroke-width: 2; fill: #f8fafc; }
            .fold-line { stroke: #64748b; stroke-width: 1.5; stroke-dasharray: 6 4; fill: none; }
            .string-line { stroke: #3b82f6; stroke-width: 2; stroke-dasharray: 4 3; fill: none; }
            .punch-hole { fill: #fee2e2; stroke: #ef4444; stroke-width: 1.8; }
            .measure-text { font-family: 'Noto Sans KR', sans-serif; font-size: 11px; fill: #475569; }
            .title-text { font-family: 'Noto Sans KR', sans-serif; font-weight: bold; font-size: 14px; fill: #1e293b; }
          </style>
          <!-- 화살표 마커 -->
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
          </marker>
        </defs>

        <!-- 도안 헤더 정보 -->
        <text x="30" y="32" class="title-text">매직 스트링 전개도: ${this.getShapeTitle(this.currentShape)}</text>
        <text x="30" y="50" class="measure-text">✂️ 실선: 자르는 선 | --- 점선: 접는 선(칼등 자국) | 🔴 빨간 원: 1구 펀치 타공점</text>

        <!-- 메인 전개도 형상 -->
        <g transform="translate(0, 30)">
          ${content}
        </g>
      </svg>
    `;

    return svg;
  }

  // 1. 정육면체 십자형 도안
  generateCubeSVG() {
    const s = 65; // 정사각형 한 변 (px)
    const cx = 300;
    const cy = 230;

    // 면 위치: Base(0,0), Top(0, -s), Bottom(0, s), Left(-s, 0), Right(s, 0), Lid(2s, 0)
    let paths = `
      <!-- 6개 정사각형 외곽선 (자르는 선) -->
      <polygon points="
        ${cx - s/2},${cy - 3*s/2} ${cx + s/2},${cy - 3*s/2}
        ${cx + s/2},${cy - s/2} ${cx + 5*s/2},${cy - s/2}
        ${cx + 5*s/2},${cy + s/2} ${cx + s/2},${cy + s/2}
        ${cx + s/2},${cy + 3*s/2} ${cx - s/2},${cy + 3*s/2}
        ${cx - s/2},${cy + s/2} ${cx - 3*s/2},${cy + s/2}
        ${cx - 3*s/2},${cy - s/2} ${cx - s/2},${cy - s/2}
      " class="cut-line" />

      <!-- 접는 선 (점선) -->
      <line x1="${cx - s/2}" y1="${cy - s/2}" x2="${cx + s/2}" y2="${cy - s/2}" class="fold-line" />
      <line x1="${cx - s/2}" y1="${cy + s/2}" x2="${cx + s/2}" y2="${cy + s/2}" class="fold-line" />
      <line x1="${cx - s/2}" y1="${cy - s/2}" x2="${cx - s/2}" y2="${cy + s/2}" class="fold-line" />
      <line x1="${cx + s/2}" y1="${cy - s/2}" x2="${cx + s/2}" y2="${cy + s/2}" class="fold-line" />
      <line x1="${cx + 3*s/2}" y1="${cy - s/2}" x2="${cx + 3*s/2}" y2="${cy + s/2}" class="fold-line" />

      <!-- 면 번호 레이블 -->
      <text x="${cx}" y="${cy + 5}" class="measure-text" font-weight="bold" text-anchor="middle">1. 밑면</text>
      <text x="${cx}" y="${cy - s + 5}" class="measure-text" text-anchor="middle">2. 뒷면</text>
      <text x="${cx}" y="${cy + s + 5}" class="measure-text" text-anchor="middle">3. 앞면</text>
      <text x="${cx - s}" y="${cy + 5}" class="measure-text" text-anchor="middle">4. 왼쪽면</text>
      <text x="${cx + s}" y="${cy + 5}" class="measure-text" text-anchor="middle">5. 오른쪽면</text>
      <text x="${cx + 2*s}" y="${cy + 5}" class="measure-text" text-anchor="middle">6. 뚜껑</text>

      <!-- 타공 구멍 위치 (꼭짓점 안쪽 5mm) -->
      <circle cx="${cx - s/2 + 8}" cy="${cy - 3*s/2 + 8}" r="5" class="punch-hole" />
      <circle cx="${cx + s/2 - 8}" cy="${cy - 3*s/2 + 8}" r="5" class="punch-hole" />
      <circle cx="${cx - 3*s/2 + 8}" cy="${cy - s/2 + 8}" r="5" class="punch-hole" />
      <circle cx="${cx - 3*s/2 + 8}" cy="${cy + s/2 - 8}" r="5" class="punch-hole" />
      <circle cx="${cx - s/2 + 8}" cy="${cy + 3*s/2 - 8}" r="5" class="punch-hole" />
      <circle cx="${cx + s/2 - 8}" cy="${cy + 3*s/2 - 8}" r="5" class="punch-hole" />
    `;

    if (this.showStrings) {
      paths += `
        <!-- 실 꿰기 경로 -->
        <path d="M ${cx},${cy + 3*s/2 + 30} L ${cx - s/2 + 8},${cy + 3*s/2 - 8} L ${cx - 3*s/2 + 8},${cy + s/2 - 8} L ${cx - 3*s/2 + 8},${cy - s/2 + 8} L ${cx - s/2 + 8},${cy - 3*s/2 + 8} L ${cx + s/2 - 8},${cy - 3*s/2 + 8}" class="string-line" />
      `;
    }

    if (this.showMeasures) {
      paths += `
        <!-- 치수선 -->
        <line x1="${cx - s/2}" y1="${cy + 3*s/2 + 15}" x2="${cx + s/2}" y2="${cy + 3*s/2 + 15}" stroke="#94a3b8" marker-start="url(#arrow)" marker-end="url(#arrow)" />
        <text x="${cx}" y="${cy + 3*s/2 + 28}" class="measure-text" text-anchor="middle">가로 5.0 cm</text>
      `;
    }

    return paths;
  }

  // 2. 삼각기둥 도안
  generatePrismSVG() {
    const w = 70; // 밑면 폭
    const l = 160; // 기둥 높이
    const triH = 60.6; // 삼각형 높이
    const cx = 300;
    const cy = 230;

    let paths = `
      <!-- 3개 직사각형 외곽선 -->
      <polygon points="
        ${cx - 3*w/2},${cy - l/2} ${cx + 3*w/2},${cy - l/2}
        ${cx + 3*w/2},${cy + l/2} ${cx + w/2},${cy + l/2}
        ${cx},${cy + l/2 + triH} ${cx - w/2},${cy + l/2}
        ${cx - 3*w/2},${cy + l/2}
      " class="cut-line" />

      <!-- 상단 삼각형 뚜껑 -->
      <polygon points="${cx - w/2},${cy - l/2} ${cx},${cy - l/2 - triH} ${cx + w/2},${cy - l/2}" class="cut-line" />

      <!-- 접는 선 (점선) -->
      <line x1="${cx - w/2}" y1="${cy - l/2}" x2="${cx - w/2}" y2="${cy + l/2}" class="fold-line" />
      <line x1="${cx + w/2}" y1="${cy - l/2}" x2="${cx + w/2}" y2="${cy + l/2}" class="fold-line" />
      <line x1="${cx - w/2}" y1="${cy - l/2}" x2="${cx + w/2}" y2="${cy - l/2}" class="fold-line" />
      <line x1="${cx - w/2}" y1="${cy + l/2}" x2="${cx + w/2}" y2="${cy + l/2}" class="fold-line" />

      <!-- 레이블 -->
      <text x="${cx}" y="${cy}" class="measure-text" font-weight="bold" text-anchor="middle">1. 밑면 직사각형</text>
      <text x="${cx - w}" y="${cy}" class="measure-text" text-anchor="middle">2. 왼쪽면</text>
      <text x="${cx + w}" y="${cy}" class="measure-text" text-anchor="middle">3. 오른쪽면</text>
      <text x="${cx}" y="${cy - l/2 - 20}" class="measure-text" text-anchor="middle">4. 앞 삼각밑면</text>
      <text x="${cx}" y="${cy + l/2 + 25}" class="measure-text" text-anchor="middle">5. 뒤 삼각밑면</text>

      <!-- 타공 구멍 -->
      <circle cx="${cx}" cy="${cy - l/2 - triH + 12}" r="5" class="punch-hole" />
      <circle cx="${cx}" cy="${cy + l/2 + triH - 12}" r="5" class="punch-hole" />
      <circle cx="${cx - 3*w/2 + 10}" cy="${cy}" r="5" class="punch-hole" />
      <circle cx="${cx + 3*w/2 - 10}" cy="${cy}" r="5" class="punch-hole" />
    `;

    return paths;
  }

  // 3. 원기둥 도안 (PDF 실측: r=2.5cm, 가로 18cm, 세로 9cm 반영)
  generateCylinderSVG() {
    const W = 280; // 18cm 비례 스케일 (px)
    const H = 140; // 9cm 비례 스케일 (px)
    const R = 39;  // 2.5cm 원 반지름 (px)
    const cx = 300;
    const cy = 230;

    let paths = `
      <!-- 옆면 직사각형 -->
      <rect x="${cx - W/2}" y="${cy - H/2}" width="${W}" height="${H}" class="cut-line" />

      <!-- 상/하단 원형 밑면 -->
      <circle cx="${cx - 40}" cy="${cy - H/2 - R}" r="${R}" class="cut-line" />
      <circle cx="${cx + 40}" cy="${cy + H/2 + R}" r="${R}" class="cut-line" />

      <!-- 접는 선 (원 맞닿는 모서리) -->
      <line x1="${cx - 40 - 15}" y1="${cy - H/2}" x2="${cx - 40 + 15}" y2="${cy - H/2}" class="fold-line" />
      <line x1="${cx + 40 - 15}" y1="${cy + H/2}" x2="${cx + 40 + 15}" y2="${cy + H/2}" class="fold-line" />

      <!-- 겹침 여유분 (Overhang 2.3cm) 안내 점선 -->
      <line x1="${cx + W/2 - 35}" y1="${cy - H/2}" x2="${cx + W/2 - 35}" y2="${cy + H/2}" stroke="#f59e0b" stroke-dasharray="4 3" stroke-width="1.5" />
      <text x="${cx + W/2 - 18}" y="${cy}" class="measure-text" font-size="10" fill="#d97706" text-anchor="middle">겹침 여유분<br>(2.3cm)</text>

      <!-- 레이블 -->
      <text x="${cx - 40}" y="${cy - H/2 - R + 4}" class="measure-text" font-weight="bold" text-anchor="middle">밑면 원 (r=2.5cm)</text>
      <text x="${cx - 30}" y="${cy}" class="measure-text" font-weight="bold" text-anchor="middle">옆면 직사각형 (18cm × 9cm)</text>
      <text x="${cx + 40}" y="${cy + H/2 + R + 4}" class="measure-text" font-weight="bold" text-anchor="middle">밑면 원 (r=2.5cm)</text>

      <!-- 타공 구멍 -->
      <circle cx="${cx - 40}" cy="${cy - H/2 - R}" r="5" class="punch-hole" />
      <circle cx="${cx + 40}" cy="${cy + H/2 + R}" r="5" class="punch-hole" />
      <circle cx="${cx - W/2 + 10}" cy="${cy}" r="5" class="punch-hole" />
      <circle cx="${cx + W/2 - 45}" cy="${cy}" r="5" class="punch-hole" />
    `;

    if (this.showMeasures) {
      paths += `
        <line x1="${cx - W/2}" y1="${cy + H/2 + 20}" x2="${cx + W/2}" y2="${cy + H/2 + 20}" stroke="#94a3b8" marker-start="url(#arrow)" marker-end="url(#arrow)" />
        <text x="${cx}" y="${cy + H/2 + 35}" class="measure-text" text-anchor="middle">전체 가로: 18 cm (원주 15.7cm + 겹침 2.3cm)</text>
      `;
    }

    return paths;
  }

  // 4. 별 피라미드 (사각/별 텐트)
  generatePyramidSVG() {
    const s = 90; // 중앙 사각형 한 변
    const h = 100; // 날개 삼각형 높이
    const cx = 300;
    const cy = 230;

    let paths = `
      <!-- 중앙 사각형 + 4개 삼각형 날개 (별 형태 외곽선) -->
      <polygon points="
        ${cx - s/2},${cy - s/2} ${cx},${cy - s/2 - h} ${cx + s/2},${cy - s/2}
        ${cx + s/2 + h},${cy} ${cx + s/2},${cy + s/2}
        ${cx},${cy + s/2 + h} ${cx - s/2},${cy + s/2}
        ${cx - s/2 - h},${cy}
      " class="cut-line" />

      <!-- 중앙 밑면 사각형 접는 선 -->
      <rect x="${cx - s/2}" y="${cy - s/2}" width="${s}" height="${s}" class="fold-line" />

      <!-- 레이블 -->
      <text x="${cx}" y="${cy + 5}" class="measure-text" font-weight="bold" text-anchor="middle">밑면 (정사각형)</text>
      <text x="${cx}" y="${cy - s/2 - 30}" class="measure-text" text-anchor="middle">옆면 1</text>
      <text x="${cx}" y="${cy + s/2 + 40}" class="measure-text" text-anchor="middle">옆면 2</text>
      <text x="${cx - s/2 - 35}" y="${cy + 5}" class="measure-text" text-anchor="middle">옆면 3</text>
      <text x="${cx + s/2 + 35}" y="${cy + 5}" class="measure-text" text-anchor="middle">옆면 4</text>

      <!-- 꼭짓점 집중 타공 구멍 -->
      <circle cx="${cx}" cy="${cy - s/2 - h + 15}" r="5" class="punch-hole" />
      <circle cx="${cx}" cy="${cy + s/2 + h - 15}" r="5" class="punch-hole" />
      <circle cx="${cx - s/2 - h + 15}" cy="${cy}" r="5" class="punch-hole" />
      <circle cx="${cx + s/2 + h - 15}" cy="${cy}" r="5" class="punch-hole" />
    `;

    return paths;
  }

  getShapeTitle(id) {
    const titles = {
      cube: '정육면체 (초등 5-2)',
      triangular_prism: '삼각기둥 (초등 6-1)',
      cylinder: '원기둥 (초등 6-2)',
      pyramid: '별 피라미드 (초등 6-1)'
    };
    return titles[id] || '전개도';
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = this.generateSVG();
  }

  // A4 원클릭 인쇄 실행
  printNet() {
    const printArea = document.getElementById('print-area');
    if (!printArea) return;

    printArea.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="font-size: 22px; font-weight: bold; margin: 0 0 6px 0;">매직 스트링 입체도형 A4 제작 도안</h1>
        <p style="font-size: 13px; color: #475569; margin: 0;">도형: ${this.getShapeTitle(this.currentShape)} | 두꺼운 도화지(180g 이상)에 100% 비율로 인쇄하세요.</p>
      </div>
      <div style="display: flex; justify-content: center; align-items: center; width: 100%;">
        ${this.generateSVG()}
      </div>
      <div style="margin-top: 30px; font-size: 12px; color: #64748b; border-top: 1px solid #cbd5e1; padding-top: 15px;">
        <strong>[만드는 법]</strong><br>
        1. 실선을 따라 자른 뒤, 점선에 칼등이나 볼펜으로 자국(오시)을 냅니다.<br>
        2. 빨간색 원(타공점) 뒷면에 투명 테이프를 덧댄 뒤 1구 펀치로 뚫습니다.<br>
        3. 실을 꿰고 바닥을 스케치북에 고정한 뒤 PULL 손잡이를 당깁니다!
      </div>
    `;

    window.print();
  }

  // SVG 파일 다운로드
  downloadSVG() {
    const svgData = this.generateSVG();
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `magic_string_${this.currentShape}_net.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  bindEvents() {
    const select = document.getElementById('diy-shape-select');
    const chkStrings = document.getElementById('chk-show-strings');
    const chkMeasures = document.getElementById('chk-show-measures');
    const printBtn = document.getElementById('btn-print-net');
    const downloadBtn = document.getElementById('btn-download-svg');

    if (select) {
      select.onchange = (e) => this.setShape(e.target.value);
    }
    if (chkStrings) {
      chkStrings.onchange = (e) => this.setOptions(e.target.checked, this.showMeasures);
    }
    if (chkMeasures) {
      chkMeasures.onchange = (e) => this.setOptions(this.showStrings, e.target.checked);
    }
    if (printBtn) {
      printBtn.onclick = () => this.printNet();
    }
    if (downloadBtn) {
      downloadBtn.onclick = () => this.downloadSVG();
    }
  }
}

window.NetGenerator = NetGenerator;
