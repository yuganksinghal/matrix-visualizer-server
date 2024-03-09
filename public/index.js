var colorPicker;
var paintbrush = '#888';
const rows = 8;
const columns = 32;
var matrixData = new Array(rows*columns);
const total = rows * columns;
const lightSocket = new WebSocket(`ws://${window.location.host}/matrix`);

lightSocket.onmessage = (event) => {
    lsData = JSON.parse(event.data);
    if(lsData.length === 0) {
        setupBoard();
        return
    }
    const LEDMatrix = document.querySelector('#LEDMatrix');
    let children = []
    for (let i = 0; i < lsData.length; i++) {
        let LED = document.createElement('div');
        LED.classList.add("led");
        // LED.innerHTML = `${i} | ${findIndex(i)}`; // debug line
        let index = findIndex(i);
        LED.dataset.matrixIndex = index;
        if (lsData[index] && lsData[index] !== "#000") LED.style.backgroundColor = lsData[index];
        LED.addEventListener('mousedown', (event) => paintPixel(event));
        LED.addEventListener('mouseover', (event) => dragPixel(event));
        children.push(LED);
    }
    matrixData = lsData;
    LEDMatrix.replaceChildren(...children);
}

function setupBoard() {
    colorPicker = document.querySelector('#colorPicker');
    const LEDMatrix = document.querySelector('#LEDMatrix');
    for (let i = 0; i < rows * columns; i++) {
        let LED = document.createElement('div');
        LED.classList.add("led");
        // LED.innerHTML = `${i} | ${findIndex(i)}`; // debug line
        LED.dataset.matrixIndex = findIndex(i);
        LED.addEventListener('mousedown', (event) => paintPixel(event));
        LED.addEventListener('mouseover', (event) => dragPixel(event));
        LEDMatrix.appendChild(LED);
    }
    matrixData.fill("off");
}

function onColorChange() {
    paintbrush = colorPicker.value;
}

function dragPixel(e) {
    if (e.buttons === 1) {
        paintPixel(e);
    }
}

function findIndex(i) {
    let matrixColumn = Math.floor(i / rows);
    let reverseColumn = (matrixColumn % 2 == 1);
    let index = reverseColumn ? ((matrixColumn + 1) * rows - (i % rows + 1) ) : i;
    return index;
}

function paintPixel(e) {
    const eraseState = matrixData[e.target.dataset.matrixIndex] != 'off';
    const pixel = e.target;
    pixel.style.backgroundColor = eraseState ? '' : paintbrush;
    matrixData[pixel.dataset.matrixIndex] = eraseState ? 'off' : paintbrush;
    //sendData();
    lightSocket.send(JSON.stringify({'LEDMatrix': matrixData}));
}

async function sendData(){
    const response  = await fetch("/matrix", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ 'LEDMatrix': matrixData })
    });
    return response.json;
}

window.addEventListener("load", () => setupBoard());