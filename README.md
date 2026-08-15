# 🤖 Seguidor de Línea — Taller de Robótica

Material didáctico para construir un auto seguidor de línea con Arduino, pensado para
chicos y chicas de **10 a 15 años** que ya conocen Arduino.

No es un tutorial de "copiá este circuito": es una ruta de 7 paradas en la que cada
componente se entiende, se prueba y se le gana con desafíos antes de sumar el siguiente.

## La ruta

| # | Parada | Contenido |
|---|--------|-----------|
| 0 | **El desafío** | Qué se construye, materiales, cómo armar la pista |
| 1 | **El motor DC** | Cómo gira, la caja reductora, por qué el Arduino solo no puede — *sin Arduino* |
| 2 | **El puente H (L298N)** | Pinout, jumpers, PWM, primer código, coreografía |
| 3 | **Los sensores IR** | Reflexión infrarroja, Monitor Serie, calibración, altura de montaje |
| 4 | **La lógica** ⭐ | Tabla de verdad en papel, simulador interactivo, código completo |
| 5 | **El armado** | Orden de montaje, ubicación de sensores, reparto del peso, cableado |
| 6 | **A la pista** | Simulador de pista, ajuste fino, motores desparejos, carrera |
| 7 | **Nivel experto** | 4 sensores, posición ponderada, control proporcional, recuperación |

## Lo interactivo

- **Simulador de lógica** (parada 4): se tocan los sensores y se ve qué decide el auto,
  con la línea de código correspondiente iluminándose. Sirve para entender la tabla de
  verdad sin tener el auto armado.
- **Simulador de pista** (parada 6): un auto virtual con la misma lógica bang-bang, con
  controles de velocidad, fuerza de corrección y separación de sensores. Cuenta vueltas,
  tiempos y salidas de pista.
- **Diagramas de conexión interactivos**: al pasar el mouse por la tabla de cables, se
  resalta ese cable en el diagrama.
- **Tabla de verdad para completar**, con corrección al vuelo.
- **Progreso guardado** en el navegador (desafíos y lista de materiales).
- **Quizzes** con explicación al responder.
- Tema claro/oscuro, responsive, e imprimible.

## Componentes del proyecto

- Arduino Uno
- 2 motores DC con caja reductora
- Módulo puente H L298N
- 2 sensores infrarrojos (4 en la parada 7)
- Chasis con rueda loca, batería 7,4 V, cables dupont

### Pines usados

| Función | Pin |
|---------|-----|
| `ENA` — velocidad motor izquierdo | `~5` |
| `IN1`, `IN2` — sentido motor izquierdo | `6`, `7` |
| `IN3`, `IN4` — sentido motor derecho | `8`, `9` |
| `ENB` — velocidad motor derecho | `~10` |
| Sensor izquierdo / derecho | `2`, `3` |
| Sensores extra (parada 7) | `4`, `11` |

El código de todas las paradas está en [`codigo/`](codigo/) y se puede descargar desde
cada página.

## Publicar en GitHub Pages

El sitio es HTML, CSS y JavaScript puro: **no tiene build ni dependencias**.

1. En el repositorio: **Settings → Pages → Source: GitHub Actions**.
2. Push a `main`. El workflow de [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
   publica solo.

También funciona en Vercel importando el repo (framework: *Other*, sin comando de build)
o abriendo `index.html` directamente en el navegador.

## Para quien da la clase

- La **parada 4 arranca en papel**, no en la computadora. Es el momento en que participa
  todo el grupo, no solo quien programa más rápido. Está señalado en la página.
- Cada parada tiene una sección **"Si no funciona"** con los síntomas reales y su causa
  más probable — pensada para consultar durante la clase, no para leer antes.
- Los desafíos están etiquetados *Fácil / Medio / Difícil* para poder repartirlos según
  el grupo.
- El taller está pensado para ir **a ritmo libre**: cada equipo avanza a su velocidad y
  los desafíos difíciles funcionan como material extra para quienes van más rápido.

## Estructura

```
index.html              Portada, mapa de la ruta, materiales, pista
01-motores.html         …
07-nivel-experto.html
assets/css/estilo.css   Estilos (tokens de color, tema claro/oscuro)
assets/js/comun.js      Progreso, tema, quiz, diagramas, navegación
assets/js/simulador-logica.js
assets/js/simulador-pista.js
codigo/*.ino            Sketches de Arduino descargables
```
