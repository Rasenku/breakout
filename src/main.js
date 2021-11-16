// JavaScript code goes here
  
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

const ballRadius = 10;
const paddleHeight = 10;
const paddleWidth = 75;
const brickRowCount = 5;
const brickColumnCount = 3;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;
let paddleXStart = (canvas.width - paddleWidth) / 2;
const paddleYStart = canvas.height - paddleHeight;
const PI2 = Math.PI * 2;
const objcolor = '#0095DD';


class Sprite {
  constructor(x = 0, y = 0, width = 100, height = 100, color = "red"){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
  }
  render(ctx){
    ctx.beginPath()
    ctx.rect(this.x, this.y, this.width, this.height)
    ctx.fillStyle = this.color
    ctx.fill()
    ctx.closePath()
  }

  render(ctx) {
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }

  reset(paddleXStart) {
    this.x = paddleXStart;
  }

  moveBy(dx, dy) {
    this.x += dx;
    this.y += dy;
  }

  moveTo(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Ball extends Sprite {
  constructor(x = 0, y = 0, dx = 2, dy = -1, radius = 10) {
    super(x, y, radius*2, radius*2, "#0095DD")
    this.dx = dx;
    this.dy = -dy;
    this.radius = radius;
    this.PI2 = Math.PI * 2;
  }
  // moves our ball, using sprite moveBy
  move() {
    this.moveBy(this.dx, this.dy);
  }

  render(ctx){
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2)
    ctx.fillStyle = this.color
    ctx.fill()
    ctx.closePath()
  }

  reset(canvas) {
    this.x = canvas.width / 2;
    this.y = canvas.height - 30;
    this.dx = 3;
    this.dy = -3;
  }
}

class Brick extends Sprite{
  constructor(x,y, width = 75, height = 20, color = "#0095DD"){
    super(x, y, width, height, color)
    this.status = 1;
  }
}

// creates our Bricks class 
class Bricks {
  constructor(cols, rows, width, height, padding, OffsetTop, OffsetLeft, color) {
    this.cols = cols;
    this.rows = rows;
    this.bricks = [];
    this.width = width;
    this.height = height;
    this.padding = padding;
    this.OffsetLeft = OffsetLeft;
    this.OffsetTop = OffsetTop;
    this.color = color;

    this.init();
  }

  // orients our new bricks in their positions
  init() {
    for (let c = 0; c < this.cols; c += 1) {
      this.bricks[c] = [];
      for (let r = 0; r < this.rows; r += 1) {
        const brickX = (c * (this.width + this.padding)) + this.OffsetLeft;
        const brickY = (r * (this.height + this.padding)) + this.OffsetTop;
        if (c % 2 === 0) {
          this.bricks[c][r] = new Brick(brickX, brickY, this.width + (c * 2.5),
            this.height + (r * 2.5), this.color);
        } else if (r % 2 === 0) {
          this.bricks[c][r] = new Brick(brickX, brickY, this.width, this.height, "pink");
        } else {
          this.bricks[c][r] = new Brick(brickX, brickY, this.width, this.height, "yellow");
        }
      }
    }
  }

  // draws our bricks
  render(ctx) {
    for (let c = 0; c < this.cols; c += 1) {
      for (let r = 0; r < this.rows; r += 1) {
        const brick = this.bricks[c][r];
        if (brick.status === 1) {
          brick.render(ctx);
        }
      }
    }
  }
}

class Lables extends Sprite {
  // Lable's params
  constructor(x, y, color, txt, font = "16px Arial") {
    // Sprite's params
    super(x, y, 0, 0, color);
    this.txt = txt;
    this.font = font;
    this.value = 0;
  }

  // overrides Sprites render method
  render(ctx) {
    ctx.font = this.font;
    ctx.fillStyle = this.color;
    ctx.fillText(`${this.txt} ${this.value}`, this.x, this.y);
  }
}

// creates our main opperations class
class Game {
  constructor() {
    // Ball class
    this.ball = new Ball(0, 0, 2, -2, ballRadius, '#0095DD');

    // Paddle Class
    this.paddle = new Sprite(paddleXStart, paddleYStart,
      paddleWidth, paddleHeight, '#0095DD');

    // Bricks Class
    this.brick = new Brick(brickColumnCount, brickRowCount,
      brickWidth, brickHeight, '#0095DD');
    this.bricks = new Bricks(brickColumnCount, brickRowCount,
      brickWidth, brickHeight, brickPadding,
      brickOffsetLeft, brickOffsetTop, '#0095DD');

    // Lables Class
    this.score = new Lables(8, 20, '#0095DD', "Score: ");
    this.lives = new Lables(canvas.width - 65, 20, '#0095DD', "Lives: ");

    // Setup
    this.leftPressed = false;
    this.rightPressed = false;
    this.setup();
  }

  setup() {
    this.lives.value = 3;
    this.resetBallAndPaddle();
    document.addEventListener("keydown", ((e) => {
      this.keyDownHandler(e);
    }), false);
    document.addEventListener("keyup", ((e) => {
      this.keyUpHandler(e);
    }), false);
    document.addEventListener("mousemove", ((e) => {
      this.mouseMoveHandler(e);
    }), false);
  }

  // resets our ball and Paddle
  resetBallAndPaddle() {
    this.ball.reset(canvas);
    this.paddle.reset(paddleXStart);
  }

  // creates win conditions and tests collisions with bricks
  collisionDetection() {
    for (let c = 0; c < this.bricks.cols; c += 1) {
      for (let r = 0; r < this.bricks.rows; r += 1) {
        const brick = this.bricks.bricks[c][r];
        if (brick.status === 1) {
          if (this.ball.x > brick.x
            && this.ball.x < brick.x + brick.width
            && this.ball.y > brick.y
            && this.ball.y < brick.y + brick.height) {
            this.ball.dy = -this.ball.dy;
            brick.status = 0;
            this.score.value += 1;
            if (this.score.value === this.bricks.cols * this.bricks.rows) {
              alert("YOU WIN, CONGRATS!");
              document.location.reload();
            }
          }
        }
      }
    }
  }

  // controls the movement of our paddle
  movePaddle() {
    if (this.rightPressed && this.x < canvas.width - this.width) {
      this.paddle.moveBy(7, 0);
    } else if (this.leftPressed && this.x > 0) {
      this.paddle.moveBy(-7, 0);
    }
  }

  // creates lose conditions and tests collisions with canvas/paddle
  collisionWithCanvasAndPaddle() {
    if (this.ball.x + this.ball.dx > canvas.width - this.ball.radius
      || this.ball.x + this.ball.dx < this.ball.radius) {
      this.ball.dx = -this.ball.dx;
    }
    if (this.ball.y + this.ball.dy < this.ball.radius) {
      this.ball.dy = -this.ball.dy;
    } else if (this.ball.y + this.ball.dy > canvas.height - this.ball.radius) {
      if (this.ball.x > this.paddle.x && this.ball.x < this.paddle.x + this.paddle.width) {
        this.ball.dy = -this.ball.dy;
      } else {
        this.lives.value -= 1;
        if (this.lives.value < 1) {
          alert("GAME OVER");
          this.lives = 3;
          document.location.reload();
        } else {
          this.resetBallAndPaddle();
        }
      }
    }
  }

  // tests if the keys are held down/pressed
  keyDownHandler(e) {
    if (e.key === 39) {
      this.rightPressed = true;
    } else if (e.key === 37) {
      this.leftPressed = true;
    }
  }

  // tests if the keys are up/not pressed
  keyUpHandler(e) {
    if (e.key === 39) {
      this.rightPressed = false;
    } else if (e.key === 37) {
      this.leftPressed = false;
    }
  }

  // controls our paddle using the mouse
  mouseMoveHandler(e) {
    const relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
      this.paddle.moveTo(relativeX - this.paddle.width / 2, paddleYStart);
    }
  }

  // displays our game and runs necessary functions
  draw() {
    // creates our canvas and colors it's background
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "purple";
    ctx.fill();
    // creates our assests
    this.bricks.render(ctx);
    this.ball.render(ctx);
    this.paddle.render(ctx);
    this.score.render(ctx);
    this.lives.render(ctx);
    // runs our functions for gameplay
    this.collisionDetection();
    this.ball.move();
    this.movePaddle();
    this.collisionWithCanvasAndPaddle();
    // requestAnimationFrame(this.draw.bind(this));
    requestAnimationFrame(() => {
      this.draw();
    });
  }
}

// creates new game
const game = new Game();
// runs our program! (or at least it used to)
game.draw();