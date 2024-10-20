import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { calcularZ0, calcularGamma, calcularVoltajeALoLargoDeLaLinea } from '../utils/Calculos';

function Graficas({ inputValues }) {
  const [voltajeDatos, setVoltajeDatos] = useState(null);  // Inicializar como null

  useEffect(() => {
    // Verifica que inputValues no esté vacío y que todos los valores importantes estén presentes
    if (Object.keys(inputValues).length === 0) return;

    const { amplitud, 
      frequency, 
      loadImpedance, 
      cableType, 
      radioInterno, 
      radioExterno, 
      conductividad, 
      conductividadElectrica, 
      permeabilidad, 
      permitividad, 
      permeabilidadDielectrica, 
      phase, 
      longitud
    } = inputValues;

    const w = 2*Math.PI*frequency;
    // Constantes del vacío
    const mu_0 = 1.25e-6;  // Permeabilidad del vacío en H/m
    const e_0 = 8.85e-12;  // Permitividad del vacío en F/m

    // Calcular permeabilidades y permitividades
    const uc = permeabilidad * mu_0;
    const Ed = permitividad * e_0;
    const mu_d = permeabilidadDielectrica * e_0;

    let R, L, G, C, Z0, gamma;

    //PUSE ESTA FUNCION AQUI PARA PODER CALCULAR LOS VALORES DE R,C,L,G. Los calcula
    //ya que son atributos de funciones gamma y Z0
    
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
    console.log("Gamma:", gamma);
    console.log("Z0:", Z0);
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
    const Z0Calculated = Z0 || calcularZ0(R, L, G, C, w);
    const gammaCalculated = gamma || calcularGamma(R, L, G, C, w);

    // Calcular la magnitud del voltaje a lo largo de la línea
    const { voltajeMagnitudes, zValores } = calcularVoltajeALoLargoDeLaLinea(
      amplitud,
      phase,
      Z0Calculated,
      gammaCalculated,
      longitud,
      100  // Número de puntos en la gráfica
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
  }, [inputValues]);

  return (
    <div>
      <h2>Gráfico de la Magnitud del Voltaje a lo largo de la Línea</h2>
      {voltajeDatos ? (
        <Line data={voltajeDatos} />
      ) : (
        <p>No hay datos suficientes para generar el gráfico.</p>  // Mensaje en caso de que no haya datos
      )}
    </div>
  );
}

export default Graficas;
