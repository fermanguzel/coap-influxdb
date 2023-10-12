const coap = require("coap");

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const portNumber = 5683;
coap
  .createServer(function (req, res) {
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
        displayOutput(res, { Co2: randomInt(0, 1000) });
        break;
      case "/temperature":
        displayOutput(res, { Temperature: randomInt(-10, 50) });
        break;
      case "/humidity":
        displayOutput(res, { Humidity: randomInt(0, 100) });
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

// node coap.js

// Test: coap get coap://localhost:5683/co2
