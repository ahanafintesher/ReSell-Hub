"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Sparkles } from "lucide-react";

export default function HeroScene() {
  const containerRef = useRef(null);
  const [webGLError, setWebGLError] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let scene, camera, renderer, animationFrameId;
    let mainGroup, coreMesh, orbitRing1, orbitRing2, particles;
    let isVisible = true;
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    try {
      const width = container.clientWidth || 460;
      const height = container.clientHeight || 460;

      // Scene
      scene = new THREE.Scene();

      // Camera
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 0, 7.5);

      // Renderer
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      container.appendChild(renderer.domElement);

      // Main Group for object rotation & parallax
      mainGroup = new THREE.Group();
      scene.add(mainGroup);

      // 1. Core Gem / Icosahedron (Representing verified marketplace quality)
      const coreGeo = new THREE.IcosahedronGeometry(1.65, 1);
      const coreMat = new THREE.MeshPhysicalMaterial({
        color: 0x10b981,
        emissive: 0x064e3b,
        emissiveIntensity: 0.35,
        roughness: 0.15,
        metalness: 0.2,
        clearcoat: 0.9,
        clearcoatRoughness: 0.1,
        wireframe: false,
        flatShading: true,
      });
      coreMesh = new THREE.Mesh(coreGeo, coreMat);
      mainGroup.add(coreMesh);

      // Wireframe overlay for a technological, modern verified look
      const wireGeo = new THREE.IcosahedronGeometry(1.67, 1);
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0x34d399,
        wireframe: true,
        transparent: true,
        opacity: 0.25,
      });
      const wireMesh = new THREE.Mesh(wireGeo, wireMat);
      coreMesh.add(wireMesh);

      // 2. Primary Orbit Ring (Representing circular economy & giving products a second life)
      const ringGeo1 = new THREE.TorusGeometry(2.55, 0.045, 16, 100);
      const ringMat1 = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x0891b2,
        emissiveIntensity: 0.5,
        roughness: 0.2,
        metalness: 0.8,
      });
      orbitRing1 = new THREE.Mesh(ringGeo1, ringMat1);
      orbitRing1.rotation.x = Math.PI / 3;
      orbitRing1.rotation.y = Math.PI / 6;
      mainGroup.add(orbitRing1);

      // 3. Secondary Counter-Orbit Ring
      const ringGeo2 = new THREE.TorusGeometry(2.9, 0.03, 16, 100);
      const ringMat2 = new THREE.MeshStandardMaterial({
        color: 0x8b5cf6,
        emissive: 0x6d28d9,
        emissiveIntensity: 0.4,
        roughness: 0.3,
        metalness: 0.7,
      });
      orbitRing2 = new THREE.Mesh(ringGeo2, ringMat2);
      orbitRing2.rotation.x = -Math.PI / 4;
      orbitRing2.rotation.y = Math.PI / 3;
      mainGroup.add(orbitRing2);

      // Small satellite nodes on orbit ring
      const nodeGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const nodeMat1 = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x10b981,
        emissiveIntensity: 0.8,
      });
      const node1 = new THREE.Mesh(nodeGeo, nodeMat1);
      node1.position.set(2.55, 0, 0);
      orbitRing1.add(node1);

      const nodeMat2 = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.8,
      });
      const node2 = new THREE.Mesh(nodeGeo, nodeMat2);
      node2.position.set(-2.9, 0, 0);
      orbitRing2.add(node2);

      // 4. Subtle Ambient Particle Cloud
      const particleCount = 45;
      const particlePositions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount * 3; i += 3) {
        particlePositions[i] = (Math.random() - 0.5) * 8;
        particlePositions[i + 1] = (Math.random() - 0.5) * 8;
        particlePositions[i + 2] = (Math.random() - 0.5) * 6;
      }
      const particleGeo = new THREE.BufferGeometry();
      particleGeo.setAttribute(
        "position",
        new THREE.BufferAttribute(particlePositions, 3)
      );
      const particleMat = new THREE.PointsMaterial({
        color: 0x34d399,
        size: 0.08,
        transparent: true,
        opacity: 0.6,
      });
      particles = new THREE.Points(particleGeo, particleMat);
      scene.add(particles);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
      scene.add(ambientLight);

      const mainLight = new THREE.DirectionalLight(0x34d399, 2.8);
      mainLight.position.set(5, 6, 6);
      scene.add(mainLight);

      const cyanRimLight = new THREE.DirectionalLight(0x06b6d4, 2.2);
      cyanRimLight.position.set(-6, -4, -3);
      scene.add(cyanRimLight);

      const violetFillLight = new THREE.PointLight(0x8b5cf6, 1.5, 12);
      violetFillLight.position.set(0, -3, 3);
      scene.add(violetFillLight);

      // Pointer Parallax Handler
      const handlePointerMove = (e) => {
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        targetX = x * 0.8;
        targetY = y * 0.8;
      };

      window.addEventListener("pointermove", handlePointerMove, { passive: true });

      // Resize Handler
      const handleResize = () => {
        if (!container) return;
        const newW = container.clientWidth;
        const newH = container.clientHeight;
        if (newW === 0 || newH === 0) return;
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      };

      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);

      // Intersection Observer to pause rendering when offscreen
      const intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isVisible = entry.isIntersecting;
          });
        },
        { threshold: 0.05 }
      );
      intersectionObserver.observe(container);

      // Animation Loop
      let clock = new THREE.Clock();
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        if (!isVisible) return;

        const delta = clock.getDelta();

        // Parallax damping
        mouseX += (targetX - mouseX) * 0.05;
        mouseY += (targetY - mouseY) * 0.05;

        mainGroup.rotation.y = mouseX * 0.7;
        mainGroup.rotation.x = -mouseY * 0.7;

        if (!prefersReducedMotion) {
          // Slow harmonious rotations
          coreMesh.rotation.y += delta * 0.35;
          coreMesh.rotation.x += delta * 0.2;

          orbitRing1.rotation.z += delta * 0.45;
          orbitRing2.rotation.z -= delta * 0.35;

          particles.rotation.y += delta * 0.08;
        }

        renderer.render(scene, camera);
      };

      animate();

      // Cleanup
      return () => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        window.removeEventListener("pointermove", handlePointerMove);
        resizeObserver.disconnect();
        intersectionObserver.disconnect();

        // Dispose geometries and materials
        [coreGeo, wireGeo, ringGeo1, ringGeo2, nodeGeo, particleGeo].forEach(
          (g) => g.dispose()
        );
        [coreMat, wireMat, ringMat1, ringMat2, nodeMat1, nodeMat2, particleMat].forEach(
          (m) => m.dispose()
        );

        if (renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        renderer.dispose();
      };
    } catch (err) {
      console.warn("Three.js initialization fallback:", err);
      setTimeout(() => {
        setWebGLError(true);
      }, 0);
    }
  }, []);

  if (webGLError) {
    return <StaticFallback />;
  }

  return (
    <div className="relative w-full h-full min-h-[380px] sm:min-h-[440px] flex items-center justify-center pointer-events-none select-none">
      {/* Decorative ambient backdrop glow */}
      <div className="absolute inset-0 bg-radial from-emerald-500/15 via-teal-500/5 to-transparent blur-2xl rounded-full" />
      <div
        ref={containerRef}
        className="w-full h-full min-h-[380px] sm:min-h-[440px] flex items-center justify-center cursor-default"
      />
    </div>
  );
}

function StaticFallback() {
  return (
    <div className="relative w-full h-full min-h-[380px] flex items-center justify-center p-8 select-none">
      <div className="relative flex items-center justify-center w-64 h-64 rounded-full bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-cyan-500/20 border border-emerald-500/30 shadow-2xl">
        <div className="flex flex-col items-center justify-center text-center p-6 space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
            <Sparkles className="w-7 h-7" />
          </div>
          <p className="font-bold text-slate-800 dark:text-white text-base">
            Circular Marketplace
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Giving pre-owned products a verified second life
          </p>
        </div>
      </div>
    </div>
  );
}
