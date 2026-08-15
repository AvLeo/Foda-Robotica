// ============================================
//  Parada 2 - Funciones de movimiento
//  Guarda este archivo: lo vamos a usar siempre.
// ============================================

const int ENA = 5, IN1 = 6, IN2 = 7;    // motor izquierdo
const int IN3 = 8, IN4 = 9, ENB = 10;   // motor derecho

int velocidad = 170;   // de 0 a 255. Proba cambiarlo.

void setup() {
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  frenar();
}

void loop() {
  adelante();          delay(1500);
  frenar();            delay(500);
  atras();             delay(1500);
  frenar();            delay(500);
  girarDerecha();      delay(800);
  frenar();            delay(500);
  girarIzquierda();    delay(800);
  frenar();            delay(2000);
}

// ---------- Las funciones ----------

void adelante() {
  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);
  analogWrite(ENA, velocidad);
  analogWrite(ENB, velocidad);
}

void atras() {
  digitalWrite(IN1, LOW); digitalWrite(IN2, HIGH);
  digitalWrite(IN3, LOW); digitalWrite(IN4, HIGH);
  analogWrite(ENA, velocidad);
  analogWrite(ENB, velocidad);
}

// Gira sobre su propio eje: una rueda adelante, la otra atras.
void girarDerecha() {
  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);   // izquierda adelante
  digitalWrite(IN3, LOW);  digitalWrite(IN4, HIGH);  // derecha atras
  analogWrite(ENA, velocidad);
  analogWrite(ENB, velocidad);
}

void girarIzquierda() {
  digitalWrite(IN1, LOW);  digitalWrite(IN2, HIGH);
  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);
  analogWrite(ENA, velocidad);
  analogWrite(ENB, velocidad);
}

void frenar() {
  analogWrite(ENA, 0);
  analogWrite(ENB, 0);
}
