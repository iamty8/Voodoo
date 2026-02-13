
import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DollState, PinData } from '../types';

interface SceneProps {
  dollState: DollState;
  onAddPin: (pin: PinData) => void;
}

const Scene: React.FC<SceneProps> = ({ dollState, onAddPin }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const dollGroupRef = useRef<THREE.Group | null>(null);
  const pinsGroupRef = useRef<THREE.Group | null>(null);
  const torsoRef = useRef<THREE.Mesh | null>(null);
  const facePaperRef = useRef<THREE.Mesh | null>(null);
  const nameMeshRef = useRef<THREE.Mesh | null>(null);
  const textureLoader = useRef(new THREE.TextureLoader());

  // Function to create blood-dripping text texture
  const createBloodTextTexture = (text: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const bloodColor = '#9e0000';
    const darkBlood = '#4a0000';

    // Text style
    ctx.font = 'bold 72px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Glow/Shadow for depth
    ctx.shadowColor = darkBlood;
    ctx.shadowBlur = 10;
    ctx.fillStyle = bloodColor;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 3;
    const upperText = text.toUpperCase();

    // Draw drips first
    ctx.strokeStyle = bloodColor;
    ctx.lineCap = 'round';
    
    const metrics = ctx.measureText(upperText);
    const textWidth = metrics.width;
    const startX = centerX - textWidth / 2;

    for (let i = 0; i < 25; i++) {
      const x = startX + Math.random() * textWidth;
      const length = 15 + Math.random() * 90;
      const thickness = 2 + Math.random() * 5;
      
      ctx.beginPath();
      ctx.lineWidth = thickness;
      ctx.moveTo(x, centerY);
      ctx.lineTo(x, centerY + length);
      ctx.stroke();

      // Drip drop
      ctx.beginPath();
      ctx.arc(x, centerY + length, thickness * 1.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw the text
    ctx.fillText(upperText, centerX, centerY);
    
    // Extra splatters
    for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        const sx = Math.random() * canvas.width;
        const sy = Math.random() * canvas.height;
        ctx.arc(sx, sy, Math.random() * 4, 0, Math.PI * 2);
        ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // --- SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a24); // Slightly lighter background
    scene.fog = new THREE.FogExp2(0x1a1a24, 0.04);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.2;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 2;
    controls.maxDistance = 12;

    // --- LIGHTS (Brightened) ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.7)); // Increased from 0.3
    
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5);
    scene.add(hemiLight);

    const spotlight = new THREE.SpotLight(0xffffff, 3); // Increased from 2
    spotlight.position.set(5, 12, 5);
    spotlight.castShadow = true;
    spotlight.angle = Math.PI / 6;
    spotlight.penumbra = 0.3;
    scene.add(spotlight);

    const redRimLight = new THREE.PointLight(0xff0000, 1.5, 15);
    redRimLight.position.set(-4, 2, 4);
    scene.add(redRimLight);

    // --- DOLL ---
    const dollGroup = new THREE.Group();
    dollGroupRef.current = dollGroup;
    scene.add(dollGroup);

    const burlapColor = 0xbda27e;
    const clothMat = new THREE.MeshPhongMaterial({ 
        color: burlapColor,
        shininess: 5
    });

    const createPart = (geo: THREE.BufferGeometry, x: number, y: number, z: number, rotZ = 0) => {
      const m = new THREE.Mesh(geo, clothMat.clone());
      m.position.set(x, y, z);
      m.rotation.z = rotZ;
      m.castShadow = true;
      m.receiveShadow = true;
      dollGroup.add(m);
      return m;
    };

    // Body parts
    const torso = createPart(new THREE.CapsuleGeometry(0.7, 1.2, 8, 20), 0, 0, 0);
    torsoRef.current = torso;

    const head = createPart(new THREE.SphereGeometry(0.65, 32, 32), 0, 1.6, 0);
    createPart(new THREE.CapsuleGeometry(0.2, 0.8, 4, 8), -1, 0.5, 0, Math.PI/3);
    createPart(new THREE.CapsuleGeometry(0.2, 0.8, 4, 8), 1, 0.5, 0, -Math.PI/3);
    createPart(new THREE.CapsuleGeometry(0.25, 1, 4, 8), -0.4, -1.5, 0);
    createPart(new THREE.CapsuleGeometry(0.25, 1, 4, 8), 0.4, -1.5, 0);

    // Face Paper
    const faceGeometry = new THREE.CircleGeometry(0.5, 32);
    const faceMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const facePaper = new THREE.Mesh(faceGeometry, faceMaterial);
    facePaper.position.set(0, 0, 0.66);
    head.add(facePaper);
    facePaperRef.current = facePaper;

    const edgeGeo = new THREE.RingGeometry(0.5, 0.53, 32);
    const edgeMat = new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.DoubleSide });
    facePaper.add(new THREE.Mesh(edgeGeo, edgeMat));

    // Blood Name Plate (Now on Torso)
    const nameGeo = new THREE.PlaneGeometry(1.4, 0.7);
    const nameMat = new THREE.MeshBasicMaterial({ transparent: true, side: THREE.DoubleSide });
    const nameMesh = new THREE.Mesh(nameGeo, nameMat);
    // Positioned on the front surface of the torso capsule (radius 0.7)
    nameMesh.position.set(0, 0, 0.71); 
    torso.add(nameMesh);
    nameMeshRef.current = nameMesh;

    // Pins Container
    const pinsGroup = new THREE.Group();
    pinsGroupRef.current = pinsGroup;
    scene.add(pinsGroup);

    // --- INTERACTION ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let mouseDownTime = 0;

    const onMouseDown = () => { mouseDownTime = Date.now(); };
    const onMouseUp = (e: MouseEvent) => {
      if (Date.now() - mouseDownTime > 200) return;

      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(dollGroup.children, true);

      if (intersects.length > 0) {
        const hit = intersects[0];
        const point = hit.point.clone();
        const normal = hit.face ? hit.face.normal.clone() : new THREE.Vector3(0, 1, 0);
        const worldNormal = normal.applyQuaternion(hit.object.getWorldQuaternion(new THREE.Quaternion()));

        onAddPin({
          id: Math.random().toString(36).substr(2, 9),
          position: [point.x, point.y, point.z],
          normal: [worldNormal.x, worldNormal.y, worldNormal.z],
          color: `hsl(${Math.random() * 20}, 90%, 40%)`, // Blood red variants
          targetName: hit.object.uuid
        });

        hit.object.scale.set(1.08, 1.08, 1.08);
        setTimeout(() => hit.object.scale.set(1, 1, 1), 100);
      }
    };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    // --- ANIMATION ---
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Update Face Image
  useEffect(() => {
    if (!facePaperRef.current || !dollState.faceImageUrl) return;
    textureLoader.current.load(dollState.faceImageUrl, (tex) => {
      (facePaperRef.current!.material as THREE.MeshPhongMaterial).map = tex;
      (facePaperRef.current!.material as THREE.MeshPhongMaterial).needsUpdate = true;
    });
  }, [dollState.faceImageUrl]);

  // Update Blood Name Label
  useEffect(() => {
    if (!nameMeshRef.current) return;
    const tex = createBloodTextTexture(dollState.name);
    if (tex) {
      if ((nameMeshRef.current.material as THREE.MeshBasicMaterial).map) {
          (nameMeshRef.current.material as THREE.MeshBasicMaterial).map?.dispose();
      }
      (nameMeshRef.current.material as THREE.MeshBasicMaterial).map = tex;
      (nameMeshRef.current.material as THREE.MeshBasicMaterial).needsUpdate = true;
    }
  }, [dollState.name]);

  // Update Pins
  useEffect(() => {
    if (!pinsGroupRef.current) return;
    while(pinsGroupRef.current.children.length > 0) {
      pinsGroupRef.current.remove(pinsGroupRef.current.children[0]);
    }

    dollState.pins.forEach(pin => {
      const pinObj = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.005, 0.65, 8),
        new THREE.MeshPhongMaterial({ color: 0xaaaaaa, shininess: 50 })
      );
      body.position.y = 0.325;
      pinObj.add(body);

      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.065, 12, 12),
        new THREE.MeshPhongMaterial({ color: pin.color, shininess: 100 })
      );
      head.position.y = 0.65;
      pinObj.add(head);

      pinObj.position.set(...pin.position);
      const v = new THREE.Vector3(0, 1, 0);
      const n = new THREE.Vector3(...pin.normal);
      pinObj.quaternion.setFromUnitVectors(v, n);
      pinsGroupRef.current?.add(pinObj);
    });
  }, [dollState.pins]);

  return <div ref={mountRef} className="w-full h-full" />;
};

export default Scene;
