var pixelField;
var activePixels;
var ColorPixel = /** @class */ (function () {
    function ColorPixel(xPos, yPos, stage) {
        this.xPos = xPos;
        this.yPos = yPos;
        this.stage = stage;
        this.pixel = new createjs.Shape();
        this.pixel.x = this.xPos;
        this.pixel.y = this.yPos;
    }
    ColorPixel.prototype.activatePixel = function () {
        this.pixel.graphics.beginFill("#0000FF").drawRect(0, 0, 1, 1);
        this.pixel.cache(0, 0, 1, 1);
        this.stage.addChild(this.pixel);
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
    var stage = new createjs.Stage("container");
    var stageSize = 400;
    pixelField = [];
    for (var a = 0; a < stageSize; a++) {
        pixelField[a] = [];
        for (var b = 0; b < stageSize; b++) {
            pixelField[a][b] = new ColorPixel(b, a, stage);
        }
    }
    var spiralArray = createSpiralArray(stageSize / 2 - 1, stageSize / 2 - 1);
    stage.update();
    var counter = 0;
    createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
    createjs.Ticker.framerate = 30;
    createjs.Ticker.on("tick", function () {
        pixelField[spiralArray[counter].y][spiralArray[counter].x].activatePixel();
        counter++;
        stage.update();
    });
}
