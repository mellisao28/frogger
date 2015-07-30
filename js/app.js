/* app.js
 * Written by	: Mellisa Octaviani
 * Created on	: 26 July 2015
 *
 * This file provides the game objects and game logic function
 * such as update, reset, render, as well as handling key input.
 * This script also handles all object instantiation.
 */
'use strict';
var score = 0;
var barrierTime = 3;
var selectedCharacter = 0;
var state = 'onPreStart';
const b_width = 101, //block width
    b_height = 83, //block height
    col = 5, //number of column
    row = 3, //number of row
    numItems = 2, // number of item
    numBarrier = 1, //number of barrier
    numEnemies = 3; // number of enemies

//************************************Start of Frogger Object********************************

var FroggerObj = function(sprite, x, y) {
    this.sprite = sprite;
    this.x = x;
    this.y = y;
};

FroggerObj.prototype.reset = function() {
    this.x = 0;
    this.speed = 0;
};

// Draw the object on the screen, required method for game
FroggerObj.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

//************************************End of Frogger Object********************************

//************************************Start of Enemy Object********************************

// Enemies our player must avoid
var Enemy = function(enemy_y) {
    // Call parental constructor.
    // Assign random item image and postiion

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    var sprite = 'images/enemy-bug.png';
    var x = -b_height;
    FroggerObj.call(this, sprite, x, enemy_y);
};

// Prototypes are chained.
Enemy.prototype = Object.create(FroggerObj.prototype);

// You can change the constructor. 
Enemy.prototype.constructor = Enemy;

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    /* Multiply any movement by the dt parameter which will ensure the game runs at the same speed for
     all computers. Move the enemy from left to right unless it hits the right border. In that case
     enemy position and speed will be reset back.
	 */
    var rightBorder = 402;

    if (this.x < rightBorder + b_width) {
        this.x = this.x + (this.speed * dt * 30);
        if (Math.floor((Date.now() / 10000) % 10) == barrierTime) {
            // if there is barrier enemy cannot move pass barrier.
            for (var i = 0; i < allBarrier.length; i++) {
                if (Math.abs(allBarrier[i].x - this.x) < 80 && allBarrier[i].y == this.y) {
                    this.x = this.x - (this.speed * dt * 30);
                }
            }
        }
    } else {
        this.reset(); // enemy will be reset back to starting point after reaching right border.
    }
};

// Enemy is reset to starting point
Enemy.prototype.reset = function() {
    this.x = -b_height;
    this.speed = Math.floor((Math.random() * 5) + 3); // random number between 3-7
};


//************************************End of enemy************************************
//************************************Start of item************************************

// imageList variable will stores image paths to 7 types of items to be collected
var imageList = [
    'images/gem-blue.png',
    'images/gem-orange.png',
    'images/gem-green.png',
    'images/Heart.png',
    'images/Key.png',
    'images/Star.png',
    'images/Selector.png'
];

var Item = function() {
    // Call parental constructor.
    // Assign random item image and postiion
    var type = Date.now() % imageList.length;
    var sprite = imageList[type];
    var x = Math.floor(Math.random() * col) * b_width;
    var y = 48 + Math.floor(Math.random() * row) * b_height;
    FroggerObj.call(this, sprite, x, y);
};

// Prototypes are chained.
Item.prototype = Object.create(FroggerObj.prototype);

// Move item to another location and change item type
Item.prototype.reset = function(seed) {
    var type = Date.now() * (seed + 1) % imageList.length;
    this.sprite = imageList[type];
    this.y = 48 + (Date.now() * (seed + 1) % row) * b_height;
    this.x = (Date.now() * (seed + 1) % col) * b_width;
};

//************************************End of item************************************
//************************************Start of barrier************************************

var Barrier = function(sprite, x, y) {
    // Call parental constructor.
    sprite = 'images/Rock.png';
    x = Math.floor(Math.random() * col) * b_width;
    y = 48 + Math.floor(Math.random() * row) * b_height;
    FroggerObj.call(this, sprite, x, y);
};

// Prototypes are chained.
Barrier.prototype = Object.create(FroggerObj.prototype);

// Only display barrier at specific time for specific period
// otherwise hide the barrier
Barrier.prototype.update = function() {
    if (Math.floor((Date.now() / 10000) % 10) == barrierTime) {
        if (this.x == -100) {
            this.y = 48 + (Date.now() % row) * b_height;
            this.x = (Date.now() % col) * b_width;
        }
    } else {
        this.reset();
    }
};

// hide barrier
Barrier.prototype.reset = function() {
    this.x = -100;
    this.y = -100;
};
//************************************End of barrier************************************


//************************************Start of player************************************

// gameCharacters stores collection of game Character selection.
var gameCharacters = ['images/char-boy.png',
    'images/char-cat-girl.png',
    'images/char-horn-girl.png',
    'images/char-pink-girl.png',
    'images/char-princess-girl.png'
];

// Player class requires an update(), render() and
// a handleInput() method.

var Player = function() {
    // Call parental constructor.
    var sprite = gameCharacters[selectedCharacter];
    var x = 202;
    var y = 380;
    FroggerObj.call(this, sprite, x, y);
};

// Prototypes are chained.
Player.prototype = Object.create(FroggerObj.prototype);

// Player update function is only called when there is key input
Player.prototype.update = function(cmd) {
    var leftBorder = 0;
    var rightBorder = 402;
    var topBorder = 48;
    var bottomBorder = 380;

    // to change position based on key input. If there is barrier then player cannot go pass barrier
    if (cmd === 'left' && this.x > leftBorder)
        this.x = this.x - b_width;
    else if (cmd === 'right' && this.x < rightBorder)
        this.x = this.x + b_width;
    else if (cmd === 'up' && this.y > topBorder)
        this.y = this.y - b_height;
    else if (cmd === 'up' && this.y === topBorder) {
        this.reset();
        score--;
        updateScore();
    } else if (cmd === 'down' && this.y < bottomBorder)
        this.y = this.y + b_height;

    for (var i = 0; i < allBarrier.length; i++) {
        if (player.x == allBarrier[i].x && allBarrier[i].y == player.y) {
            if (cmd == 'left')
                this.x = this.x + b_width;
            else if (cmd == 'up')
                this.y = this.y + b_height;
            else if (cmd == 'down')
                this.y = this.y - b_height;
            else if (cmd == 'right')
                this.x = this.x - b_width;
        }
    }

};

// If there is any input while the game is on then update player 
// If the game is not on then input is for start menu or game over screen
Player.prototype.handleInput = function(cmd) {
    if (state == "onPlay")
        if (cmd == "pause")
            state = "onPause"; //control of pausing the game
        else
            this.update(cmd); // control for main game
    else if (state == "onPause" && cmd == 'pause')
        state = "onPlay"; // control of unpausing the game
    else if (state == "onPreStart" || state == "onGameOver") {
        selectGameMenu(cmd); // control for game menu
    }
};

// This function resets player to start position.
Player.prototype.reset = function() {
    this.y = 380;
    this.x = 202;
};

//************************************End of player************************************

//************************************Start of function************************************
// To navigate game character start menu
function selectGameMenu(cmd) {
    if (cmd == 'right' && selectedCharacter < gameCharacters.length - 1) {
        selectedCharacter += 1;
        redraw();
    } else if (cmd == 'left' && selectedCharacter > 0) {
        selectedCharacter -= 1;
        redraw();
    } else if (cmd == 'yes' || cmd == 'enter') {
        player.sprite = gameCharacters[selectedCharacter]; //select game character and start game
        state = "onPlay";
        redraw();
    } else if (cmd == 'start') {
        state = "onPreStart";
        redraw(); // to start 'menu' UI
    }
}

// This function is to check if game is over
function updateScore() {
    if (score < 0) {
        state = 'onGameOver';
        score = 0;
    }
}

//wipes the canvas context
function clear(c) {
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.beginPath();
}

//clears the canvas and draws start Menu if required
function redraw() {
    clear(ctx);
    if (state == "onPreStart")
        drawStartMenu();
}

function drawStartMenu() {
    // draw background
    ctx.fillStyle = '#f93';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.stroke();

    //draw instruction
    ctx.font = '25pt Impact';
    ctx.textAlign = 'center';
    ctx.lineWidth = 3;
    ctx.fillStyle = 'white';
    ctx.fillText("Select your character", canvas.width / 2 - 10, 100);
    ctx.fillText("Press Enter / Y to start", canvas.width / 2 - 10, 300);

    //draw rectangle
    ctx.fillStyle = '#ffff99';
    ctx.fillRect(selectedCharacter * b_width, 130, b_width, b_width);
    ctx.stroke();
    ctx.strokeStyle = 'yellow';
    ctx.rect(selectedCharacter * b_width, 130, b_width, b_width);
    ctx.stroke();

    //draw game characters
    for (var i = 0; i < gameCharacters.length; i++) {
        ctx.drawImage(Resources.get(gameCharacters[i]), i * b_width, b_height);
    }

    //draw footer
    ctx.fillStyle = 'white';
    ctx.font = '10pt Serif';
    ctx.lineWidth = 1;
    ctx.fillText("Copyright @ 2015 Mellisa Octaviani. All rights reserved.", canvas.width / 2 - 10, canvas.height - 30);
}


// This section is to instantiate all objects

// All item objects is in an array called allItems
// which will be positioned in one of three row of stones.

var allItems = [];

for (var item = 0; item < numItems; item++) {
    var newItem = new Item();
    allItems[item] = newItem;
}


// All barrier objects is in an array called allBarrier
// which will be positioned in one of three row of stones.

var allBarrier = [];

for (var barrier = 0; barrier < numBarrier; barrier++) {
    var newBarrier = new Barrier();
    allBarrier[barrier] = newBarrier;
}

// All enemy objects is in an array called allEnemies
// which will be positioned in one of three row of stones.

var allEnemies = [];
var counter = 0;

for (var enemy = 0; enemy < numEnemies; enemy++) {
    var y = 48 + (counter * b_height);
    var newEnemy = new Enemy(y);
    newEnemy.reset();
    allEnemies[enemy] = newEnemy;
    counter++;
    if (counter == row)
        counter = Math.floor(Math.random() * row);
}


// Place the player object in a variable called player
var player = new Player();

// This listens for key presses and sends the keys to
// Player.handleInput() method. 
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        80: 'pause',
        89: 'yes',
        78: 'start',
        13: 'enter'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});