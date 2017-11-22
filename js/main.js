var pixelField;
var activePixels;
var ColorPixel = /** @class */ (function () {
    function ColorPixel(xPos, yPos) {
        this.xPos = xPos;
        this.yPos = yPos;
        this.pixel = new createjs.Shape();
        this.pixel.x = this.xPos;
        this.pixel.y = this.yPos;
        this.pixel.graphics.beginFill("#0000FF").drawRect(0, 0, 1, 1);
        //this.pixel.cache(0,0,1,1);
    }
    ColorPixel.prototype.activatePixel = function (stage) {
        stage.addChild(this.pixel);
    };
    return ColorPixel;
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
//TODO CHECK IF COLORING AND PUTTING EVERY PIXEL ON SCREEN AND THEN JUST CHANGING COLOR IS FASTER
function start() {
    var stageSize = 400;
    var stageSizeX2 = stageSize * stageSize;
    pixelField = [];
    for (var a = 0; a < stageSize; a++) {
        pixelField[a] = [];
        for (var b = 0; b < stageSize; b++) {
            pixelField[a][b] = new ColorPixel(b, a);
        }
    }
    var spiralArray = createSpiralArray(stageSize / 2 - 1, stageSize / 2 - 1);
    var counter = 0;
    var canv = document.getElementById("container0");
    var ctx = canv.getContext("2d");
    var imageData = ctx.createImageData(stageSize, stageSize);
    var data32 = new Uint32Array(imageData.data.buffer);
    var interval = 1000 / 60;
    var drawsPerTick = 8;
    var intervalCounter = 4;
    var counterSteps = 5;
    var nextStep = 1;
    var intervalIndex = setInterval(function () {
        for (var a = 0; a < drawsPerTick; a++) {
            data32[spiralArray[counter].x + spiralArray[counter].y * stageSize] = 0xFFFF0000; //A
            counter += counterSteps;
        }
        //if(counterSteps > drawsPerTick)
        drawsPerTick = Math.floor(intervalCounter * 4 / counterSteps - nextStep + 1);
        intervalCounter += 2;
        if (intervalCounter > stageSize + 2) {
            intervalCounter = 4;
            if (nextStep <= counterSteps) {
                nextStep++;
                counter = nextStep;
                drawsPerTick = Math.floor(intervalCounter * 4 / counterSteps - nextStep + 1);
            }
            else {
                clearInterval(intervalIndex);
            }
        }
        /*if(counter > drawsPerTickCheckNumber - drawsPerTick * 2) {
            drawsPerTick += 60;
            drawsPerTickIncreaseCounter++;
            drawsPerTickCheckNumber = drawsPerTickCheckCalculation(stageSizeX2, drawsPerTickIncreaseCounter);
        }
        if(counter > stageSizeX2 - drawsPerTick*2) {
            drawsPerTick = 60;
            drawsPerTickIncreaseCounter = 1;
            drawsPerTickCheckNumber = drawsPerTickCheckCalculation(stageSizeX2, drawsPerTickIncreaseCounter);
            secondCounter++;
            counter = secondCounter;
        }*/
        ctx.putImageData(imageData, 0, 0);
    }, interval);
}
