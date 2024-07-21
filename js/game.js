// Configuration settings for the Phaser game.
const config = {
  type: Phaser.AUTO, // Automatically determine rendering method (WebGL or Canvas).
  width: 800, // Width of the game canvas.
  height: 600, // Height of the game canvas.
  physics: {
    default: 'arcade', // Use the Arcade Physics system.
    arcade: {
      gravity: { y: 600 }, // Set gravity in the y-direction.
      debug: false // Disable physics debugging.
    }
  },
  scene: {
    preload: preload, // Function to load assets.
    create: create, // Function to set up game objects.
    update: update // Function to update game logic.
  }
};
// Create a new Phaser game instance with the configuration.
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
  this.load.image('background', 'assets/images/background.png'); // Load background image.
  this.load.image('foreground', 'assets/images/foreground.png'); // Load foreground image.
  this.load.image('player', 'assets/images/player.png'); // Load player image.
  this.load.image('obstacle', 'assets/images/obstacle.png'); // Load obstacle image.
  this.load.audio('jump', 'assets/audio/jump.wav'); // Load jump sound.
  this.load.audio('powerupSound', 'assets/audio/powerup.wav'); // Load powerup sound.
  this.load.audio('gameover', 'assets/audio/gameover.wav'); // Load game over sound.
}
function create() {
  background = this.add.tileSprite(400, 300, 800, 600, 'background'); // Add background tile sprite.
  foreground = this.add.tileSprite(400, 550, 800, 100, 'foreground'); // Add foreground tile sprite.
  player = this.physics.add.sprite(100, 450, 'player'); // Add player sprite with physics.
  player.setCollideWorldBounds(true); // Prevent player from going out of bounds.
  barrier = this.physics.add.staticImage(400, 725, 'foreground'); // Add invisible barrier for collision.
  barrier.visible = false; // Make barrier invisible.
  obstacles = this.physics.add.group(); // Create a group for obstacles.
  this.time.addEvent({
    delay: getRandomDelay(), // Random delay for obstacle spawning.
    callback: addObstacle, // Function to add an obstacle.
    callbackScope: this, // Scope of the callback function.
    loop: true // Repeat the event.
  });
  cursors = this.input.keyboard.createCursorKeys(); // Create cursor keys input.
  spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); // Create spacebar input.
  scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' }); // Display the score.
  this.physics.add.collider(player, barrier, () => {
    canJump = true; // Allow player to jump again.
  });
  this.physics.add.collider(obstacles, barrier); // Collision between obstacles and barrier.

  this.time.addEvent({
    delay: 2500, // Delay for increasing obstacle speed.
    callback: increaseObstacleSpeed, // Function to increase obstacle speed.
    callbackScope: this, // Scope of the callback function.
    loop: true // Repeat this event
  });
}
// Function to update the game logic.
function update() {
  if (!isGameOver) {
    background.tilePositionX += 0.5; // Scroll background
    foreground.tilePositionX += 1; // Scroll foreground
    playerMovementManager(); // Handle player movement
    score += 1; // Increase score.
    scoreText.setText('Score: ' + score); // Update score text
  }
  if (player.y > 550) {
    player.y = 550; // Prevent player from falling below the ground.
  }
  obstacles.getChildren().forEach(obstacle => {
    if (obstacle.y > 550) {
      obstacle.y = 550; // Prevent obstacles from falling below the ground.
    }
  });
}
// Function to manage player movement.
function playerMovementManager() {
  if (cursors.left.isDown) {
    player.setVelocityX(-160); // Move player left
  } 
  else if (cursors.right.isDown) {
    player.setVelocityX(160); // Move player right
  } 
  else {
    player.setVelocityX(0); // Stop player movement
  }
  if ((cursors.up.isDown || spacebar.isDown) && canJump) {
    player.setVelocityY(-300); // Make player jump.
    canJump = false; // Prevent double jumping
  }
}
// Function to add an obstacle.
function addObstacle() {
  const obstacle = obstacles.create(800, 500, 'obstacle'); // Create an obstacle sprite
  obstacle.setVelocityX(obstacleSpeed); // Set obstacle speed
  obstacle.checkWorldBounds = true; // Enable world bounds check
  obstacle.outOfBoundsKill = true; // Destroy obstacle when out of bounds.
  this.physics.add.collider(player, obstacle, hitObstacle, null, this); // Collision between player and obstacle.
  this.physics.add.collider(obstacle, barrier); // Collision between obstacle and barrier.
}
// Function to get a random delay for obstacle spawning.
function getRandomDelay() {
  return Phaser.Math.Between(1000, 3000); // Return a random delay between 1 and 3 seconds.
}
// Function to handle collision between player and obstacle
function hitObstacle(player, obstacle) {
  this.physics.pause(); // Pause the game physics
  player.setTint(0xff0000); // Change the player color to red
  this.sound.play('gameover'); // Play the gameover sound
  isGameOver = true; // Set game over state
}
// Function to increase the speed of obstacles over time.
function increaseObstacleSpeed() {
  obstacleSpeed -= 75; // Increase obstacle speed
}
