const coap = require("coap");
const axios = require("axios");

const influxDBURL =
  "http://localhost:8086/api/v2/write?org=ferman&bucket=coapdb&precision=s";
const influxDBToken =
  "qlHlljmPUr_db95TBbB-i5iN001F89tzn8kYgLlrnMVRPmAQh6qa0Z7szIyOXhIxYnAGG9opv0-CG5y__IqFcw==";

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const portNumber = 5683;
coap
  .createServer(async function (req, res) {
    console.info("CoAP device got a request from %s", req.url);

    if (req.method !== "GET") {
      res.code = "4.05";
      return res.end();
    }

    if (
      req.headers["Accept"] &&
      req.headers["Accept"].toLowerCase() !== "application/json"
    ) {
      res.code = "4.06";
      return res.end();
    }

    switch (req.url) {
      case "/co2":
        const co2Value = randomInt(0, 1000);
        writeToInflux("co2", co2Value);
        displayOutput(res, { Co2: co2Value });
        break;
      case "/temperature":
        const temperatureValue = randomInt(-10, 50);
        writeToInflux("temperature", temperatureValue);
        displayOutput(res, { Temperature: temperatureValue });
        break;
      case "/humidity":
        const humidityValue = randomInt(0, 100);
        writeToInflux("humidity", humidityValue);
        displayOutput(res, { Humidity: humidityValue });
        break;
      default:
        displayOutput(res, { error: "Not Found" });
    }
  })
  .listen(portNumber);
console.log("CoAP Server is started at port Number", portNumber);

function displayOutput(res, content) {
  if (content) {
    res.setOption("Content-Format", "application/json");
    res.code = "2.05";
    res.end(JSON.stringify(content));
  } else {
    res.code = "4.04";
    res.end();
  }
}

function writeToInflux(measurement, value) {
  const dataPoint = `${measurement} value=${value}`;
  axios
    .post(influxDBURL, dataPoint, {
      headers: {
        Authorization: `Token ${influxDBToken}`,
      },
    })
    .then((response) => {
      if (response.status === 204) {
        console.log(`Data written to InfluxDB: ${measurement} - ${value}`);
      } else {
        console.error("Error writing to InfluxDB: Unexpected response status");
      }
    })
    .catch((error) => {
      console.error(`Error writing to InfluxDB: ${error.message}`);
    });
}

// node coap.js
// Test: coap get coap://localhost:5683/co2
