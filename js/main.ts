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
		this.pixel.cache(0,0,1,1);
		this.stage.addChild(this.pixel);
	}
}

function createSpiralArray(x: number, y: number) {
	let array = [];
	let distance = 2;
	let distanceCounter = -1;
	let direction = 0;
	let directionArray = [];
	directionArray[0] = {x: 1, y: 0};
	directionArray[1] = {x: 0, y: 1};
	directionArray[2] = {x: -1, y: 0};
	directionArray[3] = {x: 0, y: -1};

	while (x >= 0) {
		array.push({x: x, y: y});
		distanceCounter++;

		if (distanceCounter == distance) {
			distanceCounter = 0;
			direction++;
			if (direction == 3) {
				distanceCounter = 1;
			} else if (direction == 4) {
				y -= 2;
				x -= 2;
				distance+=2;
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
	let stage = new createjs.Stage("container");
	let stageSize = 400;
	pixelField = [];
	for (let a = 0; a < stageSize; a++) {
		pixelField[a] = [];
		for (let b = 0; b < stageSize; b++) {
			pixelField[a][b] = new ColorPixel(b, a, stage);
		}
	}

	let spiralArray = createSpiralArray(stageSize/2 - 1, stageSize/2 - 1);
	stage.update();

	let counter = 0;
	createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
	createjs.Ticker.framerate = 30;
	createjs.Ticker.on("tick", function () {
		pixelField[spiralArray[counter].y][spiralArray[counter].x].activatePixel();
		counter++;
		stage.update();
	});

}