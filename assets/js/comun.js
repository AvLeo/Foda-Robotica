/* ============================================================
   Seguidor de Línea — Taller de Robótica
   Funciones comunes a todas las páginas:
   tema, progreso, código, quiz, tabla de verdad, navegación.
   ============================================================ */

/* ---------------------------------------------------------
   1. El mapa de la ruta (fuente única de verdad)
   --------------------------------------------------------- */
const RUTA = [
  {
    id: '0', arch: 'index.html', color: 'acento', icono: '🏁',
    titulo: 'El desafío', desafios: 2,
    desc: 'Qué vamos a construir, qué necesitamos y cómo armar la pista.'
  },
  {
    id: '1', arch: '01-motores.html', color: 'motor', icono: '⚙️',
    titulo: 'El motor DC', desafios: 4,
    desc: 'Cómo se mueve un motor y por qué el Arduino solo no puede con él.'
  },
  {
    id: '2', arch: '02-puente-h.html', color: 'puente', icono: '🔀',
    titulo: 'El puente H (L298N)', desafios: 5,
    desc: 'El músculo del auto. Adelante, atrás, girar y controlar la velocidad.'
  },
  {
    id: '3', arch: '03-sensores.html', color: 'sensor', icono: '👁️',
    titulo: 'Los sensores IR', desafios: 4,
    desc: 'Los ojos del auto: cómo distinguen el negro del blanco y cómo calibrarlos.'
  },
  {
    id: '4', arch: '04-logica.html', color: 'logica', icono: '🧠',
    titulo: 'La lógica', desafios: 4,
    desc: 'El cerebro. La tabla de verdad y el primer código que junta todo.'
  },
  {
    id: '5', arch: '05-armado.html', color: 'armado', icono: '🔧',
    titulo: 'El armado', desafios: 3,
    desc: 'Montar el chasis, ubicar los sensores y ordenar el cableado.'
  },
  {
    id: '6', arch: '06-pista.html', color: 'pista', icono: '🏎️',
    titulo: 'A la pista', desafios: 4,
    desc: 'Calibrar, ajustar la velocidad y sobrevivir a las curvas.'
  },
  {
    id: '7', arch: '07-nivel-experto.html', color: 'experto', icono: '🚀',
    titulo: 'Nivel experto', desafios: 4,
    desc: '4 sensores, control proporcional y trucos de competencia.'
  }
];

const TOTAL_DESAFIOS = RUTA.reduce((s, p) => s + p.desafios, 0);

/* ---------------------------------------------------------
   2. Guardado del progreso
   --------------------------------------------------------- */
const LLAVE = 'seguidor-linea-progreso';

function leerProgreso() {
  try {
    return JSON.parse(localStorage.getItem(LLAVE)) || {};
  } catch (e) {
    return {};
  }
}

function guardarProgreso(datos) {
  try {
    localStorage.setItem(LLAVE, JSON.stringify(datos));
  } catch (e) {
    /* modo incógnito o storage lleno: seguimos sin guardar */
  }
}

function marcar(clave, valor) {
  const datos = leerProgreso();
  if (valor) { datos[clave] = true; } else { delete datos[clave]; }
  guardarProgreso(datos);
  actualizarBarra();
}

function hechosDeParada(idParada) {
  const datos = leerProgreso();
  return Object.keys(datos).filter(k => k.startsWith('d:' + idParada + ':')).length;
}

function actualizarBarra() {
  const datos = leerProgreso();
  const hechos = Object.keys(datos).filter(k => k.startsWith('d:')).length;
  const pct = TOTAL_DESAFIOS ? Math.round((hechos / TOTAL_DESAFIOS) * 100) : 0;
  const relleno = document.querySelector('.progreso-relleno');
  if (relleno) relleno.style.width = pct + '%';
  document.querySelectorAll('[data-progreso-texto]').forEach(el => {
    el.textContent = hechos + ' de ' + TOTAL_DESAFIOS + ' desafíos (' + pct + '%)';
  });
  document.querySelectorAll('[data-progreso-pct]').forEach(el => {
    el.textContent = pct + '%';
  });
}

/* ---------------------------------------------------------
   3. Tema claro / oscuro
   --------------------------------------------------------- */
function iniciarTema() {
  const guardado = localStorage.getItem('seguidor-linea-tema');
  if (guardado) document.documentElement.setAttribute('data-tema', guardado);

  const boton = document.getElementById('btn-tema');
  if (!boton) return;

  const pintar = () => {
    const actual = document.documentElement.getAttribute('data-tema');
    const oscuroSistema = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const estaOscuro = actual === 'oscuro' || (!actual && oscuroSistema);
    boton.textContent = estaOscuro ? '☀️' : '🌙';
    boton.setAttribute('aria-label', estaOscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
  };

  boton.addEventListener('click', () => {
    const actual = document.documentElement.getAttribute('data-tema');
    const oscuroSistema = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const estaOscuro = actual === 'oscuro' || (!actual && oscuroSistema);
    const nuevo = estaOscuro ? 'claro' : 'oscuro';
    document.documentElement.setAttribute('data-tema', nuevo);
    localStorage.setItem('seguidor-linea-tema', nuevo);
    pintar();
    document.dispatchEvent(new CustomEvent('tema-cambiado'));
  });

  pintar();
}

/* ---------------------------------------------------------
   4. Desafíos con tilde
   --------------------------------------------------------- */
function iniciarDesafios() {
  const parada = document.body.dataset.parada;
  if (!parada) return;
  const datos = leerProgreso();

  document.querySelectorAll('.desafio').forEach((caja, i) => {
    const clave = 'd:' + parada + ':' + (caja.dataset.desafio || (i + 1));
    const check = caja.querySelector('.desafio-check');
    if (!check) return;

    check.id = 'chk-' + clave.replace(/:/g, '-');
    const titulo = caja.querySelector('.desafio-titulo');
    if (titulo) titulo.setAttribute('for', check.id);

    check.checked = !!datos[clave];
    caja.classList.toggle('hecho', check.checked);

    check.addEventListener('change', () => {
      caja.classList.toggle('hecho', check.checked);
      marcar(clave, check.checked);
      if (check.checked) festejar(caja);
    });
  });
}

function festejar(caja) {
  caja.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.015)' }, { transform: 'scale(1)' }],
    { duration: 320, easing: 'ease-out' }
  );
}

/* ---------------------------------------------------------
   5. Lista de materiales con tilde
   --------------------------------------------------------- */
function iniciarMateriales() {
  const datos = leerProgreso();
  document.querySelectorAll('.material input[type=checkbox]').forEach((chk, i) => {
    const clave = 'm:' + i;
    const caja = chk.closest('.material');
    chk.id = 'mat-' + i;
    const eti = caja.querySelector('.m-nombre');
    if (eti) eti.setAttribute('for', chk.id);

    chk.checked = !!datos[clave];
    caja.classList.toggle('tildado', chk.checked);
    chk.addEventListener('change', () => {
      caja.classList.toggle('tildado', chk.checked);
      const d = leerProgreso();
      if (chk.checked) { d[clave] = true; } else { delete d[clave]; }
      guardarProgreso(d);
    });
  });
}

/* ---------------------------------------------------------
   6. Coloreado de código Arduino + copiar + descargar
   --------------------------------------------------------- */
const PALABRAS_CLAVE = ['if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break',
  'continue', 'return', 'const', 'static', 'define', 'include', 'true', 'false'];
const TIPOS = ['void', 'int', 'long', 'float', 'double', 'char', 'bool', 'boolean',
  'byte', 'unsigned', 'String'];
const CONSTANTES = ['HIGH', 'LOW', 'INPUT', 'OUTPUT', 'INPUT_PULLUP', 'LED_BUILTIN', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5'];
const FUNCIONES = ['setup', 'loop', 'pinMode', 'digitalWrite', 'digitalRead', 'analogWrite',
  'analogRead', 'delay', 'delayMicroseconds', 'millis', 'micros', 'Serial', 'begin',
  'print', 'println', 'map', 'constrain', 'abs', 'min', 'max', 'random', 'attachInterrupt'];

function escaparHTML(t) {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function colorearArduino(texto) {
  const patron = new RegExp(
    '(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)' +           // 1 comentarios
    '|("(?:[^"\\\\]|\\\\.)*")' +                          // 2 textos
    '|(#\\s*(?:include|define)\\b)' +                     // 3 preprocesador
    '|\\b(' + TIPOS.join('|') + ')\\b' +                  // 4 tipos
    '|\\b(' + PALABRAS_CLAVE.join('|') + ')\\b' +         // 5 palabras clave
    '|\\b(' + CONSTANTES.join('|') + ')\\b' +             // 6 constantes
    '|\\b(' + FUNCIONES.join('|') + ')(?=\\s*[.(])' +     // 7 funciones
    '|\\b(\\d+\\.?\\d*)\\b',                              // 8 números
    'g'
  );

  return escaparHTML(texto).replace(patron, (m, com, str, pre, tipo, clave, cons, fn, num) => {
    if (com)   return '<span class="tk-com">' + com + '</span>';
    if (str)   return '<span class="tk-str">' + str + '</span>';
    if (pre)   return '<span class="tk-key">' + pre + '</span>';
    if (tipo)  return '<span class="tk-tipo">' + tipo + '</span>';
    if (clave) return '<span class="tk-key">' + clave + '</span>';
    if (cons)  return '<span class="tk-const">' + cons + '</span>';
    if (fn)    return '<span class="tk-fn">' + fn + '</span>';
    if (num)   return '<span class="tk-num">' + num + '</span>';
    return m;
  });
}

function iniciarCodigo() {
  document.querySelectorAll('.caja-codigo').forEach(caja => {
    const code = caja.querySelector('pre code');
    if (!code) return;

    const original = code.textContent.replace(/^\n/, '').replace(/\s+$/, '');
    code.dataset.plano = original;
    code.innerHTML = colorearArduino(original);

    const btn = caja.querySelector('.btn-copiar');
    if (btn) {
      btn.addEventListener('click', async () => {
        const texto = code.dataset.plano;
        try {
          await navigator.clipboard.writeText(texto);
        } catch (e) {
          const ta = document.createElement('textarea');
          ta.value = texto;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); } catch (e2) { /* nada */ }
          document.body.removeChild(ta);
        }
        const antes = btn.textContent;
        btn.textContent = '✓ Copiado';
        btn.classList.add('listo');
        setTimeout(() => { btn.textContent = antes; btn.classList.remove('listo'); }, 1800);
      });
    }
  });
}

/* ---------------------------------------------------------
   7. Quiz
   --------------------------------------------------------- */
function iniciarQuiz() {
  document.querySelectorAll('.quiz').forEach(quiz => {
    const devuelta = quiz.querySelector('.quiz-devuelta');
    const opciones = quiz.querySelectorAll('.quiz-op');

    opciones.forEach(op => {
      op.addEventListener('click', () => {
        const acierta = op.dataset.ok === 'si';
        opciones.forEach(o => {
          o.disabled = true;
          if (o.dataset.ok === 'si') o.classList.add('correcta');
        });
        if (!acierta) op.classList.add('incorrecta');

        if (devuelta) {
          devuelta.innerHTML = (acierta ? '<strong>✅ ¡Correcto! </strong>' : '<strong>❌ No es esa. </strong>')
            + (devuelta.dataset.explica || '');
          devuelta.classList.add('visible');
        }
      });
    });
  });
}

/* ---------------------------------------------------------
   8. Tabla de verdad para completar
   --------------------------------------------------------- */
function iniciarTablaVerdad() {
  document.querySelectorAll('.tv-select').forEach(sel => {
    sel.addEventListener('change', () => {
      sel.classList.remove('bien', 'mal');
      if (!sel.value) return;
      sel.classList.add(sel.value === sel.dataset.ok ? 'bien' : 'mal');

      const tabla = sel.closest('table');
      if (!tabla) return;
      const todos = tabla.querySelectorAll('.tv-select');
      const bien = tabla.querySelectorAll('.tv-select.bien');
      const aviso = tabla.parentElement.parentElement.querySelector('[data-tv-aviso]');
      if (aviso && todos.length === bien.length) {
        aviso.style.display = 'block';
        aviso.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400 });
      } else if (aviso) {
        aviso.style.display = 'none';
      }
    });
  });
}

/* ---------------------------------------------------------
   9. Diagramas: resaltar el cable al pasar por la tabla
   --------------------------------------------------------- */
function iniciarDiagramas() {
  document.querySelectorAll('.tabla-cables').forEach(tabla => {
    const idDiagrama = tabla.dataset.diagrama;
    const diagrama = idDiagrama ? document.getElementById(idDiagrama) : null;
    if (!diagrama) return;

    const filas = tabla.querySelectorAll('tbody tr[data-cable]');

    const limpiar = () => {
      diagrama.classList.remove('enfocando');
      diagrama.querySelectorAll('.destacado').forEach(e => e.classList.remove('destacado'));
      filas.forEach(f => f.classList.remove('activa'));
    };

    const enfocar = fila => {
      limpiar();
      const nombre = fila.dataset.cable;
      const partes = diagrama.querySelectorAll('[data-cable="' + nombre + '"]');
      if (!partes.length) return;
      diagrama.classList.add('enfocando');
      partes.forEach(p => p.classList.add('destacado'));
      fila.classList.add('activa');
    };

    filas.forEach(fila => {
      fila.addEventListener('mouseenter', () => enfocar(fila));
      fila.addEventListener('click', () => {
        if (fila.classList.contains('activa')) { limpiar(); } else { enfocar(fila); }
      });
      fila.setAttribute('tabindex', '0');
      fila.addEventListener('focus', () => enfocar(fila));
    });

    tabla.addEventListener('mouseleave', limpiar);
  });
}

/* ---------------------------------------------------------
   10. Navegación anterior / siguiente + menú de la ruta
   --------------------------------------------------------- */
function iniciarNavegacion() {
  const parada = document.body.dataset.parada;
  if (parada === undefined) return;
  const i = RUTA.findIndex(p => p.id === parada);
  const cont = document.getElementById('nav-paradas');
  if (!cont || i === -1) return;

  const antes = RUTA[i - 1];
  const luego = RUTA[i + 1];
  let html = '';

  if (antes) {
    html += '<a class="nav-link anterior" href="' + antes.arch + '">' +
      '<div class="nl-eti">← Anterior</div>' +
      '<div class="nl-tit">' + antes.icono + ' ' + antes.titulo + '</div></a>';
  } else {
    html += '<span></span>';
  }
  if (luego) {
    html += '<a class="nav-link siguiente" href="' + luego.arch + '">' +
      '<div class="nl-eti">Siguiente →</div>' +
      '<div class="nl-tit">' + luego.icono + ' ' + luego.titulo + '</div></a>';
  } else {
    html += '<a class="nav-link siguiente" href="index.html">' +
      '<div class="nl-eti">Volver →</div>' +
      '<div class="nl-tit">🏁 Mapa de la ruta</div></a>';
  }
  cont.innerHTML = html;
}

/* Marca las paradas completas en el mapa de la portada */
function iniciarMapa() {
  document.querySelectorAll('.parada-tarjeta[data-parada-id]').forEach(t => {
    const id = t.dataset.paradaId;
    const info = RUTA.find(p => p.id === id);
    if (!info) return;
    const hechos = hechosDeParada(id);
    const marcador = t.querySelector('[data-cuenta]');
    if (marcador) marcador.textContent = hechos + '/' + info.desafios + ' desafíos';
    if (hechos >= info.desafios && info.desafios > 0) t.classList.add('completa');
  });
}

/* Botón para borrar todo el progreso */
function iniciarReinicio() {
  const btn = document.getElementById('btn-reiniciar');
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (!confirm('¿Borrar todo el progreso guardado en esta computadora? No se puede deshacer.')) return;
    localStorage.removeItem(LLAVE);
    location.reload();
  });
}

/* ---------------------------------------------------------
   Arranque
   --------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  iniciarTema();
  iniciarDesafios();
  iniciarMateriales();
  iniciarCodigo();
  iniciarQuiz();
  iniciarTablaVerdad();
  iniciarDiagramas();
  iniciarNavegacion();
  iniciarMapa();
  iniciarReinicio();
  actualizarBarra();
});
