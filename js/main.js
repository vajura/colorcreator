var colorArray = [];
var axisArray = new Int8Array(16);
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
var stageSize = 1000;
var stageSizeX2 = stageSize * stageSize;
var canv = document.getElementById("container0");
var ctx = canv.getContext("2d");
var imageData = ctx.createImageData(stageSize, stageSize);
var data32 = new Uint32Array(imageData.data.buffer);
var intervalIndex;
function startAdvancedAnimation(advancedOffsetNumber, speed) {
    advancedOffsetNumber = parseInt(advancedOffsetNumber);
    var LinkedPixels = /** @class */ (function () {
        function LinkedPixels() {
            this.head = null;
            this.tail = null;
            this.length = 0;
        }
        LinkedPixels.prototype.push = function (value) {
            var head = this.head;
            if (head) {
                var next = { value: value, previous: this.tail, next: null };
                this.tail.next = next;
                this.tail = next;
            }
            else {
                this.head = { value: value, previous: null, next: null };
                this.tail = this.head;
            }
            this.length++;
        };
        LinkedPixels.prototype.getValueByIndex = function (index) {
            var current = this.head;
            if (index >= this.length) {
                return null;
            }
            for (var a = 0; a < index; a++) {
                current = current.next;
            }
            return current.value;
        };
        LinkedPixels.prototype.getNodeByIndex = function (index) {
            var current = this.head;
            if (index >= this.length) {
                return null;
            }
            for (var a = 0; a < index; a++) {
                current = current.next;
            }
            return current;
        };
        LinkedPixels.prototype.getValueByIndexFromBack = function (index) {
            var current = this.tail;
            if (index >= this.length) {
                return null;
            }
            for (var a = 0; a < index; a++) {
                current = current.previous;
            }
            return current.value;
        };
        LinkedPixels.prototype.deleteNodeByNode = function (node) {
            if (!node.previous) {
                this.head = node.next;
                if (!this.head) {
                    this.tail = null;
                }
                else {
                    this.head.previous = null;
                }
            }
            else if (!node.next) {
                this.tail = node.previous;
                if (!this.tail) {
                    this.head = null;
                }
                else {
                    this.tail.next = null;
                }
            }
            else {
                node.previous.next = node.next;
                node.next.previous = node.previous;
            }
            this.length--;
            return this.head;
        };
        LinkedPixels.prototype.deleteNodeByIndex = function (index) {
            var current = this.head;
            if (index >= this.length) {
                return null;
            }
            if (index == 0) {
                this.head = this.head.next;
                if (this.head) {
                    this.head.previous = null;
                }
                else {
                    this.tail = null;
                }
                this.length--;
                return this.head;
            }
            for (var a = 0; a < index; a++) {
                current = current.next;
            }
            if (current.next) {
                current.previous.next = current.next;
                current.next.previous = current.previous;
            }
            else {
                this.tail = current.previous;
                this.tail.next = null;
            }
            this.length--;
            return this.head;
        };
        LinkedPixels.prototype.deleteNodeByIndexFromBack = function (index) {
            var current = this.tail;
            if (index >= this.length) {
                return null;
            }
            if (index == 0) {
                this.tail = this.tail.previous;
                if (this.tail) {
                    this.tail.next = null;
                }
                else {
                    this.head = null;
                }
                this.length--;
                return this.head;
            }
            for (var a = 0; a < index; a++) {
                current = current.previous;
            }
            if (current.previous) {
                current.previous.next = current.next;
                current.next.previous = current.previous;
            }
            else {
                this.head = current.next;
                this.head.previous = null;
            }
            this.length--;
            return this.head;
        };
        return LinkedPixels;
    }());
    var Pixel = /** @class */ (function () {
        function Pixel(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
        }
        Pixel.prototype.setNeighbour = function () {
            for (var a = 0; a < 16; a += 2) {
                var tempY = this.y + axisArray[a + 1];
                var tempX = this.x + axisArray[a];
                if (tempX >= 0 && tempX < stageSize && tempY >= 0 && tempY < stageSize && !pixel2DArray[tempY][tempX]) {
                    var pixel = new Pixel(tempX, tempY, colorArray[this.color]);
                    linkedPixels.push(pixel);
                    pixel2DArray[tempY][tempX] = pixel;
                }
            }
        };
        Pixel.prototype.makeAlive = function (node) {
            linkedPixels.deleteNodeByNode(node);
            this.setNeighbour();
            data32[this.x + this.y * stageSize] = this.color;
        };
        return Pixel;
    }());
    function activatePixel(x, y, color, addToArray) {
        if (!pixel2DArray[y][x]) {
            var pixel = new Pixel(x, y, color);
            if (addToArray) {
                pixel.setNeighbour();
            }
            pixel2DArray[y][x] = pixel;
            data32[x + y * stageSize] = pixel2DArray[y][x].color;
        }
    }
    var globc = 0;
    var globcup = true;
    function getNextPixel(data32) {
        //let randomIndex = 1;
        var randomIndex = Math.floor(Math.random() * linkedPixels.length);
        /*let randomIndex = 0;
        if (linkedPixels.length > advancedOffsetNumber) {
            randomIndex = advancedOffsetNumber;
        }*/
        var node = linkedPixels.getNodeByIndex(randomIndex);
        if (node) {
            node.value.makeAlive(node);
        }
        else {
            clearInterval(intervalIndex);
        }
    }
    var pixel2DArray = new Array();
    var linkedPixels = new LinkedPixels();
    imageData = ctx.createImageData(stageSize, stageSize);
    data32 = new Uint32Array(imageData.data.buffer);
    for (var a = 0; a < stageSize; a++) {
        pixel2DArray[a] = new Array();
        for (var b = 0; b < stageSize; b++) {
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
    activatePixel(1, 1, 0xFFFF0000, true);
    /*activatePixel(200, 200, 0xFFFF0000, true);
    activatePixel(600, 200, 0xFF00FF00, true);
    activatePixel(200, 600, 0xFF0000FF, true);
    activatePixel(600, 600, 0xFFFFFF00, true);
    activatePixel(400, 400, 0xFF00FFFF, true);*/
    var interval = 1000 / 30;
    var drawsPerTick = parseInt(speed) * 1;
    var start = 0, end = 0, time = 0;
    intervalIndex = setInterval(function () {
        start = window.performance.now();
        for (var a = 0; a < drawsPerTick; a++) {
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
function startSpiralAnimation(spiralOffsetNumber, speed, color, repeat) {
    if (repeat === void 0) { repeat = false; }
    spiralOffsetNumber = parseInt(spiralOffsetNumber);
    function createSpiralArray(x, y) {
        var array = [];
        var distance = 2;
        var distanceCounter = -1;
        var direction = 0;
        var directionArray = [];
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
                }
                else if (direction == 4) {
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
    var spiralArray = createSpiralArray(stageSize / 2 - 1, stageSize / 2 - 1);
    var counter = 0;
    var interval = 1000 / 60;
    var drawsPerTick = parseInt(speed);
    var counterStartingOffset = 1;
    var drawsPerTickIncrease = 3;
    var startNext = false;
    var start = 0, end = 0, time = 0;
    intervalIndex = setInterval(function () {
        start = window.performance.now();
        for (var a = 0; a < drawsPerTick && counter < stageSizeX2; a++) {
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
var AnimationTypes = /** @class */ (function () {
    function AnimationTypes(label, offsetNum, mainFunc, val) {
        if (val === void 0) { val = null; }
        this.label = label;
        this.mainFunc = mainFunc;
        this.val = val;
        var sliderMin = 1;
        var sliderMax = 1000;
        if (val) {
            if (val["sliderSpeed"]) {
                sliderMin = val.sliderSpeed.min;
                sliderMax = val.sliderSpeed.max;
            }
        }
        $("#data-entry").append('<div class="animation-options-wrapper"><div class="label">' + label + ' Offset number</div><input class="number-input" id="' + label + '-offset-number"><div class="label" id="' + label + '-speed-label">Speed</div><input type="range" min="' + sliderMin + '" max="' + sliderMax + '" value="500" class="slider" id="' + label + '-speed"><button class="global-button" id="' + label + '-start-button">Start ' + label + '</button></div>');
        $("#" + label + "-offset-number").val(offsetNum);
        $("#" + label + "-speed").on("change", function () {
            $("#" + label + "-speed-label").text("Speed " + $("#" + label + "-speed").val());
        });
        $("#" + label + "-speed-label").text("Speed " + $("#" + label + "-speed").val());
        $("#" + label + "-start-button").on("click touch", function () {
            clearInterval(intervalIndex);
            mainFunc($("#" + label + "-offset-number").val(), $("#" + label + "-speed").val(), 0xFFFF0000);
        });
    }
    return AnimationTypes;
}());
function start() {
    colorArray1();
    var animationTypes = new Array();
    //animationTypes.push(new AnimationTypes("spread", 0, startSpreadAnimation, { sliderSpeed: { min: 1, max: 50000 } }));
    animationTypes.push(new AnimationTypes("advanced", 0, startAdvancedAnimation, { sliderSpeed: { min: 1, max: 50000 } }));
    animationTypes.push(new AnimationTypes("spiral", 13, startSpiralAnimation, { sliderSpeed: { min: 1, max: 50000 } }));
}
function colorArray2() {
    var hexColor = 0xFFFF0000;
    for (var a = 0; a < 256; a++) {
        var tempHexColor = hexColor - 0x00010000;
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
    var hexColor = 0xFFFF0000;
    for (var a = 0; a < 255; a++) {
        var tempHexColor = hexColor + 0x00000100;
        colorArray[hexColor] = tempHexColor;
        hexColor = tempHexColor;
    }
    hexColor = 0xFFFFFF00;
    for (var a = 0; a < 255; a++) {
        var tempHexColor = hexColor - 0x00010000;
        colorArray[hexColor] = tempHexColor;
        hexColor = tempHexColor;
    }
    hexColor = 0xFF00FF00;
    for (var a = 0; a < 255; a++) {
        var tempHexColor = hexColor + 0x00000001;
        colorArray[hexColor] = tempHexColor;
        hexColor = tempHexColor;
    }
    hexColor = 0xFF00FFFF;
    for (var a = 0; a < 255; a++) {
        var tempHexColor = hexColor - 0x00000100;
        colorArray[hexColor] = tempHexColor;
        hexColor = tempHexColor;
    }
    hexColor = 0xFF0000FF;
    for (var a = 0; a < 255; a++) {
        var tempHexColor = hexColor + 0x00010000;
        colorArray[hexColor] = tempHexColor;
        hexColor = tempHexColor;
    }
    hexColor = 0xFFFF00FF;
    for (var a = 0; a < 255; a++) {
        var tempHexColor = hexColor - 0x00000001;
        colorArray[hexColor] = tempHexColor;
        hexColor = tempHexColor;
    }
}
