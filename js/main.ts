declare var createjs;
declare var $;

class Pixel {
	public color;
	constructor(public weight: number, public liveNeighbours: Array<Pixel>, public deadNeighbours: Array<Pixel>) {

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

function createPixels(x: number, y: number, weight: number, color, live: boolean, livePixels: Array<Array<Pixel>>) {
	
}

//TODO CHECK IF COLORING AND PUTTING EVERY PIXEL ON SCREEN AND THEN JUST CHANGING COLOR IS FASTER
function start() {
	let stageSize = 800;
	let stageSizeX2 = stageSize * stageSize;

	let livePixels: Array<Array<Pixel>> = new Array<Array<Pixel>>();
	for (let a = 0; a < 200; a++) {
		livePixels[a] = new Array<Pixel>();
	}
	//createPixels(200, 200, 1, 0xFFFF0000, true);

	

	let spiralArray = createSpiralArray(stageSize/2 - 1 , stageSize/2 - 1);

	let canv = <HTMLCanvasElement>document.getElementById("container0");
    let ctx = canv.getContext("2d");

	const imageData = ctx.createImageData(stageSize, stageSize);
	const data32 = new Uint32Array(imageData.data.buffer);

	let counter = 0;
	let interval = 1000/60;
	let drawsPerTick = 8;
	let addToCounterPerTick = 1131;
	let counterStartingOffset = 1;
	let drawsPerTickIncrease = 3;

	const colorArray = new Uint32Array(addToCounterPerTick);
	colorArray[0] = 0xFFFF0000;
	colorArray[1] = 0xFF00FF00;
	colorArray[2] = 0xFF0000FF;
	colorArray[3] = 0xFFFFFF00;
	colorArray[4] = 0xFFFF00FF;
	colorArray[5] = 0xFF00FFFF;

	let intervalIndex = setInterval(function() {
		for(let a = 0; a < drawsPerTick && counter < stageSizeX2; a++) {
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
		drawsPerTickIncrease += 2;
		ctx.putImageData(imageData, 0, 0);
	}, interval)
}