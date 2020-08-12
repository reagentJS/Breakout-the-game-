'use strict';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;
const blockSize = 10;

// Decorating text (will be output with messages about ending game)
ctx.font = 'bold 32px serif';
ctx.textAlign = 'center';
ctx.textBaseLine = 'middle';



// Creating blocks constructor
const Block = function(x, y, speedX = 0, speedY = 0) {
    this.x = x;
    this.y = y;
    this.speedX = speedX;
    this.speedY = speedY;
};

// Creating blocks drawning method
Block.prototype.drawBlock = function(color) {
    if (color) ctx.fillStyle = color
    else ctx.fillStyle = '#000';
    ctx.fillRect(this.x, this.y, blockSize, blockSize);
};

// Creating blocks drawning method (only for ball)
Block.prototype.drawBall = function() {
    ctx.beginPath();
    ctx.fillStyle = 'orange';
    ctx.arc(this.x + blockSize / 2, this.y + blockSize / 2, blockSize / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
};

// Creating blocks moving method (only for ball)
Block.prototype.move = function() {
    this.x += this.speedX;
    this.y += this.speedY;
};

// Creating method for checking collisions with walls
// collision with left, top, right walls -> rebound of ball
// collision with bottom -> the game is lost
Block.prototype.checkWallCollision = function() {
    if (this.x <= blockSize || this.x >= width - 2 * blockSize) this.speedX *= -1;
    if (this.y <= blockSize) this.speedY *= -1;
    if (this.y >= height - 2 * blockSize) gameLose();
};

// Creating method for checking for the same coordinates of two blocks
// True if two blocks have same coordinates
Block.prototype.equal = function(anotherBlock) {
    let distance = Math.sqrt((this.x - anotherBlock.x) ** 2 + (this.y - anotherBlock.y) ** 2);
    return distance <= blockSize;
};

// Creating method for checking ball's collisions with bricks
Block.prototype.checkBlocksCollision = function(target) {
    if (target) {
        for (let j = 0; j < target.segments.length; j++) {
            if (this.equal(target.segments[j])) {
                if ((1 <= j && j <= 4) || (13 <= j && j <= 16)) { // rebound of the brick's top or bottom
                    this.speedY *= -1;
                } else if (j === 6 || j === 11) { // rebound of the brick's left or right border
                    this.speedX *= -1;
                } else if ((this.x - target.segments[j].x) ** 2 > (this.y - target.segments[j].y) ** 2) { // rebound of the brick's edge (left or right border)
                    this.speedX *= -1;
                } else if ((this.x - target.segments[j].x) ** 2 < (this.y - target.segments[j].y) ** 2) { // rebound of the brick's edge (top or bottom border)
                    this.speedY *= -1;
                } else { // rebound of the corner
                    this.speedX *= -1;
                    this.speedY *= -1;
                };
                return true;
            };
        };
    };
};


let count = 0; // counter of destroyed bricks for increase ball's speed
let score = 0; // score counter

// Creating method for check ball's collisions with bricks
Block.prototype.checkBricksCollision = function() {
    for (let i = 0; i < arr.length; i++) {
        if (this.checkBlocksCollision(arr[i])) {
            count++;
            showBricksDestroyed();
            showBricksRemain();
            if (i <= 6) {
                score += 40;
            } else if (6 < i <= 13) {
                score += 30;
            } else if (13 < i <= 20) {
                score += 20;
            } else if (i > 20) {
                score += 10;
            };
            showScore();
            delete arr[i];
            if (count === 3 || count === 8 || count === 13 || count === 18 || count === 23) {
                ball.speedX *= 1.3;
                ball.speedY *= 1.3;
            };
        };
    };
};

// Creating method for check ball's collisions with racket
Block.prototype.checkRacketCollision = function() {
    for (let i = 0; i < racket.segments.length; i++) {
        if (this.equal(racket.segments[i])) {
            if ((1 <= i && i <= 4) || (7 <= i && i <= 10)) { // rebound of top bottom border
                this.speedY *= -1;
            } else if ((this.x - racket.segments[i].x) ** 2 > (this.y - racket.segments[i].y) ** 2) {
                this.speedX *= -1; // rebound of the racket's edge (left or right border)
            } else if ((this.x - racket.segments[i].x) ** 2 < (this.y - racket.segments[i].y) ** 2) {
                this.speedY *= -1; // rebound of the racket's edge (top or bottom border)
            } else { // rebound of corner
                this.speedX *= -1;
                this.speedY *= -1;
            };
        };
    };
};



// Creating bricks constructor
const Brick = function(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.width = 6 * blockSize;
    this.height = 3 * blockSize;
    this.length = this.width * this.height;
    this.segments = [];
    for(let i = 0; i < this.length / blockSize / blockSize; i++) {
        this.segments.push(new Block(this.x + (i % (this.width / blockSize)) * blockSize, this.y + blockSize * Math.floor((i / (this.width / blockSize))), this.color));
    };
};

// Creating bricks drawning method
Brick.prototype.draw = function() {
    ctx.fillStyle = this.color;
    for(let i = 0; i < this.segments.length; i++) {
        ctx.fillRect(this.segments[i].x, this.segments[i].y, blockSize, blockSize, this.color);
    };
};


// Creating racket's constructor
const Racket = function() {
    this.width = 6 * blockSize;
    this.height = 2 * blockSize;
    this.length = this.width * this.height;
    this.x = width / 2 - this.width / 2;
    this.y = 9 * height / 10 - 3 * this.height;
    this.speed = 0;

    this.segments = []; // Creating racket's segments
    for(let i = 0; i < this.length / blockSize / blockSize; i++) {
        this.segments.push(new Block(this.x + (i % (this.width / blockSize)) * blockSize, this.y + blockSize * Math.floor((i / (this.width / blockSize)))));
    };
};

// Creating method for change racket's direction
Racket.prototype.changeDirection = function(newDirection) {
    if (newDirection === 'right') this.speed = 9
    else if (newDirection === 'left') this.speed = -9;
};

// Creating method for racket movement
Racket.prototype.move = function() {
    this.x += this.speed;
    for (let i = 0; i < this.segments.length; i++) {
        this.segments[i].x += this.speed;
    };

    if (this.x <= blockSize) {
        this.x = blockSize;
        for (let i = 0; i < this.segments.length; i++) {
            this.segments[i].x = this.x + (i % (this.width / blockSize)) * blockSize;
        };
    } else if (this.x + this.width >= width - blockSize) {
        this.x = width - blockSize - this.width;
        for (let i = 0; i < this.segments.length; i++) {
            this.segments[i].x = this.x + (i % (this.width / blockSize)) * blockSize;
        };
    };
};

// Creating method for racket stop
Racket.prototype.stopMoving = function() {
    this.speed = 0;
};

// Creating method for racket's drawning 
Racket.prototype.draw = function() {
    ctx.fillStyle = '#000';
    for (let i = 0; i < this.segments.length; i++) {
        ctx.fillRect(this.segments[i].x, this.segments[i].y, blockSize, blockSize);
    };
};



// Creating function for drawning borders (left, top, right)
function drawBorders() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width - blockSize, blockSize);
    ctx.fillRect(width - blockSize, 0, blockSize, height - blockSize);
    ctx.fillRect(0, blockSize, blockSize, height - 2 * blockSize);
};

// Creating function for drawning bricks
function drawBricks() {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i]) arr[i].draw();
    };
};

// Creating function for checking victory
function checkWin() {
    for (let i = 0; i < arr.length; i++) {
        if(arr[i]) return;
    };
    return gameWin();
};


// Creating main function
function main() {
    ctx.clearRect(blockSize, blockSize, width - 2 * blockSize, height - blockSize);
    drawBorders();
    racket.draw();
    racket.move();
    ball.drawBall();
    ball.move();
    drawBricks();
    ball.checkWallCollision();
    ball.checkRacketCollision();
    ball.checkBricksCollision();
    checkWin();
};


let racket = new Racket();
// Creating ball. Initial position = center, initial speedX = 0.8, initial speedY = 1.2
let ball = new Block(width / 2, height / 2, 1.8, 2.2);

// Creating array of bricks
let arr = [
    new Brick(3 * blockSize, 10 * blockSize, 'red'), // value = 40
    new Brick(11 * blockSize, 10 * blockSize, 'red'),
    new Brick(19 * blockSize, 10 * blockSize, 'red'),
    new Brick(27 * blockSize, 10 * blockSize, 'red'),
    new Brick(35 * blockSize, 10 * blockSize, 'red'),
    new Brick(43 * blockSize, 10 * blockSize, 'red'),
    new Brick(51 * blockSize, 10 * blockSize, 'red'),

    new Brick(3 * blockSize, 14 * blockSize, 'yellow'), // value = 30
    new Brick(11 * blockSize, 14 * blockSize, 'yellow'),
    new Brick(19 * blockSize, 14 * blockSize, 'yellow'),
    new Brick(27 * blockSize, 14 * blockSize, 'yellow'),
    new Brick(35 * blockSize, 14 * blockSize, 'yellow'),
    new Brick(43 * blockSize, 14 * blockSize, 'yellow'),
    new Brick(51 * blockSize, 14 * blockSize, 'yellow'),

    new Brick(3 * blockSize, 18 * blockSize, 'green'), // value = 20
    new Brick(11 * blockSize, 18 * blockSize, 'green'),
    new Brick(19 * blockSize, 18 * blockSize, 'green'),
    new Brick(27 * blockSize, 18 * blockSize, 'green'),
    new Brick(35 * blockSize, 18 * blockSize, 'green'),
    new Brick(43 * blockSize, 18 * blockSize, 'green'),
    new Brick(51 * blockSize, 18 * blockSize, 'green'),

    new Brick(3 * blockSize, 22 * blockSize, 'grey'), // value = 10
    new Brick(11 * blockSize, 22 * blockSize, 'grey'),
    new Brick(19 * blockSize, 22 * blockSize, 'grey'),
    new Brick(27 * blockSize, 22 * blockSize, 'grey'),
    new Brick(35 * blockSize, 22 * blockSize, 'grey'),
    new Brick(43 * blockSize, 22 * blockSize, 'grey'),
    new Brick(51 * blockSize, 22 * blockSize, 'grey'),
];

let counterTime = null;
let game = null;

// Creating function for beginning game
function begin() {
    time = 0;
    counterTime = setInterval(timeCount, 1000);
    game = setInterval(main, 1000 / 60);
};

let time = 0; // Initial time
// Creating time counter
function timeCount() {
    time++;
    showTime();
};

// Creating function for end the game (win)
function gameWin() {
    clearInterval(game);
    clearInterval(counterTime)
    ctx.fillStyle = '#000';
    ctx.fillText('You won! Time: ' + time + ' sec, score: ' + score, width / 2, height / 2);
};

// Creating function for end the game (lose)
function gameLose() {
    clearInterval(game);
    clearInterval(counterTime)
    ctx.fillStyle = '#000';
    ctx.fillText('You lost! Time: ' + time + ' sec, score: ' + score, width / 2, height / 2);
};


// Creating function for showing score
const displayScore = document.getElementById('score');
function showScore() {
    displayScore.innerHTML = score;
};

// Creating function for showing time
const displayTime = document.getElementById('time');
function showTime() {
    displayTime.innerHTML = time;
};

// Creating function for showing quantity of destroyed bricks
const bricksDestroyed = document.getElementById('bricksDestroyed');
function showBricksDestroyed() {
    bricksDestroyed.innerHTML = count;
};

// Creating function for showing quantity of remain bricks
const bricksRemain = document.getElementById('bricksRemain');
function showBricksRemain() {
    bricksRemain.innerHTML = arr.length - count;
};

// Creating object for transform keyCode to word
let keyNames = {
    37: 'left', // Left arrow
    39: 'right', // Right arrow
};

// Set the actions keyup event
document.addEventListener('keyup', stop);
function stop() {
    racket.stopMoving();
};

// Set the actions keydown event
document.addEventListener('keydown', setNewDirection);
function setNewDirection(event) {
    let newDirection = keyNames[event.keyCode];
    if (newDirection) racket.changeDirection(newDirection);
};


begin(); // Beginning of the game