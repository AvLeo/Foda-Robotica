// ============================================================
//  SEGUIDOR DE LINEA - con ajuste fino
//  Todo lo que se toca esta arriba de todo.
// ============================================================

const int ENA = 5, IN1 = 6, IN2 = 7;
const int IN3 = 8, IN4 = 9, ENB = 10;
const int SENSOR_IZQ = 2, SENSOR_DER = 3;

const int VE_LINEA = HIGH;    // cambiar a LOW si tu sensor es al reves

// ---------- LOS NUMEROS QUE AJUSTAS ----------
int VEL_NORMAL = 150;   // velocidad en recta
int VEL_GIRO   = 175;   // rueda de afuera al corregir
int VEL_FRENO  = 0;     // rueda de adentro (proba -80 para giro brusco)

// Compensacion: ningun par de motores es igual.
// Si el auto se va SIEMPRE a la derecha, subi COMP_IZQ o baja COMP_DER.
float COMP_IZQ = 1.00;
float COMP_DER = 1.00;

const bool DIAGNOSTICO = false;   // true = manda datos al Monitor Serie

void setup() {
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  pinMode(SENSOR_IZQ, INPUT); pinMode(SENSOR_DER, INPUT);

  if (DIAGNOSTICO) Serial.begin(9600);

  frenar();
  delay(2000);    // tiempo para soltar el auto y sacar la mano
}

void loop() {
  bool izq = (digitalRead(SENSOR_IZQ) == VE_LINEA);
  bool der = (digitalRead(SENSOR_DER) == VE_LINEA);

  if (!izq && !der) {
    motorIzquierdo(VEL_NORMAL);
    motorDerecho(VEL_NORMAL);
  } else if (izq && !der) {
    motorIzquierdo(VEL_FRENO);
    motorDerecho(VEL_GIRO);
  } else if (!izq && der) {
    motorIzquierdo(VEL_GIRO);
    motorDerecho(VEL_FRENO);
  } else {
    frenar();
  }

  if (DIAGNOSTICO) {
    Serial.print(izq); Serial.print(" "); Serial.println(der);
  }
}

// ============================================================

void frenar() {
  motorIzquierdo(0);
  motorDerecho(0);
}

void motorIzquierdo(int v) {
  v = (int)(v * COMP_IZQ);
  if (v >= 0) { digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW); }
  else        { digitalWrite(IN1, LOW);  digitalWrite(IN2, HIGH); v = -v; }
  analogWrite(ENA, constrain(v, 0, 255));
}

void motorDerecho(int v) {
  v = (int)(v * COMP_DER);
  if (v >= 0) { digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW); }
  else        { digitalWrite(IN3, LOW);  digitalWrite(IN4, HIGH); v = -v; }
  analogWrite(ENB, constrain(v, 0, 255));
}
