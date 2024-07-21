// Configuration settings for the Phaser game.
const config = {
  type: Phaser.AUTO, // Automatically determine rendering method (WebGL or Canvas).
  width: 800, // Width of the game canvas.
  height: 600, // Height of the game canvas.
  physics: {
    default: 'arcade', // Uses the Arcade Physics system.
    arcade: {
      gravity: { y: 600 }, // Sets gravity in the y-direction.
      debug: false // Disables physics debugging.
    }
  },
  scene: {
    preload: preload, // Function to load assets.
    create: create, // Function to set up game objects.
    update: update // Function to update game logic.
  }
};
// Creates a new Phaser game instance with the configuration.
const game = new Phaser.Game(config);
let player; // Player sprite
let cursors; // Cursor keys input
let spacebar; // Spacebar input
let obstacles; // Group of obstacle sprites
let score = 0; // Player's score
let scoreText; // Text displaying the score
let background; // Background tile sprite
let foreground; // Foreground tile sprite
let barrier; // Invisible barrier for collision detection
let isGameOver = false; // Game over state
let obstacleSpeed = -200; // Initial speed of obstacles
let canJump = true; // Flag to control player jumping
function preload() {
  this.load.image('background', 'assets/images/background.png'); // Loads background image.
  this.load.image('foreground', 'assets/images/foreground.png'); // Loads foreground image.
  this.load.image('player', 'assets/images/player.png'); // Loads player image.
  this.load.image('obstacle', 'assets/images/obstacle.png'); // Loads obstacle image.
  this.load.audio('jump', 'assets/audio/jump.wav'); // Loads jump sound.
  this.load.audio('gameover', 'assets/audio/gameover.wav'); // Loads game over sound.
}
function create() {
  background = this.add.tileSprite(400, 300, 800, 600, 'background'); // Adds background tile sprite.
  foreground = this.add.tileSprite(400, 550, 800, 100, 'foreground'); // Adds foreground tile sprite.
  player = this.physics.add.sprite(100, 450, 'player'); // Adds player sprite with physics.
  player.setCollideWorldBounds(true); // Prevents player from going out of bounds.
  barrier = this.physics.add.staticImage(400, 725, 'foreground'); // Adds invisible barrier for collision.
  barrier.visible = false; // Makes barrier invisible.
  obstacles = this.physics.add.group(); // Creates a group for obstacles.
  this.time.addEvent({
    delay: getRandomDelay(), // Random delay for obstacle spawning.
    callback: addObstacle, // Function to add an obstacle.
    callbackScope: this, // Scope of the callback function.
    loop: true // Repeats the event.
  });
  cursors = this.input.keyboard.createCursorKeys(); // Creates cursor keys input.
  spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); // Creates spacebar input.
  scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' }); // Displays the score.
  this.physics.add.collider(player, barrier, () => {
    canJump = true; // Allows player to jump again.
  });
  this.physics.add.collider(obstacles, barrier); // Collision between obstacles and barrier.

  this.time.addEvent({
    delay: 2500, // Delay for increasing obstacle speed.
    callback: increaseObstacleSpeed, // Function to increase obstacle speed.
    callbackScope: this, // Scope of the callback function.
    loop: true // Repeats this event
  });
}
// Function to update the game logic.
function update() {
  if (!isGameOver) {
    background.tilePositionX += 0.5; // Scrolls background
    foreground.tilePositionX += 1; // Scrolls foreground
    playerMovementManager(); // Handles player movement
    score += 1; // Increases score.
    scoreText.setText('Score: ' + score); // Updates score text
  }
  if (player.y > 550) {
    player.y = 550; // Prevents player from falling below the ground.
  }
  obstacles.getChildren().forEach(obstacle => {
    if (obstacle.y > 550) {
      obstacle.y = 550; // Prevents obstacles from falling below the ground.
    }
  });
}
// Function to manage player movement.
function playerMovementManager() {
  if (cursors.left.isDown) {
    player.setVelocityX(-160); // Moves player left
  } 
  else if (cursors.right.isDown) {
    player.setVelocityX(160); // Moves player right
  } 
  else {
    player.setVelocityX(0); // Stops player movement
  }
  if ((cursors.up.isDown || spacebar.isDown) && canJump) {
    player.setVelocityY(-300); // Makes player jump.
    canJump = false; // Prevents double jumping
  }
}
// Function to add an obstacle.
function addObstacle() {
  const obstacle = obstacles.create(800, 500, 'obstacle'); // Creates an obstacle sprite
  obstacle.setVelocityX(obstacleSpeed); // Sets obstacle speed
  obstacle.checkWorldBounds = true; // Enables world bounds check
  obstacle.outOfBoundsKill = true; // Destroys obstacle when out of bounds.
  this.physics.add.collider(player, obstacle, hitObstacle, null, this); // Collision between player and obstacle.
}
// Function to get a random delay for obstacle spawning.
function getRandomDelay() {
  return Phaser.Math.Between(1000, 3000); // Returns a random delay between 1 and 3 seconds.
}
// Function to handle collision between player and obstacles
function hitObstacle(player, obstacle) {
  this.physics.pause(); // Pauses the game physics
  player.setTint(0xff0000); // Changes the player color to red
  this.sound.play('gameover'); // Plays the gameover sound
  isGameOver = true; // Sets game over state
}
// Function to increase the speed of obstacles over time.
function increaseObstacleSpeed() {
  obstacleSpeed -= 75; // Increases obstacle speed
}
