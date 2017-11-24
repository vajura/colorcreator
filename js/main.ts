declare var createjs;
declare var $;

const colorArray = new Uint32Array(6);
colorArray[0] = 0xFFFF0000;
colorArray[1] = 0xFF00FF00;
colorArray[2] = 0xFF0000FF;
colorArray[3] = 0xFFFFFF00;
colorArray[4] = 0xFFFF00FF;
colorArray[5] = 0xFF00FFFF;

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
const canv = <HTMLCanvasElement>document.getElementById("container0");
const ctx = canv.getContext("2d");

let imageData = ctx.createImageData(stageSize, stageSize);
let data32 = new Uint32Array(imageData.data.buffer);

let intervalIndex;



function startAdvancedAnimation(advancedOffsetNumber, speed) {
	advancedOffsetNumber = parseInt(advancedOffsetNumber);
	class Pixel {
		constructor(public x: number, public y: number, public color, public drawn: boolean = false) {
		}

		public setNeighbour() {
			for(let a = 0; a < 16; a+=2) {
				let tempY = this.y + axisArray[a+1];
				let tempX = this.x + axisArray[a];
				if(tempX >= 0 && tempX < stageSize && tempY >= 0 && tempY < stageSize && !pixel2DArray[tempY][tempX] ) {
					let pixel = new Pixel(tempX, tempY, this.color - 0x0000101);
					hashedDeadPixels.push(pixel);
					pixel2DArray[tempY][tempX] = pixel;
				}
			}
		}
		public makeAlive( index) {
			//this.drawn = true;
			this.setNeighbour();
			hashedDeadPixels.splice(index, 1);
			data32[this.x + this.y * stageSize] = this.color;
			//runningTotal -= pixel2DArray[this.y][this.x].weight;
		}
	}


	function activatePixel(x: number, y: number, color) {
		if (!pixel2DArray[y][x]) {
			let pixel = new Pixel(x, y, color, true);
			pixel.setNeighbour();
			pixel2DArray[y][x] = pixel;
			data32[x + y * stageSize] = pixel2DArray[y][x].color;
		}
	}

	function getNextPixel(data32) {
		//var randomIndex = Math.floor(Math.random() * runningTotal / 10);
		//let randomIndex = Math.floor(Math.random() * hashedDeadPixels.length);
		let randomIndex = hashedDeadPixels.length - 8;
		if (hashedDeadPixels.length > advancedOffsetNumber){
			randomIndex = hashedDeadPixels.length - advancedOffsetNumber;
		}
		let pixel = hashedDeadPixels[randomIndex];
		if(pixel) {
			pixel.makeAlive(randomIndex);
		} else {
			clearInterval(intervalIndex);
		}
	}
	let pixel2DArray: Array<Array<Pixel>> = new Array<Array<Pixel>>();
	let hashedDeadPixels: Array<Pixel> = new Array<Pixel>();

	imageData = ctx.createImageData(stageSize, stageSize);
	data32 = new Uint32Array(imageData.data.buffer);

	for (let a = 0; a < stageSize; a++) {
		pixel2DArray[a] = new Array<Pixel>();
		for(let b = 0; b < stageSize; b++) {
			pixel2DArray[a][b] = null;
		}
	}

	//activatePixel(200, 200, 0xFFFF0000);
	activatePixel(600, 200, 0xFF00FF00);
	//activatePixel(200, 600, 0xFF0000FF);
	//activatePixel(600, 600, 0xFFFFFF00);
	//activatePixel(400, 400, 0xFFFF0000);

	let interval = 1000/60;
	let drawsPerTick = parseInt(speed);

	let start = 0, end = 0, time = 0;
	intervalIndex = setInterval(function() {
		start = window.performance.now();
		for(let a = 0; a < drawsPerTick; a++) {
			getNextPixel(data32);
		}
		end = window.performance.now();
		time = end - start;
		if(time > 4)
		{
			console.log("Calc: " + time.toFixed(4));
		}
		ctx.putImageData(imageData, 0, 0);
	}, interval);
}

function startSpiralAnimation(spiralOffsetNumber, speed, color, repeat = false) {
	spiralOffsetNumber = parseInt(spiralOffsetNumber);

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
	if(!repeat) {
		imageData = ctx.createImageData(stageSize, stageSize);
		data32 = new Uint32Array(imageData.data.buffer);
	}

	let spiralArray = createSpiralArray(stageSize/2 - 1 , stageSize/2 - 1);

	let counter = 0;
	let interval = 1000/60;
	let drawsPerTick = parseInt(speed);
	let counterStartingOffset = 1;
	let drawsPerTickIncrease = 3;
	let startNext = false;

	let start = 0, end = 0, time = 0;
	intervalIndex = setInterval(function() {
		start = window.performance.now();
		for(let a = 0; a < drawsPerTick && counter < stageSizeX2; a++) {
			data32[spiralArray[counter].x + spiralArray[counter].y * stageSize] = color;
			counter += spiralOffsetNumber;
			if(counter >= stageSizeX2) {
				if(counterStartingOffset == spiralOffsetNumber) {
					//clearInterval(intervalIndex);
					counter = 0;
					counterStartingOffset = 1;
					drawsPerTickIncrease = 3;
					spiralOffsetNumber += 1;
					$("#spiral-offset-number").val(spiralOffsetNumber+1);
					color = color - 0x0005000;
					break;
				}
				counter = counterStartingOffset;
				counterStartingOffset++;
				drawsPerTickIncrease = 2;
				drawsPerTick = parseInt(speed) + Math.floor(drawsPerTickIncrease * parseInt(speed) / spiralOffsetNumber);
				drawsPerTickIncrease += 2;
			}
		}
		end = window.performance.now();
		time = end - start;
		if(time > 4){
			console.log("Calc: " + time.toFixed(4));
		}
		ctx.putImageData(imageData, 0, 0);
	}, interval);
}

class AnimationTypes {
	constructor(public label: string, offsetNum: number, public mainFunc, public val = null) {
		let sliderMin = 1;
		let sliderMax = 1000;
		if(val) {
			if(val["sliderSpeed"]) {
				sliderMin = val.sliderSpeed.min;
				sliderMax = val.sliderSpeed.max;
			}
		}
		$("#data-entry").append('<div class="animation-options-wrapper"><div class="label">'+label+' Offset number</div><input class="number-input" id="'+label+'-offset-number"><div class="label" id="'+label+'-speed-label">Speed</div><input type="range" min="'+sliderMin+'" max="'+sliderMax+'" value="500" class="slider" id="'+label+'-speed"><button class="global-button" id="'+label+'-start-button">Start '+label+'</button></div>');
		$("#"+label+"-offset-number").val(offsetNum);
		$("#"+label+"-speed").on("change", function () {
			$("#"+label+"-speed-label").text("Speed " + $("#"+label+"-speed").val());
		});
		$("#"+label+"-speed-label").text("Speed " + $("#"+label+"-speed").val());
		$("#"+label+"-start-button").on("click touch", function() {
			clearInterval(intervalIndex);
			mainFunc($("#"+label+"-offset-number").val(), $("#"+label+"-speed").val(), 0xFFFF0000);
		});
	}
}

function start() {

	let animationTypes: Array<AnimationTypes> = new Array<AnimationTypes>();
	animationTypes.push(new AnimationTypes("advanced", 7, startAdvancedAnimation));
	animationTypes.push(new AnimationTypes("spiral", 13, startSpiralAnimation, {sliderSpeed: {min: 1, max: 50000}}));
}