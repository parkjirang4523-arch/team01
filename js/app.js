/**
 * app.js - 매직 스트링 입체도형 3D 통합 메인 컨트롤러
 * 3D 시뮬레이터, 4단계 퀘스트, 도안 생성기, 사운드, UI 인터랙션 통합 제어
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. 인스턴스 초기화
  window.simulator = new MagicStringSimulator('canvas-container');
  window.quiz = new InquiryQuest();
  window.generator = new NetGenerator('svg-preview-container');

  window.quiz.init();
  window.generator.init();

  // 2. 글로벌 탭 전환 함수
  window.switchTab = function(tabName) {
    const tabs = ['sim', 'quiz', 'diy'];
    tabs.forEach(t => {
      const section = document.getElementById(`section-${t}`);
      const btn = document.getElementById(`nav-${t}`);
      if (t === tabName) {
        if (section) section.classList.remove('hidden');
        if (btn) {
          btn.className = 'tab-btn active px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5';
        }
      } else {
        if (section) section.classList.add('hidden');
        if (btn) {
          btn.className = 'tab-btn px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 text-slate-600 hover:bg-slate-100';
        }
      }
    });

    // 3D 캔버스 리사이즈 갱신
    if (tabName === 'sim' && window.simulator) {
      setTimeout(() => window.simulator.onWindowResize(), 50);
    }
  };

  // 3. 도형 변경 처리 함수
  function selectShape(shapeId) {
    // 도형 버튼 스타일 갱신
    document.querySelectorAll('.shape-btn').forEach(btn => {
      if (btn.dataset.shape === shapeId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // 3D 시뮬레이터 도형 로드
    if (window.simulator) {
      window.simulator.loadShape(shapeId);
    }

    // 슬라이더 및 접힘 뱃지 초기화
    const slider = document.getElementById('pull-slider');
    if (slider) slider.value = 0;
    const badge = document.getElementById('folding-percent-badge');
    if (badge) badge.innerText = '접힘: 0% (평면 전개도)';

    // 우측 정보 패널 업데이트
    updateShapeInfoPanel(shapeId);

    // 퀘스트 모듈 및 도안 생성기 동기화
    if (window.quiz) window.quiz.setShape(shapeId);
    if (window.generator) window.generator.setShape(shapeId);

    // DIY 선택 셀렉트 동기화
    const diySelect = document.getElementById('diy-shape-select');
    if (diySelect) diySelect.value = shapeId;
  }

  // 우측 정보 패널 렌더링
  function updateShapeInfoPanel(shapeId) {
    const data = window.SHAPES_DATA[shapeId] || window.SHAPES_DATA.cube;

    const titleEl = document.getElementById('shape-title');
    const badgeEl = document.getElementById('shape-grade-badge');
    const iconEl = document.getElementById('shape-icon');
    const statFaces = document.getElementById('stat-faces');
    const statEdges = document.getElementById('stat-edges');
    const statVertices = document.getElementById('stat-vertices');
    const mechTitle = document.getElementById('mechanism-title');
    const mechDesc = document.getElementById('mechanism-desc');
    const pointsList = document.getElementById('curriculum-points');
    const formulaBox = document.getElementById('math-formula-box');
    const katexEl = document.getElementById('katex-formula');
    const formulaDesc = document.getElementById('formula-explanation');

    if (titleEl) titleEl.innerText = data.title;
    if (badgeEl) badgeEl.innerText = data.gradeBadge;
    if (iconEl) iconEl.innerText = data.icon;
    if (statFaces) statFaces.innerText = `${data.stats.faces}${typeof data.stats.faces === 'number' ? '개' : ''}`;
    if (statEdges) statEdges.innerText = `${data.stats.edges}개`;
    if (statVertices) statVertices.innerText = `${data.stats.vertices}개`;
    if (mechTitle) mechTitle.innerText = data.mechanismTitle;
    if (mechDesc) mechDesc.innerText = data.mechanismDesc;

    if (pointsList) {
      pointsList.innerHTML = data.curriculumPoints.map(p => `<li>${p}</li>`).join('');
    }

    // 수학 공식 박스 (원기둥 등)
    if (formulaBox) {
      if (data.mathFormula) {
        formulaBox.classList.remove('hidden');
        if (katexEl) {
          if (typeof katex !== 'undefined') {
            try {
              katex.render(data.mathFormula.formula, katexEl, { throwOnError: false });
            } catch (e) {
              katexEl.innerText = data.mathFormula.formula;
            }
          } else {
            katexEl.innerText = data.mathFormula.formula;
          }
        }
        if (formulaDesc) formulaDesc.innerText = data.mathFormula.detail;
      } else {
        formulaBox.classList.add('hidden');
      }
    }
  }

  // 4. 이벤트 바인딩
  // 도형 선택 버튼 클릭
  document.querySelectorAll('.shape-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const shape = btn.dataset.shape;
      selectShape(shape);
    });
  });

  // PULL 슬라이더 조작
  const pullSlider = document.getElementById('pull-slider');
  const percentBadge = document.getElementById('folding-percent-badge');

  if (pullSlider) {
    pullSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      const ratio = val / 100;
      if (window.simulator) {
        window.simulator._hasUserInteracted = true;
        window.simulator.isAutoPlaying = false;
        window.simulator.updateFolding(ratio);
      }
      if (percentBadge) {
        const pct = Math.round(val);
        percentBadge.innerText = `접힘: ${pct}% ${pct === 0 ? '(평면 전개도)' : pct === 100 ? '(3D 완성!)' : ''}`;
      }
    });
  }

  // 비주얼 PULL 손잡이 탭 드래그/클릭 인터랙션
  const pullTab = document.getElementById('pull-tab');
  if (pullTab) {
    let isDragging = false;
    let startY = 0;
    let startVal = 0;

    const onStart = (clientY) => {
      isDragging = true;
      startY = clientY;
      startVal = parseFloat(pullSlider.value || 0);
      pullTab.classList.add('scale-105');
      if (window.soundFx) window.soundFx.init();
    };

    const onMove = (clientY) => {
      if (!isDragging) return;
      const deltaY = clientY - startY;
      // 아래로 당기면(deltaY > 0) 접힘 진행도 증가
      const newVal = Math.max(0, Math.min(100, startVal + deltaY * 0.7));
      pullSlider.value = newVal;
      pullSlider.dispatchEvent(new Event('input'));
    };

    const onEnd = () => {
      if (isDragging) {
        isDragging = false;
        pullTab.classList.remove('scale-105');
      }
    };

    pullTab.addEventListener('mousedown', (e) => onStart(e.clientY));
    window.addEventListener('mousemove', (e) => onMove(e.clientY));
    window.addEventListener('mouseup', onEnd);

    pullTab.addEventListener('touchstart', (e) => onStart(e.touches[0].clientY), { passive: true });
    window.addEventListener('touchmove', (e) => onMove(e.touches[0].clientY), { passive: true });
    window.addEventListener('touchend', onEnd);

    // 손잡이 클릭 시 토글 (0% -> 100% 또는 100% -> 0%)
    pullTab.addEventListener('click', () => {
      const current = parseFloat(pullSlider.value || 0);
      const target = current > 50 ? 0 : 100;
      animateSliderTo(target);
    });
  }

  // 슬라이더 부드러운 애니메이션 이동 헬퍼
  function animateSliderTo(targetVal) {
    if (!pullSlider) return;
    const startVal = parseFloat(pullSlider.value || 0);
    const duration = 600; // ms
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // easeInOutCubic
      const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      const currentVal = startVal + (targetVal - startVal) * ease;

      pullSlider.value = currentVal;
      pullSlider.dispatchEvent(new Event('input'));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }

  // 자동 접기/펼치기 버튼
  const btnAuto = document.getElementById('btn-auto-toggle');
  const autoIcon = document.getElementById('auto-play-icon');
  const autoText = document.getElementById('auto-play-text');

  if (btnAuto) {
    btnAuto.addEventListener('click', () => {
      if (window.simulator) {
        const isPlaying = window.simulator.toggleAutoPlay();
        if (autoIcon) autoIcon.innerText = isPlaying ? '⏸' : '▶';
        if (autoText) autoText.innerText = isPlaying ? '일시 정지' : '자동 접기/펼치기';
      }
    });
  }

  // 완전 펼치기(리셋) 버튼
  const btnResetFold = document.getElementById('btn-reset-fold');
  if (btnResetFold) {
    btnResetFold.addEventListener('click', () => {
      if (window.simulator) window.simulator.isAutoPlaying = false;
      animateSliderTo(0);
    });
  }

  // 투시 / 속 보이기 버튼
  const btnViewMode = document.getElementById('view-mode-toggle');
  const viewModeLabel = document.getElementById('view-mode-label');
  if (btnViewMode) {
    btnViewMode.addEventListener('click', () => {
      if (window.simulator) {
        const isWire = window.simulator.toggleWireframe();
        if (viewModeLabel) {
          viewModeLabel.innerText = isWire ? '일반 겉면 보기' : '속 보이기 (투시)';
        }
      }
    });
  }

  // 카메라 시점 초기화
  const btnResetCam = document.getElementById('reset-cam-btn');
  if (btnResetCam) {
    btnResetCam.addEventListener('click', () => {
      if (window.simulator) window.simulator.resetCamera();
    });
  }

  // 사운드 토글 버튼
  const btnAudio = document.getElementById('audio-toggle-btn');
  const audioIcon = document.getElementById('audio-icon');
  if (btnAudio) {
    btnAudio.addEventListener('click', () => {
      if (window.soundFx) {
        const isUnmuted = window.soundFx.toggleMute();
        if (audioIcon) audioIcon.innerText = isUnmuted ? '🔊' : '🔇';
      }
    });
  }

  // 초기 상태 로드
  selectShape('cube');
});
