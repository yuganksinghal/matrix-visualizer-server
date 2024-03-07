const express = require('express')
const cors = require('cors')
const app = express()
const port = 3000

app.use(cors());
app.use(express.json());

var lightState = [];

app.get('/status', (req, res) => {
    console.log("HELLO WORLD");
    res.send('HELLO WORLD');
})

app.get('/matrix', (req, res) => {
  res.send(JSON.stringify({LEDMatrix: lightState, size: lightState.length}));
})

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