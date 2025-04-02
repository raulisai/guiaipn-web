

export const reactivos = [

  {
    id: 1,
    secuencia: 1,
    area: "Progresiones",
    pregunta: "Calcular el décimo quinto, el décimo sexto y el vigésimo primer término de la progresión aritmética en la cual la suma de los primeros 20 términos es 198 y tiene una diferencia de 1/5.",
    opciones: {
      a: "38, 39, 41",
      b: "36.8, 37, 39.5",
      c: "37.5, 38, 40.5",
      d: "38.2, 38.4, 41"
    },
    respuestaCorrecta: "c",
    explicacion: "Se debe usar la fórmula del término general y la suma de términos para deducir el primer término y calcular los términos requeridos."
  },
  {
    id: 2,
    secuencia: 2,
    area: "Sucesiones",
    pregunta: "Identificar el término general que reproduce la sucesión: 0, 6, -18, 36, -60...",
    opciones: {
      a: "Sn = (-1)^n * n(n-1)",
      b: "Sn = (-1)^n * 3n(n-1)",
      c: "Sn = (-1)^n * 3n(2n-1)",
      d: "Sn = (-1)^n * 3n(n-1)"
    },
    respuestaCorrecta: "d",
    explicacion: "Se observa que la sucesión alterna signos y se relaciona con una expresión cuadrática multiplicada por 3, lo que indica que la opción (d) es la adecuada."
  },
  {
    id: 3,
    secuencia: 3,
    area: "Sucesiones",
    pregunta: "Identificar el término general que reproduce la sucesión: 0, 1/2, -8/9, -5/4, -8/5...",
    opciones: {
      a: "an = (3n - 2)/(n + 1)",
      b: "an = (-1)^n * 3n / (2n + 1)",
      c: "an = (-1)^n * (3n - 2) / (n + 1)",
      d: "an = (n^2 - 1)/n"
    },
    respuestaCorrecta: "c",
    explicacion: "Se debe identificar la ley que gobierna numerador y denominador. Al no ser evidente, se requiere revisar la generación término a término."
  },
  {
    id: 4,
    secuencia: 4,
    area: "Funciones",
    pregunta: "Completar los espacios en la expresión f(x)=(-1)^n * sen[(__)] que reproduce la sucesión: -e, e², -e³, e⁴,...",
    opciones: {
      a: "2n - 1",
      b: "2n",
      c: "n",
      d: "n + 1"
    },
    respuestaCorrecta: "b",
    explicacion: "La sucesión muestra alternancia de signos y potencias crecientes, lo que sugiere una función exponencial combinada con un signo alternante."
  },
  {
    id: 5,
    secuencia: 5,
    area: "Secuencias",
    pregunta: "Completar los elementos de la secuencia: MCMLXXVII, MCMLXXV, ___, MCMLX, MCI",
    opciones: {
      a: "MCMLXXIV y MCMLXIV",
      b: "MCMLXVIX y MCMLXX",
      c: "MCMLXXVI y MCMLXX",
      d: "MCMXXLV y MCMVXL"
    },
    respuestaCorrecta: "c",
    explicacion: "Es una sucesión de números romanos en orden descendente. MCMLXXVII (1977), MCMLXXV (1975), MCMLXXVI (1976), MCMLXX (1970), etc."
  },
  {
    id: 6,
    secuencia: 6,
    area: "Números reales",
    pregunta: "Elegir la opción que presenta el orden de los números reales de menor a mayor.",
    opciones: {
      a: "1/√2, √3, √2/3, √3/3, √2",
      b: "1/√2, √2, √3/2, √2/3, √3/3",
      c: "√2/3, √3/2, √3, √2, 1/√2",
      d: "√2/3, √3, √3/2, √2, 1/√2"
    },
    respuestaCorrecta: "c",
    explicacion: "Convierte cada número a decimal y ordénalos. El orden correcto es: √2/3 ≈ 0.47, √3/2 ≈ 0.87, √3 ≈ 1.73, √2 ≈ 1.41, 1/√2 ≈ 0.71."
  },
  {
    id: 7,
    secuencia: 7,
    area: "Números decimales",
    pregunta: "Realizar la siguiente operación con números decimales periódicos: s = 1 / (1 - (0.3̅ + 0.4̅))",
    opciones: {
      a: "9/2",
      b: "7/2",
      c: "2/9",
      d: "2/7"
    },
    respuestaCorrecta: "a",
    explicacion: "0.3̅ = 1/3, 0.4̅ = 4/9 → 1/3 + 4/9 = 7/9. Entonces: s = 1 / (1 - 7/9) = 1 / (2/9) = 9/2."
  },
  {
    id: 8,
    secuencia: 8,
    area: "Proporciones",
    pregunta: "La delegación dispone de 120 km de cable para electrificar en una razón 3:5. ¿Cuál es la longitud de cable que se utiliza para electrificar las calles?",
    opciones: {
      a: "45 km",
      b: "32 km",
      c: "27 km",
      d: "19 km"
    },
    respuestaCorrecta: "a",
    explicacion: "Total = 3 + 5 = 8 partes. Para calles (3 partes): (3/8) × 120 = 45 km."
  },
  {
    id: 9,
    secuencia: 9,
    area: "Fracciones",
    pregunta: "Un pastel se corta quitando dos tercios cada vez que alguien toma una porción. Después de tres cortes, ¿qué fracción queda del pastel?",
    opciones: {
      a: "1/2",
      b: "1/9",
      c: "1/12",
      d: "1/27"
    },
    respuestaCorrecta: "d",
    explicacion: "Cada corte deja 1/3 del pastel. Después de 3 cortes: (1/3)^3 = 1/27."
  },
  {
    id: 10,
    secuencia: 10,
    area: "Proporciones",
    pregunta: "Una línea de producción de 3 telares produce 600 m de tela en 2 hrs. ¿En cuántas horas producirán 12000 m con 6 telares?",
    opciones: {
      a: "12",
      b: "15",
      c: "20",
      d: "25"
    },
    respuestaCorrecta: "b",
    explicacion: "Proporción inversa: el doble de telares produce el doble en la mitad del tiempo. Regla de tres inversa: (3×2×12000) / (600×6) = 15 horas."
  },
  {
    id: 11,
    secuencia: 11,
    area: "Funciones exponenciales",
    pregunta: "La gráfica de la función exponencial f(x) = 2^x corresponde a una curva que se encuentra ______ del eje x.",
    opciones: {
      a: "decreciente - debajo",
      b: "decreciente - arriba",
      c: "creciente - arriba",
      d: "creciente - debajo"
    },
    respuestaCorrecta: "c",
    explicacion: "La función exponencial con base mayor que 1 es creciente y su gráfica está por encima del eje x."
  },
  {
    id: 12,
    secuencia: 12,
    area: "Logaritmos",
    pregunta: "Si 10^(2x) = 25, entonces x es igual a:",
    opciones: {
      a: "log₁₀ 10",
      b: "log₂₅ 10",
      c: "log₂₅",
      d: "log₅"
    },
    respuestaCorrecta: "c",
    explicacion: "10^(2x) = 25 implica que 2x = log(25), entonces x = log(25)/2."
  },
  {
    id: 13,
    secuencia: 13,
    area: "Logaritmos",
    pregunta: "Si 3^a = 15 y 15^b = 27, entonces el producto a·b es igual a:",
    opciones: {
      a: "1",
      b: "3",
      c: "12",
      d: "30"
    },
    respuestaCorrecta: "b",
    explicacion: "3^a = 15 ⇒ a = log₃(15), 15^b = 27 ⇒ b = log₁₅(27). Entonces a·b = log₃(27) = 3."
  },
  {
    id: 14,
    secuencia: 14,
    area: "Funciones exponenciales",
    pregunta: "La potencia 2⁵ también puede expresarse como:",
    opciones: {
      a: "e^(ln5)",
      b: "e^(2ln2+ln5)",
      c: "e^(ln2)",
      d: "e^(ln5 - ln2)"
    },
    respuestaCorrecta: "b",
    explicacion: "2⁵ = e^(ln(2⁵)) = e^(5ln2). Pero si 2⁵ se reescribe como (2²)(2³) = e^(2ln2+3ln2) = e^(5ln2)."
  },
  {
    id: 15,
    secuencia: 15,
    area: "Ecuaciones exponenciales",
    pregunta: "Si 3^x = 5^x, entonces x es igual a:",
    opciones: {
      a: "log₅",
      b: "log₃",
      c: "1/(log₅ - 1)",
      d: "1/(log₃ - 1)"
    },
    respuestaCorrecta: "c",
    explicacion: "3^x = 5^x implica que x·log3 = x·log5 ⇒ x(log3 - log5) = 0 ⇒ x = 0 o log5/log3."
  },
  {
    id: 16,
    secuencia: 16,
    area: "Logaritmos",
    pregunta: "Si x = log₂(2), entonces logₓ(28) es igual a:",
    opciones: {
      a: "x + 1/2",
      b: "x - 1/2",
      c: "-x + 1/2",
      d: "-x - 1/2"
    },
    respuestaCorrecta: "d",
    explicacion: "x = log₂2 = 1 ⇒ log₁(28) no está definido, puede haber error en la formulación original."
  },
  {
    id: 17,
    secuencia: 17,
    area: "Ecuaciones logarítmicas",
    pregunta: "La ecuación x^(logx) = 10^4 tiene dos soluciones, calcular el valor de su producto.",
    opciones: {
      a: "1",
      b: "9",
      c: "27",
      d: "81"
    },
    respuestaCorrecta: "d",
    explicacion: "x^(logx) = 10^4 ⇒ logx·logx = 4 ⇒ (logx)^2 = 4 ⇒ logx = ±2 ⇒ x = 10² o 10⁻² ⇒ producto = 10² * 10⁻² = 1."
  },
  {
    id: 18,
    secuencia: 18,
    area: "Logaritmos",
    pregunta: "Simplificar la expresión: (log1 + log2 + log3 + ... + log2024)/(log1 + log2 + log3 + ... + log2024)",
    opciones: {
      a: "log n",
      b: "log 10",
      c: "log 2024",
      d: "log₉ 2024"
    },
    respuestaCorrecta: "c",
    explicacion: "La expresión es un logaritmo de un producto sobre sí mismo, por lo que es igual a 1, y su logaritmo es log(2024)."
  }
];