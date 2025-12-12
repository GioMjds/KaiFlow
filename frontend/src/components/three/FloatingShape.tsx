import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

export function FloatingShape({
	position,
	geometry,
	color,
	scale,
	rotationSpeed,
	floatSeed,
}: {
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
	floatSeed?: number;
}) {
	const meshRef = useRef<THREE.Group>(null);
	const floatOffset = useRef((floatSeed ?? Math.random()) * Math.PI * 2);

	useFrame((state) => {
		if (meshRef.current) {
			meshRef.current.rotation.x += rotationSpeed;
			meshRef.current.rotation.y += rotationSpeed * 0.7;
			// smaller float amplitude to reduce movement directions
			meshRef.current.position.y =
				position[1] +
				Math.sin(state.clock.elapsedTime + floatOffset.current) * 0.25;
		}
	});

	// return the actual geometry instance used by the mesh (for reuse in edges)
	const geometryInstance = useMemo(() => {
		switch (geometry) {
			case 'box':
				return new THREE.BoxGeometry(1, 1, 1);
			case 'octahedron':
				return new THREE.OctahedronGeometry(0.7);
			case 'icosahedron':
				return new THREE.IcosahedronGeometry(0.7);
			case 'dodecahedron':
				return new THREE.DodecahedronGeometry(0.7);
			case 'tetrahedron':
				return new THREE.TetrahedronGeometry(0.8);
			case 'torus':
				return new THREE.TorusGeometry(0.5, 0.2, 16, 32);
			default:
				return new THREE.BoxGeometry(1, 1, 1);
		}
	}, [geometry]);

	// build a wireframe geometry once per geometryInstance
	const wireframeGeom = useMemo(() => {
		return new THREE.WireframeGeometry(geometryInstance);
	}, [geometryInstance]);

	return (
		<group ref={meshRef} position={position} scale={scale}>
			{/* render only the wireframe lines (no filled mesh) */}
			<lineSegments>
				<primitive object={wireframeGeom} />
				<lineBasicMaterial attach="material" color={color} linewidth={1} />
			</lineSegments>
		</group>
	);
}
