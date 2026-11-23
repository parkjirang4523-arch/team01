/**
 * quiz.js - 엄마표 생각을 깨우는 4단계 발문법 퀘스트 모듈
 * (관찰하기 → 예측하기 → 검증하기 → 원리 심화)
 */

class InquiryQuest {
  constructor() {
    this.currentStep = 1; // 1 ~ 4
    this.currentShape = 'cube';
    this.userAnswers = {};

    this.quests = {
      cube: [
        {
          step: 1,
          tag: '1단계: 관찰하기 (Observation)',
          question: '정육면체의 펼쳐진 전개도를 보세요. 모양이 똑같은 정사각형 면은 모두 몇 개일까요?',
          hint: '💡 팁: 평면 전개도에 펼쳐진 정사각형 조각들을 하나씩 세어보세요.',
          options: [
            { text: '4개', correct: false, desc: '다시 세어보세요! 옆면뿐만 아니라 밑면과 뚜껑도 있어요.' },
            { text: '6개', correct: true, desc: '정답입니다! 정육면체는 6개의 합동인 정사각형 면으로 둘러싸인 입체도형입니다.' },
            { text: '8개', correct: false, desc: '8개는 꼭짓점의 개수입니다. 면은 6개예요!' }
          ]
        },
        {
          step: 2,
          tag: '2단계: 예측하기 (Prediction)',
          question: '끈을 아래로 잡아당겨 3D 상자를 만들 때, 바닥의 [1번 밑면]과 마주보며 평행하게 닫히는 면은 몇 번일까요?',
          hint: '💡 팁: 1번 면을 바닥에 두고 2, 3, 4, 5번이 90°로 일어섰을 때 가장 마지막에 덮이는 면을 상상해보세요.',
          options: [
            { text: '2번 앞면', correct: false, desc: '2번 면은 1번 면과 직각(90°)으로 만나 수직인 옆면이 됩니다.' },
            { text: '4번 왼쪽면', correct: false, desc: '4번 면 역시 1번 밑면과 수직으로 만나는 옆면입니다.' },
            { text: '6번 윗면(뚜껑)', correct: true, desc: '정답입니다! 5번 면을 타고 올라가 마지막에 1번 밑면과 평행하게 마주보며 뚜껑 역할을 합니다.' }
          ]
        },
        {
          step: 3,
          tag: '3단계: 검증하기 (Verification)',
          question: '이제 3D 시뮬레이터에서 끈을 직접 당겨보세요! 정말로 1번 면과 6번 면이 마주보며 평행하게 서있나요?',
          hint: '💡 팁: 하단의 [직접 당겨서 눈으로 확인하기] 버튼을 눌러 확인해보세요.',
          interactiveAction: 'test_fold',
          options: [
            { text: '네! 1번 밑면과 6번 뚜껑이 정확히 평행하게 마주봅니다.', correct: true, desc: '맞습니다! 손으로 당기며 머릿속 상상이 현실 입체와 일치함을 직접 확인했습니다.' },
            { text: '아니요, 서로 수직으로 만나요.', correct: false, desc: '끈을 끝까지 100% 당겨보세요! 6번 면이 상자 맨 위에서 1번 바닥과 평행을 이룹니다.' }
          ]
        },
        {
          step: 4,
          tag: '4단계: 원리 심화 (Deepen Principle)',
          question: '정육면체 상자가 완성되었을 때, 평면에서 떨어져 있던 모서리들은 어떻게 되었을까요?',
          hint: '💡 팁: 실이 구멍을 통과하며 당겨질 때 모서리의 변화를 관찰하세요.',
          options: [
            { text: '실의 장력(Tension)으로 인해 서로 다른 모서리 2개가 정확히 맞닿아 1개의 모서리가 됩니다.', correct: true, desc: '완벽합니다! 입체도형의 모서리는 전개도의 두 변이 만나서 생기며, 총 12개의 모서리가 완성됩니다.' },
            { text: '모서리가 서로 겹쳐서 면 속으로 사라집니다.', correct: false, desc: '모서리는 사라지지 않고 두 변이 만나 입체의 뼈대를 이룹니다.' }
          ]
        }
      ],

      cylinder: [
        {
          step: 1,
          tag: '1단계: 관찰하기 (Observation)',
          question: '원기둥 전개도를 펼치면 어떤 평면도형들이 보이나요?',
          hint: '💡 팁: 옆면의 모양과 위아래 밑면의 모양을 각각 관찰해보세요.',
          options: [
            { text: '직사각형 1개와 서로 같은 크기의 원 2개', correct: true, desc: '정답입니다! 원기둥은 1개의 직사각형 옆면과 2개의 합동인 원 밑면으로 구성됩니다.' },
            { text: '정사각형 2개와 원 1개', correct: false, desc: '원기둥의 밑면은 2개이고 옆면은 직사각형입니다.' }
          ]
        },
        {
          step: 2,
          tag: '2단계: 예측하기 (Prediction)',
          question: '밑면 원의 반지름(r)이 2.5cm일 때, 직사각형 종이가 둥글게 말려 원을 감싸려면 옆면의 가로 길이는 최소 얼마여야 할까요? (원주율 π = 3.14)',
          hint: '💡 팁: 직사각형의 가로는 원의 둘레(원주 = 2 × π × r)와 같아야 합니다.',
          options: [
            { text: '약 15.7cm', correct: true, desc: '정답입니다! 2 × 3.14 × 2.5cm = 15.7cm가 되어 원을 빈틈없이 감싸게 됩니다.' },
            { text: '약 5.0cm', correct: false, desc: '5.0cm는 지름의 길이입니다. 둘레는 지름에 원주율(3.14)을 곱해야 합니다.' }
          ]
        },
        {
          step: 3,
          tag: '3단계: 검증하기 (Verification)',
          question: '실제 교구 도안에서는 가로를 15.7cm가 아니라 18cm로 제작했습니다. 왜 약 2.3cm를 더 길게 만들었을까요?',
          hint: '💡 팁: 실을 세게 잡아당겼을 때 종이 양 끝이 벌어지는 현상을 방지하기 위해서입니다.',
          options: [
            { text: '실을 당겼을 때 양 끝이 안정적으로 겹쳐지도록 하는 겹침 여유분(Overhang)입니다.', correct: true, desc: '놀라운 통찰력입니다! 겹침 여유분이 있어야 테이프 없이도 단단한 원통 형태가 유지됩니다.' },
            { text: '그냥 종이가 남아서 길게 자른 것입니다.', correct: false, desc: '정밀한 교구 설계를 위해 수학적 원주에 겹침 여유분을 과학적으로 계산한 것입니다.' }
          ]
        },
        {
          step: 4,
          tag: '4단계: 원리 심화 (Deepen Principle)',
          question: '초등 6학년 2학기 원기둥 단원의 핵심! 직사각형을 둥글게 말았을 때 생기는 옆면은 평면일까요, 곡면일까요?',
          hint: '💡 팁: 손으로 만져보았을 때 둥글게 굽어있는 면을 무엇이라 부를까요?',
          options: [
            { text: '둥글게 굽은 곡면입니다.', correct: true, desc: '정답입니다! 평면 직사각형이 공간 상에서 휘어져 곡면이 되는 것이 회전체와 원기둥의 신비입니다.' },
            { text: '여전히 평평한 평면입니다.', correct: false, desc: '입체로 둥글게 말리면 평면이 아니라 곡면이 됩니다.' }
          ]
        }
      ]
    };
  }

  init() {
    this.render();
    this.bindEvents();
  }

  setShape(shapeId) {
    if (this.quests[shapeId]) {
      this.currentShape = shapeId;
    } else {
      this.currentShape = 'cube';
    }
    this.currentStep = 1;
    this.render();
  }

  render() {
    const questList = this.quests[this.currentShape] || this.quests.cube;
    const currentQ = questList[this.currentStep - 1];

    // 스텝 도트 업데이트
    for (let i = 1; i <= 4; i++) {
      const dot = document.getElementById(`q-dot-${i}`);
      if (!dot) continue;
      dot.className = 'quest-step-dot';
      if (i === this.currentStep) {
        dot.classList.add('active');
      } else if (i < this.currentStep) {
        dot.classList.add('completed');
        dot.innerHTML = '✓';
      } else {
        dot.innerHTML = String(i);
      }
    }

    // 텍스트 업데이트
    const stepTag = document.getElementById('quest-step-tag');
    const shapeName = document.getElementById('quest-shape-name');
    const questionEl = document.getElementById('quest-question');
    const hintEl = document.getElementById('quest-hint');
    const optionsContainer = document.getElementById('quest-options');
    const feedbackEl = document.getElementById('quest-feedback');
    const prevBtn = document.getElementById('btn-prev-quest');
    const nextBtn = document.getElementById('btn-next-quest');

    if (stepTag) stepTag.innerText = currentQ.tag;
    if (shapeName) shapeName.innerText = `대상 도형: ${this.getShapeName(this.currentShape)}`;
    if (questionEl) questionEl.innerText = currentQ.question;
    if (hintEl) hintEl.innerText = currentQ.hint;

    // 피드백 초기화
    if (feedbackEl) {
      feedbackEl.className = 'p-4 rounded-xl text-xs font-medium hidden';
      feedbackEl.innerHTML = '';
    }

    // 버튼 활성/비활성
    if (prevBtn) prevBtn.disabled = this.currentStep === 1;
    if (nextBtn) {
      nextBtn.innerText = this.currentStep === 4 ? '퀘스트 완료! 다시 풀기 ↺' : '다음 단계로 →';
    }

    // 보기 버튼 렌더링
    if (optionsContainer) {
      optionsContainer.innerHTML = '';
      currentQ.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'w-full text-left p-4 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50/50 hover:border-indigo-300 transition-all flex items-start gap-3 group';
        btn.innerHTML = `
          <span class="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white text-slate-700 text-xs font-bold flex items-center justify-center shrink-0 transition">
            ${idx + 1}
          </span>
          <span class="text-xs font-semibold text-slate-800 leading-relaxed">${opt.text}</span>
        `;
        btn.onclick = () => this.selectOption(opt, btn);
        optionsContainer.appendChild(btn);
      });

      // 3단계일 경우 직접 시뮬레이터 당기기 버튼 추가
      if (currentQ.interactiveAction === 'test_fold') {
        const actionBtn = document.createElement('button');
        actionBtn.className = 'col-span-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-sm';
        actionBtn.innerHTML = '<span>🧵 3D 시뮬레이터에서 끈 당겨 확인해보기</span>';
        actionBtn.onclick = () => {
          if (window.switchTab) window.switchTab('sim');
          if (window.simulator) {
            window.simulator.updateFolding(1.0);
            const slider = document.getElementById('pull-slider');
            if (slider) slider.value = 100;
          }
        };
        optionsContainer.appendChild(actionBtn);
      }
    }
  }

  selectOption(opt, btnEl) {
    const feedbackEl = document.getElementById('quest-feedback');
    if (!feedbackEl) return;

    feedbackEl.classList.remove('hidden');

    if (opt.correct) {
      feedbackEl.className = 'p-4 rounded-xl text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800';
      feedbackEl.innerHTML = `
        <div class="flex items-center gap-2 mb-1">
          <span class="text-base">🎉</span>
          <span class="font-bold text-emerald-900">정답입니다!</span>
        </div>
        <p>${opt.desc}</p>
      `;
      if (window.soundFx) window.soundFx.playCorrect();
    } else {
      feedbackEl.className = 'p-4 rounded-xl text-xs font-medium bg-rose-50 border border-rose-200 text-rose-800';
      feedbackEl.innerHTML = `
        <div class="flex items-center gap-2 mb-1">
          <span class="text-base">🤔</span>
          <span class="font-bold text-rose-900">다시 생각해보세요!</span>
        </div>
        <p>${opt.desc}</p>
      `;
      if (window.soundFx) window.soundFx.playWrong();
    }
  }

  next() {
    if (this.currentStep < 4) {
      this.currentStep++;
      this.render();
    } else {
      // 리셋
      this.currentStep = 1;
      this.render();
    }
  }

  prev() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.render();
    }
  }

  getShapeName(id) {
    const names = {
      cube: '정육면체 (Cube)',
      cylinder: '원기둥 (Cylinder)',
      triangular_prism: '삼각기둥 (Triangular Prism)',
      pyramid: '별 피라미드 (Star Pyramid)'
    };
    return names[id] || '정육면체';
  }

  bindEvents() {
    const nextBtn = document.getElementById('btn-next-quest');
    const prevBtn = document.getElementById('btn-prev-quest');

    if (nextBtn) nextBtn.onclick = () => this.next();
    if (prevBtn) prevBtn.onclick = () => this.prev();
  }
}

window.InquiryQuest = InquiryQuest;
