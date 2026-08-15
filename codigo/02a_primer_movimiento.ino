// ============================================
//  Parada 2 - Primer movimiento
//  Los dos motores para adelante, y frenan.
// ============================================

// Motor izquierdo (canal A del L298N)
const int ENA = 5;   // velocidad (tiene que ser un pin ~)
const int IN1 = 6;   // sentido
const int IN2 = 7;   // sentido

// Motor derecho (canal B del L298N)
const int IN3 = 8;
const int IN4 = 9;
const int ENB = 10;  // velocidad (pin ~)

void setup() {
  // Los 6 pines son salidas: el Arduino manda, no escucha.
  pinMode(ENA, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  pinMode(ENB, OUTPUT);
}

void loop() {
  // --- Los dos motores para adelante ---
  digitalWrite(IN1, HIGH);   // motor izquierdo: sentido 1
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH);   // motor derecho: sentido 1
  digitalWrite(IN4, LOW);

  analogWrite(ENA, 180);     // velocidad: de 0 a 255
  analogWrite(ENB, 180);

  delay(2000);               // andar 2 segundos

  // --- Frenar ---
  analogWrite(ENA, 0);
  analogWrite(ENB, 0);

  delay(2000);               // quieto 2 segundos
}
