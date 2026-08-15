/* ============================================================
   Simulador de la lógica de 2 sensores
   Tocá cada sensor para cambiarlo entre blanco y negro
   y mirá qué decide hacer el auto.
   ============================================================ */

(function () {
  const cont = document.getElementById('sim-logica');
  if (!cont) return;

  /* estado: 0 = ve blanco (no hay línea), 1 = ve negro (hay línea) */
  let izq = 0;
  let der = 0;

  /* Los cuatro casos posibles */
  const CASOS = {
    '00': {
      accion: 'Voy derecho 🡅',
      exp: 'Los dos sensores ven blanco: la línea está justo en el medio, pasando entre los dos. Todo en orden.',
      vIzq: 1, vDer: 1, linea: 0, color: 'var(--ok)', fondo: 'var(--ok-fondo)', lineaCod: 1
    },
    '10': {
      accion: 'Doblo a la izquierda ↰',
      exp: 'El sensor izquierdo pisó la línea negra: me estoy yendo hacia la derecha. Freno la rueda izquierda para volver.',
      vIzq: 0, vDer: 1, linea: -1, color: 'var(--logica)', fondo: 'var(--logica-fondo)', lineaCod: 2
    },
    '01': {
      accion: 'Doblo a la derecha ↱',
      exp: 'El sensor derecho pisó la línea: me estoy yendo hacia la izquierda. Freno la rueda derecha para corregir.',
      vIzq: 1, vDer: 0, linea: 1, color: 'var(--pista)', fondo: 'var(--pista-fondo)', lineaCod: 3
    },
    '11': {
      accion: 'Freno 🛑',
      exp: 'Los dos ven negro a la vez: o llegué a un cruce, o a una línea de llegada, o la línea es muy ancha. Por ahora, freno.',
      vIzq: 0, vDer: 0, linea: 0, color: 'var(--peligro)', fondo: 'var(--peligro-fondo)', lineaCod: 4
    }
  };

  cont.innerHTML = `
    <p class="sim-titulo">🎮 Probá la lógica sin tener el auto armado</p>
    <p class="sim-sub">Tocá cada sensor para cambiar lo que está viendo. El auto decide solo.</p>
    <div class="sim-grilla">
      <div class="sim-escena">
        <svg viewBox="0 0 260 300" width="260" height="300" role="img" aria-label="Auto visto desde arriba sobre una línea negra">
          <!-- piso -->
          <rect x="0" y="0" width="260" height="300" rx="10" fill="#f2f3f7"/>
          <!-- línea a seguir -->
          <rect id="sl-linea" x="112" y="0" width="36" height="300" fill="#16171f"/>

          <!-- cuerpo del auto -->
          <g id="sl-auto">
            <rect x="55" y="70" width="150" height="170" rx="18" fill="#3b4157" stroke="#232838" stroke-width="2"/>
            <rect x="88" y="96" width="84" height="52" rx="8" fill="#5b6480"/>
            <text x="130" y="128" text-anchor="middle" font-family="monospace"
                  font-size="13" font-weight="700" fill="#cdd3e6">UNO</text>

            <!-- ruedas -->
            <g id="sl-rueda-izq">
              <rect x="28" y="120" width="30" height="76" rx="8" fill="#1d2130"/>
              <g id="sl-tacos-izq"></g>
            </g>
            <g id="sl-rueda-der">
              <rect x="202" y="120" width="30" height="76" rx="8" fill="#1d2130"/>
              <g id="sl-tacos-der"></g>
            </g>

            <!-- rueda loca -->
            <circle cx="130" cy="232" r="11" fill="#2a3044"/>

            <!-- sensores -->
            <g id="sl-sensor-izq" style="cursor:pointer">
              <rect x="76" y="46" width="42" height="26" rx="6" fill="#7c3aed"/>
              <circle id="sl-ojo-izq" cx="97" cy="59" r="7" fill="#fff" stroke="#4c1d95" stroke-width="2"/>
              <text x="97" y="38" text-anchor="middle" class="txt-svg-chico"
                    font-size="11" font-weight="700" fill="#7c3aed">IZQ</text>
            </g>
            <g id="sl-sensor-der" style="cursor:pointer">
              <rect x="142" y="46" width="42" height="26" rx="6" fill="#7c3aed"/>
              <circle id="sl-ojo-der" cx="163" cy="59" r="7" fill="#fff" stroke="#4c1d95" stroke-width="2"/>
              <text x="163" y="38" text-anchor="middle" class="txt-svg-chico"
                    font-size="11" font-weight="700" fill="#7c3aed">DER</text>
            </g>
          </g>

          <!-- flecha de avance -->
          <path id="sl-flecha" d="M130 26 L130 8 M130 8 L123 16 M130 8 L137 16"
                stroke="#059669" stroke-width="3" fill="none" stroke-linecap="round"/>
        </svg>
      </div>

      <div class="sim-panel">
        <div class="sim-botones">
          <button class="btn-sensor" id="sl-btn-izq" type="button">
            <span class="bs-eti">Sensor izquierdo</span>
            <span class="bs-val">⬜ Blanco (0)</span>
          </button>
          <button class="btn-sensor" id="sl-btn-der" type="button">
            <span class="bs-eti">Sensor derecho</span>
            <span class="bs-val">⬜ Blanco (0)</span>
          </button>
        </div>

        <div class="sim-resultado" id="sl-resultado">
          <span class="sr-eti">El auto decide</span>
          <p class="sr-txt" id="sl-accion">Voy derecho 🡅</p>
          <p class="sr-exp" id="sl-exp"></p>
        </div>

        <div class="sim-codigo" aria-hidden="true">
          <span class="linea" data-l="0">int i = digitalRead(SENSOR_IZQ);</span>
          <span class="linea" data-l="0">int d = digitalRead(SENSOR_DER);</span>
          <span class="linea" data-l="0"> </span>
          <span class="linea" data-l="1">if (i == 0 &amp;&amp; d == 0)  adelante();</span>
          <span class="linea" data-l="2">else if (i == 1 &amp;&amp; d == 0)  girarIzquierda();</span>
          <span class="linea" data-l="3">else if (i == 0 &amp;&amp; d == 1)  girarDerecha();</span>
          <span class="linea" data-l="4">else  frenar();</span>
        </div>
      </div>
    </div>
  `;

  const $ = id => cont.querySelector('#' + id);

  /* --- tacos de las ruedas, para verlas girar --- */
  const TACOS = 6;
  function crearTacos(grupo, x) {
    let html = '';
    for (let i = 0; i < TACOS; i++) {
      html += `<rect x="${x}" y="0" width="30" height="5" rx="2" fill="#697393" />`;
    }
    grupo.innerHTML = html;
  }
  crearTacos($('sl-tacos-izq'), 28);
  crearTacos($('sl-tacos-der'), 202);

  let desplazIzq = 0, desplazDer = 0, ultimo = 0;
  const ALTO = 76, TOPE = 120, PASO = ALTO / TACOS;

  function dibujarTacos(grupo, desplaz) {
    const rects = grupo.querySelectorAll('rect');
    rects.forEach((r, i) => {
      let y = TOPE + ((i * PASO + desplaz) % ALTO + ALTO) % ALTO;
      r.setAttribute('y', y.toFixed(1));
    });
  }

  function animar(t) {
    const dt = ultimo ? Math.min(t - ultimo, 60) : 16;
    ultimo = t;
    const caso = CASOS['' + izq + der];
    desplazIzq += caso.vIzq * dt * 0.09;
    desplazDer += caso.vDer * dt * 0.09;
    dibujarTacos($('sl-tacos-izq'), desplazIzq);
    dibujarTacos($('sl-tacos-der'), desplazDer);
    requestAnimationFrame(animar);
  }
  requestAnimationFrame(animar);

  /* --- pintar el estado actual --- */
  function pintar() {
    const clave = '' + izq + der;
    const caso = CASOS[clave];

    /* ojos de los sensores */
    $('sl-ojo-izq').setAttribute('fill', izq ? '#16171f' : '#ffffff');
    $('sl-ojo-der').setAttribute('fill', der ? '#16171f' : '#ffffff');

    /* botones */
    const btnI = $('sl-btn-izq'), btnD = $('sl-btn-der');
    btnI.classList.toggle('negro', !!izq);
    btnD.classList.toggle('negro', !!der);
    btnI.querySelector('.bs-val').textContent = izq ? '⬛ Negro (1)' : '⬜ Blanco (0)';
    btnD.querySelector('.bs-val').textContent = der ? '⬛ Negro (1)' : '⬜ Blanco (0)';

    /* la línea se corre para que el dibujo tenga sentido */
    const linea = $('sl-linea');
    if (clave === '11') {
      linea.setAttribute('x', '70');
      linea.setAttribute('width', '120');
    } else {
      linea.setAttribute('width', '36');
      linea.setAttribute('x', caso.linea === 0 ? '112' : (caso.linea < 0 ? '78' : '146'));
    }

    /* resultado */
    const res = $('sl-resultado');
    res.style.background = caso.fondo;
    $('sl-accion').textContent = caso.accion;
    $('sl-accion').style.color = caso.color;
    $('sl-exp').textContent = caso.exp;
    cont.querySelector('.sr-eti').style.color = caso.color;

    /* flecha de avance solo si va para adelante */
    $('sl-flecha').style.opacity = clave === '00' ? '1' : '0.15';

    /* línea de código viva */
    cont.querySelectorAll('.sim-codigo .linea').forEach(l => {
      l.classList.toggle('viva', +l.dataset.l === caso.lineaCod);
    });
  }

  $('sl-btn-izq').addEventListener('click', () => { izq = izq ? 0 : 1; pintar(); });
  $('sl-btn-der').addEventListener('click', () => { der = der ? 0 : 1; pintar(); });
  $('sl-sensor-izq').addEventListener('click', () => { izq = izq ? 0 : 1; pintar(); });
  $('sl-sensor-der').addEventListener('click', () => { der = der ? 0 : 1; pintar(); });

  pintar();
})();
