// ============================================================
//  SEGUIDOR DE LINEA - version basica con 2 sensores
//  Taller de Robotica
// ============================================================

// ---------- Motores (puente H L298N) ----------
const int ENA = 5, IN1 = 6, IN2 = 7;    // motor izquierdo
const int IN3 = 8, IN4 = 9, ENB = 10;   // motor derecho

// ---------- Sensores infrarrojos ----------
const int SENSOR_IZQ = 2;
const int SENSOR_DER = 3;

// Cambia esto a LOW si TU sensor da 0 sobre el negro
// (lo descubriste en el desafio 1 de la parada 3)
const int VE_LINEA = HIGH;

// ---------- Velocidades: aca se ajusta todo ----------
const int VEL_NORMAL = 150;   // cuando va derecho
const int VEL_GIRO   = 170;   // la rueda de afuera al corregir
const int VEL_FRENO  = 0;     // la rueda de adentro al corregir

void setup() {
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);

  pinMode(SENSOR_IZQ, INPUT);
  pinMode(SENSOR_DER, INPUT);

  Serial.begin(9600);

  // 2 segundos para sacar la mano antes de que arranque
  frenar();
  delay(2000);
}

void loop() {
  // ---------- 1. SENSAR ----------
  bool izq = (digitalRead(SENSOR_IZQ) == VE_LINEA);
  bool der = (digitalRead(SENSOR_DER) == VE_LINEA);

  // ---------- 2. PENSAR y 3. ACTUAR ----------
  if (!izq && !der) {
    // Caso A: la linea esta en el medio
    adelante();

  } else if (izq && !der) {
    // Caso B: me fui a la derecha -> vuelvo a la izquierda
    corregirIzquierda();

  } else if (!izq && der) {
    // Caso C: me fui a la izquierda -> vuelvo a la derecha
    corregirDerecha();

  } else {
    // Caso D: los dos ven negro -> cruce o llegada
    frenar();
  }
}

// ============================================================
//  Los movimientos
// ============================================================

void adelante() {
  motorIzquierdo(VEL_NORMAL);
  motorDerecho(VEL_NORMAL);
}

void corregirIzquierda() {
  motorIzquierdo(VEL_FRENO);   // freno la de adentro
  motorDerecho(VEL_GIRO);      // acelero la de afuera
}

void corregirDerecha() {
  motorIzquierdo(VEL_GIRO);
  motorDerecho(VEL_FRENO);
}

void frenar() {
  motorIzquierdo(0);
  motorDerecho(0);
}

// ============================================================
//  Control de cada motor por separado.
//  Velocidad positiva = adelante. Negativa = atras.
// ============================================================

void motorIzquierdo(int velocidad) {
  if (velocidad >= 0) {
    digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);
  } else {
    digitalWrite(IN1, LOW);  digitalWrite(IN2, HIGH);
    velocidad = -velocidad;
  }
  analogWrite(ENA, constrain(velocidad, 0, 255));
}

void motorDerecho(int velocidad) {
  if (velocidad >= 0) {
    digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);
  } else {
    digitalWrite(IN3, LOW);  digitalWrite(IN4, HIGH);
    velocidad = -velocidad;
  }
  analogWrite(ENB, constrain(velocidad, 0, 255));
}
