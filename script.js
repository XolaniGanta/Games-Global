// Create a PixiJS application
const app = new PIXI.Application({ width: 600, height: 400 });

// Add the PixiJS canvas to the HTML document
document.body.appendChild(app.view);

// Global variables
let pegs = [];
let ball;
let ballRadius = 10;
let animationSpeed = 2;
let animationStarted = false;
let pegSpacing = 55; // Adjust the spacing between pegs
let score = 100; // Initial score
const bucketValues = [10, 5, 2, 1, 0, 1, 2, 5, 10]; // Bucket values

// Define path options
const PathOptions = {
  STRAIGHT: 0,
  LEFT: 1,
  RIGHT: 2
};

// Function to randomly select a path option based on the direction of approach
function selectPathOption(ball, peg) {
  // Calculate the direction of approach
  const fromLeft = ball.x < peg.x;
  const fromRight = ball.x > peg.x;
  const fromAbove = ball.y < peg.y;

  // Generate a random path option based on the direction of approach
  if (fromLeft && fromAbove) {
    // Ball is coming from above and left of the peg
    return Math.random() < 0.5 ? PathOptions.LEFT : PathOptions.STRAIGHT;
  } else if (fromRight && fromAbove) {
    // Ball is coming from above and right of the peg
    return Math.random() < 0.5 ? PathOptions.RIGHT : PathOptions.STRAIGHT;
  } else {
    // Default path options for other cases
    return Math.floor(Math.random() * 3);
  }
}

// Create the pegs and add them to the stage
for (let row = 0; row < 6; row++) {
  for (let col = 0; col < 9; col++) {
    const peg = new PIXI.Graphics();
    peg.beginFill(0x00ff00);
    peg.drawCircle(0, 0, 5); // Use a smaller size for the pegs
    peg.endFill();
    peg.x = (col * pegSpacing) + 25;
    peg.y = (row * pegSpacing) + 25;
    app.stage.addChild(peg);
    pegs.push(peg);
  }
}

// Create the ball and add it to the stage
ball = new PIXI.Graphics();
ball.beginFill(0xff0000);
ball.drawCircle(0, 0, ballRadius);
ball.endFill();
ball.x = app.screen.width / 2;
ball.y = 0;
app.stage.addChild(ball);

// Function to move the ball towards a target position
function moveBall(targetX, targetY) {
  const deltaX = targetX - ball.x;
  const deltaY = targetY - ball.y;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  // Calculate velocity components
  const velocityX = (deltaX / distance) * animationSpeed;
  const velocityY = (deltaY / distance) * animationSpeed;

  // Move the ball towards the target position
  ball.x += velocityX;
  ball.y += velocityY;
}

// Event listener for clicks on the canvas
app.view.addEventListener('click', event => {
  if (!animationStarted && score >= 10) { // Check if there are enough points to drop the puck
    animationStarted = true;
    score -= 10; // Deduct points for dropping the puck
    // Get the position of the click relative to the canvas
    const clickX = event.clientX - app.view.getBoundingClientRect().left;
    const clickY = event.clientY - app.view.getBoundingClientRect().top;

    // Move the ball towards the position of the click
    moveBall(clickX, clickY);
  }
});

// Function to check if the ball falls into a bucket and update the score
function checkBucket(ball) {
  const bucketIndex = Math.floor(ball.x / pegSpacing); // Determine bucket based on x position
  if (bucketIndex >= 0 && bucketIndex < bucketValues.length) {
    score += bucketValues[bucketIndex]; // Add bucket value to score
  }
}

// Text style for displaying the score
const textStyle = new PIXI.TextStyle({
  fontFamily: 'Arial',
  fontSize: 24,
  fill: '#ffffff'
});

// Position for displaying the score
const scorePositionY = app.screen.height - 30;

// Display the score
const scoreText = new PIXI.Text(`Score: ${score}`, textStyle);
scoreText.position.set(10, scorePositionY); // Adjusted position
app.stage.addChild(scoreText);

// Display the buckets
const bucketGraphics = new PIXI.Graphics();
app.stage.addChild(bucketGraphics);

// Calculate the position for displaying the buckets
const bucketPositionY = scorePositionY - 50; // Adjust as needed

// Function to draw buckets
function drawBuckets() {
  bucketGraphics.clear();
  bucketGraphics.lineStyle(2, 0xFFFFFF, 1); // Line style for bucket outlines
  for (let i = 0; i < bucketValues.length; i++) {
    const bucketValue = bucketValues[i];
    const bucketWidth = pegSpacing * 0.8;
    const bucketHeight = pegSpacing * 0.3;
    const bucketX = (i * pegSpacing) + 25 - (bucketWidth / 2);
    const bucketY = bucketPositionY; // Adjusted position
    bucketGraphics.beginFill(0x333333); // Bucket color
    bucketGraphics.drawRect(bucketX, bucketY, bucketWidth, bucketHeight);
    bucketGraphics.endFill();
    // Display bucket value
    const bucketText = new PIXI.Text(`${bucketValue}`, textStyle);
    bucketText.position.set(bucketX + bucketWidth / 2 - 10, bucketY + 10);
    app.stage.addChild(bucketText);
  }
}

// Draw the buckets
drawBuckets();


// Define game loop or update function
app.ticker.add(() => {
  if (animationStarted) {
    // Move the ball continuously
    moveBall(ball.x, app.screen.height);

  // Check for collisions with pegs
pegs.forEach(peg => {
    // Calculate the distance between the ball and the peg
    const distance = Math.sqrt(Math.pow(ball.x - peg.x, 2) + Math.pow(ball.y - peg.y, 2));
  
    // Check if the distance is less than the sum of the ball's radius and the peg's radius
    if (distance <= ballRadius + 5) { // Adjust the collision radius as needed
      // Determine the direction of the ball's movement after collision
      const pathOption = selectPathOption(ball, peg);
      let movementSpeed = animationSpeed; // Default movement speed
  
      // Increase movement speed if the collision is with a green peg
      if (peg.fill === 0x00ff00) {
        movementSpeed *= 2; // Doubling the movement speed for green pegs
      }
  
      switch (pathOption) {
        case PathOptions.STRAIGHT:
          // Ball continues straight down
          ball.x = peg.x;
          ball.y += movementSpeed;
          break;
        case PathOptions.LEFT:
          // Ball moves left
          ball.x -= movementSpeed;
          ball.y += movementSpeed;
          break;
        case PathOptions.RIGHT:
          // Ball moves right
          ball.x += movementSpeed;
          ball.y += movementSpeed;
          break;
        default:
          break;
      }
    }
  });
  
  

       // Check if the ball reaches the bottom
       if (ball.y + ballRadius >= app.screen.height) {
        // Check if the ball falls into a bucket
        checkBucket(ball);
        // Stop the ball's movement
        animationStarted = false;
        ball.x = app.screen.width / 2;
        ball.y = 0;
        // Update the score text
        scoreText.text = `Score: ${score}`;
      }
    }
  });
