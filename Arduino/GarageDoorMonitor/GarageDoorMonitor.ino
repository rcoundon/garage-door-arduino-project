/*

 Monitors Pin 2 with a magnetic switch attached of an Arduino MKR1010 and
 makes a call to an API with the state if opened for more than -MAX_OPEN_TIME_MILLIS
 After that is triggered a subsequent close event will be sent to the API

*/

#include <SPI.h>
#include <WiFiNINA.h>

#include "arduino_secrets.h"
 ///////please enter your sensitive data in the Secret tab/arduino_secrets.h
char ssid[] = SECRET_SSID; // your network SSID (name)
char pass[] = SECRET_PASS; // your network password (use for WPA, or use as key for WEP)
char server[] = SECRET_API_SERVER; // your network SSID (name)
char basic_auth[] = SECRET_BASIC_AUTH; // your basic auth header e.g. Basic somebase64encodedstring

int status = WL_IDLE_STATUS;
const int sensor = 2;

const int MAX_OPEN_TIME_MILLIS = -(60*5*1000);
const int LOOP_DELAY_MILLIS = 2 * 1000;
bool oldState = LOW;

long int start_time;
long int open_time;
long int close_time;

bool closed = false;
bool notified_open = true;
bool notified_close = true;

String server_str = server;

WiFiSSLClient client;

void setup() {
  start_time = millis();
  close_time = millis();
  open_time = millis();
  //Initialize serial and wait for port to open:
  Serial.begin(9600);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }

  pinMode(sensor, INPUT_PULLUP);

  // check for the WiFi module:
  if (WiFi.status() == WL_NO_MODULE) {
    Serial.println("Communication with WiFi module failed!");
    // don't continue
    while (true);
  }

  String fv = WiFi.firmwareVersion();

  if (fv < WIFI_FIRMWARE_LATEST_VERSION) {
    Serial.println("Please upgrade the firmware");
  }

  // attempt to connect to WiFi network:

  while (status != WL_CONNECTED) {
    Serial.print("Attempting to connect to SSID: ");
    Serial.println(ssid);
    // Connect to WPA/WPA2 network. Change this line if using open or WEP network:

    status = WiFi.begin(ssid, pass);
    // wait 10 seconds for connection:
    delay(10000);
  }

  Serial.println("Connected to wifi");
  printWiFiStatus();

  
}

void loop() {
  Serial.print("notified_open at loop start: ");Serial.println(notified_open);
  Serial.print("notified_close at loop start: ");Serial.println(notified_close);
  
  const bool new_state = digitalRead(sensor);


  if (new_state == HIGH) {
    Serial.println("new_state: HIGH");
    close_time = millis();
  }
  if (new_state == LOW) {
    Serial.println("new_state: LOW");
  }
    
  Serial.print("oldState");Serial.println(oldState);
  
  if (new_state == LOW && oldState == HIGH) {
    Serial.println("Closing door");
    closed = true;
    close_time = millis();
    open_time = millis();
    notified_open = true;
  } else if (new_state == HIGH && oldState == LOW) {
    Serial.println("Opening door");
    closed = false;
    open_time = millis();
    notified_open = false;
  }
  oldState = new_state;

  // if there are incoming bytes available
  // from the server, read them and print them:
  while (client.available()) {
    char c = client.read();
    Serial.write(c);
  }

  long int open_time_passed = open_time - close_time;

  Serial.print("Time passed since open: ");Serial.print(open_time_passed);Serial.println("ms");

  if(!notified_open && open_time_passed < MAX_OPEN_TIME_MILLIS) {
    Serial.println("Not yet sent");
    if(!client.connect(server, 443)){
      while (!client.connect(server, 443)) {
        ;
        delay(1000);
      }
    }

    makeRequest(true);

    Serial.println("Setting sent to true");
    notified_open = true;
    notified_close = false;
  } else if (notified_open && closed && !notified_close) {
    Serial.println("notified_close is false - sending close");
    if(!client.connect(server, 443)){
      while (!client.connect(server, 443)) {
        ;
        delay(1000);
      }    
    }
    makeRequest(false);
    notified_close = true;
    
  }
//  client.stop();
  delay(LOOP_DELAY_MILLIS);
  Serial.println();
  Serial.println("______________________________________________");
  Serial.println();

}

void makeRequest(bool open){

  if(!client.connect(server, 443)){
    while (!client.connect(server, 443)) {
      ;
      delay(1000);
    }
  }
  String param_value = open ? "open" : "close";

  String url = "GET /garage?state=" + param_value + " HTTP/1.1";
  Serial.println(url);
  client.println(url);
  client.print("Host: ");client.println(server_str);
  client.println(basic_auth);
  client.println("Connection: close");
  client.println();
}

void printWiFiStatus() {

  // print the SSID of the network you're attached to:

  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  // print your board's IP address:

  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);

  // print the received signal strength:
  long rssi = WiFi.RSSI();
  Serial.print("signal strength (RSSI):");
  Serial.print(rssi);
  Serial.println(" dBm");
}
