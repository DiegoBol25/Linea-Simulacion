import React, { useState } from 'react';
import '../hojas-de-estilos/FormularioDatos.css';

function FormInputComponent({ onSubmit }) {
    const [inputValues, setInputValues] = useState({
        amplitud: '100',
        frequency: '110000000',
        phase: '90',
        longitud: '100',
        generatorImpedance: { Rg: 0, Xg: 0 },
        loadImpedance: { Rl: 1, Xl: 1 },
        cableType: 'coaxial',
        radioInterno: '0.001',   
        radioExterno: '0.005',   
        radioConductor: '',    
        distanciaConductores: '',
        material: 'cobre',
        conductividad: 5.96e7,
        permeabilidad: 1,
        dielectrico: 'aire',
        conductividadElectrica: 10e-15,
        permitividad: 1.0,
        permeabilidadDielectrica: 1
    });

    const materiales = [
        { name: 'cobre',    conductividad: 5.96e7, permeabilidad: 1 },
        { name: 'oro',      conductividad: 4.1e7,  permeabilidad: 1 },
        { name: 'plata',    conductividad: 6.3e7,  permeabilidad: 1 },
        { name: 'aluminio', conductividad: 3.5e7,  permeabilidad: 1 },
        { name: 'hierro',   conductividad: 1.0e7,  permeabilidad: 5000 },
        { name: 'níquel',   conductividad: 1.43e7, permeabilidad: 600 },
        { name: 'platino',  conductividad: 9.43e6, permeabilidad: 1 }
    ];

    const dielectricos = [
        { name: 'Aire',                     conductividadElectrica: 10e-15,           permitividad: 1.0,   permeabilidadDielectrica: 1 },
        { name: 'Polietileno',              conductividadElectrica: 10e-15,           permitividad: 2.25,  permeabilidadDielectrica: 1 },
        { name: 'Teflon',                   conductividadElectrica: 10e-16,           permitividad: 2.1,   permeabilidadDielectrica: 1 },
        { name: 'Ceramicas',                conductividadElectrica: 10e-12,           permitividad: 48,    permeabilidadDielectrica: 1 },
        { name: 'Espuma de Polietileno',    conductividadElectrica: 10e-17,           permitividad: 1.6,   permeabilidadDielectrica: 1 },
        { name: 'Mica',                     conductividadElectrica: 10e-15,           permitividad: 7,     permeabilidadDielectrica: 1 }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.includes('generatorImpedance')) {
            setInputValues(prev => ({
                ...prev,
                generatorImpedance: {
                    ...prev.generatorImpedance,
                    [name.split('.')[1]]: value
                }
            }));
        } else if (name.includes('loadImpedance')) {
            setInputValues(prev => ({
                ...prev,
                loadImpedance: {
                    ...prev.loadImpedance,
                    [name.split('.')[1]]: value
                }
            }));
        } else if (name === 'material') {
            const selectedMaterial = materiales.find(material => material.name === value);
            setInputValues(prev => ({
                ...prev,
                material: value,
                conductividad: selectedMaterial.conductividad,
                permeabilidad: selectedMaterial.permeabilidad
            }));
        } else if (name === 'dielectrico') {
            const selectedDielectrico = dielectricos.find(dielectrico => dielectrico.name === value);
            setInputValues(prev => ({
                ...prev,
                dielectrico: value,
                conductividadElectrica: selectedDielectrico.conductividadElectrica,
                permitividad: selectedDielectrico.permitividad,
                permeabilidadDielectrica: selectedDielectrico.permeabilidadDielectrica
            }));
        } else {
            setInputValues({ ...inputValues, [name]: value });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(inputValues);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Amplitud de Voltaje:</label>
                <input type="number"
                 name="amplitud" 
                 value={inputValues.amplitud} 
                 onChange={handleChange} 
                 placeholder="0"
                 />
            </div>
            <div>
                <label>Frecuencia:</label>
                <input type="number" 
                name="frequency" 
                value={inputValues.frequency} 
                onChange={handleChange} 
                placeholder="0"
                />
                
            </div>
            <div>
                <label>Fase del Voltaje:</label>
                <input type="number" 
                name="phase" 
                value={inputValues.phase} 
                onChange={handleChange} 
                placeholder="0"
                />
            </div>

            <div>
                <label>Longitud de la línea:</label>
                <input type="number" 
                name="longitud" 
                value={inputValues.longitud} 
                onChange={handleChange} 
                placeholder="0"
                />
            </div>

            <div>
                <label>Impedancia del generador (Re) Rg:</label>
                <input type="number" 
                name="generatorImpedance.Rg" 
                value={inputValues.generatorImpedance.Rg} 
                onChange={handleChange} 
                placeholder="0"/>
            </div>
            <div>
                <label>Impedancia del generador (Im) jXg:</label>
                <input type="number" 
                name="generatorImpedance.Xg" 
                value={inputValues.generatorImpedance.Xg}
                onChange={handleChange} 
                placeholder="0"/>
            </div>
            <div>
                <label>Impedancia de la carga (Re) Rl:</label>
                <input type="number" 
                name="loadImpedance.Rl" 
                value={inputValues.loadImpedance.Rl} 
                onChange={handleChange} placeholder="0"/>
            </div>

            <div>
                <label>Impedancia de la carga (Im) Xl:</label>
                <input type="number" 
                name="loadImpedance.Xl" 
                value={inputValues.loadImpedance.Xl} 
                onChange={handleChange} placeholder="0"/>
            </div>

            <div>
                <label>Tipo de Cable:</label>
                <select className='selector' 
                name="cableType" 
                value={inputValues.cableType} 
                onChange={handleChange}>
                    <option value="coaxial">Coaxial</option>
                    <option value="bifilar">Bifilar</option>
                </select>
            </div>

            {inputValues.cableType === 'coaxial' && (
        <div>
            <label>Radio Interno (mm):</label>
            <input
                type="number"
                name="radioInterno"
                value={inputValues.radioInterno}
                onChange={handleChange}
                placeholder="Diámetro Interno"
            />
            <label>Radio Externo (mm):</label>
            <input
                type="number"
                name="radioExterno"
                value={inputValues.radioExterno}
                onChange={handleChange}
                placeholder="Diámetro Externo"
            />
        </div>
        )}

        {inputValues.cableType === 'bifilar' && (
        <div>
            <label>Radio del Conductor (mm):</label>
                <input
                    type="number"
                    name="radioConductor"
                    value={inputValues.radioConductor}
                    onChange={handleChange}
                    placeholder="Radio del Conductor"
                />
            <label>Distancia entre Conductores (mm):</label>
                <input
                    type="number"
                    name="distanciaConductores"
                    value={inputValues.distanciaConductores}
                    onChange={handleChange}
                    placeholder="Distancia entre Conductores"
                />
        </div>
)}

            <div>
                <label>Material del conductor:</label>
                <select name="material" className='selector'
                value={inputValues.material} 
                onChange={handleChange}>
                    {materiales.map(material => (
                        <option key={material.name} value={material.name}>
                            {material.name.charAt(0).toUpperCase() + material.name.slice(1)}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <p><strong>Conductividad eléctrica:</strong> {inputValues.conductividad} S/m</p>
                <p><strong>Permeabilidad magnética relativa:</strong> {inputValues.permeabilidad}</p>
            </div>

            <div>
                <label>Material dieléctrico:</label>
                <select name="dielectrico" className='selector'
                value={inputValues.dielectrico} 
                onChange={handleChange}>
                    {dielectricos.map(dielectrico => (
                        <option key={dielectrico.name} value={dielectrico.name}>
                            {dielectrico.name.charAt(0).toUpperCase() + dielectrico.name.slice(1)}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <p><strong>Conductividad Eléctrica:</strong> {inputValues.conductividadElectrica}</p>
                <p><strong>Permitividad Relativa:</strong> {inputValues.permitividad}</p>
                <p><strong>Permeabilidad Relativa </strong> {inputValues.permeabilidadDielectrica}</p>
            </div>

            <button className='Boton' type="submit">Simular</button>
        </form>
    );
}

export default FormInputComponent;
