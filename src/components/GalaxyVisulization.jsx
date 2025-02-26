"use client"

import { useState, useRef, useMemo } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Html } from "@react-three/drei"
import * as THREE from "three"

// Scale factor to bring the large coordinates into a more manageable range
const SCALE_FACTOR = 0.01

function CelestialBody({ galaxy }) {
    const [hovered, setHovered] = useState(false)
    const meshRef = useRef()
    const glowRef = useRef()

    // Generate a random color for each galaxy
    const color = useMemo(() => new THREE.Color(`hsl(${Math.random() * 360}, 100%, 75%)`), [])

    // Scale the position
    const position = useMemo(
        () => [galaxy.x * SCALE_FACTOR, galaxy.y * SCALE_FACTOR, galaxy.z * SCALE_FACTOR],
        [galaxy.x, galaxy.y, galaxy.z],
    )

    useFrame((state) => {
        if (glowRef.current) {
            glowRef.current.rotation.y += 0.01
            glowRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.04)
        }
    })

    return (
        <group position={position}>
            <mesh ref={meshRef} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshStandardMaterial color={color} />
            </mesh>
            <mesh ref={glowRef}>
                <sphereGeometry args={[0.6, 32, 32]} />
                <meshBasicMaterial color={color} transparent opacity={0.3} />
            </mesh>
            {hovered && (
                <Html>
                    <div
                        style={{
                            backgroundColor: "rgba(0, 0, 0, 0.7)",
                            color: "white",
                            padding: "8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontFamily: "Arial, sans-serif",
                        }}
                    >
                        <p style={{ fontWeight: "bold", marginBottom: "4px" }}>{galaxy.name}</p>
                        <p>
                            X: {galaxy.x}, Y: {galaxy.y}, Z: {galaxy.z}
                        </p>
                    </div>
                </Html>
            )}
        </group>
    )
}

function SubtleAxes() {
    return (
        <group>
            {["x", "y", "z"].map((axis) => (
                <line key={axis}>
                    <bufferGeometry
                        attach="geometry"
                        {...new THREE.BufferGeometry().setFromPoints([
                            new THREE.Vector3(axis === "x" ? -100 : 0, axis === "y" ? -100 : 0, axis === "z" ? -100 : 0),
                            new THREE.Vector3(axis === "x" ? 100 : 0, axis === "y" ? 100 : 0, axis === "z" ? 100 : 0),
                        ])}
                    />
                    <lineBasicMaterial attach="material" color="#ffffff" opacity={0.2} transparent />
                </line>
            ))}
        </group>
    )
}

function CameraController() {
    const { camera } = useThree()

    useMemo(() => {
        camera.position.set(20, 20, 20)
        camera.far = 10000
        camera.updateProjectionMatrix()
    }, [camera])

    return null
}

function GalaxyVisualization({ galaxies }) {
    return (
        <div style={{ width: "100%", height: "100vh", backgroundColor: "black" }}>
            <Canvas>
                <CameraController />
                <color attach="background" args={["#000000"]} />
                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={0.5} />
                <SubtleAxes />
                {galaxies.map((galaxy, index) => (
                    <CelestialBody key={index} galaxy={galaxy} />
                ))}
                <OrbitControls />
            </Canvas>
        </div>
    )
}

export default GalaxyVisualization

