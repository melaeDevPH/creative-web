import * as THREE from 'three';

export function buildCameraModel() {
    const root = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1c1c1c, roughness: 0.35, metalness: 0.85 });
    const gripMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.92, metalness: 0.1 });
    const orangeAccentMat = new THREE.MeshStandardMaterial({ color: 0xff5500, roughness: 0.2, metalness: 0.6, emissive: 0xff3300, emissiveIntensity: 0.0 });
    const yellowAccentMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.25, metalness: 0.5, emissive: 0xffaa00, emissiveIntensity: 0.0 });
    const lensMat = new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.05, metalness: 0.95 });
    const lensGlassMat = new THREE.MeshStandardMaterial({ color: 0x050510, roughness: 0.0, metalness: 0.1, transparent: true, opacity: 0.92 });
    const lensRingMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.15, metalness: 0.95 });
    const shutterMat = new THREE.MeshStandardMaterial({ color: 0xff4400, roughness: 0.2, metalness: 0.5, emissive: 0xff2200, emissiveIntensity: 0.0 });
    const glintMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.0, metalness: 0.0, transparent: true, opacity: 0.0, emissive: 0xffffff, emissiveIntensity: 0.0 });
    const afMat = new THREE.MeshStandardMaterial({ color: 0xff4400, emissive: 0xff2200, emissiveIntensity: 0.0, roughness: 0.3, metalness: 0.1 });

    const add = (geo, mat, parent = root) => {
        const m = new THREE.Mesh(geo, mat);
        m.castShadow = true;
        m.receiveShadow = true;
        parent.add(m);
        return m;
    };

    const bW = 2.6, bH = 1.7, bD = 1.1;
    add(new THREE.BoxGeometry(bW, bH, bD), bodyMat);

    const grip = add(new THREE.CylinderGeometry(0.52, 0.48, bH * 0.92, 24), gripMat);
    grip.rotation.z = Math.PI / 2;
    grip.rotation.x = Math.PI / 2;
    grip.position.set(-bW / 2 + 0.08, 0, 0);

    for (let i = 0; i < 6; i++) {
        const lm = add(new THREE.BoxGeometry(0.015, bH * 0.85, 0.06), orangeAccentMat);
        lm.position.set(-bW / 2 - 0.22, 0, -bD / 2 + 0.03 + i * 0.12);
    }

    const humpW = 0.9, humpH = 0.42, humpD = bD;
    const hump = add(new THREE.BoxGeometry(humpW, humpH, humpD), bodyMat);
    hump.position.set(0.08, bH / 2 + humpH / 2, 0);

    const evf = add(new THREE.BoxGeometry(0.28, 0.2, 0.02), new THREE.MeshStandardMaterial({ color: 0x05050f, roughness: 0.05, metalness: 0.1 }));
    evf.position.set(0.08, bH / 2 + humpH / 2, bD / 2 + 0.01);

    const hotshoe = add(new THREE.BoxGeometry(0.5, 0.06, 0.16), new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.4, metalness: 0.9 }));
    hotshoe.position.set(-0.5, bH / 2 + 0.03, 0);

    const dial = add(new THREE.CylinderGeometry(0.19, 0.19, 0.09, 32), new THREE.MeshStandardMaterial({ color: 0x2e2e2e, roughness: 0.25, metalness: 0.95 }));
    dial.position.set(0.55, bH / 2 + 0.045, 0.15);

    const knurl = add(new THREE.TorusGeometry(0.19, 0.025, 8, 32), new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.5, metalness: 0.8 }));
    knurl.position.copy(dial.position);
    knurl.rotation.x = Math.PI / 2;

    const shutter = add(new THREE.CylinderGeometry(0.11, 0.13, 0.07, 32), shutterMat);
    shutter.position.set(0.28, bH / 2 + 0.035, 0.38);

    const shutterRing = add(new THREE.TorusGeometry(0.135, 0.018, 8, 32), orangeAccentMat);
    shutterRing.position.copy(shutter.position);
    shutterRing.rotation.x = Math.PI / 2;

    const lensZ = bD / 2;
    const lensX = 0.32;

    add(new THREE.TorusGeometry(0.62, 0.045, 16, 64), orangeAccentMat).position.set(lensX, 0, lensZ);
    add(new THREE.TorusGeometry(0.51, 0.03, 16, 64), lensRingMat).position.set(lensX, 0, lensZ + 0.02);
    add(new THREE.TorusGeometry(0.40, 0.025, 16, 64), orangeAccentMat).position.set(lensX, 0, lensZ + 0.06);
    add(new THREE.TorusGeometry(0.30, 0.02, 16, 64), lensRingMat).position.set(lensX, 0, lensZ + 0.10);

    const barrel = add(new THREE.CylinderGeometry(0.60, 0.62, 0.22, 64), lensMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(lensX, 0, lensZ + 0.06);

    const innerBarrel = add(new THREE.CylinderGeometry(0.38, 0.40, 0.18, 64), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2, metalness: 0.95 }));
    innerBarrel.rotation.x = Math.PI / 2;
    innerBarrel.position.set(lensX, 0, lensZ + 0.12);

    const glass = add(new THREE.CircleGeometry(0.27, 64), lensGlassMat);
    glass.position.set(lensX, 0, lensZ + 0.22);

    add(new THREE.CircleGeometry(0.18, 64), new THREE.MeshStandardMaterial({ color: 0x0a0a2a, roughness: 0.0, metalness: 0.2, emissive: 0x110011, emissiveIntensity: 0.0 })).position.set(lensX, 0, lensZ + 0.23);

    const glint = add(new THREE.CircleGeometry(0.08, 32), glintMat);
    glint.position.set(lensX - 0.10, 0.10, lensZ + 0.24);
    glint.rotation.z = -0.5;
    glint.scale.set(1, 0.6, 1);

    const glint2 = add(new THREE.CircleGeometry(0.035, 32), glintMat);
    glint2.position.set(lensX + 0.08, -0.09, lensZ + 0.24);
    glint2.scale.set(1, 0.62, 1);

    const af = add(new THREE.SphereGeometry(0.055, 16, 16), afMat);
    af.position.set(-0.55, -0.48, lensZ + 0.02);

    const badge = add(new THREE.BoxGeometry(0.22, 0.1, 0.02), yellowAccentMat);
    badge.position.set(0.92, -0.58, lensZ);

    for (let i = 0; i < 5; i++) {
        const line2 = add(new THREE.BoxGeometry(0.015, 0.75, 0.025), new THREE.MeshStandardMaterial({ color: 0xff5500, roughness: 0.3, metalness: 0.4, emissive: 0xff2200, emissiveIntensity: 0.0 }));
        line2.position.set(bW / 2 - 0.08 - i * 0.06, 0, lensZ);
    }

    const portMats = new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.8, metalness: 0.1 });
    const mkPort = (w, h, d, x, y, z) => {
        add(new THREE.BoxGeometry(w, h, d), portMats).position.set(x, y, z);
        const hm = add(new THREE.BoxGeometry(w + 0.06, h + 0.06, 0.04), new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.6, metalness: 0.8 }));
        hm.position.set(x - 0.02, y, z);
    };
    const portX = bW / 2;
    mkPort(0.06, 0.14, 0.28, portX + 0.03, 0.22, 0.1);
    mkPort(0.06, 0.10, 0.20, portX + 0.03, -0.0, 0.1);
    mkPort(0.06, 0.08, 0.15, portX + 0.03, -0.22, 0.1);

    const lugMat = new THREE.MeshStandardMaterial({ color: 0x2e2e2e, roughness: 0.3, metalness: 0.95 });
    const mkLug = (x) => {
        add(new THREE.BoxGeometry(0.1, 0.22, 0.14), lugMat).position.set(x, bH / 2 - 0.12, 0);
        const hm = add(new THREE.TorusGeometry(0.055, 0.018, 8, 16), new THREE.MeshStandardMaterial({ color: 0x080808 }));
        hm.position.set(x, bH / 2 - 0.12, 0.07);
    };
    mkLug(-bW / 2 - 0.05);
    mkLug(bW / 2 + 0.05);

    add(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 16), new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.2, metalness: 1.0 })).position.set(0.2, -bH / 2 - 0.03, 0);

    const lensLight = new THREE.PointLight(0xff6600, 0.0, 3.0);
    lensLight.position.set(lensX, 0, lensZ + 0.3);
    root.add(lensLight);

    return {
        root,
        materials: {
            bodyMat,
            gripMat,
            orangeAccentMat,
            yellowAccentMat,
            lensMat,
            lensGlassMat,
            lensRingMat,
            shutterMat,
            glintMat,
            afMat,
        },
        lensLight,
    };
}
