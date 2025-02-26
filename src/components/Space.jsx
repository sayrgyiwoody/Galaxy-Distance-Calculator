"use client"

import axios from "axios"
import { useState } from "react"
import { Plus, Trash2, Edit2, Check, X, Loader2, Edit } from "lucide-react"
import GalaxyVisualization from "./GalaxyVisulization"

// interface Galaxy {
//     name: string
//     x: number
//     y: number
//     z: number
// }

export default function Space() {
    const [galaxies, setGalaxies] = useState([
        { name: 'milky way', x: -238, y: 854, z: 123 }
        ,
        { name: 'black eye', x: 345, y: -123, z: 678 }
        ,
        { name: 'andromeda', x: 150, y: 200, z: 300 }
    ])
    const [newGalaxyName, setNewGalaxyName] = useState("")
    const [editingIndex, setEditingIndex] = useState(null)
    const [editingGalaxy, setEditingGalaxy] = useState({ name: "", x: 0, y: 0, z: 0 })
    const [isLoading, setIsLoading] = useState(false)
    const [isPreview, setIsPreview] = useState(false)

    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

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
            <div className="p-6 w-full flex justify-end">
                <label className="inline-flex items-center cursor-pointer">
                    <input onChange={() => setIsPreview((prev) => !prev)} type="checkbox" value="" className="sr-only peer" />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                    <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">{isPreview ? 'Hide Preview' : 'Show Preview'}</span>
                </label>
            </div>


            <div className={`${!isPreview ? 'hidden' : 'block'}`}>
                <GalaxyVisualization galaxies={galaxies} />
            </div>


            <div className={`${isPreview ? 'hidden' : 'block'} container mx-auto px-4`}>
                <h1 className="text-2xl font-bold mb-4">Galaxy Distance Calculator</h1>

                <div className="grid items-center grid-cols-2 gap-2 mb-4">
                    <input
                        type="text"
                        placeholder="Enter Galaxy Name"
                        value={newGalaxyName}
                        onChange={(e) => setNewGalaxyName(e.target.value)}
                        className="border-[1.4px] border-gray-500 p-2 ps-4 rounded "
                    />
                    <button onClick={addGalaxy}
                        disabled={!newGalaxyName || isLoading}
                        type="button"
                        className=" disabled:bg-blue-900 disabled:scale-none cursor-pointer w-fit flex items-center justify-center text-white  focus:ring-4  font-medium rounded-lg text-sm px-5 py-2.5 me-2 bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-blue-800 active:scale-95 transition-transform duration-200">
                        {isLoading ? (
                            <svg className="mr-2 h-4 w-4 animate-spin" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v16l12-8-12-8z" />
                            </svg>
                        ) : (
                            <Plus className="mr-2" />
                        )}
                        Add Galaxy
                    </button>
                </div>
                <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-400 bg-gray-900">
                        <thead className="text-xs uppercase bg-gray-700 text-gray-300">
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
                                                    className="cursor-pointer mr-2 bg-green-500 hover:bg-green-600 text-white p-2 rounded disabled:bg-gray-400"
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? (
                                                        <svg className="h-4 w-4 animate-spin" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v16l12-8-12-8z" />
                                                        </svg>
                                                    ) : (
                                                        <Check />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={cancelEditing}
                                                    className="cursor-pointer bg-red-500 hover:bg-red-600 text-white p-2 rounded"
                                                >
                                                    <X />
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
                                                <div className="flex justify-start gap-2">
                                                    <button
                                                        onClick={() => startEditing(index)}
                                                        className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded cursor-pointer flex items-center justify-center"
                                                    >
                                                        <Edit className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => removeGalaxy(index)}
                                                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded cursor-pointer flex items-center justify-center"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>

                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className=" bg-gray-600 h-[.4px] mt-12" />

                {galaxies.length > 1 && (
                    <div className="mt-8 pb-6">
                        <h2 className="text-xl font-semibold mb-2">Distance Matrix</h2>
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left rtl:text-right text-gray-400 bg-gray-900">
                                <thead className="text-xs uppercase bg-gray-700 text-gray-300">
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
                    </div>
                )}

                {/* <Visualization galaxies={galaxies} /> */}

            </div>

        </>
    )
}

