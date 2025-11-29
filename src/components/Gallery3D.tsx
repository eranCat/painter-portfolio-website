import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { getPaintings } from '../services/paintingService';
import { Painting } from '../types/painting';
import * as THREE from 'three';

export const Gallery3D = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRotationRef = useRef(0);
  const targetRotationRef = useRef(0);
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null);
  const [currentWall, setCurrentWall] = useState(0); // 0: back, 1: right, 2: front, 3: left
  const { t, language } = useLanguage();

  const wallNames = ['Back', 'Right', 'Front', 'Left'];

  useEffect(() => {
    const loadPaintings = async () => {
      try {
        const firebasePaintings = await getPaintings();
        setPaintings(firebasePaintings);
      } catch (error) {
        console.error('Failed to load paintings:', error);
      }
    };

    loadPaintings();
  }, []);

  const rotateView = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      setCurrentWall((prev) => (prev + 1) % 4);
      targetRotationRef.current += Math.PI / 2;
    } else {
      setCurrentWall((prev) => (prev - 1 + 4) % 4);
      targetRotationRef.current -= Math.PI / 2;
    }
  };

  useEffect(() => {
    if (!containerRef.current || paintings.length === 0) return;

    const container = containerRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfafafa);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.6, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 8, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0xe8e8e8 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Ceiling
    const ceilingGeometry = new THREE.PlaneGeometry(20, 20);
    const ceilingMaterial = new THREE.MeshLambertMaterial({ color: 0xfafafa });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.position.y = 3;
    ceiling.rotation.x = Math.PI / 2;
    ceiling.receiveShadow = true;
    scene.add(ceiling);

    // Create 4 walls with paintings
    const wallDistance = 9;
    const wallPositions = [
      { x: 0, z: wallDistance, rotY: 0, name: 'back' },
      { x: wallDistance, z: 0, rotY: Math.PI / 2, name: 'right' },
      { x: 0, z: -wallDistance, rotY: Math.PI, name: 'front' },
      { x: -wallDistance, z: 0, rotY: -Math.PI / 2, name: 'left' },
    ];

    const textureLoader = new THREE.TextureLoader();

    wallPositions.forEach((wallPos) => {
      const wallGeometry = new THREE.PlaneGeometry(20, 15);
      const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);
      wall.position.set(wallPos.x, 4, wallPos.z);
      wall.rotation.y = wallPos.rotY;
      wall.receiveShadow = true;
      scene.add(wall);

      // Add paintings to wall
      const wallPaintings = getWallPaintings(wallPos.name, paintings);
      wallPaintings.forEach((painting, index) => {
        const frameWidth = 2.5;
        const frameHeight = 3;
        const frameGeometry = new THREE.BoxGeometry(frameWidth, frameHeight, 0.05);
        const frameMaterial = new THREE.MeshStandardMaterial({
          color: 0xf5f5f5,
          metalness: 0.1,
          roughness: 0.8,
        });

        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.castShadow = true;
        frame.receiveShadow = true;

        // Position paintings on wall
        const totalPaintings = wallPaintings.length;
        const spacing = 5;
        const startX = -(spacing * (totalPaintings - 1)) / 2;
        const xPos = startX + index * spacing;

        if (wallPos.rotY === 0) {
          // Back wall
          frame.position.set(xPos, 3.5, wallDistance - 0.03);
        } else if (wallPos.rotY === Math.PI / 2) {
          // Right wall
          frame.position.set(wallDistance - 0.03, 3.5, -xPos);
          frame.rotation.y = Math.PI / 2;
        } else if (wallPos.rotY === Math.PI) {
          // Front wall
          frame.position.set(-xPos, 3.5, -wallDistance + 0.03);
          frame.rotation.y = Math.PI;
        } else {
          // Left wall
          frame.position.set(-wallDistance + 0.03, 3.5, xPos);
          frame.rotation.y = -Math.PI / 2;
        }

        scene.add(frame);

        // Load and add painting image using canvas to bypass CORS
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
          try {
            // Create canvas and draw image to it
            const canvas = document.createElement('canvas');
            canvas.width = 1024;
            canvas.height = 1024;
            const ctx = canvas.getContext('2d');

            if (ctx) {
              // Fill background
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, 1024, 1024);

              // Calculate image dimensions to fit in canvas
              const imgAspect = img.width / img.height;
              let drawWidth = 1024;
              let drawHeight = 1024;
              let offsetX = 0;
              let offsetY = 0;

              if (imgAspect > 1) {
                drawHeight = 1024 / imgAspect;
                offsetY = (1024 - drawHeight) / 2;
              } else {
                drawWidth = 1024 * imgAspect;
                offsetX = (1024 - drawWidth) / 2;
              }

              // Draw image centered on canvas
              ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

              // Create Three.js texture from canvas
              const canvasTexture = new THREE.CanvasTexture(canvas);
              canvasTexture.colorSpace = THREE.SRGBColorSpace;

              const imageMaterial = new THREE.MeshStandardMaterial({
                map: canvasTexture,
                metalness: 0,
                roughness: 0.4,
                toneMapped: true,
              });

              const imageGeometry = new THREE.PlaneGeometry(frameWidth - 0.2, frameHeight - 0.2);
              const imageMesh = new THREE.Mesh(imageGeometry, imageMaterial);
              imageMesh.position.z = 0.03;
              imageMesh.castShadow = true;
              imageMesh.receiveShadow = true;

              frame.add(imageMesh);

              // Make painting clickable
              (imageMesh as any).paintingData = painting;
              (imageMesh as any).isPainting = true;
            }
          } catch (error) {
            console.warn('Error drawing image to canvas:', painting.imageUrl, error);
            createPlaceholder();
          }
        };

        img.onerror = () => {
          console.warn('Failed to load image (CORS or network issue):', painting.imageUrl);
          createPlaceholder();
        };

        const createPlaceholder = () => {
          const placeholderMaterial = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            metalness: 0,
            roughness: 0.5,
          });
          const imageGeometry = new THREE.PlaneGeometry(frameWidth - 0.2, frameHeight - 0.2);
          const placeholderMesh = new THREE.Mesh(imageGeometry, placeholderMaterial);
          placeholderMesh.position.z = 0.03;
          frame.add(placeholderMesh);
          (frame as any).paintingData = painting;
          (frame as any).isPainting = true;
        };

        // Start loading image
        img.src = painting.imageUrl;
      });
    });

    // Raycaster for mouse clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const paintingMeshes = scene.children.filter(
        (obj) => (obj as any).isPainting || obj.children.some((child) => (child.parent as any).isPainting)
      );

      const intersects = raycaster.intersectObjects(paintingMeshes, true);
      if (intersects.length > 0) {
        const object = intersects[0].object;
        const paintingData = (object.parent as any).paintingData || (object as any).paintingData;
        if (paintingData) {
          setSelectedPainting(paintingData);
        }
      }
    };

    window.addEventListener('click', onMouseClick);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Smooth rotation to target angle
      const rotationDifference = targetRotationRef.current - cameraRotationRef.current;
      const normalizedDiff = Math.atan2(Math.sin(rotationDifference), Math.cos(rotationDifference));
      cameraRotationRef.current += normalizedDiff * 0.1;

      // Update camera position based on rotation
      const radius = 0.01;
      camera.position.x = Math.sin(cameraRotationRef.current) * radius;
      camera.position.z = Math.cos(cameraRotationRef.current) * radius;
      camera.lookAt(0, 1.6, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('click', onMouseClick);
      window.removeEventListener('resize', handleResize);
      container.removeChild(renderer.domElement);
    };
  }, [paintings]);

  return (
    <>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100vh',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Loading indicator */}
        {paintings.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
            <p className="text-white font-light text-lg">{t('gallery.loading')}</p>
          </div>
        )}

        {/* Navigation Controls */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex items-center gap-8">
          <button
            onClick={() => rotateView('left')}
            className="bg-black/70 hover:bg-black text-white p-3 rounded-full transition-colors"
            aria-label="View left wall"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Wall indicator */}
          <div className="bg-black/70 text-white px-6 py-2 rounded-lg font-light text-sm min-w-32 text-center">
            {wallNames[currentWall]} Wall
          </div>

          <button
            onClick={() => rotateView('right')}
            className="bg-black/70 hover:bg-black text-white p-3 rounded-full transition-colors"
            aria-label="View right wall"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Instructions */}
        <div className="absolute top-6 left-6 z-10 bg-black/70 text-white p-4 rounded-lg max-w-xs">
          <p className="font-light text-sm">Click on paintings to view details</p>
        </div>
      </div>

      {/* Modal for painting details */}
      {selectedPainting && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div
            className="bg-white rounded-lg overflow-hidden max-w-4xl w-full max-h-screen flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 overflow-hidden bg-gray-100 flex items-center justify-center">
              <img
                src={selectedPainting.imageUrl}
                alt={selectedPainting.title.en}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="p-6 md:p-8 border-t border-gray-200">
              <h2 className="text-2xl md:text-3xl font-light mb-2">
                {selectedPainting.title[language as 'en' | 'he']}
              </h2>
              <p className="text-gray-500 text-sm mb-3">{selectedPainting.year}</p>
              <p className="text-gray-700 mb-4 leading-relaxed">
                {selectedPainting.description[language as 'en' | 'he']}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">{selectedPainting.dimensions}</p>
                <button
                  onClick={() => setSelectedPainting(null)}
                  className="px-6 py-2 bg-black text-white rounded font-light hover:bg-gray-800 transition-colors"
                >
                  {t('gallery.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Helper function to distribute paintings across walls
function getWallPaintings(wallName: string, paintings: Painting[]): Painting[] {
  const paintingsPerWall = Math.ceil(paintings.length / 4);
  switch (wallName) {
    case 'back':
      return paintings.slice(0, paintingsPerWall);
    case 'right':
      return paintings.slice(paintingsPerWall, paintingsPerWall * 2);
    case 'front':
      return paintings.slice(paintingsPerWall * 2, paintingsPerWall * 3);
    case 'left':
      return paintings.slice(paintingsPerWall * 3);
    default:
      return [];
  }
}
