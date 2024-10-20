import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { calcularZ0, calcularGamma, calcularVoltajeALoLargoDeLaLinea, calcularCorrienteALoLargoDeLaLinea, calcularCoeficienteReflexion} from '../utils/Calculos';


// Registrar los componentes necesarios de Chart.js
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Graficas({ inputValues }) {
  
  const [voltajeDatos, setVoltajeDatos] = useState({
    labels: [],  // Inicialmente vacío
    datasets: [],  // Inicializar datasets como un array 
  });  // Inicializar como null

  const [corrienteDatos, setCorrienteDatos] = useState({
    labels: [],  // Inicialmente vacío
    datasets: [],  // Inicializar datasets como un array 
  }); 

  useEffect(() => {
    // Verifica que inputValues no esté vacío y que todos los valores importantes estén presentes
    if (Object.keys(inputValues).length === 0) return;

    const amplitud = parseFloat(inputValues.amplitud);
    const frequency = parseFloat(inputValues.frequency);
    const loadImpedance = inputValues.loadImpedance; // Este puede ser un objeto, se mantiene igual
    const cableType = inputValues.cableType;
    const radioInterno = parseFloat(inputValues.radioInterno);
    const radioExterno = parseFloat(inputValues.radioExterno);
    const conductividad = parseFloat(inputValues.conductividad);
    const conductividadElectrica = parseFloat(inputValues.conductividadElectrica);
    const permeabilidad = parseFloat(inputValues.permeabilidad);
    const permitividad = parseFloat(inputValues.permitividad);
    const permeabilidadDielectrica = parseFloat(inputValues.permeabilidadDielectrica);
    const phase = parseFloat(inputValues.phase);
    const longitud = parseFloat(inputValues.longitud);

    const w = 2*Math.PI*frequency;
    // Constantes del vacío
    const mu_0 = 1.25e-6;  // Permeabilidad del vacío en H/m
    const e_0 = 8.85e-12;  // Permitividad del vacío en F/m

    // Calcular permeabilidades y permitividades
    const uc = permeabilidad * mu_0;
    const Ed = permitividad * e_0;
    const mu_d = permeabilidadDielectrica * e_0;

    let R, L, G, C, Z0, gamma, Ro;

    function calcularCoaxial() {
      if (!radioInterno || !radioExterno || !conductividad || radioInterno <= 0 || radioExterno <= 0) {
        console.error("Error: Parámetros de radio o conductividad inválidos en coaxial.");
        return { R: NaN, C: NaN, G: NaN, L: NaN };
      }
      const Rs = Math.sqrt((w * uc) / (2 * conductividad));
      const R = Rs * ((1 / (2 * Math.PI * radioInterno)) + (1 / (2 * Math.PI * radioExterno)));
      if (radioExterno <= radioInterno) {
        console.error("Error: radioExterno debe ser mayor que radioInterno.");
        return { R: NaN, C: NaN, G: NaN, L: NaN };
      }
      const C = (2 * Math.PI * Ed) / Math.log(radioExterno / radioInterno);
      const sigma_d = conductividadElectrica;
      const tanDelta = 0.01;
      const G = 2 * Math.PI * sigma_d * tanDelta;
      const L = (mu_d) / (2 * Math.PI) * Math.log(radioExterno / radioInterno);
      return { R, C, G, L };
    }

    if (cableType === 'coaxial') {
      const { R: R_Calculado, C: C_Calculado, G: G_Calculado, L: L_Calculado } = calcularCoaxial();
      if (Number.isFinite(R_Calculado) && Number.isFinite(C_Calculado) && Number.isFinite(G_Calculado) && Number.isFinite(L_Calculado)) {
        R = R_Calculado;
        C = C_Calculado;
        G = G_Calculado;
        L = L_Calculado;
      }
    }

    console.log("Amplitud:", amplitud);
    console.log("Fase:", phase);
    console.log("Frecuencia:", w);
    console.log("R:", R);
    console.log("L:", L);
    console.log("G:", G);
    console.log("C:", C);
    console.log("Longitud:", longitud);
  
    // Verificar que los valores importantes no sean undefined ni null
    if (
      !Number.isFinite(amplitud) ||
      !Number.isFinite(phase) ||
      !Number.isFinite(w) ||
      !Number.isFinite(R) ||
      !Number.isFinite(L) ||
      !Number.isFinite(G) ||
      !Number.isFinite(C) ||
      !Number.isFinite(longitud)
    ) {

      console.error("Valores de entrada no válidos para los cálculos:", inputValues);
      return;
    }
   
    // Si Z0 y gamma no están definidos, los calculamos con los valores dados
     Z0 = Z0 || calcularZ0(R, L, G, C, w);
     gamma= gamma || calcularGamma(R, L, G, C, w);
     Ro = Ro || calcularCoeficienteReflexion (Z0, loadImpedance);
    
      // Extraer partes reales e imaginarias


    // Calcular la magnitud del voltaje a lo largo de la línea
    const { voltajeMagnitudes, zValores } = calcularVoltajeALoLargoDeLaLinea(
      amplitud,
      phase,
      Z0,
      gamma,
      longitud,
      50  // Número de puntos en la gráfica
    );

    const { corrienteMagnitudes, zValores1 } = calcularCorrienteALoLargoDeLaLinea(
      amplitud, 
      phase, 
      Z0, 
      gamma, 
      longitud, 
      50
    );

    // Guardar los datos para la gráfica
    setVoltajeDatos({
      labels: zValores.map(z => z.toFixed(2)), // Distancias a lo largo de la línea
      datasets: [
        {
          label: 'Magnitud del Voltaje |V(z)|',
          data: voltajeMagnitudes,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
        },
      ],
    });

    setCorrienteDatos({
      labels: zValores1.map(z => z.toFixed(2)),
      datasets: [
        {
          label: 'Magnitud del Corriente |I(z)|',
          data: corrienteMagnitudes,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
        },
      ],
    });

  }, [inputValues]);

  return (
    <>
      <div>
        <h2>Gráfico de la Magnitud del Voltaje a lo largo de la Línea</h2>
        {voltajeDatos.labels.length > 0 ? (
          <Line data={voltajeDatos} />
        ) : (
          <p>No hay datos suficientes para generar el gráfico.</p>
        )}
      </div>
  
      <div>
        <h2>Gráfico de la Magnitud del Corriente a lo largo de la Línea</h2>
        {corrienteDatos.labels.length > 0 ? (
          <Line data={corrienteDatos} />
        ) : (
          <p>No hay datos suficientes para generar el gráfico.</p>
        )}
      </div>
    </>
  );
  
}
export default Graficas;
