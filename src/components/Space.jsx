"use client"

import axios from "axios"
import { useState } from "react"
import { Plus, Trash2, Edit2, Check, X, Loader2, Edit } from "lucide-react"
import Visualization from "./GalaxyVisulization"
import GalaxyVisualization from "./GalaxyVisulization"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { toast } from "@/components/ui/use-toast"

// interface Galaxy {
//     name: string
//     x: number
//     y: number
//     z: number
// }

export default function Space() {
    const [galaxies, setGalaxies] = useState([])
    const [newGalaxyName, setNewGalaxyName] = useState("")
    const [editingIndex, setEditingIndex] = useState(null)
    const [editingGalaxy, setEditingGalaxy] = useState({ name: "", x: 0, y: 0, z: 0 })
    const [isLoading, setIsLoading] = useState(false)
    const [isPreview, setIsPreview] = useState(false)

    const API_KEY = "AIzaSyAYJaYaKLhGUfddS9_MPK4BjmReiupeVig"; // Replace with your API key


    const generateCoordinates = async (name) => {

        const prompt = `Check if the galaxy named "${name}" exists in the database. 
        If the galaxy exists, generate plausible X, Y, Z coordinates for it. The coordinates should be integers between -1000 and 1000. 
        If the galaxy doesn't exist, return the coordinates as {"x": 0, "y": 0, "z": 0}. 
        Respond only with a JSON object in this format: {"x": 123, "y": 456, "z": 789}`;


        setIsLoading(true)
        try {
            const res = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
                {
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: prompt }],
                        },
                    ],
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );


            const inputString = res.data.candidates?.[0]?.content?.parts?.[0]?.text;
            const regex = /{([^}]+)}/;

            // Extracting the content
            const match = inputString.match(regex);

            if (match) {
                const contentInsideBraces = match[1].trim(); // match[1] will contain the content inside the curly braces

                const content = contentInsideBraces;

                // Adding curly braces to make it a valid JSON string
                const jsonString = `{${content}}`;

                // Parsing the JSON string
                const parsedObject = JSON.parse(jsonString);

                // Accessing the values
                const x = parsedObject.x;
                const y = parsedObject.y;
                const z = parsedObject.z;
                return { x, y, z };
            } else {
                console.log("No content inside curly braces found.");
            }
        } catch (error) {
            console.error("Error fetching response:", error?.response?.data || error.message);
            // setResponse("Error fetching response. Try again.");
        } finally {
            setIsLoading(false);
        }
    }

    const addGalaxy = async () => {
        if (newGalaxyName) {
            const coordinates = await generateCoordinates(newGalaxyName)
            if (coordinates) {
                setGalaxies([...galaxies, { name: newGalaxyName, ...coordinates }])
                console.log(galaxies)
                setNewGalaxyName("")
            }
        }
    }

    const removeGalaxy = (index) => {
        setGalaxies(galaxies.filter((_, i) => i !== index))
    }

    const startEditing = (index) => {
        setEditingIndex(index)
        setEditingGalaxy({ ...galaxies[index] })
    }

    const cancelEditing = () => {
        setEditingIndex(null)
        setEditingGalaxy({ name: "", x: 0, y: 0, z: 0 })
    }

    const saveEdit = async () => {
        if (editingIndex !== null) {
            if (editingGalaxy.name !== galaxies[editingIndex].name) {
                const coordinates = await generateCoordinates(editingGalaxy.name)
                if (coordinates) {
                    editingGalaxy.x = coordinates.x
                    editingGalaxy.y = coordinates.y
                    editingGalaxy.z = coordinates.z
                }
            }
            const updatedGalaxies = [...galaxies]
            updatedGalaxies[editingIndex] = editingGalaxy
            setGalaxies(updatedGalaxies)
            setEditingIndex(null)
            setEditingGalaxy({ name: "", x: 0, y: 0, z: 0 })
        }
    }

    const calculateDistance = (g1, g2) => {
        const dx = g1.x - g2.x
        const dy = g1.y - g2.y
        const dz = g1.z - g2.z
        return Math.sqrt(dx * dx + dy * dy + dz * dz)
    }

    return (
    

        <>
            <button onClick={()=>setIsPreview((pre)=>!pre)}>toggle preview</button>
            {
                isPreview ? (
                    <GalaxyVisualization galaxies={galaxies} />
                ) : (
                    <div className="container mx-auto p-4">
                        <h1 className="text-2xl font-bold mb-4">Galaxy Distance Calculator</h1>

                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <input
                                type="text"
                                placeholder="Galaxy Name"
                                value={newGalaxyName}
                                onChange={(e) => setNewGalaxyName(e.target.value)}
                                className="border p-2 rounded"
                            />
                            <button
                                onClick={addGalaxy}
                                disabled={isLoading}
                                className="flex items-center bg-blue-500 text-white p-2 rounded disabled:bg-gray-400"
                            >
                                {isLoading ? (
                                    <svg className="mr-2 h-4 w-4 animate-spin" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v16l12-8-12-8z" />
                                    </svg>
                                ) : (
                                    <svg className="mr-2 h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14m7-7H5" />
                                    </svg>
                                )}
                                Add Galaxy
                            </button>
                        </div>

                        <table className="min-w-full table-auto border-collapse border border-gray-300">
                            <thead>
                                <tr>
                                    <th className="border px-4 py-2">Name</th>
                                    <th className="border px-4 py-2">X</th>
                                    <th className="border px-4 py-2">Y</th>
                                    <th className="border px-4 py-2">Z</th>
                                    <th className="border px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {galaxies.map((galaxy, index) => (
                                    <tr key={index}>
                                        {editingIndex === index ? (
                                            <>
                                                <td className="border px-4 py-2">
                                                    <input
                                                        value={editingGalaxy.name}
                                                        onChange={(e) => setEditingGalaxy({ ...editingGalaxy, name: e.target.value })}
                                                        className="border p-2 rounded"
                                                    />
                                                </td>
                                                <td className="border px-4 py-2">{editingGalaxy.x}</td>
                                                <td className="border px-4 py-2">{editingGalaxy.y}</td>
                                                <td className="border px-4 py-2">{editingGalaxy.z}</td>
                                                <td className="border px-4 py-2">
                                                    <button
                                                        onClick={saveEdit}
                                                        className="mr-2 bg-green-500 text-white p-2 rounded disabled:bg-gray-400"
                                                        disabled={isLoading}
                                                    >
                                                        {isLoading ? (
                                                            <svg className="h-4 w-4 animate-spin" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v16l12-8-12-8z" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={cancelEditing}
                                                        className="bg-red-500 text-white p-2 rounded"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="border px-4 py-2">{galaxy.name}</td>
                                                <td className="border px-4 py-2">{galaxy.x}</td>
                                                <td className="border px-4 py-2">{galaxy.y}</td>
                                                <td className="border px-4 py-2">{galaxy.z}</td>
                                                <td className="border px-4 py-2">
                                                    <button
                                                        onClick={() => startEditing(index)}
                                                        className="mr-2 bg-yellow-500 text-white p-2 rounded"
                                                    >
                                                        <Edit />
                                                    </button>
                                                    <button
                                                        onClick={() => removeGalaxy(index)}
                                                        className="bg-red-500 text-white p-2 rounded"
                                                    >
                                                        <Trash2 />
                                                    </button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {galaxies.length > 1 && (
                            <div className="mt-8">
                                <h2 className="text-xl font-semibold mb-2">Distance Matrix</h2>
                                <table className="min-w-full table-auto border-collapse border border-gray-300">
                                    <thead>
                                        <tr>
                                            <th className="border px-4 py-2">Galaxy</th>
                                            {galaxies.map((galaxy, index) => (
                                                <th key={index} className="border px-4 py-2">{galaxy.name}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {galaxies.map((galaxy1, i) => (
                                            <tr key={i}>
                                                <td className="border px-4 py-2">{galaxy1.name}</td>
                                                {galaxies.map((galaxy2, j) => (
                                                    <td key={j} className="border px-4 py-2">
                                                        {i === j ? "-" : calculateDistance(galaxy1, galaxy2).toFixed(2)}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* <Visualization galaxies={galaxies} /> */}

                    </div>
                )
            }
        </>
    )
}

