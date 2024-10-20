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
  console.log("Z0:", Z0);
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

export function calcularCoeficienteReflexion(Z0, loadImpedance) {
  const ZL = math.complex(loadImpedance.Rl, loadImpedance.Xl);
  const numerador = math.subtract(ZL, Z0); 
  const denominador = math.add(ZL, Z0); 
  const Ro = math.divide(numerador, denominador); 
  console.log("Coeficiente de Reflexión (Ro):", Ro);
  return Ro;
}

// Función para calcular la corriente de entrada I_e a partir de V_e y Z0
  export function calcularCorrienteEntrada(Ve, Z0) {
  const Ie = math.divide(Ve, Z0);
  console.log("Corriente de entrada (Ie):", Ie);
  return Ie;
}

// Función para calcular la magnitud del voltaje a lo largo de la línea
  export function calcularVoltajeALoLargoDeLaLinea(amplitud, phase, Z0, gamma, longitud, pasos) {
  // Convertir amplitud y phase a un número complejo
  const Ve = math.complex({ r: amplitud, phi: phase * (Math.PI / 180) }); // Convertir phase de grados a radianes
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

export function calcularCorrienteALoLargoDeLaLinea(amplitud, phase, Z0, gamma, longitud, pasos) {
  // Validar entradas
  if (!Number.isFinite(amplitud) || !Number.isFinite(phase) || !Number.isFinite(Z0) || !Number.isFinite(gamma) || !Number.isFinite(longitud) || !Number.isInteger(pasos)) {
    console.error("Entradas no válidas:", { amplitud, phase, Z0, gamma, longitud, pasos });
    return { corrienteMagnitudes: [], zValores1: [] };
  }

  // Convertir amplitud y phase a un número complejo
  const Ve = math.complex({ r: amplitud, phi: phase * (Math.PI / 180) }); // Convertir phase de grados a radianes
  const Ie = calcularCorrienteEntrada(Ve, Z0); // Calcular la corriente de entrada

  // Definir un rango de distancias a lo largo de la línea
  const zValores1 = Array.from({ length: pasos }, (_, i) => (i / pasos) * longitud);

  // Convertir gamma en un número complejo
  const gammaComplex = math.complex(gamma.re, gamma.im);

  // Calcular la magnitud de la corriente a lo largo de la línea
  const corrienteMagnitudes = zValores1.map(z => {
    const term1 = math.multiply(Ie, math.cosh(math.multiply(gammaComplex, z)));
    const term2 = math.multiply(Ve, math.sinh(math.multiply(gammaComplex, z)), 1 / Z0);
    const I = math.subtract(term1, term2); // Aplicar la ecuación de corriente
    return math.abs(I); // Obtener la magnitud de la corriente
  });

  console.log("Corriente a lo largo de la línea (magnitudes):", corrienteMagnitudes);
  return { corrienteMagnitudes, zValores1 };
}

