declare var createjs;
declare var $;

let pixelField: Array<Array<ColorPixel>>;
let activePixels: Array<ColorPixel>;

class ColorPixel {
	public pixel;
	constructor(public xPos: number, public yPos: number) {
		this.pixel = new createjs.Shape();
		this.pixel.x = this.xPos;
		this.pixel.y = this.yPos;
		this.pixel.graphics.beginFill("#0000FF").drawRect(0, 0, 1, 1);
		//this.pixel.cache(0,0,1,1);
	}

	public activatePixel(stage) {
		
		stage.addChild(this.pixel);
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
	/*array.push({x: x, y: y});
	x -= 1;
	y -= 1;*/
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
	let stageSize = 400;
	let stageSizeX2 = stageSize *stageSize;
	pixelField = [];
	for (let a = 0; a < stageSize; a++) {
		pixelField[a] = [];
		for (let b = 0; b < stageSize; b++) {
			pixelField[a][b] = new ColorPixel(b, a);
		}
	}

	let spiralArray = createSpiralArray(stageSize/2 - 1 , stageSize/2 - 1);

	let counter = 0;

	let canv = <HTMLCanvasElement>document.getElementById("container0");
    let ctx = canv.getContext("2d");

	const imageData = ctx.createImageData(stageSize, stageSize);
	const data32 = new Uint32Array(imageData.data.buffer);
	
	let interval = 1000/60;
	let drawsPerTick = 8;
	let intervalCounter = 4;
	let counterSteps = 5;
	let nextStep = 1;
	let intervalIndex = setInterval(function() {
		for(let a = 0; a < drawsPerTick; a++) {
			data32[spiralArray[counter].x + spiralArray[counter].y * stageSize] = 0xFFFF0000;//A
			counter += counterSteps;
		}
		//if(counterSteps > drawsPerTick)
		drawsPerTick = Math.floor(intervalCounter * 4 / counterSteps - nextStep + 1);
		intervalCounter += 2;
		if (intervalCounter > stageSize+2 ) {
			intervalCounter = 4;
			if (nextStep <= counterSteps) {
				nextStep++;
				counter = nextStep;
				drawsPerTick = Math.floor(intervalCounter * 4 / counterSteps - nextStep + 1);
			} else {
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
	}, interval)
}