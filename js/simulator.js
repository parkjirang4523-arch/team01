/**
 * simulator.js - Three.js 기반 매직 스트링 3D 전개도 팝업 시뮬레이터
 * 4대 도형(정육면체, 삼각기둥, 원기둥, 별 피라미드)의 실시간 접힘 및 실(String) 물리 시각화
 */

class MagicStringSimulator {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.currentShape = 'cube';
    this.progress = 0; // 0.0 ~ 1.0
    this.isWireframe = false;
    this.isAutoPlaying = false;
    this.autoPlayDir = 1;
    this.meshesGroup = new THREE.Group();
    this.stringsGroup = new THREE.Group();
    this.shapeObjects = {}; // 각 도형별 파츠 참조
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.init();
  }

  init() {
    if (!this.container) return;

    // 1. Scene 생성
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a); // Slate-900

    // 2. Camera 생성
    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 500;
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.resetCamera();

    // 3. Renderer 생성
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // 4. OrbitControls 생성
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxPolarAngle = Math.PI / 2 + 0.1; // 바닥 아래로 과도하게 내려가지 않도록 제한
      this.controls.minDistance = 2;
      this.controls.maxDistance = 20;
    }

    // 5. Lighting 설정
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight1.position.set(6, 12, 8);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 1024;
    dirLight1.shadow.mapSize.height = 1024;
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x818cf8, 0.4);
    dirLight2.position.set(-6, -4, -6);
    this.scene.add(dirLight2);

    // 바닥 격자 & 그림자 받침대
    const grid = new THREE.GridHelper(12, 24, 0x4f46e5, 0x1e293b);
    grid.position.y = -0.01;
    this.scene.add(grid);

    const shadowPlaneGeo = new THREE.PlaneGeometry(12, 12);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.3 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.015;
    shadowPlane.receiveShadow = true;
    this.scene.add(shadowPlane);

    // 메인 그룹 등록
    this.scene.add(this.meshesGroup);
    this.scene.add(this.stringsGroup);

    // 리사이즈 이벤트
    window.addEventListener('resize', () => this.onWindowResize());

    // 클릭 인터랙션
    this.renderer.domElement.addEventListener('pointerdown', (e) => this.onPointerDown(e));

    // 기본 도형 생성
    this.loadShape('cube');

    // 렌더 루프 시작
    this.animate();
  }

  resetCamera() {
    this.camera.position.set(4.5, 4.2, 5.8);
    this.camera.lookAt(0, 0.7, 0);
    if (this.controls) {
      this.controls.target.set(0, 0.7, 0);
      this.controls.update();
    }
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  // 텍스처 생성 (도형 면 번호 및 레이블 렌더링)
  createFaceTexture(number, label, bgColor = '#3b82f6', textColor = '#ffffff') {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // 배경
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 256, 256);

    // 테두리
    ctx.lineWidth = 10;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.strokeRect(5, 5, 246, 246);

    // 내부 점선 테두리
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 8]);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.strokeRect(18, 18, 220, 220);
    ctx.setLineDash([]);

    // 번호
    ctx.fillStyle = textColor;
    ctx.font = 'bold 90px "Noto Sans KR", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(number), 128, 115);

    // 라벨 (예: "밑면", "옆면 1")
    if (label) {
      ctx.font = 'bold 24px "Noto Sans KR", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText(label, 128, 185);
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  createMaterial(number, label, colorHex, opacity = 1.0) {
    const texture = this.createFaceTexture(number, label, colorHex);
    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.35,
      metalness: 0.1,
      side: THREE.DoubleSide,
      transparent: opacity < 1.0,
      opacity: opacity,
      wireframe: this.isWireframe
    });
  }

  clearShape() {
    while (this.meshesGroup.children.length > 0) {
      const obj = this.meshesGroup.children[0];
      this.meshesGroup.remove(obj);
    }
    while (this.stringsGroup.children.length > 0) {
      const obj = this.stringsGroup.children[0];
      this.stringsGroup.remove(obj);
    }
    this.shapeObjects = {};
  }

  loadShape(shapeId) {
    this.currentShape = shapeId;
    this.clearShape();
    this.progress = 0;

    switch (shapeId) {
      case 'cube':
        this.buildCube();
        break;
      case 'triangular_prism':
        this.buildTriangularPrism();
        break;
      case 'cylinder':
        this.buildCylinder();
        break;
      case 'pyramid':
        this.buildStarPyramid();
        break;
      default:
        this.buildCube();
    }

    this.updateFolding(0);
  }

  /* ==========================================================================
     도형 1: 정육면체 (Cube - Latin Cross Net)
     ========================================================================== */
  buildCube() {
    const s = 1.6; // 한 변의 길이
    const half = s / 2;
    const geom = new THREE.PlaneGeometry(s, s);

    // 기본 색상 팔레트
    const colors = ['#6366f1', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

    // 1. 밑면 (Base) - 바닥 고정
    const baseMat = this.createMaterial('1', '밑면 (바닥)', colors[0]);
    const baseMesh = new THREE.Mesh(geom, baseMat);
    baseMesh.rotation.x = -Math.PI / 2;
    baseMesh.position.set(0, 0.005, 0);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    this.meshesGroup.add(baseMesh);

    // 2. 앞면 (Front Face) - Hinge at z = +half
    const frontPivot = new THREE.Group();
    frontPivot.position.set(0, 0, half);
    const frontMat = this.createMaterial('2', '앞면', colors[1]);
    const frontMesh = new THREE.Mesh(geom, frontMat);
    frontMesh.rotation.x = -Math.PI / 2;
    frontMesh.position.set(0, 0, half);
    frontMesh.castShadow = true;
    frontPivot.add(frontMesh);
    this.meshesGroup.add(frontPivot);

    // 3. 뒷면 (Back Face) - Hinge at z = -half
    const backPivot = new THREE.Group();
    backPivot.position.set(0, 0, -half);
    const backMat = this.createMaterial('3', '뒷면', colors[2]);
    const backMesh = new THREE.Mesh(geom, backMat);
    backMesh.rotation.x = -Math.PI / 2;
    backMesh.position.set(0, 0, -half);
    backMesh.castShadow = true;
    backPivot.add(backMesh);
    this.meshesGroup.add(backPivot);

    // 4. 왼쪽면 (Left Face) - Hinge at x = -half
    const leftPivot = new THREE.Group();
    leftPivot.position.set(-half, 0, 0);
    const leftMat = this.createMaterial('4', '왼쪽면', colors[3]);
    const leftMesh = new THREE.Mesh(geom, leftMat);
    leftMesh.rotation.x = -Math.PI / 2;
    leftMesh.position.set(-half, 0, 0);
    leftMesh.castShadow = true;
    leftPivot.add(leftMesh);
    this.meshesGroup.add(leftPivot);

    // 5. 오른쪽면 (Right Face) - Hinge at x = +half
    const rightPivot = new THREE.Group();
    rightPivot.position.set(half, 0, 0);
    const rightMat = this.createMaterial('5', '오른쪽면', colors[4]);
    const rightMesh = new THREE.Mesh(geom, rightMat);
    rightMesh.rotation.x = -Math.PI / 2;
    rightMesh.position.set(half, 0, 0);
    rightMesh.castShadow = true;
    rightPivot.add(rightMesh);
    this.meshesGroup.add(rightPivot);

    // 6. 윗면 (Top Face / 뚜껑) - 오른쪽면 끝에 경첩 (Hinge at local x = s)
    const topPivot = new THREE.Group();
    topPivot.position.set(s, 0, 0); // local to rightMesh center, but we place at edge
    const topMat = this.createMaterial('6', '윗면 (뚜껑)', colors[5]);
    const topMesh = new THREE.Mesh(geom, topMat);
    topMesh.rotation.x = -Math.PI / 2;
    topMesh.position.set(half, 0, 0);
    topMesh.castShadow = true;
    topPivot.add(topMesh);
    rightMesh.add(topPivot);

    // 실(String) 라인 생성 (구멍들을 관통하여 하단으로 연결되는 끈)
    const stringMat = new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 3 });
    const stringGeo = new THREE.BufferGeometry();
    const stringLine = new THREE.Line(stringGeo, stringMat);
    this.stringsGroup.add(stringLine);

    this.shapeObjects = {
      type: 'cube',
      s,
      frontPivot,
      backPivot,
      leftPivot,
      rightPivot,
      topPivot,
      meshes: [baseMesh, frontMesh, backMesh, leftMesh, rightMesh, topMesh],
      stringLine
    };
  }

  /* ==========================================================================
     도형 2: 삼각기둥 (Triangular Prism)
     ========================================================================== */
  buildTriangularPrism() {
    const w = 1.8; // 밑면 정삼각형 한 변의 길이
    const l = 2.4; // 기둥의 높이(길이)
    const h = w * (Math.sqrt(3) / 2); // 정삼각형의 높이
    const halfW = w / 2;
    const halfL = l / 2;

    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

    // 1. 바닥 직사각형 면 (Base)
    const rectGeo = new THREE.PlaneGeometry(w, l);
    const baseMat = this.createMaterial('1', '밑면 직사각형', colors[0]);
    const baseMesh = new THREE.Mesh(rectGeo, baseMat);
    baseMesh.rotation.x = -Math.PI / 2;
    baseMesh.position.set(0, 0.005, 0);
    baseMesh.castShadow = true;
    this.meshesGroup.add(baseMesh);

    // 2. 왼쪽 직사각형 옆면 (Left Flap)
    const leftPivot = new THREE.Group();
    leftPivot.position.set(-halfW, 0, 0);
    const leftMat = this.createMaterial('2', '왼쪽 옆면', colors[1]);
    const leftMesh = new THREE.Mesh(rectGeo, leftMat);
    leftMesh.rotation.x = -Math.PI / 2;
    leftMesh.position.set(-halfW, 0, 0);
    leftMesh.castShadow = true;
    leftPivot.add(leftMesh);
    this.meshesGroup.add(leftPivot);

    // 3. 오른쪽 직사각형 옆면 (Right Flap)
    const rightPivot = new THREE.Group();
    rightPivot.position.set(halfW, 0, 0);
    const rightMat = this.createMaterial('3', '오른쪽 옆면', colors[2]);
    const rightMesh = new THREE.Mesh(rectGeo, rightMat);
    rightMesh.rotation.x = -Math.PI / 2;
    rightMesh.position.set(halfW, 0, 0);
    rightMesh.castShadow = true;
    rightPivot.add(rightMesh);
    this.meshesGroup.add(rightPivot);

    // 4 & 5. 앞뒤 삼각형 밑면 (Triangle Caps)
    const triShape = new THREE.Shape();
    triShape.moveTo(-halfW, 0);
    triShape.lineTo(halfW, 0);
    triShape.lineTo(0, h);
    triShape.closePath();
    const triGeo = new THREE.ShapeGeometry(triShape);

    // 앞쪽 삼각형 Hinge at z = +halfL
    const frontPivot = new THREE.Group();
    frontPivot.position.set(0, 0, halfL);
    const frontMat = this.createMaterial('4', '삼각 밑면 (앞)', colors[3]);
    const frontMesh = new THREE.Mesh(triGeo, frontMat);
    frontMesh.rotation.x = -Math.PI / 2;
    frontMesh.castShadow = true;
    frontPivot.add(frontMesh);
    this.meshesGroup.add(frontPivot);

    // 뒤쪽 삼각형 Hinge at z = -halfL
    const backPivot = new THREE.Group();
    backPivot.position.set(0, 0, -halfL);
    const backMat = this.createMaterial('5', '삼각 밑면 (뒤)', colors[4]);
    const backMesh = new THREE.Mesh(triGeo, backMat);
    backMesh.rotation.x = Math.PI / 2;
    backMesh.rotation.z = Math.PI;
    backMesh.castShadow = true;
    backPivot.add(backMesh);
    this.meshesGroup.add(backPivot);

    // 실 라인
    const stringMat = new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 3 });
    const stringGeo = new THREE.BufferGeometry();
    const stringLine = new THREE.Line(stringGeo, stringMat);
    this.stringsGroup.add(stringLine);

    this.shapeObjects = {
      type: 'triangular_prism',
      w, l, h,
      leftPivot, rightPivot, frontPivot, backPivot,
      meshes: [baseMesh, leftMesh, rightMesh, frontMesh, backMesh],
      stringLine
    };
  }

  /* ==========================================================================
     도형 3: 원기둥 (Cylinder - Rolling Curvature Sheet + 2 Lids)
     ========================================================================== */
  buildCylinder() {
    const R = 0.9;
    const H = 2.2;
    const C = 2 * Math.PI * R; // 약 5.65
    const segments = 48; // 부드러운 롤링 곡면

    // 직사각형 옆면 (세분화된 메쉬로 롤링 변형)
    const sheetGeo = new THREE.PlaneGeometry(C, H, segments, 1);
    const sheetMat = this.createMaterial('1', '원기둥 옆면 (곡면)', '#ec4899');
    sheetMat.side = THREE.DoubleSide;
    const sheetMesh = new THREE.Mesh(sheetGeo, sheetMat);
    sheetMesh.rotation.x = -Math.PI / 2;
    sheetMesh.position.set(0, 0.005, 0);
    sheetMesh.castShadow = true;
    this.meshesGroup.add(sheetMesh);

    // 상단/하단 원형 뚜껑
    const circleGeo = new THREE.CircleGeometry(R, 36);
    
    // 상단 뚜껑 (Hinge at z = +H/2)
    const topPivot = new THREE.Group();
    topPivot.position.set(0, 0, H / 2);
    const topMat = this.createMaterial('2', '밑면 원 (상단)', '#3b82f6');
    const topMesh = new THREE.Mesh(circleGeo, topMat);
    topMesh.rotation.x = -Math.PI / 2;
    topMesh.position.set(0, 0, R); // flat 일 때 전개도 상에서 옆면에 붙어있음
    topMesh.castShadow = true;
    topPivot.add(topMesh);
    this.meshesGroup.add(topPivot);

    // 하단 뚜껑 (Hinge at z = -H/2)
    const bottomPivot = new THREE.Group();
    bottomPivot.position.set(0, 0, -H / 2);
    const bottomMat = this.createMaterial('3', '밑면 원 (하단)', '#8b5cf6');
    const bottomMesh = new THREE.Mesh(circleGeo, bottomMat);
    bottomMesh.rotation.x = -Math.PI / 2;
    bottomMesh.position.set(0, 0, -R);
    bottomMesh.castShadow = true;
    bottomPivot.add(bottomMesh);
    this.meshesGroup.add(bottomPivot);

    // 실 라인
    const stringMat = new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 3 });
    const stringGeo = new THREE.BufferGeometry();
    const stringLine = new THREE.Line(stringGeo, stringMat);
    this.stringsGroup.add(stringLine);

    this.shapeObjects = {
      type: 'cylinder',
      R, H, C,
      sheetMesh,
      sheetGeoOrig: sheetGeo.clone(),
      topPivot,
      bottomPivot,
      topMesh,
      bottomMesh,
      meshes: [sheetMesh, topMesh, bottomMesh],
      stringLine
    };
  }

  /* ==========================================================================
     도형 4: 별 피라미드 (Star Pyramid / 사각뿔)
     ========================================================================== */
  buildStarPyramid() {
    const s = 1.8; // 바닥 사각형 한 변
    const half = s / 2;
    const slantH = 1.8; // 옆면 삼각형 경사 높이

    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

    // 1. 바닥 정사각형 (Base)
    const baseGeo = new THREE.PlaneGeometry(s, s);
    const baseMat = this.createMaterial('1', '밑면 (정사각형)', colors[0]);
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.rotation.x = -Math.PI / 2;
    baseMesh.position.set(0, 0.005, 0);
    baseMesh.castShadow = true;
    this.meshesGroup.add(baseMesh);

    // 삼각형 날개 (Petal) 형상
    const triShape = new THREE.Shape();
    triShape.moveTo(-half, 0);
    triShape.lineTo(half, 0);
    triShape.lineTo(0, slantH);
    triShape.closePath();
    const triGeo = new THREE.ShapeGeometry(triShape);

    // 4개의 방사형 삼각형 날개
    const petals = [];
    const dirs = [
      { hinge: [0, 0, half], rotY: 0, rotX: -1, name: '앞쪽 옆면', col: colors[1] },
      { hinge: [0, 0, -half], rotY: Math.PI, rotX: -1, name: '뒤쪽 옆면', col: colors[2] },
      { hinge: [-half, 0, 0], rotY: Math.PI / 2, rotX: -1, name: '왼쪽 옆면', col: colors[3] },
      { hinge: [half, 0, 0], rotY: -Math.PI / 2, rotX: -1, name: '오른쪽 옆면', col: colors[4] }
    ];

    dirs.forEach((d, idx) => {
      const pivot = new THREE.Group();
      pivot.position.set(d.hinge[0], 0, d.hinge[2]);
      pivot.rotation.y = d.rotY;

      const mat = this.createMaterial(String(idx + 2), d.name, d.col);
      const mesh = new THREE.Mesh(triGeo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.castShadow = true;
      pivot.add(mesh);
      this.meshesGroup.add(pivot);

      petals.push({ pivot, mesh });
    });

    // 실 라인
    const stringMat = new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 3 });
    const stringGeo = new THREE.BufferGeometry();
    const stringLine = new THREE.Line(stringGeo, stringMat);
    this.stringsGroup.add(stringLine);

    this.shapeObjects = {
      type: 'pyramid',
      s, slantH,
      petals,
      meshes: [baseMesh, ...petals.map(p => p.mesh)],
      stringLine
    };
  }

  /* ==========================================================================
     접힘(Folding) 애니메이션 업데이트 (0.0 ~ 1.0)
     ========================================================================== */
  updateFolding(progress) {
    this.progress = Math.max(0, Math.min(1, progress));
    const t = this.progress;

    if (this.shapeObjects.type === 'cube') {
      const { frontPivot, backPivot, leftPivot, rightPivot, topPivot, stringLine } = this.shapeObjects;
      const angle = (Math.PI / 2) * t;

      frontPivot.rotation.x = -angle;
      backPivot.rotation.x = angle;
      leftPivot.rotation.z = angle;
      rightPivot.rotation.z = -angle;
      topPivot.rotation.z = -angle;

      // 끈 궤적 업데이트
      this.updateCubeStrings(t, stringLine);
    }
    else if (this.shapeObjects.type === 'triangular_prism') {
      const { leftPivot, rightPivot, frontPivot, backPivot, stringLine } = this.shapeObjects;
      const sideAngle = (Math.PI / 3) * t; // 60도
      const capAngle = (Math.PI / 2) * t;  // 90도

      leftPivot.rotation.z = sideAngle;
      rightPivot.rotation.z = -sideAngle;
      frontPivot.rotation.x = -capAngle;
      backPivot.rotation.x = capAngle;

      this.updatePrismStrings(t, stringLine);
    }
    else if (this.shapeObjects.type === 'cylinder') {
      const { R, H, C, sheetMesh, sheetGeoOrig, topPivot, bottomPivot, stringLine } = this.shapeObjects;

      // 직사각형 곡면 롤링 계산
      const posAttr = sheetMesh.geometry.attributes.position;
      const origPos = sheetGeoOrig.attributes.position;

      for (let i = 0; i < posAttr.count; i++) {
        const u = origPos.getX(i); // -C/2 ~ +C/2
        const v = origPos.getY(i); // -H/2 ~ +H/2

        if (t < 0.001) {
          posAttr.setXYZ(i, u, v, 0);
        } else {
          // Curvature interpolation
          const theta = t * (u / R);
          const curR = R / t;
          const newX = curR * Math.sin(theta);
          const newZ = curR * (1 - Math.cos(theta));
          posAttr.setXYZ(i, newX, v, newZ);
        }
      }
      posAttr.needsUpdate = true;
      sheetMesh.geometry.computeVertexNormals();

      // 상/하 뚜껑 접힘 (90도 직각 접힘 + 곡면 중심 이동)
      const capAngle = (Math.PI / 2) * t;
      topPivot.rotation.x = capAngle;
      topPivot.position.y = (R * t);
      bottomPivot.rotation.x = -capAngle;
      bottomPivot.position.y = (R * t);

      this.updateCylinderStrings(t, stringLine);
    }
    else if (this.shapeObjects.type === 'pyramid') {
      const { s, slantH, petals, stringLine } = this.shapeObjects;
      // 피라미드 완성 접힘 각도 (기울기)
      const half = s / 2;
      const maxAngle = Math.acos(half / slantH); // 지면과의 각도
      const curAngle = maxAngle * t;

      petals.forEach(p => {
        p.pivot.rotation.x = -curAngle;
      });

      this.updatePyramidStrings(t, stringLine);
    }

    // 슬라이더 효과음 연동 (사용자 조작 중에만 재생, 초기 로드 시 미호출)
    if (window.soundFx && this._hasUserInteracted) {
      window.soundFx.playStringTension(t);
      if (t >= 0.999 && !this._snapped) {
        window.soundFx.playSnap();
        this._snapped = true;
      } else if (t < 0.95) {
        this._snapped = false;
      }
    }
  }

  /* ==========================================================================
     3D 끈(String) 궤적 물리 시각화
     ========================================================================== */
  updateCubeStrings(t, line) {
    const s = this.shapeObjects.s;
    const half = s / 2;
    // 끈이 통과하는 꼭짓점 타공 구멍 좌표 추적
    const p1 = new THREE.Vector3(-half, s * t, half * (1 - t) + half * t);
    const p2 = new THREE.Vector3(half, s * t, half);
    const p3 = new THREE.Vector3(half, s * t, -half);
    const p4 = new THREE.Vector3(-half, s * t, -half);
    const pullEnd = new THREE.Vector3(0, -0.5 - t * 0.8, 0); // PULL 손잡이

    const points = [pullEnd, p1, p2, p3, p4, p1, pullEnd];
    line.geometry.setFromPoints(points);
  }

  updatePrismStrings(t, line) {
    const { w, l, h } = this.shapeObjects;
    const apexY = h * t;
    const apexFront = new THREE.Vector3(0, apexY, l / 2);
    const apexBack = new THREE.Vector3(0, apexY, -l / 2);
    const pullEnd = new THREE.Vector3(0, -0.4 - t * 0.6, l / 2 + 0.3);

    const points = [pullEnd, apexFront, apexBack, pullEnd];
    line.geometry.setFromPoints(points);
  }

  updateCylinderStrings(t, line) {
    const { R, H } = this.shapeObjects;
    const yTop = H / 2;
    const yBot = -H / 2;
    const pTop = new THREE.Vector3(0, yTop, R * (1 - t) + R * t);
    const pBot = new THREE.Vector3(0, yBot, R * (1 - t) + R * t);
    const pullEnd = new THREE.Vector3(0, yBot - 0.5 - t * 0.5, 0);

    const points = [pullEnd, pBot, pTop, pullEnd];
    line.geometry.setFromPoints(points);
  }

  updatePyramidStrings(t, line) {
    const { s, slantH, petals } = this.shapeObjects;
    const half = s / 2;
    const apexH = Math.sqrt(slantH * slantH - half * half);
    const curApexH = (slantH * (1 - t)) + (apexH * t);

    // 각 삼각형 날개의 꼭짓점 좌표
    const tips = [];
    const pullEnd = new THREE.Vector3(0, curApexH + 0.6 + (1 - t) * 0.8, 0);

    petals.forEach(p => {
      const tip = new THREE.Vector3(0, slantH, 0);
      p.mesh.localToWorld(tip);
      tips.push(tip);
    });

    const points = [pullEnd];
    tips.forEach(tp => {
      points.push(tp);
      points.push(pullEnd);
    });
    line.geometry.setFromPoints(points);
  }

  // 투시 / 와이어프레임 모드 토글
  toggleWireframe() {
    this.isWireframe = !this.isWireframe;
    if (this.shapeObjects.meshes) {
      this.shapeObjects.meshes.forEach(m => {
        if (m.material) {
          m.material.wireframe = this.isWireframe;
          m.material.opacity = this.isWireframe ? 0.6 : 1.0;
          m.material.transparent = this.isWireframe;
          m.material.needsUpdate = true;
        }
      });
    }
    return this.isWireframe;
  }

  // 자동 재생 토글
  toggleAutoPlay() {
    this.isAutoPlaying = !this.isAutoPlaying;
    return this.isAutoPlaying;
  }

  // 면 클릭 감지
  onPointerDown(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.meshesGroup.children, true);

    if (intersects.length > 0) {
      const hit = intersects[0];
      const statusEl = document.getElementById('canvas-status');
      if (statusEl) {
        statusEl.innerText = `선택한 면: ${hit.object.name || '도형의 면'} 클릭됨!`;
      }
    }
  }

  // 메인 애니메이션 루프
  animate() {
    requestAnimationFrame(() => this.animate());

    // 자동 접기/펼치기 루프
    if (this.isAutoPlaying) {
      this.progress += 0.007 * this.autoPlayDir;
      if (this.progress >= 1.0) {
        this.progress = 1.0;
        this.autoPlayDir = -1;
      } else if (this.progress <= 0.0) {
        this.progress = 0.0;
        this.autoPlayDir = 1;
      }
      this.updateFolding(this.progress);

      // 슬라이더 동기화
      const slider = document.getElementById('pull-slider');
      if (slider) slider.value = (this.progress * 100).toFixed(1);
      const badge = document.getElementById('folding-percent-badge');
      if (badge) {
        const pct = Math.round(this.progress * 100);
        badge.innerText = `접힘: ${pct}% ${pct === 0 ? '(평면 전개도)' : pct === 100 ? '(3D 완성!)' : ''}`;
      }
    }

    if (this.controls) {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.MagicStringSimulator = MagicStringSimulator;
