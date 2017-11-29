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

const stageSize = 1600;
const stageSizeX2 = stageSize * stageSize;
const canv = <HTMLCanvasElement>document.getElementById("container0");
const ctx = canv.getContext("2d");

let imageData = ctx.createImageData(stageSize, stageSize);
let data32 = new Uint32Array(imageData.data.buffer);

let intervalIndex;

function startSpreadAnimation(advancedOffsetNumber, speed) {
	advancedOffsetNumber = parseInt(advancedOffsetNumber);

	class Node {
		public left = null;
		public right = null;
		public height = null;
		public key;
		public value;
		constructor(key, value) {
			this.left = null;
			this.right = null;
			this.height = null;
			this.key = key;
			this.value = value;
		}

		public rotateRight() {
			var other = this.left;
			this.left = other.right;
			other.right = this;
			this.height = Math.max(this.leftHeight(), this.rightHeight()) + 1;
			other.height = Math.max(other.leftHeight(), this.height) + 1;
			return other;
		}
		public rotateLeft() {
			var other = this.right;
			this.right = other.left;
			other.left = this;
			this.height = Math.max(this.leftHeight(), this.rightHeight()) + 1;
			other.height = Math.max(other.rightHeight(), this.height) + 1;
			return other;
		}
		public leftHeight() {
			if (!this.left) {
				return -1;
			}
			return this.left.height;
		}
		public rightHeight() {
			if (!this.right) {
				return -1;
			}
			return this.right.height;
		}
	}

	class PixelTree {
		public _root;
		public _size;
		public BalanceState = {
			UNBALANCED_RIGHT: 1,
			SLIGHTLY_UNBALANCED_RIGHT: 2,
			BALANCED: 3,
			SLIGHTLY_UNBALANCED_LEFT: 4,
			UNBALANCED_LEFT: 5
		};
		constructor(customCompare = null) {
			this._root = null;
			this._size = 0;

			if (customCompare) {
				this._compare = customCompare;
			}
		}

		private _compare(a, b) {
			if (a > b) {
				return 1;
			}
			if (a < b) {
				return -1;
			}
			return 0;
		};
		public getRandom() {
			let randomIndex = Math.floor(Math.random() * 3);
			let current = this._root;
			if (current && this._root.left)
				return this._root.left;
			return this._root;
			/*while(randomIndex != 0 && current.left != null && current.right != null) {
				if(randomIndex == 1) {
					current = current.left;
				}
				if (randomIndex == 2) {
					current = current.right;
				}
			}
			return current;*/
		}
		public insert(value) {
			this._root = this._insert(value.key, value, this._root);
			this._size++;
		};
		private _insert(key, value, root) {
			// Perform regular BST insertion
			if (root === null) {
				return new Node(key, value);
			}

			if (this._compare(key, root.key) < 0) {
				root.left = this._insert(key, value, root.left);
			} else if (this._compare(key, root.key) > 0) {
				root.right = this._insert(key, value, root.right);
			} else {
				// It's a duplicate so insertion failed, decrement size to make up for it
				this._size--;
				return root;
			}

			// Update height and rebalance tree
			root.height = Math.max(root.leftHeight(), root.rightHeight()) + 1;
			var balanceState = this.getBalanceState(root);

			if (balanceState === this.BalanceState.UNBALANCED_LEFT) {
				if (this._compare(key, root.left.key) < 0) {
					// Left left case
					root = root.rotateRight();
				} else {
					// Left right case
					root.left = root.left.rotateLeft();
					return root.rotateRight();
				}
			}

			if (balanceState === this.BalanceState.UNBALANCED_RIGHT) {
				if (this._compare(key, root.right.key) > 0) {
					// Right right case
					root = root.rotateLeft();
				} else {
					// Right left case
					root.right = root.right.rotateRight();
					return root.rotateLeft();
				}
			}

			return root;
		};
		public delete(key) {
			this._root = this._delete(key, this._root);
			this._size--;
		};
		private _delete(key, root) {
			// Perform regular BST deletion
			if (root === null) {
				this._size++;
				return root;
			}

			if (this._compare(key, root.key) < 0) {
				// The key to be deleted is in the left sub-tree
				root.left = this._delete(key, root.left);
			} else if (this._compare(key, root.key) > 0) {
				// The key to be deleted is in the right sub-tree
				root.right = this._delete(key, root.right);
			} else {
				// root is the node to be deleted
				if (!root.left && !root.right) {
					root = null;
				} else if (!root.left && root.right) {
					root = root.right;
				} else if (root.left && !root.right) {
					root = root.left;
				} else {
					// Node has 2 children, get the in-order successor
					var inOrderSuccessor = this.minValueNode(root.right);
					root.key = inOrderSuccessor.key;
					root.value = inOrderSuccessor.value;
					root.right = this._delete(inOrderSuccessor.key, root.right);
				}
			}

			if (root === null) {
				return root;
			}

			// Update height and rebalance tree
			root.height = Math.max(root.leftHeight(), root.rightHeight()) + 1;
			var balanceState = this.getBalanceState(root);

			if (balanceState === this.BalanceState.UNBALANCED_LEFT) {
				// Left left case
				if (this.getBalanceState(root.left) === this.BalanceState.BALANCED ||
					this.getBalanceState(root.left) === this.BalanceState.SLIGHTLY_UNBALANCED_LEFT) {
					return root.rotateRight();
				}
				// Left right case
				if (this.getBalanceState(root.left) === this.BalanceState.SLIGHTLY_UNBALANCED_RIGHT) {
					root.left = root.left.rotateLeft();
					return root.rotateRight();
				}
			}

			if (balanceState === this.BalanceState.UNBALANCED_RIGHT) {
				// Right right case
				if (this.getBalanceState(root.right) === this.BalanceState.BALANCED ||
					this.getBalanceState(root.right) === this.BalanceState.SLIGHTLY_UNBALANCED_RIGHT) {
					return root.rotateLeft();
				}
				// Right left case
				if (this.getBalanceState(root.right) === this.BalanceState.SLIGHTLY_UNBALANCED_LEFT) {
					root.right = root.right.rotateRight();
					return root.rotateLeft();
				}
			}

			return root;
		};
		public get(key) {
			if (this._root === null) {
				return null;
			}

			return this._get(key, this._root).value;
		};
		private _get(key, root) {
			if (key === root.key) {
				return root;
			}

			if (this._compare(key, root.key) < 0) {
				if (!root.left) {
					return null;
				}
				return this._get(key, root.left);
			}

			if (!root.right) {
				return null;
			}
			return this._get(key, root.right);
		};
		public contains(key) {
			if (this._root === null) {
				return false;
			}

			return !!this._get(key, this._root);
		};
		public findMinimum() {
			return this.minValueNode(this._root).key;
		};
		public minValueNode(root) {
			var current = root;
			while (current.left) {
				current = current.left;
			}
			return current;
		}
		public findMaximum() {
			return this.maxValueNode(this._root).key;
		};


		public maxValueNode(root) {
			var current = root;
			while (current.right) {
				current = current.right;
			}
			return current;
		}
		public size() {
			return this._size;
		};
		public isEmpty() {
			return this._size === 0;
		};
		public getBalanceState(node) {
			var heightDifference = node.leftHeight() - node.rightHeight();
			switch (heightDifference) {
				case -2: return this.BalanceState.UNBALANCED_RIGHT;
				case -1: return this.BalanceState.SLIGHTLY_UNBALANCED_RIGHT;
				case 1: return this.BalanceState.SLIGHTLY_UNBALANCED_LEFT;
				case 2: return this.BalanceState.UNBALANCED_LEFT;
				default: return this.BalanceState.BALANCED;
			}
		}
	}

	class Pixel {
		public key;
		constructor(public x: number, public y: number, public color) {
			this.key = x + y * stageSize;
		}

		public setNeighbour() {
			for (let a = 0; a < 16; a += 2) {
				let tempY = this.y + axisArray[a + 1];
				let tempX = this.x + axisArray[a];
				if (tempX >= 0 && tempX < stageSize && tempY >= 0 && tempY < stageSize && !pixel2DArray[tempY][tempX]) {
					let pixel = new Pixel(tempX, tempY, colorArray[this.color]);
					//linkedPixels.push(pixel);
					pixelTree.insert(pixel);
					pixel2DArray[tempY][tempX] = pixel;
				}
			}
		}
		public makeAlive(node) {
			//linkedPixels.deleteNodeByIndexFromBack(index);
			pixelTree.delete(node);
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
			pixel2DArray[y][x] = pixel;
			data32[x + y * stageSize] = pixel2DArray[y][x].color;
		}
	}

	function getNextPixel(data32) {

		//let randomIndex = Math.floor(Math.random() * linkedPixels.length);
		//let randomIndex = Math.floor(Math.random() * pixelTree.size());

		//let pixel = linkedPixels.getValueByIndexFromBack(randomIndex);
		let node = pixelTree.getRandom();

		if (node) {
			node.value.makeAlive(node);
		} else {
			clearInterval(intervalIndex);
		}
	}

	let pixel2DArray: Array<Array<Pixel>> = new Array<Array<Pixel>>();
	let pixelTree = new PixelTree();

	imageData = ctx.createImageData(stageSize, stageSize);
	data32 = new Uint32Array(imageData.data.buffer);

	for (let a = 0; a < stageSize; a++) {
		pixel2DArray[a] = new Array<Pixel>();
		for (let b = 0; b < stageSize; b++) {
			pixel2DArray[a][b] = null;
		}
	}

	activatePixel(stageSize / 2, stageSize / 2, 0xFFFF0000, true);

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
			console.log("Calc: " + time.toFixed(4));
		}
		ctx.putImageData(imageData, 0, 0);
	}, interval);
}

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
		public getRandomNode(randomIndex) {
			/*let node = this.head;
			if(!node) {
				return null;
			}
			while (randomIndex >= this.hashedGetsLen) {
				node = this.lastHashedGet(node);
				randomIndex -= this.hashedGetsLen;
			}
			return this.hashedGets[randomIndex](node);*/
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
		public getNodeByIndexFromBack(index) {
			let current = this.tail;
			if (index >= this.length) {
				return null;
			}
			for (let a = 0; a < index; a++) {
				current = current.previous;
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
			if (!node.previous) {
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
					let pixel = new Pixel(tempX, tempY, colorArray[this.color]);
					linkedPixels.push(pixel);
					pixel2DArray[tempY][tempX] = pixel;
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
			pixel2DArray[y][x] = pixel;
			data32[x + y * stageSize] = pixel2DArray[y][x].color;
		}
	}

	function getNextPixel(data32) {
		//let randomIndex = 1;

		let randomIndex = Math.floor(Math.random() * linkedPixels.length);
		/*let randomIndex = 0;
		if (linkedPixels.length > advancedOffsetNumber) {
			randomIndex = advancedOffsetNumber;
		}*/

		//let pixel = linkedPixels.getValueByIndexFromBack(randomIndex);
		//let node = linkedPixels.getNodeByIndexFromBack(randomIndex);
		let node = linkedPixels.getNodeByIndex(randomIndex);

		if (node) {
			node.value.makeAlive(node);
		} else {
			clearInterval(intervalIndex);
		}
	}

	let pixel2DArray: Array<Array<Pixel>> = new Array<Array<Pixel>>();

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


	//activatePixel(stageSize / 2, stageSize / 2, 0xFFFF0000, true);
	activatePixel(0, 0, 0xFFFF0000, true);

	/*activatePixel(200, 200, 0xFFFF0000, true);
	activatePixel(600, 200, 0xFF00FF00, true);
	activatePixel(200, 600, 0xFF0000FF, true);
	activatePixel(600, 600, 0xFFFFFF00, true);
	activatePixel(400, 400, 0xFF00FFFF, true);*/

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
		$("#data-entry").append('<div class="animation-options-wrapper"><div class="label">' + label + ' Offset number</div><input class="number-input" id="' + label + '-offset-number"><div class="label" id="' + label + '-speed-label">Speed</div><input type="range" min="' + sliderMin + '" max="' + sliderMax + '" value="5000" class="slider" id="' + label + '-speed"><button class="global-button" id="' + label + '-start-button">Start ' + label + '</button></div>');
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
	animationTypes.push(new AnimationTypes("spread", 0, startSpreadAnimation, { sliderSpeed: { min: 1, max: 50000 } }));
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