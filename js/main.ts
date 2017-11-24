declare var createjs;
declare var $;

const axisArray = new Int8Array(16);
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

const stageSize = 800;
const stageSizeX2 = stageSize * stageSize;
let pixel2DArray: Array<Array<Pixel>> = new Array<Array<Pixel>>();
let hashedDeadPixels: Array<Pixel> = new Array<Pixel>();

let runningTotal = 0;

class Pixel {
	public color;
	constructor(public x: number, public y: number, public weight: number, public drawn: boolean = false) {
		this.color = 0xFFFF0000;
		runningTotal += weight;
	}

	public setNeighbour() {
		for(let a = 0; a < 16; a+=2) {
			if(!pixel2DArray[this.y + axisArray[a+1]][this.x + axisArray[a]]) {
				let pixel = new Pixel(this.x + axisArray[a], this.y + axisArray[a+1], this.weight - 1);
				hashedDeadPixels.push(pixel);
				pixel2DArray[this.y + axisArray[a+1]][this.x + axisArray[a]] = pixel;
			}
		}
	}
	public makeAlive(data32) {
		this.drawn = true;
		this.setNeighbour();
		runningTotal -= pixel2DArray[this.y][this.x].weight;
		data32[this.x + this.y * stageSize] = this.color;
		hashedDeadPixels.splice(hashedDeadPixels.indexOf(this), 1);
		//remove from dead array
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

function activatePixel(x: number, y: number, weight: number, data32) {
	if (pixel2DArray[y][x]) {
		pixel2DArray[y][x].drawn = true;
		runningTotal -= pixel2DArray[y][x].weight;
	} else {
		let pixel = new Pixel(x, y , weight, true);
		pixel.setNeighbour();
		pixel2DArray[y][x] = pixel;
	}
	data32[x + y * stageSize] = pixel2DArray[y][x].color;
}

function getNextPixel(data32) {
	var randomIndex = Math.floor(Math.random() * runningTotal / 1000);
	hashedDeadPixels[randomIndex].makeAlive(data32);
}


function start() {

	for (let a = 0; a < stageSize; a++) {
		pixel2DArray[a] = new Array<Pixel>();
		for(let b = 0; b < stageSize; b++) {
			pixel2DArray[a][b] = null;
		}
	}
	

	let spiralArray = createSpiralArray(stageSize/2 - 1 , stageSize/2 - 1);

	const canv = <HTMLCanvasElement>document.getElementById("container0");
    const ctx = canv.getContext("2d");

	const imageData = ctx.createImageData(stageSize, stageSize);
	const data32 = new Uint32Array(imageData.data.buffer);

	activatePixel(400, 400, 1000, data32);

	runningTotal -= 1000;

	let counter = 0;
	let interval = 1000/60;
	let drawsPerTick = 100;
	let addToCounterPerTick = 1;
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
		for(let a = 0; a < drawsPerTick; a++) {
			getNextPixel(data32);
		}
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
	}, interval)
}