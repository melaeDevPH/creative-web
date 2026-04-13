import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { buildCameraModel } from './CameraModel';

export default function WaterBackground() {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        const W = el.clientWidth, H = el.clientHeight;

        const scene = new THREE.Scene();

        const world = new THREE.Group();
        world.position.x = 2.8;
        scene.add(world);

        // ── View camera (unchanged) ──
        const camera = new THREE.PerspectiveCamera(53, W / H, 0.1, 1000);
        camera.position.set(-1.5, 1.6, 2.9);
        camera.lookAt(1.0, 1.2, -4.0);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(W, H);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.95;
        el.appendChild(renderer.domElement);

        // ── Sky dome (unchanged) ──
        const skyMat = new THREE.ShaderMaterial({
            side: THREE.BackSide,
            uniforms: { uTime: { value: 0 } },
            vertexShader: `
                varying vec3 vWorldPos;
                void main(){
                    vWorldPos = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vWorldPos;
                uniform float uTime;
                vec3 lerpC(vec3 a, vec3 b, float t){ return mix(a, b, clamp(t, 0.0, 1.0)); }
                void main(){
                    float h = normalize(vWorldPos).y;
                    vec3 c0 = vec3(0.72, 0.10, 0.02);
                    vec3 c1 = vec3(0.95, 0.22, 0.03);
                    vec3 c2 = vec3(1.00, 0.45, 0.05);
                    vec3 c3 = vec3(1.00, 0.65, 0.08);
                    vec3 c4 = vec3(1.00, 0.82, 0.18);
                    vec3 c5 = vec3(0.90, 0.55, 0.10);
                    vec3 c6 = vec3(0.60, 0.20, 0.05);
                    vec3 col;
                    if      (h < 0.0)  col = c0;
                    else if (h < 0.05) col = lerpC(c0, c1, h / 0.05);
                    else if (h < 0.12) col = lerpC(c1, c2, (h - 0.05) / 0.07);
                    else if (h < 0.22) col = lerpC(c2, c3, (h - 0.12) / 0.10);
                    else if (h < 0.40) col = lerpC(c3, c4, (h - 0.22) / 0.18);
                    else if (h < 0.65) col = lerpC(c4, c5, (h - 0.40) / 0.25);
                    else               col = lerpC(c5, c6, (h - 0.65) / 0.35);
                    float pulse = sin(uTime * 0.18) * 0.5 + 0.5;
                    col = mix(col, col * vec3(1.05, 0.97, 0.98), pulse * 0.08);
                    gl_FragColor = vec4(col, 1.0);
                }
            `,
        });
        scene.add(new THREE.Mesh(new THREE.SphereGeometry(500, 64, 64), skyMat));

        // ── Horizon glow (unchanged) ──
        const glowCanvas = document.createElement('canvas');
        glowCanvas.width = 4; glowCanvas.height = 128;
        const gc = glowCanvas.getContext('2d');
        const glowGrad = gc.createLinearGradient(0, 0, 0, 128);
        glowGrad.addColorStop(0.0, 'rgba(255,180,60,0)');
        glowGrad.addColorStop(0.3, 'rgba(255,120,20,0.22)');
        glowGrad.addColorStop(0.5, 'rgba(255,80,10,0.45)');
        glowGrad.addColorStop(0.7, 'rgba(255,120,20,0.22)');
        glowGrad.addColorStop(1.0, 'rgba(255,180,60,0)');
        gc.fillStyle = glowGrad;
        gc.fillRect(0, 0, 4, 128);
        const horizonGlow = new THREE.Sprite(new THREE.SpriteMaterial({
            map: new THREE.CanvasTexture(glowCanvas),
            transparent: true, depthWrite: false,
            blending: THREE.AdditiveBlending, opacity: 0.9,
        }));
        horizonGlow.position.set(0, -1, -80);
        horizonGlow.scale.set(400, 28, 1);
        scene.add(horizonGlow);

        // ── Moon (unchanged) ──
        const moon = new THREE.Mesh(
            new THREE.SphereGeometry(2.4, 32, 32),
            new THREE.MeshStandardMaterial({ color: 0xffeedd, emissive: 0xffcc88, emissiveIntensity: 0.8, roughness: 0.9 })
        );
        moon.position.set(-22, 8, -160);
        scene.add(moon);
        [
            { size: 52, opacity: 0.22, color: [255, 160, 80] },
            { size: 90, opacity: 0.12, color: [255, 100, 60] },
            { size: 140, opacity: 0.07, color: [220, 60, 10] },
            { size: 200, opacity: 0.03, color: [180, 40, 5] },
        ].forEach(({ size, opacity, color }) => {
            const c = document.createElement('canvas');
            c.width = c.height = 256;
            const cx = c.getContext('2d');
            const rg = cx.createRadialGradient(128, 128, 0, 128, 128, 128);
            const [r, g, b] = color;
            rg.addColorStop(0, `rgba(${r},${g},${b},1)`);
            rg.addColorStop(0.3, `rgba(${r},${g},${b},0.6)`);
            rg.addColorStop(1, `rgba(${r},${g},${b},0)`);
            cx.fillStyle = rg; cx.fillRect(0, 0, 256, 256);
            const sp = new THREE.Sprite(new THREE.SpriteMaterial({
                map: new THREE.CanvasTexture(c), transparent: true, opacity,
                depthWrite: false, blending: THREE.AdditiveBlending,
            }));
            sp.position.copy(moon.position);
            sp.scale.setScalar(size);
            scene.add(sp);
        });

        // ── Clouds (unchanged) ──
        [
            { x: -60, y: 18, z: -200, sx: 120, sy: 22 },
            { x: 40, y: 28, z: -220, sx: 90, sy: 16 },
            { x: -20, y: 38, z: -240, sx: 140, sy: 18 },
            { x: 80, y: 14, z: -180, sx: 70, sy: 14 },
            { x: -90, y: 32, z: -260, sx: 100, sy: 20 },
        ].forEach(({ x, y, z, sx, sy }) => {
            const cc = document.createElement('canvas');
            cc.width = 512; cc.height = 128;
            const ccx = cc.getContext('2d');
            const cloudGrad = ccx.createRadialGradient(256, 64, 10, 256, 64, 120);
            cloudGrad.addColorStop(0, 'rgba(255,120,60,0.35)');
            cloudGrad.addColorStop(0.5, 'rgba(200,60,80,0.15)');
            cloudGrad.addColorStop(1, 'rgba(180,40,100,0)');
            ccx.fillStyle = cloudGrad;
            ccx.fillRect(0, 0, 512, 128);
            const cloudSp = new THREE.Sprite(new THREE.SpriteMaterial({
                map: new THREE.CanvasTexture(cc), transparent: true, opacity: 0.85,
                depthWrite: false, blending: THREE.AdditiveBlending,
            }));
            cloudSp.position.set(x, y, z);
            cloudSp.scale.set(sx, sy, 1);
            scene.add(cloudSp);
        });

        // ── Water (realistic waves) ──
        const waterNormals = new THREE.TextureLoader().load('/waternormals.jpg');
        waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
        const water = new Water(new THREE.PlaneGeometry(120, 120), {
            textureWidth: 1024,
            textureHeight: 1024,
            waterNormals,
            sunDirection: new THREE.Vector3(0, 1, 0),
            sunColor: 0xffffff,
            waterColor: 0x0099cc,
            distortionScale: 3.2,
            fog: false,
            alpha: 1.0,
        });
        water.rotation.x = -Math.PI / 2;
        water.position.y = -0.5;
        world.add(water);

        // ── Camera model (unchanged) ──
        const cameraBase = new THREE.Vector3(0, 1.35, -3.0);
        const { root: cameraRoot, materials: cameraMaterials } = buildCameraModel();
        cameraRoot.position.copy(cameraBase);
        cameraRoot.rotation.set(-0.08, -0.45, 0);
        cameraRoot.scale.setScalar(1.0);
        world.add(cameraRoot);

        Object.values(cameraMaterials).forEach((mat) => {
            if (!mat || !mat.isMaterial) return;
            mat.color = new THREE.Color(0x2a2a2a);   // dark gray instead of pure black
            mat.roughness = 0.35;                     // more roughness = catches light on edges
            mat.metalness = 0.75;
            mat.clearcoat = 1.0;
            mat.clearcoatRoughness = 0.12;
            mat.emissive = new THREE.Color(0x221108);
            mat.emissiveIntensity = 0.25;
            mat.needsUpdate = true;
        });

        // ── Dedicated camera rim / edge lights ──
        // Front-left fill so edges are visible
        const camFill = new THREE.DirectionalLight(0xffd0a0, 1.8);
        camFill.position.set(-6, 4, 6);
        camFill.target.position.copy(cameraBase);
        world.add(camFill);
        world.add(camFill.target);

        // Top-right rim to outline the body silhouette
        const camRim = new THREE.DirectionalLight(0xff9955, 2.2);
        camRim.position.set(8, 6, -1);
        camRim.target.position.copy(cameraBase);
        world.add(camRim);
        world.add(camRim.target);

        // Subtle cool bounce from below (water reflection)
        const camBounce = new THREE.PointLight(0x88ccff, 1.4, 12);
        camBounce.position.set(cameraBase.x, cameraBase.y - 1.5, cameraBase.z + 1);
        world.add(camBounce);

        // ── Moon shimmer (unchanged) ──
        const shimmerC = document.createElement('canvas');
        shimmerC.width = 64; shimmerC.height = 256;
        const sc2 = shimmerC.getContext('2d');
        const sg = sc2.createLinearGradient(0, 0, 0, 256);
        sg.addColorStop(0, 'rgba(255,180,100,0)');
        sg.addColorStop(0.3, 'rgba(255,160,80,0.18)');
        sg.addColorStop(0.5, 'rgba(255,140,60,0.28)');
        sg.addColorStop(0.7, 'rgba(255,160,80,0.18)');
        sg.addColorStop(1, 'rgba(255,180,100,0)');
        sc2.fillStyle = sg; sc2.fillRect(0, 0, 64, 256);
        const shimmer = new THREE.Sprite(new THREE.SpriteMaterial({
            map: new THREE.CanvasTexture(shimmerC),
            transparent: true, opacity: 0.5,
            depthWrite: false, blending: THREE.AdditiveBlending,
        }));
        shimmer.position.set(-19, -0.3, -5);
        shimmer.scale.set(8, 20, 1);
        world.add(shimmer);

        // ========== OBJECT 1: YouTube as a 3D BALL (sphere) with play button ==========
        const youtubeGroup = new THREE.Group();
        youtubeGroup.position.set(2.4, -0.6, -2.2);
        world.add(youtubeGroup);

        // Red glossy sphere
        const sphereGeo = new THREE.SphereGeometry(0.7, 64, 64);
        const sphereMat = new THREE.MeshStandardMaterial({
            color: 0xff2020,
            metalness: 0.7,
            roughness: 0.25,
            emissive: 0xff0000,
            emissiveIntensity: 0.5,
        });
        const youtubeBall = new THREE.Mesh(sphereGeo, sphereMat);
        youtubeBall.material.depthWrite = false;
        youtubeBall.renderOrder = 1;
        youtubeGroup.add(youtubeBall);

        // Play triangle (extruded) – declared AFTER youtubeBall, no premature reference
        const shape = new THREE.Shape();
        shape.moveTo(-0.28, -0.35);
        shape.lineTo(0.42, 0);
        shape.lineTo(-0.28, 0.35);
        shape.closePath();
        const playGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: false });
        const playMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 0.9,
            depthTest: false,   // set in constructor so it's applied immediately
        });
        const playIcon = new THREE.Mesh(playGeo, playMat);
        playIcon.position.set(0, 0, 0.72);
        playIcon.renderOrder = 10;
        playIcon.rotation.y = 0; // face +Z of group which is rotated toward camera
        youtubeGroup.add(playIcon);

        // Water drips for YouTube
        const youtubeDrips = (() => {
            const drips = [];
            for (let i = 0; i < 8; i++) {
                const drip = new THREE.Mesh(
                    new THREE.SphereGeometry(0.035, 6, 6),
                    new THREE.MeshPhysicalMaterial({ color: 0xaaddff, transparent: true, opacity: 0.8, ior: 1.33 })
                );
                drip.userData = { active: false };
                youtubeGroup.add(drip);
                drips.push(drip);
            }
            return drips;
        })();

        // ========== OBJECT 2: 3D Rectangle with pencil, ballpen, lab icon ==========
        const rectGroup = new THREE.Group();
        rectGroup.position.set(3.5, -0.8, 0.2);
        world.add(rectGroup);

        // Main rectangle platform — glacier ice look
        const boxGeo = new THREE.BoxGeometry(1.3, 0.15, 1.0);
        const boxMat = new THREE.MeshPhysicalMaterial({
            color: 0xddf4ff,          // pale icy blue-white
            emissive: 0x88ccee,
            emissiveIntensity: 0.12,
            metalness: 0.0,
            roughness: 0.05,          // very smooth like polished ice
            transparent: true,
            opacity: 0.72,            // translucent like real ice
            clearcoat: 1.0,
            clearcoatRoughness: 0.02,
            ior: 1.31,                // ice IOR
            transmission: 0.4,        // light passes through
            thickness: 0.15,
        });
        const platform = new THREE.Mesh(boxGeo, boxMat);
        platform.position.y = 0;
        rectGroup.add(platform);

        // Pencil
        const pencilGroup = new THREE.Group();
        const pencilBody = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.5, 8), new THREE.MeshStandardMaterial({ color: 0xffaa33, metalness: 0.3 }));
        pencilBody.rotation.z = 0.2;
        pencilGroup.add(pencilBody);
        const pencilTip = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.14, 8), new THREE.MeshStandardMaterial({ color: 0xffcc88, emissive: 0xffaa66 }));
        pencilTip.position.set(0, 0.26, 0);
        pencilGroup.add(pencilTip);
        const pencilEraser = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.12, 8), new THREE.MeshStandardMaterial({ color: 0xff8888 }));
        pencilEraser.position.set(0, -0.26, 0);
        pencilGroup.add(pencilEraser);
        pencilGroup.position.set(-0.45, 0.13, 0.25);
        pencilGroup.rotation.z = 0.35;
        rectGroup.add(pencilGroup);

        // Ballpen
        const penGroup = new THREE.Group();
        const penBody = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.45, 12), new THREE.MeshStandardMaterial({ color: 0xccccdd, metalness: 0.9, roughness: 0.2 }));
        penBody.rotation.z = -0.15;
        penGroup.add(penBody);
        const penCap = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.12, 8), new THREE.MeshStandardMaterial({ color: 0xaaaaff, metalness: 0.8 }));
        penCap.position.set(0, 0.24, 0);
        penGroup.add(penCap);
        const penTip = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.12, 8), new THREE.MeshStandardMaterial({ color: 0xffaa66 }));
        penTip.position.set(0, -0.24, 0);
        penGroup.add(penTip);
        penGroup.position.set(0.35, 0.13, 0.2);
        penGroup.rotation.z = -0.25;
        rectGroup.add(penGroup);

        // Lab experiment icon (flask)
        const labGroup = new THREE.Group();
        const flaskBody = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.1, 0.4, 16), new THREE.MeshStandardMaterial({ color: 0x88ccff, metalness: 0.7, transparent: true, opacity: 0.9 }));
        flaskBody.position.y = 0;
        labGroup.add(flaskBody);
        const flaskNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.14, 8), new THREE.MeshStandardMaterial({ color: 0x88ccff, metalness: 0.7 }));
        flaskNeck.position.y = 0.22;
        labGroup.add(flaskNeck);
        const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.24, 12), new THREE.MeshStandardMaterial({ color: 0x44ff88, emissive: 0x22ff44, emissiveIntensity: 0.4 }));
        liquid.position.y = -0.05;
        labGroup.add(liquid);
        labGroup.position.set(0, 0.17, -0.4);
        rectGroup.add(labGroup);

        // Floating particles around rectangle
        const rectParticles = (() => {
            const particleCount = 24;
            const particleGeo = new THREE.BufferGeometry();
            const positions = [];
            for (let i = 0; i < particleCount; i++) {
                positions.push((Math.random() - 0.5) * 1.5);
                positions.push((Math.random() - 0.5) * 0.9);
                positions.push((Math.random() - 0.5) * 1.3);
            }
            particleGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
            const particleMat = new THREE.PointsMaterial({ color: 0xaaffff, size: 0.02, transparent: true, blending: THREE.AdditiveBlending });
            return new THREE.Points(particleGeo, particleMat);
        })();
        rectGroup.add(rectParticles);

        // Drips for rectangle
        const rectDrips = (() => {
            const drips = [];
            for (let i = 0; i < 8; i++) {
                const drip = new THREE.Mesh(
                    new THREE.SphereGeometry(0.035, 6, 6),
                    new THREE.MeshPhysicalMaterial({ color: 0xaaddff, transparent: true, opacity: 0.8, ior: 1.33 })
                );
                drip.userData = { active: false };
                rectGroup.add(drip);
                drips.push(drip);
            }
            return drips;
        })();

        const floatingObjects = [
            { grp: youtubeGroup, baseX: 2.4, baseY: -0.05, baseZ: -2.2, speed: 0.18, phase: 0, delay: 0.0, drips: youtubeDrips },
            { grp: rectGroup, baseX: 3.5, baseY: 0.0, baseZ: 0.2, speed: 0.20, phase: 1, delay: 0.45, drips: rectDrips }
        ];
        const entranceStartTime = performance.now() / 1000;

        // ── Lights (unchanged) ──
        world.add(new THREE.AmbientLight(0xff5522, 0.5));
        const keyLight = new THREE.DirectionalLight(0xff8833, 1.2);
        keyLight.position.set(-20, 10, -50);
        world.add(keyLight);
        const warmFill = new THREE.DirectionalLight(0xff9900, 0.35);
        warmFill.position.set(10, 20, 5);
        world.add(warmFill);
        const waterFill = new THREE.DirectionalLight(0x44bbff, 0.7);
        waterFill.position.set(0, 8, 5);
        world.add(waterFill);
        const moonGlow = new THREE.PointLight(0xffaa66, 1.0, 300);
        moonGlow.position.copy(moon.position);
        scene.add(moonGlow);

        // ── Animation with water drips ──
        let t = 0, rafId;
        const animate = () => {
            rafId = requestAnimationFrame(animate);
            t += 0.016;
            const nowSec = performance.now() / 1000;
            const elapsed = Math.max(0, nowSec - entranceStartTime);

            skyMat.uniforms.uTime.value = t;
            water.material.uniforms['time'].value = t * 0.38;
            water.material.uniforms['distortionScale'].value = 3.2 + Math.sin(t * 0.5) * 0.5;
            horizonGlow.material.opacity = 0.75 + Math.sin(t * 0.3) * 0.15;
            shimmer.material.opacity = 0.35 + Math.sin(t * 1.4) * 0.12;

            cameraRoot.position.y = cameraBase.y + Math.sin(t * 0.18) * 0.12;
            cameraRoot.position.x = cameraBase.x + Math.sin(t * 0.11) * 0.05;
            cameraRoot.position.z = cameraBase.z + Math.cos(t * 0.14) * 0.04;
            cameraRoot.rotation.x = -0.08 + Math.sin(t * 0.28) * 0.02;
            cameraRoot.rotation.y = -0.45 + Math.cos(t * 0.18) * 0.035;

            floatingObjects.forEach(obj => {
                const { grp, baseX, baseY, baseZ, speed, phase, delay, drips } = obj;
                let progress = (elapsed - delay) / 0.7;
                progress = Math.min(1, Math.max(0, progress));
                const easeOut = 1 - Math.pow(1 - progress, 2.2);
                const currentY = -1.0 + (baseY + 1.0) * easeOut;
                grp.position.y = currentY;

                // Drip effects during rise
                if (progress < 1.0 && progress > 0.1) {
                    drips.forEach(drip => {
                        if (!drip.userData.active && Math.random() < 0.025) {
                            drip.userData.active = true;
                            drip.userData.startY = currentY;
                            drip.position.y = currentY + 0.35;
                            drip.position.x = (Math.random() - 0.5) * 0.9;
                            drip.position.z = (Math.random() - 0.5) * 0.9;
                            drip.scale.setScalar(1);
                        }
                        if (drip.userData.active) {
                            drip.position.y -= 0.04;
                            drip.scale.multiplyScalar(0.97);
                            if (drip.position.y < -0.8) {
                                drip.userData.active = false;
                                drip.visible = false;
                            } else {
                                drip.visible = true;
                            }
                        } else {
                            drip.visible = false;
                        }
                    });
                } else {
                    drips.forEach(drip => { drip.userData.active = false; drip.visible = false; });
                }

                if (progress >= 1.0) {
                    const depthFactor = Math.max(0.9, Math.abs(baseZ));
                    grp.position.y = baseY + Math.sin(t * speed + phase) * (0.12 + 0.06 / depthFactor);
                    grp.position.x = baseX + Math.sin(t * speed * 0.4 + phase) * (0.06 / depthFactor);
                    const zOffset = Math.cos(t * speed * 0.3 + phase) * 0.05;

                    // clamp so they never overlap
                    if (grp === youtubeGroup) {
                        grp.position.z = Math.min(baseZ + zOffset, -1.9); // keep ball in its lane
                    } else {
                        grp.position.z = Math.max(baseZ + zOffset, 0.0);  // keep lab in front
                    }
                    const w = 1 + Math.sin(t * 1.2 + phase) * 0.012;
                    grp.scale.set(w, 1 / w, w);
                } else {
                    grp.position.x = baseX;
                    grp.position.z = baseZ;
                    const emergeScale = 0.8 + easeOut * 0.2;
                    grp.scale.set(emergeScale, emergeScale, emergeScale);
                }

                // Gentle rotation – youtube group locks to face camera, rect floats freely
                if (grp === youtubeGroup) {
                    // -0.92 rad = atan2(-6.7, 5.1): angle from ball to camera in world-local XZ
                    grp.rotation.y = -0.92 + Math.sin(t * 0.4 + phase) * 0.05;
                } else {
                    grp.rotation.y = Math.sin(t * 0.4 + phase) * 0.05;
                }
                grp.rotation.x = Math.sin(t * 0.3 + phase) * 0.03;
            });

            playIcon.material.emissiveIntensity = 0.7 + Math.sin(t * 4) * 0.3;
            // Animate rectangle's top objects
            pencilGroup.rotation.z = 0.35 + Math.sin(t * 1.2) * 0.06;
            penGroup.rotation.z = -0.25 + Math.cos(t * 1.1) * 0.05;
            labGroup.rotation.y = Math.sin(t * 0.8) * 0.12;

            renderer.render(scene, camera);
        };
        animate();

        const onResize = () => {
            const w = el.clientWidth, h = el.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', onResize);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('resize', onResize);
            renderer.dispose();
            el.removeChild(renderer.domElement);
        };
    }, []);

    return (
        <div ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }} />
    );
}