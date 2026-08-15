/* ============================================================
   Simulador de pista
   Un auto virtual con la misma lógica de 2 sensores.
   Sirve para entender por qué "más rápido" no siempre es mejor.
   ============================================================ */

(function () {
  const cont = document.getElementById('sim-pista');
  if (!cont) return;

  const ANCHO = 600, ALTO = 400;
  const ANCHO_LINEA = 16;     // px — la cinta aisladora
  const EJE = 46;             // px — separación entre ruedas
  const ADELANTE = 30;        // px — cuánto se adelantan los sensores al centro

  cont.innerHTML = `
    <p class="sim-titulo">🏎️ Probá tu auto en una pista virtual</p>
    <p class="sim-sub">Misma lógica que vas a programar. Movés los controles y ves qué pasa
       antes de gastar pilas de verdad.</p>
    <div class="pista-sim">
      <div>
        <div class="pista-lienzo">
          <canvas id="sp-lienzo" width="${ANCHO}" height="${ALTO}"
                  aria-label="Pista virtual con un auto seguidor de línea"></canvas>
        </div>
        <div class="marcador">
          <div><span class="m-eti">Vueltas</span><span class="m-val" id="sp-vueltas">0</span></div>
          <div><span class="m-eti">Vuelta actual</span><span class="m-val" id="sp-tiempo">0.0s</span></div>
          <div><span class="m-eti">Mejor vuelta</span><span class="m-val" id="sp-mejor">—</span></div>
          <div><span class="m-eti">Se salió</span><span class="m-val" id="sp-salidas">0</span></div>
        </div>
      </div>

      <div>
        <div class="control">
          <label for="sp-vel">Velocidad base <span class="valor" id="sp-vel-val">150</span></label>
          <input type="range" id="sp-vel" min="60" max="255" value="150" step="5">
          <p class="ayuda">Es el <code>analogWrite()</code> de los dos motores cuando va derecho. Subila y mirá las curvas.</p>
        </div>

        <div class="control">
          <label for="sp-giro">Fuerza de corrección <span class="valor" id="sp-giro-val">100%</span></label>
          <input type="range" id="sp-giro" min="30" max="200" value="100" step="5">
          <p class="ayuda">Cuánto frena la rueda de adentro al corregir. Más de 100% = esa rueda va en reversa (giro sobre el eje).</p>
        </div>

        <div class="control">
          <label for="sp-sep">Separación de sensores <span class="valor" id="sp-sep-val">44 mm</span></label>
          <input type="range" id="sp-sep" min="20" max="90" value="44" step="2">
          <p class="ayuda">Distancia entre los dos ojos. Muy juntos = tiembla. Muy separados = reacciona tarde.</p>
        </div>

        <div class="btn-fila">
          <button class="btn btn-primario" id="sp-play" type="button">▶ Arrancar</button>
          <button class="btn btn-suave" id="sp-reset" type="button">↺ Reiniciar</button>
        </div>

        <div class="marcador" style="margin-top:.8rem">
          <div><span class="m-eti">Sensor IZQ</span><span class="m-val" id="sp-s-izq">0</span></div>
          <div><span class="m-eti">Sensor DER</span><span class="m-val" id="sp-s-der">0</span></div>
          <div><span class="m-eti">Decisión</span><span class="m-val" id="sp-accion" style="font-size:.85rem">—</span></div>
        </div>
      </div>
    </div>
  `;

  const lienzo = document.getElementById('sp-lienzo');
  const ctx = lienzo.getContext('2d');

  /* ---------------------------------------------------------
     La pista: una curva cerrada con rectas y curvas de distinto radio
     --------------------------------------------------------- */
  const PUNTOS = [];
  const N = 720;
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2;
    // Un ovalo con tres curvas de radio distinto: rectas, curva abierta y chicane
    const r = 168 + 26 * Math.cos(3 * t);
    PUNTOS.push({
      x: ANCHO / 2 + r * Math.cos(t),
      y: ALTO / 2 + r * 0.58 * Math.sin(t)
    });
  }

  /* Mapa de la pista en blanco y negro, para "leer" como lo haría el sensor */
  const mapa = document.createElement('canvas');
  mapa.width = ANCHO; mapa.height = ALTO;
  const mctx = mapa.getContext('2d');
  let datosMapa = null;

  function dibujarTrazado(c, colorLinea) {
    c.beginPath();
    c.moveTo(PUNTOS[0].x, PUNTOS[0].y);
    for (let i = 1; i < PUNTOS.length; i++) c.lineTo(PUNTOS[i].x, PUNTOS[i].y);
    c.closePath();
    c.lineWidth = ANCHO_LINEA;
    c.lineJoin = 'round';
    c.lineCap = 'round';
    c.strokeStyle = colorLinea;
    c.stroke();
  }

  function prepararMapa() {
    mctx.fillStyle = '#ffffff';
    mctx.fillRect(0, 0, ANCHO, ALTO);
    dibujarTrazado(mctx, '#000000');
    datosMapa = mctx.getImageData(0, 0, ANCHO, ALTO).data;
  }
  prepararMapa();

  /* devuelve 1 si el sensor ve negro (línea), 0 si ve blanco */
  function leerSensor(x, y) {
    const px = Math.round(x), py = Math.round(y);
    if (px < 0 || py < 0 || px >= ANCHO || py >= ALTO) return 0;
    const i = (py * ANCHO + px) * 4;
    return datosMapa[i] < 128 ? 1 : 0;
  }

  /* ---------------------------------------------------------
     Estado del auto
     --------------------------------------------------------- */
  const auto = { x: 0, y: 0, ang: 0, vIzq: 0, vDer: 0 };
  let corriendo = false;
  let vueltas = 0, salidas = 0, tiempoVuelta = 0, mejor = null;
  let idxAnterior = 0, avance = 0, perdidoMs = 0;
  let estela = [];
  let ultimoT = 0;

  const $ = id => document.getElementById(id);

  function puntoMasCercano(x, y) {
    let mejorI = 0, mejorD = Infinity;
    for (let i = 0; i < PUNTOS.length; i++) {
      const dx = PUNTOS[i].x - x, dy = PUNTOS[i].y - y;
      const d = dx * dx + dy * dy;
      if (d < mejorD) { mejorD = d; mejorI = i; }
    }
    return { i: mejorI, dist: Math.sqrt(mejorD) };
  }

  function reponer(i) {
    const a = PUNTOS[i];
    const b = PUNTOS[(i + 8) % PUNTOS.length];
    auto.x = a.x; auto.y = a.y;
    auto.ang = Math.atan2(b.y - a.y, b.x - a.x);
    idxAnterior = i;
    perdidoMs = 0;
    estela = [];
  }

  function reiniciar() {
    vueltas = 0; salidas = 0; tiempoVuelta = 0; mejor = null; avance = 0;
    reponer(0);
    $('sp-vueltas').textContent = '0';
    $('sp-salidas').textContent = '0';
    $('sp-mejor').textContent = '—';
    $('sp-tiempo').textContent = '0.0s';
    dibujar();
  }

  /* ---------------------------------------------------------
     Un paso de simulación (lo mismo que hará el Arduino)
     --------------------------------------------------------- */
  function paso(dt) {
    const base = +$('sp-vel').value;
    const giro = +$('sp-giro').value / 100;
    const sep = +$('sp-sep').value;

    /* dónde están los sensores ahora */
    const cos = Math.cos(auto.ang), sen = Math.sin(auto.ang);
    const sx = auto.x + cos * ADELANTE, sy = auto.y + sen * ADELANTE;
    const ix = sx - sen * (sep / 2), iy = sy + cos * (sep / 2);
    const dx = sx + sen * (sep / 2), dy = sy - cos * (sep / 2);

    const sIzq = leerSensor(ix, iy);
    const sDer = leerSensor(dx, dy);

    /* ---- la lógica, igual que en el código de la parada 4 ---- */
    let pIzq, pDer, accion;
    if (sIzq === 0 && sDer === 0) {
      pIzq = base; pDer = base; accion = 'adelante';
    } else if (sIzq === 1 && sDer === 0) {
      pIzq = base * (1 - giro); pDer = base; accion = 'izquierda';
    } else if (sIzq === 0 && sDer === 1) {
      pIzq = base; pDer = base * (1 - giro); accion = 'derecha';
    } else {
      pIzq = base * 0.5; pDer = base * 0.5; accion = 'cruce';
    }

    $('sp-s-izq').textContent = sIzq;
    $('sp-s-der').textContent = sDer;
    $('sp-accion').textContent = accion;

    /* PWM -> velocidad real (los motores tienen un mínimo para arrancar) */
    const aVelocidad = p => {
      const s = Math.sign(p), m = Math.abs(p);
      if (m < 45) return 0;                 // no alcanza para vencer el rozamiento
      return s * (m * 0.62);                // px por segundo
    };
    const objIzq = aVelocidad(pIzq);
    const objDer = aVelocidad(pDer);

    /* Inercia: un motor no cambia de velocidad al instante.
       Esto es lo que hace que a mucha velocidad el auto no llegue a corregir. */
    const TAU = 0.13;                       // segundos en reaccionar
    const k = 1 - Math.exp(-dt / TAU);
    auto.vIzq += (objIzq - auto.vIzq) * k;
    auto.vDer += (objDer - auto.vDer) * k;

    /* cinemática diferencial */
    const v = (auto.vIzq + auto.vDer) / 2;
    const w = (auto.vDer - auto.vIzq) / EJE;
    auto.ang += w * dt;
    auto.x += v * Math.cos(auto.ang) * dt;
    auto.y += v * Math.sin(auto.ang) * dt;

    /* Agarre: las ruedas aguantan hasta cierta aceleración lateral.
       Más allá de eso el auto derrapa hacia afuera de la curva.
       Por esto "más rápido" no siempre es mejor. */
    const A_MAX = 150;
    const aLat = Math.abs(v * w);
    if (aLat > A_MAX) {
      const exceso = (aLat - A_MAX) / A_MAX;
      const desliz = exceso * Math.abs(v) * 0.9 * dt;
      const signo = Math.sign(w);
      auto.x += Math.sin(auto.ang) * signo * desliz;
      auto.y -= Math.cos(auto.ang) * signo * desliz;
    }

    /* estela */
    estela.push({ x: auto.x, y: auto.y });
    if (estela.length > 260) estela.shift();

    /* ¿se salió? */
    const cerca = puntoMasCercano(auto.x, auto.y);
    if (cerca.dist > 55) {
      perdidoMs += dt * 1000;
      if (perdidoMs > 700) {
        salidas++;
        $('sp-salidas').textContent = salidas;
        reponer(cerca.i);
      }
    } else {
      perdidoMs = 0;
    }

    /* ¿completó una vuelta? */
    let paso_i = cerca.i - idxAnterior;
    if (paso_i > PUNTOS.length / 2) paso_i -= PUNTOS.length;
    if (paso_i < -PUNTOS.length / 2) paso_i += PUNTOS.length;
    avance += paso_i;
    idxAnterior = cerca.i;

    tiempoVuelta += dt;
    if (avance >= PUNTOS.length) {
      avance -= PUNTOS.length;
      vueltas++;
      if (mejor === null || tiempoVuelta < mejor) {
        mejor = tiempoVuelta;
        $('sp-mejor').textContent = mejor.toFixed(1) + 's';
      }
      tiempoVuelta = 0;
      $('sp-vueltas').textContent = vueltas;
    }
    $('sp-tiempo').textContent = tiempoVuelta.toFixed(1) + 's';
  }

  /* ---------------------------------------------------------
     Dibujo
     --------------------------------------------------------- */
  function dibujar() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, ANCHO, ALTO);
    dibujarTrazado(ctx, '#15161f');

    /* línea de largada */
    const p0 = PUNTOS[0], p1 = PUNTOS[6];
    const a = Math.atan2(p1.y - p0.y, p1.x - p0.x) + Math.PI / 2;
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(p0.x + Math.cos(a) * 26, p0.y + Math.sin(a) * 26);
    ctx.lineTo(p0.x - Math.cos(a) * 26, p0.y - Math.sin(a) * 26);
    ctx.stroke();
    ctx.fillStyle = '#e11d48';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('largada', p0.x + 12, p0.y - 30);

    /* estela */
    if (estela.length > 1) {
      ctx.strokeStyle = 'rgba(79,70,229,.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(estela[0].x, estela[0].y);
      for (let i = 1; i < estela.length; i++) ctx.lineTo(estela[i].x, estela[i].y);
      ctx.stroke();
    }

    /* auto */
    const sep = +$('sp-sep').value;
    ctx.save();
    ctx.translate(auto.x, auto.y);
    ctx.rotate(auto.ang);

    ctx.fillStyle = '#3b4157';
    ctx.beginPath();
    if (ctx.roundRect) { ctx.roundRect(-24, -22, 56, 44, 7); } else { ctx.rect(-24, -22, 56, 44); }
    ctx.fill();

    ctx.fillStyle = '#1d2130';
    ctx.fillRect(-14, -28, 20, 8);
    ctx.fillRect(-14, 20, 20, 8);

    /* los dos ojos */
    const sIzq = $('sp-s-izq').textContent === '1';
    const sDer = $('sp-s-der').textContent === '1';
    ctx.beginPath(); ctx.arc(ADELANTE - 4, sep / 2, 4.5, 0, 7);
    ctx.fillStyle = sIzq ? '#22c55e' : '#ffffff';
    ctx.fill(); ctx.strokeStyle = '#4c1d95'; ctx.lineWidth = 1.6; ctx.stroke();

    ctx.beginPath(); ctx.arc(ADELANTE - 4, -sep / 2, 4.5, 0, 7);
    ctx.fillStyle = sDer ? '#22c55e' : '#ffffff';
    ctx.fill(); ctx.stroke();

    ctx.restore();
  }

  /* ---------------------------------------------------------
     Bucle principal
     --------------------------------------------------------- */
  function bucle(t) {
    if (corriendo) {
      const dt = ultimoT ? Math.min((t - ultimoT) / 1000, 0.05) : 0.016;
      ultimoT = t;
      paso(dt);
      dibujar();
    } else {
      ultimoT = 0;
    }
    requestAnimationFrame(bucle);
  }
  requestAnimationFrame(bucle);

  /* ---------------------------------------------------------
     Controles
     --------------------------------------------------------- */
  $('sp-play').addEventListener('click', () => {
    corriendo = !corriendo;
    $('sp-play').textContent = corriendo ? '⏸ Pausar' : '▶ Arrancar';
  });
  $('sp-reset').addEventListener('click', reiniciar);

  const unir = (idRange, idTexto, sufijo) => {
    const r = $(idRange), t = $(idTexto);
    const pintar = () => { t.textContent = r.value + sufijo; };
    r.addEventListener('input', pintar);
    pintar();
  };
  unir('sp-vel', 'sp-vel-val', '');
  unir('sp-giro', 'sp-giro-val', '%');
  unir('sp-sep', 'sp-sep-val', ' mm');

  reiniciar();
})();
