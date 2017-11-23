var Pixel = /** @class */ (function () {
    function Pixel(weight, liveNeighbours, deadNeighbours) {
        this.weight = weight;
        this.liveNeighbours = liveNeighbours;
        this.deadNeighbours = deadNeighbours;
    }
    return Pixel;
}());
function createSpiralArray(x, y) {
    var array = [];
    var distance = 2;
    var distanceCounter = -1;
    var direction = 0;
    var directionArray = [];
    directionArray[0] = { x: 1, y: 0 };
    directionArray[1] = { x: 0, y: 1 };
    directionArray[2] = { x: -1, y: 0 };
    directionArray[3] = { x: 0, y: -1 };
    /*array.push({x: x, y: y});
    x -= 1;
    y -= 1;*/
    while (x >= 0) {
        array.push({ x: x, y: y });
        distanceCounter++;
        if (distanceCounter == distance) {
            distanceCounter = 0;
            direction++;
            if (direction == 3) {
                distanceCounter = 1;
            }
            else if (direction == 4) {
                y -= 2;
                x -= 2;
                distance += 2;
                distanceCounter = -1;
                direction = 0;
            }
        }
        x += directionArray[direction].x;
        y += directionArray[direction].y;
    }
    return array;
}
function createPixels(x, y, weight, color, live, livePixels) {
}
//TODO CHECK IF COLORING AND PUTTING EVERY PIXEL ON SCREEN AND THEN JUST CHANGING COLOR IS FASTER
function start() {
    var stageSize = 800;
    var stageSizeX2 = stageSize * stageSize;
    var livePixels = new Array();
    for (var a = 0; a < 200; a++) {
        livePixels[a] = new Array();
    }
    //createPixels(200, 200, 1, 0xFFFF0000, true);
    var spiralArray = createSpiralArray(stageSize / 2 - 1, stageSize / 2 - 1);
    var canv = document.getElementById("container0");
    var ctx = canv.getContext("2d");
    var imageData = ctx.createImageData(stageSize, stageSize);
    var data32 = new Uint32Array(imageData.data.buffer);
    var counter = 0;
    var interval = 1000 / 60;
    var drawsPerTick = 8;
    var addToCounterPerTick = 1131;
    var counterStartingOffset = 1;
    var drawsPerTickIncrease = 3;
    var colorArray = new Uint32Array(addToCounterPerTick);
    colorArray[0] = 0xFFFF0000;
    colorArray[1] = 0xFF00FF00;
    colorArray[2] = 0xFF0000FF;
    colorArray[3] = 0xFFFFFF00;
    colorArray[4] = 0xFFFF00FF;
    colorArray[5] = 0xFF00FFFF;
    var intervalIndex = setInterval(function () {
        for (var a = 0; a < drawsPerTick && counter < stageSizeX2; a++) {
            data32[spiralArray[counter].x + spiralArray[counter].y * stageSize] = 0xFFFF0000;
            counter += addToCounterPerTick;
        }
        if (counter >= stageSizeX2) {
            if (counterStartingOffset == addToCounterPerTick) {
                clearInterval(intervalIndex);
            }
            counter = counterStartingOffset;
            counterStartingOffset++;
            drawsPerTickIncrease = 2;
        }
        drawsPerTick = 512 + Math.floor(drawsPerTickIncrease * 128 / addToCounterPerTick);
        drawsPerTickIncrease += 2;
        ctx.putImageData(imageData, 0, 0);
    }, interval);
}
