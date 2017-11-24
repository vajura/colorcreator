var axisArray = new Int8Array(16);
axisArray[0] = -1;
axisArray[1] = -1;
axisArray[2] = 0;
axisArray[3] = -1;
axisArray[4] = 1;
axisArray[5] = -1;
axisArray[6] = -1;
axisArray[7] = 0;
axisArray[8] = 1;
axisArray[9] = 0;
axisArray[10] = -1;
axisArray[11] = 1;
axisArray[12] = 0;
axisArray[13] = 1;
axisArray[14] = 1;
axisArray[15] = 1;
var stageSize = 400;
var stageSizeX2 = stageSize * stageSize;
var pixel2DArray = new Array();
var hashedDeadPixels = new Array();
var runningTotal = 0;
var Pixel = /** @class */ (function () {
    function Pixel(x, y, weight, color, drawn) {
        if (drawn === void 0) { drawn = false; }
        this.x = x;
        this.y = y;
        this.weight = weight;
        this.color = color;
        this.drawn = drawn;
        runningTotal += weight;
    }
    Pixel.prototype.setNeighbour = function () {
        for (var a = 0; a < 16; a += 2) {
            var tempY = this.y + axisArray[a + 1];
            var tempX = this.x + axisArray[a];
            if (!pixel2DArray[tempY][tempX]) {
                var pixel = new Pixel(tempX, tempY, this.weight - 1, this.color);
                hashedDeadPixels.push(pixel);
                pixel2DArray[tempY][tempX] = pixel;
            }
        }
    };
    Pixel.prototype.makeAlive = function (data32) {
        this.drawn = true;
        this.setNeighbour();
        runningTotal -= pixel2DArray[this.y][this.x].weight;
        data32[this.x + this.y * stageSize] = this.color;
        hashedDeadPixels.splice(hashedDeadPixels.indexOf(this), 1);
        //remove from dead array
    };
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
function activatePixel(x, y, weight, color, data32) {
    if (!pixel2DArray[y][x]) {
        var pixel = new Pixel(x, y, weight, color, true);
        pixel.setNeighbour();
        pixel2DArray[y][x] = pixel;
        data32[x + y * stageSize] = pixel2DArray[y][x].color;
        runningTotal -= weight;
    }
}
function getNextPixel(data32) {
    var randomIndex = Math.floor(Math.random() * runningTotal / 1000);
    hashedDeadPixels[randomIndex].makeAlive(data32);
}
function start() {
    for (var a = 0; a < stageSize; a++) {
        pixel2DArray[a] = new Array();
        for (var b = 0; b < stageSize; b++) {
            pixel2DArray[a][b] = null;
        }
    }
    var spiralArray = createSpiralArray(stageSize / 2 - 1, stageSize / 2 - 1);
    var canv = document.getElementById("container0");
    var ctx = canv.getContext("2d");
    var imageData = ctx.createImageData(stageSize, stageSize);
    var data32 = new Uint32Array(imageData.data.buffer);
    activatePixel(150, 200, 1000, 0xFFFF0000, data32);
    activatePixel(250, 200, 1000, 0xFF00FF00, data32);
    var counter = 0;
    var interval = 1000 / 60;
    var drawsPerTick = 100;
    var addToCounterPerTick = 1;
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
        for (var a = 0; a < drawsPerTick; a++) {
            getNextPixel(data32);
        }
        drawsPerTick++;
        /*for(let a = 0; a < drawsPerTick && counter < stageSizeX2; a++) {
            data32[spiralArray[counter].x + spiralArray[counter].y * stageSize] = 0xFFFF0000;
            counter += addToCounterPerTick;
        }
        if(counter >= stageSizeX2) {
            if(counterStartingOffset == addToCounterPerTick) {
                clearInterval(intervalIndex);
            }
            counter = counterStartingOffset;
            counterStartingOffset++;
            drawsPerTickIncrease = 2;
        }
        drawsPerTick = 512 + Math.floor(drawsPerTickIncrease * 128 / addToCounterPerTick);
        drawsPerTickIncrease += 2;*/
        ctx.putImageData(imageData, 0, 0);
    }, interval);
}
