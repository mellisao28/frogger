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

//************************************Start of enemy************************************

// Enemies our player must avoid
var Enemy = function() {

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.reset();
    this.y = 48;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    /* Multiply any movement by the dt parameter which will ensure the game runs at the same speed for
     all computers. Move the enemy from left to right unless it hits the right border. In that case
     enemy position and speed will be reset back.
	 */
    var rightBorder = 402;

    if (this.x < rightBorder + 101) {
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
    this.x = -83;
    this.speed = Math.floor((Math.random() * 5) + 3);
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
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

// Assign random item image and postiion
var Item = function() {
    var type = Date.now() % 7;
    this.sprite = imageList[type];
    this.x = 0;
    this.y = 0;
};

Item.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Move item to another location and change item type
Item.prototype.reset = function(seed) {
    var type = Date.now() * (seed + 1) % 7;
    this.sprite = imageList[type];
    this.y = 48 + (Date.now() * (seed + 1) % 3) * 83;
    this.x = (Date.now() * (seed + 1) % 5) * 101;
};

//************************************End of item************************************
//************************************Start of barrier************************************

var Barrier = function() {
    this.sprite = 'images/Rock.png';
    this.x = 0;
    this.y = 0;
};

// Only display barrier at specific time for specific period
// otherwise hide the barrier
Barrier.prototype.update = function() {
    if (Math.floor((Date.now() / 10000) % 10) == barrierTime) {
        if (this.x == -100) {
            this.y = 48 + (Date.now() % 3) * 83;
            this.x = (Date.now() % 5) * 101;
        }
    } else {
        this.reset();
    }
};

Barrier.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
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
    this.sprite = gameCharacters[selectedCharacter];
    this.x = 202;
    this.y = 380;
    this.speed = 0;
};

// Player update function is only called when there is key input
Player.prototype.update = function(cmd) {
    var leftBorder = 0;
    var rightBorder = 402;
    var topBorder = 48;
    var bottomBorder = 380;

    // to change position based on key input. If there is barrier then player cannot go pass barrier
    if (cmd === 'left' && this.x > leftBorder)
        this.x = this.x - 101;
    else if (cmd === 'right' && this.x < rightBorder)
        this.x = this.x + 101;
    else if (cmd === 'up' && this.y > topBorder)
        this.y = this.y - 83;
    else if (cmd === 'up' && this.y === topBorder) {
        this.reset();
        score--;
        updateScore();
    } else if (cmd === 'down' && this.y < bottomBorder)
        this.y = this.y + 83;

    for (var i = 0; i < allBarrier.length; i++) {
        if (player.x == allBarrier[i].x && allBarrier[i].y == player.y) {
            if (cmd == 'left')
                this.x = this.x + 101;
            else if (cmd == 'up')
                this.y = this.y + 83;
            else if (cmd == 'down')
                this.y = this.y - 83;
            else if (cmd == 'right')
                this.x = this.x - 101;

        }
    }

};

// Draw the player on the screen, required method for game
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
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
    if (cmd == 'right' && selectedCharacter < 4) {
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
    ctx.fillRect(selectedCharacter * 101, 130, 101, 101);
    ctx.stroke();
    ctx.strokeStyle = 'yellow';
    ctx.rect(selectedCharacter * 101, 130, 101, 101);
    ctx.stroke();

    //draw game characters
    for (var i = 0; i < gameCharacters.length; i++) {
        ctx.drawImage(Resources.get(gameCharacters[i]), i * 101, 83);
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
var numItems = 2;

for (var item = 0; item < numItems; item++) {
    var newItem = new Item();
    newItem.y = 48 + Math.floor(Math.random() * 3) * 83;
    newItem.x = Math.floor(Math.random() * 5) * 101;
    allItems[item] = newItem;
}

// All barrier objects is in an array called allBarrier
// which will be positioned in one of three row of stones.

var allBarrier = [];
var numBarrier = 1;

for (var barrier = 0; barrier < numBarrier; barrier++) {
    var newBarrier = new Barrier();
    newBarrier.y = 48 + Math.floor(Math.random() * 3) * 83;
    newBarrier.x = Math.floor(Math.random() * 5) * 101;
    allBarrier[barrier] = newBarrier;
}


// All enemy objects is in an array called allEnemies
// which will be positioned in one of three row of stones.

var allEnemies = [];
var numEnemies = 3;
var counter = 0;

for (var enemy = 0; enemy < numEnemies; enemy++) {
    var newEnemy = new Enemy();
    newEnemy.y = 48 + (counter * 83);
    allEnemies[enemy] = newEnemy;
    counter++;
    if (counter == 3)
        counter = Math.floor(Math.random() * 3);
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