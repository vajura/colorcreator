declare var createjs;
declare var $;

let pixelField: Array<Array<ColorPixel>>;
let activePixels: Array<ColorPixel>;

class ColorPixel {
	public pixel;
	constructor(public xPos: number, public yPos: number, public stage) {
		this.pixel = new createjs.Shape();
		this.pixel.x = this.xPos;
		this.pixel.y = this.yPos;
	}

	public activatePixel() {
		this.pixel.graphics.beginFill("#0000FF").drawRect(0, 0, 1, 1);
		this.stage.addChild(this.pixel);
		//this.pixel.cache();
	}
}

function start() {
	let stage = new createjs.Stage("container");

	pixelField = [];
	for (let a = 0; a < 800; a++) {
		pixelField[a] = [];
		for (let b = 0; b < 1500; b++) {
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