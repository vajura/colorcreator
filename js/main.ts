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

const stageSize = 1000;
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
				this.length++;
				return next;
			} else {
				this.head = { value: value, previous: null, next: null };
				this.tail = this.head;
				this.length++;
				return this.head;
			}
		}
		public getValueByIndex(index) {
			let current = this.head;
			if (index >= this.length) {
				return null;
			}
			for (let a = 0; a < index; a++) {
				current = current.next;
			}
			return current.value;
		}
		public getNodeByIndex(index) {
			let current = this.head;
			if (index >= this.length) {
				return null;
			}
			for (let a = 0; a < index; a++) {
				current = current.next;
			}
			return current;
		}
		public getValueByIndexFromBack(index) {
			let current = this.tail;
			if (index >= this.length) {
				return null;
			}
			for (let a = 0; a < index; a++) {
				current = current.previous;
			}
			return current.value;
		}
		public deleteNodeByNode(node) {
			if(!node.previous) {
				this.head = node.next;
				if (!this.head) {
					this.tail = null;
				} else {
					this.head.previous = null;
				}
			} else if (!node.next) {
				this.tail = node.previous;
				if (!this.tail) {
					this.head = null;
				} else {
					this.tail.next = null;
				}
			} else {
				node.previous.next = node.next;
				node.next.previous = node.previous;
			}
			this.length--;
			return this.head;
		}
		public deleteNodeByIndex(index) {
			let current = this.head;
			if (index >= this.length) {
				return null;
			}
			if (index == 0) {
				this.head = this.head.next;
				if (this.head) {
					this.head.previous = null;
				} else {
					this.tail = null;
				}
				this.length--;
				return this.head;
			}
			for (let a = 0; a < index; a++) {
				current = current.next;
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
				return null;
			}
			if (index == 0) {
				this.tail = this.tail.previous;
				if (this.tail) {
					this.tail.next = null;
				} else {
					this.head = null;
				}
				this.length--;
				return this.head;
			}
			for (let a = 0; a < index; a++) {
				current = current.previous;
			}
			if (current.previous) {
				current.previous.next = current.next;
				current.next.previous = current.previous;
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
					let node = linkedPixels.push(new Pixel(tempX, tempY, colorArray[this.color]));
					pixel2DArray[tempY][tempX] = true;
					if (freeIndexes.length == 0) {
						randomArray.push(node);
					} else {
						randomArray[freeIndexes.pop()] = node;
					}
				}
			}
		}
		public makeAlive(node) {
			linkedPixels.deleteNodeByNode(node);
			this.setNeighbour();
			data32[this.x + this.y * stageSize] = this.color;
		}
	}

	function activatePixel(x: number, y: number, color, addToArray: boolean) {
		if (!pixel2DArray[y][x]) {
			let pixel = new Pixel(x, y, color);
			if (addToArray) {
				pixel.setNeighbour();
			}
			pixel2DArray[y][x] = true;
			data32[x + y * stageSize] = pixel.color;
		}
	}

	let _radixSort_0 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	/*
	RADIX SORT
	Use 256 bins
	Use shadow array
	- Get counts
	- Transform counts to pointers
	- Sort from LSB - MSB
	*/
	function radixSort(intArr) {
		var cpy = new Array(intArr.length);
		var c4 = [].concat(_radixSort_0);
		var c3 = [].concat(_radixSort_0);
		var c2 = [].concat(_radixSort_0);
		var c1 = [].concat(_radixSort_0);
		var o4 = 0; var t4;
		var o3 = 0; var t3;
		var o2 = 0; var t2;
		var o1 = 0; var t1;
		var x;
		for (x = 0; x < intArr.length; x++) {
			t4 = intArr[x] & 0xFF;
			t3 = (intArr[x] >> 8) & 0xFF;
			t2 = (intArr[x] >> 16) & 0xFF;
			t1 = (intArr[x] >> 24) & 0xFF ^ 0x80;
			c4[t4]++;
			c3[t3]++;
			c2[t2]++;
			c1[t1]++;
		}
		for (x = 0; x < 256; x++) {
			t4 = o4 + c4[x];
			t3 = o3 + c3[x];
			t2 = o2 + c2[x];
			t1 = o1 + c1[x];
			c4[x] = o4;
			c3[x] = o3;
			c2[x] = o2;
			c1[x] = o1;
			o4 = t4;
			o3 = t3;
			o2 = t2;
			o1 = t1;
		}
		for (x = 0; x < intArr.length; x++) {
			t4 = intArr[x] & 0xFF;
			cpy[c4[t4]] = intArr[x];
			c4[t4]++;
		}
		for (x = 0; x < intArr.length; x++) {
			t3 = (cpy[x] >> 8) & 0xFF;
			intArr[c3[t3]] = cpy[x];
			c3[t3]++;
		}
		for (x = 0; x < intArr.length; x++) {
			t2 = (intArr[x] >> 16) & 0xFF;
			cpy[c2[t2]] = intArr[x];
			c2[t2]++;
		}
		for (x = 0; x < intArr.length; x++) {
			t1 = (cpy[x] >> 24) & 0xFF ^ 0x80;
			intArr[c1[t1]] = cpy[x];
			c1[t1]++;
		}
		return intArr;
	}

	function _insertionSort(arr, left, right) {
		var i, j, swap;
		for (j = left + 1; j <= right; j++) {
			swap = arr[j];
			i = j - 1;
			while (i >= left && arr[i] > swap) {
				arr[i + 1] = arr[i--];
			}
			arr[i + 1] = swap;
		}
	}
	function radixSortIP(intArr) {
		_radixSortIP(intArr, 0, intArr.length, 24, 0x80);
		return intArr;
	}
	function _radixSortIP(intArr, left, right, shift, xor) {
		var end = [].concat(_radixSort_0);
		var start = [].concat(_radixSort_0);
		var elm = left;
		var dig; var swap; var x; var next;
		for (x = left; x < right; x++) {
			dig = (intArr[x] >> shift) & 0xFF ^ xor;
			end[dig]++;
		}
		// transform counts to pointers
		for (x = 0; x < 256; x++) {
			dig = elm + end[x];
			start[x] = elm;
			end[x] += elm;
			elm = dig;
		}
		// sort array
		for (x = left, next = 0; x < right;) {
			elm = intArr[x];
			while (start[dig = ((elm >> shift) & 0xFF ^ xor)] != x) {
				swap = elm;
				elm = intArr[start[dig]];
				intArr[start[dig]++] = swap;
			}
			intArr[x] = elm;
			start[dig]++;
			while (start[next] == end[next] && next < 256) next++;
			x = start[next];
		}
		// recurse
		if (shift > 0) {
			shift -= 8;
			for (x = 0, next = left; x < 256; x++) {
				dig = end[x] - next;
				if (dig >= 24) {
					_radixSortIP(intArr, next, end[x], shift, 0x00);
				} else if (dig >= 2) {
					_insertionSort(intArr, next, end[x]);
				}
				next = end[x];
			}
		}
	}

	function getNextPixel(data32) {
		//let randomIndex = 1;

		let randomIndex;
		let reroll = true;
		if (linkedPixels.length < freeIndexes.length) {
			freeIndexes = radixSort(freeIndexes);
			for (let a = 0; a < freeIndexes.length; a++) {
				randomArray.splice(freeIndexes[a], 1);
			}
			freeIndexes = [];
		}
		while (reroll) {
			reroll = false;
			randomIndex = Math.floor(Math.random() * randomArray.length);
			for (let a = 0; a < freeIndexes.length; a++) {
				if (freeIndexes[a] == randomIndex) {
					reroll = true;
					break;
				}
			}
		} 

		let node = randomArray[randomIndex];
		freeIndexes.push(randomIndex);

		if (node) {
			node.value.makeAlive(node);
		} else {
			clearInterval(intervalIndex);
		}
	}

	let pixel2DArray: Array<Array<Boolean>> = new Array<Array<Boolean>>();

	let linkedPixels: LinkedPixels = new LinkedPixels();
	let randomArray = [];
	let freeIndexes = [];

	imageData = ctx.createImageData(stageSize, stageSize);
	data32 = new Uint32Array(imageData.data.buffer);

	for (let a = 0; a < stageSize; a++) {
		pixel2DArray[a] = new Array<Boolean>();
		for (let b = 0; b < stageSize; b++) {
			pixel2DArray[a][b] = false;
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


	//activatePixel(200, 200, 0xFFFF0000, true);

	activatePixel(200, 200, 0xFFFF0000, true);
	activatePixel(600, 200, 0xFF00FF00, true);
	activatePixel(200, 600, 0xFF0000FF, true);
	activatePixel(600, 600, 0xFFFFFF00, true);
	activatePixel(400, 400, 0xFF00FFFF, true);

	let interval = 1000 / 30;
	let drawsPerTick = parseInt(speed) * 1;

	let start = 0, end = 0, time = 0;
	intervalIndex = setInterval(function() {
		start = window.performance.now();
		for (let a = 0; a < drawsPerTick; a++) {
			getNextPixel(data32);
		}
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

	colorArray1();

	let animationTypes: Array<AnimationTypes> = new Array<AnimationTypes>();
	//animationTypes.push(new AnimationTypes("spread", 0, startSpreadAnimation, { sliderSpeed: { min: 1, max: 50000 } }));
	animationTypes.push(new AnimationTypes("advanced", 0, startAdvancedAnimation, { sliderSpeed: { min: 1, max: 50000 } }));
	animationTypes.push(new AnimationTypes("spiral", 13, startSpiralAnimation, { sliderSpeed: { min: 1, max: 50000 } }));
}

function colorArray2() {
	let hexColor = 0xFFFF0000;
	for (let a = 0; a < 256; a++) {
		let tempHexColor = hexColor - 0x00010000;
		colorArray[hexColor] = tempHexColor;
		hexColor = tempHexColor;
	}
	colorArray[0xFF000000] = 0xFFFF0000;
	/*hexColor = 0xFF000000;
	for (let a = 0; a < 255; a++) {
		let tempHexColor = hexColor + 0x00010000;
		colorArray[hexColor] = tempHexColor;
		hexColor = tempHexColor;
	}*/
}

function colorArray1() {
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
}