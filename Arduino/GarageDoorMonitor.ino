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
char ssid[] = SECRET_SSID; // your network SSID (name)
char server[] = SECRET_API_SERVER; // your network SSID (name)
char basicAuth[] = SECRET_BASIC_AUTH; // your network SSID (name)
int keyIndex = 0; // your network key Index number (needed only for WEP)

int status = WL_IDLE_STATUS;
const int sensor = 2;
const int MAX_OPEN_TIME_MILLIS = -10000;
bool oldState = LOW;

long int start_time;
long int open_time;
long int close_time;

bool closed = false;
bool notifiedOpen = true;
bool notifiedClose = true;

String serverStr = server;

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
  Serial.print("notifiedOpen at loop start: ");Serial.println(notifiedOpen);
  Serial.print("notifiedClose at loop start: ");Serial.println(notifiedClose);
  
  const bool newState = digitalRead(sensor);
 
  String sendValue = "";

  if (newState == HIGH) {
    Serial.println("newState: HIGH");
    close_time = millis();
  }
  if (newState == LOW) {
    Serial.println("newState: LOW");
  }
    
  Serial.print("oldState");Serial.println(oldState);
  
  if (newState == LOW && oldState == HIGH) {
    Serial.println("Closing door");
    sendValue = "close";
    closed = true;
    close_time = millis();
    notifiedOpen = true;
  } else if (newState == HIGH && oldState == LOW) {
    Serial.println("Opening door");
    sendValue = "open";    
    closed = false;
    open_time = millis();
    notifiedOpen = false;
  }
  oldState = newState;

  // if there are incoming bytes available
  // from the server, read them and print them:
  while (client.available()) {
    char c = client.read();
    Serial.write(c);
  }

  long int open_time_passed = open_time - close_time;

  Serial.print("Time passed since open: ");Serial.print(open_time_passed);Serial.println("ms");

  if(!notifiedOpen && open_time_passed < MAX_OPEN_TIME_MILLIS) {
    Serial.println("Not yet sent");
    if(!client.connect(server, 443)){
      while (!client.connect(server, 443)) {
        ;
        delay(1000);
      }    
    }

    String url = "GET /garage?state=open HTTP/1.1";
    Serial.println(url);
    client.println(url);
    client.print("Host: ");client.println(serverStr);
    client.println(basicAuth);
    client.println("Connection: close");
    client.println();

    sendValue = "";
    Serial.println("Setting sent to true");
    notifiedOpen = true;
    notifiedClose = false;
  } else if (notifiedOpen && closed && !notifiedClose) {
    Serial.println("notifiedClose is false - sending close");
    if(!client.connect(server, 443)){
      while (!client.connect(server, 443)) {
        ;
        delay(1000);
      }    
    }
    String url = "GET /garage?state=close HTTP/1.1";
    Serial.println(url);
    client.println(url);
    client.print("Host: ");client.println(serverStr);
    client.println(basicAuth);
    client.println("Connection: close");
    client.println();
    notifiedClose = true;
    
  }
//  client.stop();
  delay(5000);
  Serial.println();
  Serial.println("______________________________________________");
  Serial.println();

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
