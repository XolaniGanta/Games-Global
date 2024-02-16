const app = new PIXI.Application({ width: 700, height: 500 });

document.body.appendChild(app.view);

let pegs = [];
let ball;
let ballRadius = 10;
let animationSpeed = 2;
let animationStarted = false;
let pegSpacing = 55;
let score = 100;
const bucketValues = [10, 5, 2, 1, 0, 1, 2, 5, 10];

const PathOptions = {
  STRAIGHT: 0,
  LEFT: 1,
  RIGHT: 2,
};

function selectPathOption(ball, peg) {
  const fromLeft = ball.x < peg.x;
  const fromRight = ball.x > peg.x;
  const fromAbove = ball.y < peg.y;

  if (fromLeft && fromAbove) {
    return Math.random() < 0.5 ? PathOptions.LEFT : PathOptions.STRAIGHT;
  } else if (fromRight && fromAbove) {
    return Math.random() < 0.5 ? PathOptions.RIGHT : PathOptions.STRAIGHT;
  } else {
    return Math.floor(Math.random() * 3);
  }
}

// Create the pegs
for (let row = 0; row < 8; row++) {
  for (let col = 0; col < 9; col++) {
    const peg = new PIXI.Graphics();
    peg.beginFill(0x00ff00);
    peg.drawCircle(0, 0, 5);
    peg.endFill();
    peg.x = col * pegSpacing + 25;
    peg.y = row * pegSpacing + 25;
    app.stage.addChild(peg);
    pegs.push(peg);
  }
}

// Create the ball
ball = new PIXI.Graphics();
ball.beginFill(0xff0000);
ball.drawCircle(0, 0, ballRadius);
ball.endFill();
ball.x = app.screen.width / 2;
ball.y = 0;
app.stage.addChild(ball);

function moveBall(targetX, targetY) {
  const deltaX = targetX - ball.x;
  const deltaY = targetY - ball.y;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  const velocityX = (deltaX / distance) * animationSpeed;
  const velocityY = (deltaY / distance) * animationSpeed;

  ball.x += velocityX;
  ball.y += velocityY;
}

// Event listener for clicks on the "Play" button
const playButton = new PIXI.Graphics();
playButton.beginFill(0x00ff00);
playButton.drawRect(0, 0, 100, 50);
playButton.endFill();
playButton.interactive = true;
playButton.buttonMode = true;
playButton.x = app.screen.width - playButton.width - 20;
playButton.y = 20;
app.stage.addChild(playButton);

const buttonTextStyle = new PIXI.TextStyle({
  fontFamily: "Arial",
  fontSize: 20,
  fill: "#ffffff",
});

const buttonText = new PIXI.Text("Play", buttonTextStyle);
buttonText.position.set(playButton.x + 25, playButton.y + 15);
app.stage.addChild(buttonText);

playButton.on("pointertap", startGame);

// Function to start the game
function startGame() {
  if (!animationStarted && score >= 10) {
    animationStarted = true;
    score -= 10;
    moveBall(app.screen.width / 2, app.screen.height);
  }
}

function checkBucket(ball) {
  const bucketIndex = Math.floor(ball.x / pegSpacing);
  if (bucketIndex >= 0 && bucketIndex < bucketValues.length) {
    score += bucketValues[bucketIndex];
  }
}

const textStyle = new PIXI.TextStyle({
  fontFamily: "Arial",
  fontSize: 24,
  fill: "#ffffff",
});

const scorePositionY = app.screen.height - 30;

// Display the score
const scoreText = new PIXI.Text(`Score: ${score}`, textStyle);
scoreText.position.set(10, scorePositionY);
app.stage.addChild(scoreText);

const bucketGraphics = new PIXI.Graphics();
app.stage.addChild(bucketGraphics);

const bucketPositionY = scorePositionY - 50;

function drawBuckets() {
  bucketGraphics.clear();
  bucketGraphics.lineStyle(2, 0xffffff, 1);
  for (let i = 0; i < bucketValues.length; i++) {
    const bucketValue = bucketValues[i];
    const bucketWidth = pegSpacing * 0.8;
    const bucketHeight = pegSpacing * 0.3;
    const bucketX = i * pegSpacing + 25 - bucketWidth / 2;
    const bucketY = bucketPositionY;
    bucketGraphics.beginFill(0x333333);
    bucketGraphics.drawRect(bucketX, bucketY, bucketWidth, bucketHeight);
    bucketGraphics.endFill();

    const bucketText = new PIXI.Text(`${bucketValue}`, textStyle);
    bucketText.position.set(bucketX + bucketWidth / 2 - 20, bucketY + 20);
    app.stage.addChild(bucketText);
  }
}

drawBuckets();

app.ticker.add(() => {
  if (animationStarted) {
    moveBall(ball.x, app.screen.height);

    // Check for collisions with pegs
    pegs.forEach((peg) => {
      const distance = Math.sqrt(
        Math.pow(ball.x - peg.x, 2) + Math.pow(ball.y - peg.y, 2),
      );
      if (distance <= ballRadius + 10) {
        const pathOption = selectPathOption(ball, peg);
        let movementSpeed = animationSpeed;
        if (peg.fill === 0x00ff00) {
          movementSpeed *= 2;
        }

        switch (pathOption) {
          case PathOptions.STRAIGHT:
            ball.y += movementSpeed;
            break;
          case PathOptions.LEFT:
            ball.x -= movementSpeed;
            ball.y += movementSpeed;
            break;
          case PathOptions.RIGHT:
            ball.x += movementSpeed;
            ball.y += movementSpeed;
            break;
          default:
            break;
        }
      }
    });

    if (ball.y + ballRadius >= app.screen.height) {
      checkBucket(ball);
      animationStarted = false;
      ball.x = app.screen.width / 2;
      ball.y = 0;
      scoreText.text = `Score: ${score}`;
    }
  }
});