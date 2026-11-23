/**
 * shapes.js - 4대 입체도형 데이터 및 교과과정 메타데이터
 */

const SHAPES_DATA = {
  cube: {
    id: 'cube',
    title: '정육면체 (Cube)',
    icon: '📦',
    gradeBadge: '초등 5학년 2학기 5단원: 직육면체',
    stats: { faces: 6, edges: 12, vertices: 8 },
    mechanismTitle: '1점 연동 X자 실 꿰기 장력 팝업',
    mechanismDesc: '바닥면을 제외한 4개의 옆면 모서리에 실을 X자로 꿰어, 하단의 PULL 끈을 당기면 4개 옆면이 동시에 90°로 접혀 올라오며 상단 뚜껑이 닫힙니다.',
    curriculumPoints: [
      '<strong>마주보는 면:</strong> 서로 평행하며 크기와 모양이 완벽히 같은 합동입니다.',
      '<strong>만나는 모서리:</strong> 평면에서 떨어져 있던 모서리가 실이 당겨질 때 정확히 맞닿습니다.',
      '<strong>전개도의 규칙:</strong> 접는 선은 점선, 자르는 선은 실선으로 나타냅니다.'
    ],
    mathFormula: null
  },

  triangular_prism: {
    id: 'triangular_prism',
    title: '삼각기둥 (Triangular Prism)',
    icon: '⛺',
    gradeBadge: '초등 6학년 1학기 2단원: 각기둥과 각뿔',
    stats: { faces: 5, edges: 9, vertices: 6 },
    mechanismTitle: '초고속 팝업 텐트 메커니즘',
    mechanismDesc: '하단의 PULL 종이 손잡이를 당기면 직사각형 옆면 3개가 60° 각도로 솟아오르고, 양쪽 삼각형 밑면 2개가 90°로 접혀 순식간에 텐트 모양 삼각기둥이 완성됩니다.',
    curriculumPoints: [
      '<strong>밑면의 성질:</strong> 위아래 2개의 면이 서로 평행하고 합동인 삼각형입니다.',
      '<strong>옆면의 규칙:</strong> 옆면의 개수는 항상 밑면 다각형의 변의 수(3개)와 같고 모두 직사각형입니다.',
      '<strong>이름 짓기:</strong> 각기둥의 이름은 밑면의 모양(삼각형 → 삼각기둥)에 따라 정해집니다.'
    ],
    mathFormula: null
  },

  cylinder: {
    id: 'cylinder',
    title: '원기둥 (Cylinder)',
    icon: '🥫',
    gradeBadge: '초등 6학년 2학기 5단원: 원기둥, 원뿔, 구',
    stats: { faces: '3 (곡면1+원2)', edges: 2, vertices: 0 },
    mechanismTitle: '곡면 롤링(Rolling) 및 겹침 잠금',
    mechanismDesc: '실을 당기면 평면 직사각형 종이가 둥글게 말리면서 2개의 원형 뚜껑과 맞물립니다. 실측 도안 가로(18cm)는 원주(15.7cm)에 2.3cm 겹침 여유분을 두어 벌어지지 않습니다.',
    curriculumPoints: [
      '<strong>전개도 구성:</strong> 직사각형 모양의 옆면 1개와 서로 합동인 원 모양 밑면 2개로 이루어집니다.',
      '<strong>원주 공식과의 일치:</strong> 직사각형 옆면의 가로 길이는 밑면 원의 원주(둘레)와 같아야 합니다.',
      '<strong>공식:</strong> $2 \\times \\pi \\times r = 2 \\times 3.14 \\times 2.5\\text{cm} = 15.7\\text{cm}$'
    ],
    mathFormula: {
      formula: '2 \\times \\pi \\times r = 2 \\times 3.14 \\times 2.5 = 15.7\\text{ cm}',
      detail: '실측 도안 가로(18cm) = 밑면 원주(15.7cm) + 겹침 여유분(2.3cm)'
    }
  },

  pyramid: {
    id: 'pyramid',
    title: '별 피라미드 (Star Pyramid)',
    icon: '🌟',
    gradeBadge: '초등 6학년 1학기 2단원: 각기둥과 각뿔',
    stats: { faces: 5, edges: 8, vertices: 5 },
    mechanismTitle: '방사형 꼭짓점 집중 타공 메커니즘',
    mechanismDesc: '중앙 사각형 밑면 외곽으로 펼쳐진 별(Star) 모양 삼각형 날개 꼭짓점에 실을 둘러 꿰었습니다. 실을 위/아래로 당기면 모든 꼭짓점이 한 점(각뿔의 꼭짓점)으로 모입니다.',
    curriculumPoints: [
      '<strong>기둥과 뿔의 차이:</strong> 기둥은 밑면이 2개이지만, 뿔은 밑면이 1개입니다.',
      '<strong>옆면의 특징:</strong> 모든 옆면이 꼭짓점 한 점으로 모이는 삼각형 모양입니다.',
      '<strong>각뿔의 꼭짓점:</strong> 옆면인 삼각형들이 모두 만나는 한 점을 각뿔의 꼭짓점이라 부릅니다.'
    ],
    mathFormula: null
  }
};

window.SHAPES_DATA = SHAPES_DATA;
