import { useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { FloatingShape } from './FloatingShape';

export function ThreeDScene({ seed, single = false, corner = 'bottom-right' }: { seed?: number; single?: boolean; corner?: 'top-left' | 'bottom-right' } = {}) {
	const baseShapes: Array<{
		position: [number, number, number];
		geometry:
			| 'box'
			| 'sphere'
			| 'octahedron'
			| 'icosahedron'
			| 'dodecahedron'
			| 'tetrahedron'
			| 'torus';
		color: string;
		scale: number;
		rotationSpeed: number;
	}> = [
		{
			position: [-3, 2, -2],
			geometry: 'icosahedron',
			color: '#3a3a3a',
			scale: 1.2,
			rotationSpeed: 0.008,
		},
		{
			position: [3, 3, -3],
			geometry: 'dodecahedron',
			color: '#3a3a3a',
			scale: 1.0,
			rotationSpeed: 0.006,
		},
		{
			position: [0, 0, -4],
			geometry: 'octahedron',
			color: '#3a3a3a',
			scale: 1.3,
			rotationSpeed: 0.007,
		},
		{
			position: [-4, -2, -1],
			geometry: 'box',
			color: '#3a3a3a',
			scale: 1.1,
			rotationSpeed: 0.009,
		},
		{
			position: [4, -1, -2],
			geometry: 'tetrahedron',
			color: '#3a3a3a',
			scale: 1.0,
			rotationSpeed: 0.01,
		},
		{
			position: [0, 4, -2],
			geometry: 'icosahedron',
			color: '#3a3a3a',
			scale: 1.0,
			rotationSpeed: 0.012,
		},
		{
			position: [-3, 0, 0],
			geometry: 'dodecahedron',
			color: '#3a3a3a',
			scale: 0.9,
			rotationSpeed: 0.007,
		},
		{
			position: [3, 1, -1],
			geometry: 'octahedron',
			color: '#3a3a3a',
			scale: 1.0,
			rotationSpeed: 0.009,
		},
	];

		const singlePosition = corner === 'bottom-right' ? [3.5, -2.5, -3] : [-3.5, 2.5, -3];

		const shapes = single
			? [
				{
					position: singlePosition,
					geometry: 'sphere',
					color: '#3a3a3a',
					scale: 6.0,
					rotationSpeed: 0.004,
				},
			]
			: baseShapes;
	const { camera } = useThree();

	const rng = useMemo(() => {
		const init = seed ?? Math.floor(Math.random() * 0xffffffff);
		let a = init >>> 0;
		return function () {
			a |= 0;
			a = (a + 0x6d2b79f5) | 0;
			let t = Math.imul(a ^ (a >>> 15), 1 | a);
			t = (t + Math.imul(t ^ (t >>> 7), t | 61)) ^ t;
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}, [seed]);

	// explicit types to preserve the [number, number, number] tuple for position
	type ShapeBase = {
		position: [number, number, number];
		geometry:
			| 'box'
			| 'sphere'
			| 'octahedron'
			| 'icosahedron'
			| 'dodecahedron'
			| 'tetrahedron'
			| 'torus';
		color: string;
		scale: number;
		rotationSpeed: number;
	};

	type ShapeWithFloat = ShapeBase & { floatSeed: number };

	const randomized = useMemo<ShapeWithFloat[]>(() => {
		// If rendering a single, fixed sphere, preserve its supplied position
		if (single) {
			return shapes.map((s) => {
				const floatSeed = Math.floor(rng() * 1_000_000_000);
				return {
					...s,
					// keep position as-is for single mode
					position: s.position as [number, number, number],
					floatSeed,
					scale: +(s.scale).toFixed(3),
					rotationSpeed: +(s.rotationSpeed).toFixed(6),
				} as ShapeWithFloat;
			});
		}
		const isPerspective = (camera as any).isPerspectiveCamera || ('fov' in camera && 'aspect' in camera);
		const fovDeg = isPerspective ? (camera as any).fov : 50;
		const aspect = (camera as any).aspect ?? (typeof window !== 'undefined' ? window.innerWidth / window.innerHeight : 1);
		const fovRad = (fovDeg * Math.PI) / 180;

		return shapes.map((s) => {
			const depth = Math.abs((camera.position.z ?? 0) - s.position[2]);
			const heightAtDepth = 2 * Math.tan(fovRad / 2) * Math.max(depth, 0.1);
			const widthAtDepth = heightAtDepth * aspect;

			const margin = 0.6 + s.scale;

			const minX = -widthAtDepth / 2 + margin;
			const maxX = widthAtDepth / 2 - margin;
			const minY = -heightAtDepth / 2 + margin;
			const maxY = heightAtDepth / 2 - margin;

			const x = minX + rng() * Math.max(0, maxX - minX);
			const y = minY + rng() * Math.max(0, maxY - minY);

			const scaleJitter = 0.9 + rng() * 0.3;
			const rotationScale = 0.25 + rng() * 0.5;

			const floatSeed = Math.floor(rng() * 1_000_000_000);

			return {
				...s,
				position: [+(x.toFixed(3)), +(y.toFixed(3)), s.position[2]] as [number, number, number],
				scale: +(s.scale * scaleJitter).toFixed(3),
				rotationSpeed: +(s.rotationSpeed * rotationScale).toFixed(6),
				floatSeed,
			} as ShapeWithFloat;
		});
	}, [camera, seed, single]);

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            <pointLight position={[-10, -10, -5]} intensity={0.8} color="#6b7280" />
            <spotLight position={[0, 5, 5]} intensity={1} angle={0.6} penumbra={1} color="#4b5563" />
            {randomized.map((shapeProps, index) => (
                <FloatingShape key={index} {...shapeProps} />
            ))}
        </>
    );
}
