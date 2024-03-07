#include <Adafruit_NeoPixel.h>
#include <WiFi.h>
#include <ArduinoJson.h>

#define LED_PIN    1
#define LED_COUNT 256

const char* ssid     = "accesspoint"; // Change this to your WiFi SSID
const char* password = "password123"; // Change this to your WiFi password

Adafruit_NeoPixel strip(LED_COUNT, LED_PIN, NEO_GRB + NEO_KHZ800);

void setup() {

  Serial.begin(115200);
  while(!Serial){delay(100);}


  // setup WiFi
  WiFi.begin(ssid, password);

  Serial.println();
  Serial.println();
  Serial.print("Waiting for WiFi... ");

  while(WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  
  // setup RGB Matrix
  strip.begin();
  strip.show();
  strip.setBrightness(10);

  delay(500);
}

void loop() {
  const uint16_t port = 3000;
  const char * host = "255.255.255.255"; // ip or dns
  JsonDocument doc;

  Serial.print("Connecting to ");
  Serial.println(host);

  WiFiClient client;

  if (!client.connect(host, port)) {
    Serial.println("Connection failed.");
    Serial.println("Waiting 5 seconds before retrying...");
    delay(5000);
    return;
  }

  client.print("GET /matrix HTTP/1.1\n\n");

  int maxloops = 0;

  //wait for the server's reply to become available
  while (!client.available() && maxloops < 1000) {
    maxloops++;
    delay(1); //delay 1 msec
  }

  if (client.available() > 0) {
    // while(client.available()) {
    //   String line = client.readStringUntil('\r');
    //   Serial.println(line);
    // }

    // Check HTTP status
    char status[32] = {0};
    client.readBytesUntil('\r', status, sizeof(status));
    // It should be "HTTP/1.0 200 OK" or "HTTP/1.1 200 OK"
    if (strcmp(status + 9, "200 OK") != 0) {
      Serial.print(F("Unexpected response: "));
      Serial.println(status);
      client.stop();
      return;
    }

    // Skip HTTP headers
    char endOfHeaders[] = "\r\n\r\n";
    if (!client.find(endOfHeaders)) {
      Serial.println(F("Invalid response"));
      client.stop();
      return;
    }

    DeserializationError error = deserializeJson(doc, client);

    if (error) {
      Serial.print(F("deserializeJson() failed: "));
      Serial.println(error.f_str());
      client.stop();
      return;
    }
    JsonArray ledMatrix = doc["LEDMatrix"];
    for (int i = 0; i < ledMatrix.size(); i++) {
      JsonObject led = ledMatrix[i];
      int red = led["red"];
      int green = led["green"];
      int blue = led["blue"];
      Serial.println(red);
      Serial.println(blue);
      Serial.println(green);
      strip.setPixelColor(i, red, green, blue);
    }
    strip.show();
  } else {
    Serial.println("client.available() timed out ");
  }

  Serial.println("Closing connection.");
  client.stop();

  Serial.println("Waiting 1 seconds before restarting...");
  delay(500);
}
