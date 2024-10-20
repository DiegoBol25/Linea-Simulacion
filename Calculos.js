import React, { useEffect, useState } from 'react';
import { create, all } from 'mathjs';

const math = create(all);

// Función para calcular la impedancia característica Z0
export function calcularZ0(R, L, G, C, frequency) {
  const w = 2 * Math.PI * frequency;
  if (!Number.isFinite(R) || !Number.isFinite(L) || !Number.isFinite(G) || !Number.isFinite(C) || !Number.isFinite(w)) {
    console.error("Valores de entrada no válidos:", { R, L, G, C, w });
    return NaN;
  }
  // Calcular impedancia serie y admitancia paralelo
  const RL = math.complex(R, w * L);  // R + jωL
  const GC = math.complex(G, w * C);  // G + jωC
  // Calcular Z0 = sqrt((R + jωL) / (G + jωC))
  const Z0 = math.sqrt(math.divide(RL, GC));
  return Z0;
}



// Función para calcular la constante de propagación gamma
export function calcularGamma(R, L, G, C, frequency) {
  const w = 2 * Math.PI * frequency;

  if (!Number.isFinite(R) || !Number.isFinite(L) || !Number.isFinite(G) || !Number.isFinite(C) || !Number.isFinite(w)) {
    console.error("Valores de entrada no válidos:", { R, L, G, C, w });
    return NaN;
  }
  const RL = math.complex(R, w * L); 
  const GC = math.complex(G, w * C);  
  const gamma = math.sqrt(math.multiply(RL, GC));
  console.log("Gamma calculado: ", gamma);
  return gamma;
}

// Función para calcular la corriente de entrada I_e a partir de V_e y Z0
  export function calcularCorrienteEntrada(Ve, Z0) {
  const Ie = math.divide(Ve, Z0);
  console.log("Corriente de entrada (Ie):", Ie);
  return Ie;
}

// Función para calcular la magnitud del voltaje a lo largo de la línea
  export function calcularVoltajeALoLargoDeLaLinea(amplitud, fase, Z0, gamma, longitud, pasos) {
  // Convertir amplitud y fase a un número complejo
  const Ve = math.complex({ r: amplitud, phi: fase * (Math.PI / 180) }); // Convertir fase de grados a radianes
  const Ie = calcularCorrienteEntrada(Ve, Z0); // Calcular la corriente de entrada
  // Definir un rango de distancias a lo largo de la línea
  const zValores = Array.from({ length: pasos }, (_, i) => (i / pasos) * longitud);
  // Convertir gamma en un número complejo
  const gammaComplex = math.complex(gamma.re, gamma.im);
  // Calcular la magnitud del voltaje a lo largo de la línea
  const voltajeMagnitudes = zValores.map(z => {
    const term1 = math.multiply(Ve, math.cosh(math.multiply(gammaComplex, z)));
    const term2 = math.multiply(Ie, Z0, math.sinh(math.multiply(gammaComplex, z)));
    const V = math.subtract(term1, term2); // Aplicar la ecuación de voltaje
    return math.abs(V); // Obtener la magnitud del voltaje
  });

  console.log("Voltaje a lo largo de la línea (magnitudes):", voltajeMagnitudes);
  return { voltajeMagnitudes, zValores };
}
