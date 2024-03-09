const express = require('express')
const WebSocket = require('ws').WebSocket
const app = express()
const expressws = require('express-ws')(app)
const port = process.env.PORT || "8080";

app.use(express.json());
app.use(express.static('public'))

var lightState = [];

app.get('/status', (req, res) => {
  console.log("HELLO WORLD");
  res.send('HELLO WORLD');
})

app.get('/', (req, res) => {
  res.render('index');
})

app.get('/matrix', (req, res) => {
  res.send(JSON.stringify({LEDMatrix: lightState, size: lightState.length}));
})

// app.ws('/matrix', function(ws, req) {
//   ws.send(JSON.stringify(lightState.map(({red, green, blue}) => {return`#${red.toString(16)}${green.toString(16)}${blue.toString(16)}`})));

//   ws.on('message', (msg) => {
//     lightState = [];
//     let LEDMatrix = JSON.parse(msg).LEDMatrix;
//     for (let i = 0; i < LEDMatrix.length; i++) {
//       let GRB = {green: 0, red: 0, blue: 0};
//       let LED = LEDMatrix[i];
//       if (LED.match(/#[0-9|a-f|A-F]{6}/)) {
//         let red = LED.substring(1,3);
//         let green = LED.substring(3,5);
//         let blue = LED.substring(5,7);
//         GRB.red = Number(`0x${red}`);
//         GRB.green = Number(`0x${green}`);
//         GRB.blue = Number(`0x${blue}`);
//       } else if (LED.match(/#[0-9|a-f|A-F]{3}/)) {
//         let red = LED.substring(1,2);
//         let green = LED.substring(2,3);
//         let blue = LED.substring(3,4);
//         GRB.red = Number(`0x${red}${red}`);
//         GRB.green = Number(`0x${green}${green}`);
//         GRB.blue = Number(`0x${blue}${blue}`);
//       }
//       lightState.push(GRB);
//     }
//     expressws.getWss().clients.forEach(client => {
//       if (client !== ws && client.readyState === WebSocket.OPEN) {
//         client.send(JSON.stringify(lightState.map(({red, green, blue}) => {return `#${red.toString(16)}${green.toString(16)}${blue.toString(16)}`})));
//       }
//     });
//   })
// });

app.post('/matrix', (req, res) => {
    lightState = [];
    let LEDMatrix = req.body.LEDMatrix;
    for (let i = 0; i < LEDMatrix.length; i++) {
      let GRB = {green: 0, red: 0, blue: 0};
      let LED = LEDMatrix[i];
      if (LED.match(/#[0-9|a-f|A-F]{6}/)) {
        let red = LED.substring(1,3);
        let green = LED.substring(3,5);
        let blue = LED.substring(5,7);
        GRB.red = Number(`0x${red}`);
        GRB.green = Number(`0x${green}`);
        GRB.blue = Number(`0x${blue}`);

      } else if (LED.match(/#[0-9|a-f|A-F]{3}/)) {
        let red = LED.substring(1,2);
        let green = LED.substring(2,3);
        let blue = LED.substring(3,4);
        GRB.red = Number(`0x${red}${red}`);
        GRB.green = Number(`0x${green}${green}`);
        GRB.blue = Number(`0x${blue}${blue}`);
      }
      lightState.push(GRB);
    }
    res.send(JSON.stringify(lightState));
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})