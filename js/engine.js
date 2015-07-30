/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on player and enemy objects (defined in app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook. When player moves across the screen, 
 * it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object and canvas globally available to make writing app.js
 * a little simpler to work with.
 */
var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;
		
	var o_width = 69, // object's width
	o_height = 73, // object's height
	e_height = 54; // enemy's height

    canvas.width = 505;
    canvas.height = 606;
    doc.body.appendChild(canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {

        /* Get time delta information which is required if the game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call update/render functions, pass along the time delta to
         * update function since it may be used for smooth animation.
         * only update and render when game is on or not in pause mode.
         */
        if (state == 'onPlay')
            update(dt);
        if (state == 'onPlay' || state == "onGameOver")
            render();




        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);

    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        lastTime = Date.now();
        main();
    }

    /* This function is called by main (game loop) and itself calls all
     * of the functions which may need to update entity's data, check collision, and item collection
     */
    function update(dt) {
        updateEntities(dt);
        checkEnemyCollision();
        checkCollection();
    }

    /* This function is called by the checkEnemyCollision and checkCollection functions and 
    used to detect collision between 2 given objects.
    */
    function checkCollisions(x1, y1, w1, h1, x2, y2, w2, h2) {
        if (x1 < x2 + w2 &&
            x1 + w1 > x2 &&
            y1 < y2 + h2 &&
            h1 + y1 > y2)
            return true;
        return false;
    }

    /* This function is called by the update function and 
    used to detect collision between player and enemy. 
    If collision is detected then player is reset back and score is deducted.
    */
    function checkEnemyCollision() {
        allEnemies.forEach(function(enemy) {
            if (checkCollisions(player.x, player.y, o_width, o_height, enemy.x, enemy.y, o_width, e_height)) {
                player.reset();
                score--;
                updateScore();
            }
        });
    }

    /* This function is called by the update function and 
    used to detect collection of items. 
    If item is picked up then score is increased and item is moved.
    */
    function checkCollection() {
        for (var i = 0; i < allItems.length; i++) {
            if (checkCollisions(player.x, player.y, o_width , o_height, allItems[i].x, allItems[i].y, o_width, o_height)) {
                allItems[i].reset(i);
                score++;
            }
        }
    }

    /* This is called by the update function  and loops through all of the
     * objects within allEnemies and allBarriers array as defined in app.js and calls
     * their update() methods. These update methods should focus purely on updating
     * the data/properties related to  the object. 
     */
    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        allBarrier.forEach(function(barrier) {
            barrier.update();
        });
    }



    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/water-block.png', // Top row is water
                'images/stone-block.png', // Row 1 of 3 of stone
                'images/stone-block.png', // Row 2 of 3 of stone
                'images/stone-block.png', // Row 3 of 3 of stone
                'images/grass-block.png', // Row 1 of 2 of grass
                'images/grass-block.png' // Row 2 of 2 of grass
            ],
            numRows = 6,
            numCols = 5,
            row, col;

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using Resources helpers to refer to images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }

        renderEntities();

        if (state == "onPlay")
            renderScore();

        if (state == "onGameOver")
            renderGameOver();

    }

    /* This function is called by the render function and is called on each game
     * tick. It's purpose is to then call the render functions
     * on enemy and player entities within app.js
     */
    function renderEntities() {

        /* Loop through all of the objects within the allItems array and call
         * the render function.
         */
        allItems.forEach(function(item) {
            item.render();
        });

        /* Loop through all of the objects within the allBarrier array and call
         * the render function.
         */
        allBarrier.forEach(function(barrier) {
            barrier.render();
        });

        /* Loop through all of the objects within the allEnemies array and call
         * the render function.
         */
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        player.render();
    }

    // This function is to show score result or to show game over screen
    function renderScore() {
        ctx.font = '25pt Impact';
        ctx.textAlign = 'center';
        ctx.lineWidth = 3;
        ctx.fillStyle = 'white';
        ctx.fillText("SCORE: " + score, 400, 100);

    }

    //This function handle a game over screen
    function renderGameOver() {
        ctx.fillStyle = 'black';
        ctx.fillRect(canvas.width / 2 - 150, canvas.height / 2 - 50, 300, 130);
        ctx.strokeStyle = 'red';
        ctx.rect(canvas.width / 2 - 150, canvas.height / 2 - 50, 300, 130);
        ctx.stroke();
        ctx.fillStyle = 'white';
        ctx.fillText("Game Over.", canvas.width / 2, canvas.height / 2);
        ctx.fillText("Continue? (y/n)", canvas.width / 2, canvas.height / 2 + 40);
    }

    /* 
     * It's only called once by the init() method.
     */
    function reset() {
        score = 0;
        state = 'onPreStart';
        selectedCharacter = 0;
        redraw();
    }

    /* Load all of the images we know we're going to need to
     * draw game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png',
        'images/gem-blue.png',
        'images/gem-orange.png',
        'images/gem-green.png',
        'images/Heart.png',
        'images/Key.png',
        'images/Star.png',
        'images/Selector.png',
        'images/Rock.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object and canvas object to the global variable (the window
     * object when run in a browser) so that developer's can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
    global.canvas = canvas;
})(this);