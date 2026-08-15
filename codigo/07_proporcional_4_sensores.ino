// ============================================================
//  SEGUIDOR DE LINEA - 4 sensores + control proporcional
//  Nivel experto
// ============================================================

const int ENA = 5, IN1 = 6, IN2 = 7;
const int IN3 = 8, IN4 = 9, ENB = 10;

// Los 4 sensores, de izquierda a derecha
const int S1 = 2, S2 = 3, S3 = 4, S4 = 11;

const int VE_LINEA = HIGH;

// ---------- AJUSTES ----------
int   VEL_BASE = 150;    // velocidad cuando va centrado
float Kp       = 50.0;   // cuanto corrige por cada unidad de error
int   VEL_BUSQUEDA = 130;

// Memoria: hacia donde estaba yendo la ultima vez que vio la linea
float ultimoError = 0;

void setup() {
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  pinMode(S1, INPUT); pinMode(S2, INPUT);
  pinMode(S3, INPUT); pinMode(S4, INPUT);

  Serial.begin(9600);
  frenar();
  delay(2000);
}

void loop() {
  // ---------- 1. SENSAR ----------
  int s1 = (digitalRead(S1) == VE_LINEA) ? 1 : 0;
  int s2 = (digitalRead(S2) == VE_LINEA) ? 1 : 0;
  int s3 = (digitalRead(S3) == VE_LINEA) ? 1 : 0;
  int s4 = (digitalRead(S4) == VE_LINEA) ? 1 : 0;

  int cuantos = s1 + s2 + s3 + s4;

  // ---------- 2. PENSAR ----------
  if (cuantos == 0) {
    // Perdio la linea: gira hacia donde la vio por ultima vez
    buscarLinea();
    return;
  }

  if (cuantos == 4) {
    // Los cuatro ven negro: cruce o linea de llegada
    adelanteRecto();
    return;
  }

  // Posicion ponderada de la linea
  float error = (s1 * -3.0 + s2 * -1.0 + s3 * 1.0 + s4 * 3.0) / cuantos;
  ultimoError = error;

  float correccion = Kp * error;

  // ---------- 3. ACTUAR ----------
  int velIzq = VEL_BASE + correccion;
  int velDer = VEL_BASE - correccion;

  motorIzquierdo(constrain(velIzq, -255, 255));
  motorDerecho(constrain(velDer, -255, 255));
}

// ============================================================

void buscarLinea() {
  // Si la vio ultima vez a la izquierda, gira a la izquierda a buscarla.
  if (ultimoError < 0) {
    motorIzquierdo(-VEL_BUSQUEDA);
    motorDerecho(VEL_BUSQUEDA);
  } else {
    motorIzquierdo(VEL_BUSQUEDA);
    motorDerecho(-VEL_BUSQUEDA);
  }
}

void adelanteRecto() {
  motorIzquierdo(VEL_BASE);
  motorDerecho(VEL_BASE);
}

void frenar() {
  motorIzquierdo(0);
  motorDerecho(0);
}

void motorIzquierdo(int v) {
  if (v >= 0) { digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW); }
  else        { digitalWrite(IN1, LOW);  digitalWrite(IN2, HIGH); v = -v; }
  analogWrite(ENA, constrain(v, 0, 255));
}

void motorDerecho(int v) {
  if (v >= 0) { digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW); }
  else        { digitalWrite(IN3, LOW);  digitalWrite(IN4, HIGH); v = -v; }
  analogWrite(ENB, constrain(v, 0, 255));
}
