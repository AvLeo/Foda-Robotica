// ============================================
//  Parada 3 - LED testigo
//  Se prende cuando algun sensor ve la linea.
// ============================================

const int SENSOR_IZQ = 2;
const int SENSOR_DER = 3;

// Cambia esto si TU sensor da 0 sobre el negro:
const int VE_LINEA = HIGH;

void setup() {
  pinMode(SENSOR_IZQ, INPUT);
  pinMode(SENSOR_DER, INPUT);
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  bool izq = (digitalRead(SENSOR_IZQ) == VE_LINEA);
  bool der = (digitalRead(SENSOR_DER) == VE_LINEA);

  if (izq || der) {
    digitalWrite(LED_BUILTIN, HIGH);
  } else {
    digitalWrite(LED_BUILTIN, LOW);
  }
}
