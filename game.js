// snake - Phaser.js Game

let snake;
let food;
let cursors;
let score = 0;
let scoreText;
let gameOver = false;
let gridSize = 20;
let cellSize = 20;
let lastMove = 0;
let moveDelay = 150;

function preload() {
    // Load sprites
    this.load.image('player', 'assets/player.png');
    this.load.image('powerup', 'assets/powerup.png');
    this.load.image('asteroid', 'assets/asteroid.png');
}

function create() {
    // Background
    this.cameras.main.setBackgroundColor('#1a1a2e');
    
    // Create walls using asteroid sprites
    this.walls = this.physics.add.staticGroup();
    // Top wall
    for (let i = 0; i < 40; i++) {
        const wall = this.walls.create(i * cellSize + cellSize/2, cellSize/2, 'asteroid');
        wall.setScale(0.4);
        wall.setTint(0x444444);
    }
    // Bottom wall
    for (let i = 0; i < 40; i++) {
        const wall = this.walls.create(i * cellSize + cellSize/2, 580 + cellSize/2, 'asteroid');
        wall.setScale(0.4);
        wall.setTint(0x444444);
    }
    // Left wall
    for (let i = 0; i < 28; i++) {
        const wall = this.walls.create(cellSize/2, i * cellSize + cellSize + cellSize/2, 'asteroid');
        wall.setScale(0.4);
        wall.setTint(0x444444);
    }
    // Right wall
    for (let i = 0; i < 28; i++) {
        const wall = this.walls.create(780 + cellSize/2, i * cellSize + cellSize + cellSize/2, 'asteroid');
        wall.setScale(0.4);
        wall.setTint(0x444444);
    }
    
    // Create snake using player sprite
    snake = this.physics.add.group();
    // Snake head
    const head = this.physics.add.sprite(400, 300, 'player');
    head.setScale(0.6);
    snake.add(head);
    
    // Initial body segments
    for (let i = 1; i <= 3; i++) {
        const segment = this.physics.add.sprite(400 - i * cellSize, 300, 'player');
        segment.setScale(0.5);
        segment.setTint(0x66ccff);
        snake.add(segment);
    }
    
    // Snake tail
    const tail = this.physics.add.sprite(400 - 4 * cellSize, 300, 'player');
    tail.setScale(0.4);
    tail.setTint(0x66ccff);
    snake.add(tail);
    
    // Snake properties
    this.snakeDirection = { x: cellSize, y: 0 };
    this.nextDirection = { x: cellSize, y: 0 };
    
    // Create food using powerup sprite
    food = this.physics.add.sprite(200, 200, 'powerup');
    food.setScale(0.6);
    this.placeFood();
    
    // Score text
    scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '24px',
        fill: '#ffffff',
        fontFamily: 'Arial'
    });
    
    // Controls
    cursors = this.input.keyboard.createCursorKeys();
    
    // Collisions
    this.physics.add.overlap(snake.children.entries[0], food, this.eatFood, null, this);
    this.physics.add.collider(snake.children.entries[0], this.walls, this.hitWall, null, this);
    this.physics.add.collider(snake.children.entries[0], snake, this.hitSelf, null, this);
}

function update(time) {
    if (gameOver) return;
    
    // Handle input
    if (cursors.left.isDown && this.snakeDirection.x === 0) {
        this.nextDirection = { x: -cellSize, y: 0 };
    } else if (cursors.right.isDown && this.snakeDirection.x === 0) {
        this.nextDirection = { x: cellSize, y: 0 };
    } else if (cursors.up.isDown && this.snakeDirection.y === 0) {
        this.nextDirection = { x: 0, y: -cellSize };
    } else if (cursors.down.isDown && this.snakeDirection.y === 0) {
        this.nextDirection = { x: 0, y: cellSize };
    }
    
    // Move snake
    if (time > lastMove + moveDelay) {
        this.snakeDirection = { ...this.nextDirection };
        this.moveSnake();
        lastMove = time;
    }
}

function moveSnake() {
    const head = snake.children.entries[0];
    const segments = snake.children.entries;
    
    // Store previous positions
    const prevPositions = segments.map(segment => ({ x: segment.x, y: segment.y }));
    
    // Move head
    head.x += this.snakeDirection.x;
    head.y += this.snakeDirection.y;
    
    // Move body segments
    for (let i = 1; i < segments.length; i++) {
        segments[i].x = prevPositions[i - 1].x;
        segments[i].y = prevPositions[i - 1].y;
    }
    
    // Rotate head based on direction
    if (this.snakeDirection.x > 0) head.setRotation(0);
    else if (this.snakeDirection.x < 0) head.setRotation(Math.PI);
    else if (this.snakeDirection.y > 0) head.setRotation(Math.PI / 2);
    else if (this.snakeDirection.y < 0) head.setRotation(-Math.PI / 2);
}

function placeFood() {
    const gridWidth = 38;
    const gridHeight = 26;
    let x, y;
    
    do {
        x = Math.floor(Math.random() * gridWidth) * cellSize + cellSize + cellSize/2;
        y = Math.floor(Math.random() * gridHeight) * cellSize + cellSize + cellSize/2;
    } while (this.isSnakePosition(x, y));
    
    food.setPosition(x, y);
}

function isSnakePosition(x, y) {
    return snake.children.entries.some(segment => 
        Math.abs(segment.x - x) < cellSize && Math.abs(segment.y - y) < cellSize
    );
}

function eatFood() {
    score += 10;
    scoreText.setText('Score: ' + score);
    
    // Add new segment
    const tail = snake.children.entries[snake.children.entries.length - 1];
    const newSegment = this.physics.add.sprite(tail.x, tail.y, 'player');
    newSegment.setScale(0.5);
    newSegment.setTint(0x66ccff);
    snake.add(newSegment);
    
    // Place new food
    this.placeFood();
    
    // Speed up slightly
    moveDelay = Math.max(100, moveDelay - 2);
}

function hitWall() {
    this.endGame();
}

function hitSelf() {
    this.endGame();
}

function endGame() {
    gameOver = true;
    this.add.text(400, 300, 'GAME OVER', {
        fontSize: '48px',
        fill: '#ff0000',
        fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    this.add.text(400, 350, 'Press F5 to restart', {
        fontSize: '24px',
        fill: '#ffffff',
        fontFamily: 'Arial'
    }).setOrigin(0.5);
}

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: { preload, create, update }
};

// Initialize game
const game = new Phaser.Game(config);