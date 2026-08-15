// ============================================
//  Parada 3 - Leer los sensores
//  No mueve nada. Solo mira y cuenta lo que ve.
// ============================================

const int SENSOR_IZQ = 2;
const int SENSOR_DER = 3;

void setup() {
  pinMode(SENSOR_IZQ, INPUT);
  pinMode(SENSOR_DER, INPUT);

  Serial.begin(9600);          // abrir la conversacion con la compu
  Serial.println("Sensores listos. Pasa la mano por abajo.");
}

void loop() {
  int izq = digitalRead(SENSOR_IZQ);
  int der = digitalRead(SENSOR_DER);

  Serial.print("IZQ: ");
  Serial.print(izq);
  Serial.print("   DER: ");
  Serial.print(der);

  // Un dibujito para leerlo de un vistazo
  Serial.print("   [");
  Serial.print(izq == 1 ? "#" : ".");
  Serial.print(der == 1 ? "#" : ".");
  Serial.println("]");

  delay(100);   // 10 lecturas por segundo, para poder leerlo
}
