declare let createjs;
declare let $;

const colorArray = [];

const axisArray = new Int8Array(16);
axisArray[0] = -1;
axisArray[1] = -1;
axisArray[2] = 0;
axisArray[3] = -1;
axisArray[4] = 1;
axisArray[5] = -1;
axisArray[6] = 1;
axisArray[7] = 0;
axisArray[8] = 1;
axisArray[9] = 1;
axisArray[10] = 0;
axisArray[11] = 1;
axisArray[12] = -1;
axisArray[13] = 1;
axisArray[14] = -1;
axisArray[15] = 0;

const stageSize = 800;
const stageSizeX2 = stageSize * stageSize;
const canv = <HTMLCanvasElement>document.getElementById("container0");
const ctx = canv.getContext("2d");

let imageData = ctx.createImageData(stageSize, stageSize);
let data32 = new Uint32Array(imageData.data.buffer);

let intervalIndex;



function startAdvancedAnimation(advancedOffsetNumber, speed) {
	advancedOffsetNumber = parseInt(advancedOffsetNumber);

	interface Node {
		value: Pixel;
		next: Node;
		previous: Node;
	}

	class LinkedPixels {
		public head: Node = null;
		public tail: Node = null;
		public length: number = 0;

		constructor() {

		}

		public push(value) {
			let head = this.head;
			if (head) {
				let next = { value: value, previous: this.tail, next: null };
				this.tail.next = next;
				this.tail = next;
			} else {
				this.head = { value: value, previous: null, next: null };
				this.tail = this.head;
			}
			this.length++;
			console.log(this.length);
		}
		public getValueByIndex(index) {
			let current = this.head;
			if (index >= this.length) {
				return null;
			}
			while (index > 0) {
				current = current.next;
				index--;
			}
			return current.value;
		}
		public getNodeByIndex(index) {
			let current = this.head;
			if (index >= this.length) {
				return null;
			}
			while (index > 0) {
				current = current.next;
				index--;
			}
			return current;
		}
		public getValueByIndexFromBack(index) {
			let current = this.tail;
			if (index >= this.length) {
				return null;
			}
			while (index > 0) {
				current = current.previous;
				index--;
			}
			return current.value;
		}
		public deleteNodeByNode(value) {
			let current = this.head, previous;
			if (current.value == value) {
				this.head = current.next;
				if (this.head) {
					this.head.previous = null;
				}
				this.length--;
				return this.head;
			}
			while (current.next) {
				if (current.value == value) {
					previous.next = current.next;
					current.next.previous = previous;
					this.length--;
					return this.head;
				}
				previous = current;
				current = current.next;
			}
			if (current.value == value) {
				previous.next = null;
				this.length--;
			}
			return this.head;
		}
		public deleteNodeByIndex(index) {
			let current = this.head;
			if (index >= this.length) {
				return current;
			}
			if (index == 0) {
				this.head = this.head.next;
				if (this.head) {
					this.head.previous = null;
				} else {
					this.tail = null;
				}
				this.length--;
				if(this.length == 1) {
					this.tail = this.head;
				}
				return this.head;
			}
			while (index > 0) {
				current = current.next;
				index--;
			}
			if (current.next) {
				current.previous.next = current.next;
				current.next.previous = current.previous;
			} else {
				this.tail = current.previous;
				this.tail.next = null;
			}
			this.length--;
			return this.head;
		}
		public deleteNodeByIndexFromBack(index) {
			let current = this.tail;
			if (index >= this.length) {
				return current;
			}
			if (index == 0) {
				this.tail = this.tail.previous;
				if (this.tail) {
					this.tail.next = null;
				} else {
					this.head = null;
				}
				this.length--;
				if(this.length == 1) {
					this.head = this.tail;
				}
				return this.head;
			}
			while (index > 0) {
				current = current.previous;
				index--;
			}
			if (current.previous) {
				current.next.previous = current.previous;
				current.previous.next = current.next;
			} else {
				this.head = current.next;
				this.head.previous = null;
			}
			this.length--;
			return this.head;
		}

	}

	class Pixel {
		constructor(public x: number, public y: number, public color) {
		}

		public setNeighbour() {
			for (let a = 0; a < 16; a += 2) {
				let tempY = this.y + axisArray[a + 1];
				let tempX = this.x + axisArray[a];
				if (tempX >= 0 && tempX < stageSize && tempY >= 0 && tempY < stageSize && !pixel2DArray[tempY][tempX]) {
					let pixel = new Pixel(tempX, tempY, colorArray[this.color]);
					linkedPixels.push(pixel);
					pixel2DArray[tempY][tempX] = pixel;
				}
			}
		}
		public makeAlive(index) {
			this.setNeighbour();
			linkedPixels.deleteNodeByIndexFromBack(index);
			data32[this.x + this.y * stageSize] = this.color;
		}
	}


	function activatePixel(x: number, y: number, color, addToArray: boolean) {
		if (!pixel2DArray[y][x]) {
			let pixel = new Pixel(x, y, color);
			if (addToArray) {
				pixel.setNeighbour();
			}
			pixel2DArray[y][x] = pixel;
			data32[x + y * stageSize] = pixel2DArray[y][x].color;
		}
	}

	function getNextPixel(data32) {
		//let randomIndex = 1;

		//let randomIndex = Math.floor(Math.random() * linkedPixels.length);

		let randomIndex = 0;
		/*if (linkedPixels.length > advancedOffsetNumber) {
			randomIndex = advancedOffsetNumber;
		}*/

		let pixel = linkedPixels.getValueByIndexFromBack(randomIndex);

		if (pixel) {
			pixel.makeAlive(randomIndex);
		} else {
			clearInterval(intervalIndex);
		}
	}

	let pixel2DArray: Array<Array<Pixel>> = new Array<Array<Pixel>>();
	let hashedDeadPixels: Array<Pixel> = new Array<Pixel>();

	let linkedPixels: LinkedPixels = new LinkedPixels();

	imageData = ctx.createImageData(stageSize, stageSize);
	data32 = new Uint32Array(imageData.data.buffer);

	for (let a = 0; a < stageSize; a++) {
		pixel2DArray[a] = new Array<Pixel>();
		for (let b = 0; b < stageSize; b++) {
			pixel2DArray[a][b] = null;
		}
	}
	/*let cc = 0;
	for(let a = 0; a < 9; a++) {
		for(let b = 0; b < 799; b++) {
			if(cc%2==0)
				activatePixel(b, a*80+30, 0x00000000, false);
			else
				activatePixel(b+1, a*80+30, 0x00000000, false);
		}
		cc++;
	}*/
	/*for (let a = 100; a < 700; a++) {
		activatePixel(a, 500, 0xFF000000, false);
	}
	for (let a = 500; a < 797; a++) {
		activatePixel(700, a, 0xFF000000, false);
	}
	for (let a = 500; a < 800; a++) {
		activatePixel(300, a, 0xFF000000, false);
	}
	for (let a = 502; a < 800; a++) {
		activatePixel(400, a, 0xFF000000, false);
	}*/


	activatePixel(400, 400, 0xFFFF0000, true);
			getNextPixel(data32);
	console.log(linkedPixels);
			getNextPixel(data32);
	console.log(linkedPixels);
	
	/*activatePixel(200, 200, 0xFFFF0000, true);
	activatePixel(600, 200, 0xFF00FF00, true);
	activatePixel(200, 600, 0xFF0000FF, true);
	activatePixel(600, 600, 0xFFFFFF00, true);
	activatePixel(400, 400, 0xFF00FFFF, true);*/

	let interval = 1000 / 30;
	let drawsPerTick = parseInt(speed);

	let start = 0, end = 0, time = 0;
	intervalIndex = setInterval(function() {
		start = window.performance.now();
		for (let a = 0; a < drawsPerTick; a++) {
			getNextPixel(data32);
		}
		clearInterval(intervalIndex);
		end = window.performance.now();
		time = end - start;
		if (time > 4) {
			//console.log("Calc: " + time.toFixed(4));
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
	if (!repeat) {
		imageData = ctx.createImageData(stageSize, stageSize);
		data32 = new Uint32Array(imageData.data.buffer);
	}

	let spiralArray = createSpiralArray(stageSize / 2 - 1, stageSize / 2 - 1);

	let counter = 0;
	let interval = 1000 / 60;
	let drawsPerTick = parseInt(speed);
	let counterStartingOffset = 1;
	let drawsPerTickIncrease = 3;
	let startNext = false;

	let start = 0, end = 0, time = 0;
	intervalIndex = setInterval(function() {
		start = window.performance.now();
		for (let a = 0; a < drawsPerTick && counter < stageSizeX2; a++) {
			data32[spiralArray[counter].x + spiralArray[counter].y * stageSize] = color;
			counter += spiralOffsetNumber;
			if (counter >= stageSizeX2) {
				if (counterStartingOffset == spiralOffsetNumber) {
					//clearInterval(intervalIndex);
					counter = 0;
					counterStartingOffset = 1;
					drawsPerTickIncrease = 3;
					spiralOffsetNumber += 1;
					$("#spiral-offset-number").val(spiralOffsetNumber + 1);
					break;
				}
				counter = counterStartingOffset;
				counterStartingOffset++;
				drawsPerTickIncrease = 2;
				drawsPerTick = parseInt(speed) + Math.floor(drawsPerTickIncrease * parseInt(speed) / spiralOffsetNumber);
				drawsPerTickIncrease += 2;
				color = colorArray[color];
				color = colorArray[color];
				color = colorArray[color];
				color = colorArray[color];
				color = colorArray[color];
				color = colorArray[color];
				color = colorArray[color];
				color = colorArray[color];
			}
		}
		end = window.performance.now();
		time = end - start;
		if (time > 4) {
			console.log("Calc: " + time.toFixed(4));
		}
		ctx.putImageData(imageData, 0, 0);
	}, interval);
}

class AnimationTypes {
	constructor(public label: string, offsetNum: number, public mainFunc, public val = null) {
		let sliderMin = 1;
		let sliderMax = 1000;
		if (val) {
			if (val["sliderSpeed"]) {
				sliderMin = val.sliderSpeed.min;
				sliderMax = val.sliderSpeed.max;
			}
		}
		$("#data-entry").append('<div class="animation-options-wrapper"><div class="label">' + label + ' Offset number</div><input class="number-input" id="' + label + '-offset-number"><div class="label" id="' + label + '-speed-label">Speed</div><input type="range" min="' + sliderMin + '" max="' + sliderMax + '" value="500" class="slider" id="' + label + '-speed"><button class="global-button" id="' + label + '-start-button">Start ' + label + '</button></div>');
		$("#" + label + "-offset-number").val(offsetNum);
		$("#" + label + "-speed").on("change", function() {
			$("#" + label + "-speed-label").text("Speed " + $("#" + label + "-speed").val());
		});
		$("#" + label + "-speed-label").text("Speed " + $("#" + label + "-speed").val());
		$("#" + label + "-start-button").on("click touch", function() {
			clearInterval(intervalIndex);
			mainFunc($("#" + label + "-offset-number").val(), $("#" + label + "-speed").val(), 0xFFFF0000);
		});
	}
}

function start() {

	let hexColor = 0xFFFF0000;
	for (let a = 0; a < 255; a++) {
		let tempHexColor = hexColor + 0x00000100;
		colorArray[hexColor] = tempHexColor;
		hexColor = tempHexColor;
	}
	hexColor = 0xFFFFFF00;
	for (let a = 0; a < 255; a++) {
		let tempHexColor = hexColor - 0x00010000;
		colorArray[hexColor] = tempHexColor;
		hexColor = tempHexColor;
	}
	hexColor = 0xFF00FF00;
	for (let a = 0; a < 255; a++) {
		let tempHexColor = hexColor + 0x00000001;
		colorArray[hexColor] = tempHexColor;
		hexColor = tempHexColor;
	}
	hexColor = 0xFF00FFFF;
	for (let a = 0; a < 255; a++) {
		let tempHexColor = hexColor - 0x00000100;
		colorArray[hexColor] = tempHexColor;
		hexColor = tempHexColor;
	}
	hexColor = 0xFF0000FF;
	for (let a = 0; a < 255; a++) {
		let tempHexColor = hexColor + 0x00010000;
		colorArray[hexColor] = tempHexColor;
		hexColor = tempHexColor;
	}
	hexColor = 0xFFFF00FF;
	for (let a = 0; a < 255; a++) {
		let tempHexColor = hexColor - 0x00000001;
		colorArray[hexColor] = tempHexColor;
		hexColor = tempHexColor;
	}

	let animationTypes: Array<AnimationTypes> = new Array<AnimationTypes>();
	animationTypes.push(new AnimationTypes("advanced", 7, startAdvancedAnimation));
	animationTypes.push(new AnimationTypes("spiral", 13, startSpiralAnimation, { sliderSpeed: { min: 1, max: 50000 } }));
}