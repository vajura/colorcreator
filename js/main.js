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
        this.pixel.graphics.beginFill("#0000FF").drawRect(0, 0, 10, 10);
        this.stage.addChild(this.pixel);
        //this.pixel.cache();
    };
    return ColorPixel;
}());
function start() {
    var stage = new createjs.Stage("container");
    pixelField = [];
    for (var a = 0; a < 800; a++) {
        pixelField[a] = [];
        for (var b = 0; b < 1500; b++) {
            pixelField[a][b] = new ColorPixel(b, a, stage);
        }
    }
    pixelField[400][750].activatePixel();
    stage.update();
    /*let rectangle = new createjs.Shape();
    rectangle.x = dotArray[a].xPos * magnifier;
    rectangle.y = dotArray[a].yPos * magnifier;
    rectangle.graphics.beginFill("#00FF00");
    var rectangleCommand = rectangle.graphics.drawRect(0, 0, magnifier, magnifier).command;
    stage.addChild(rectangle);*/
}
