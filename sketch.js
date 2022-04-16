const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Constraint = Matter.Constraint;

var engine, world, backgroundImg;
var canvas, angle, tower, ground, cannon, boat;
var balls = [];
var boats = [];
var boatAnimation = [];
var boatSpriteData, boatSpriteSheet;
var brokenBoatAnimation = [];
var brokenBoatSpriteData, brokenBoatSpriteSheet;
var splashAnimation = [];
var splashSpriteData, splashSpriteSheet;
var laught, music, explotion, water;
var isLaughting = false;
var isGameOver = false;
var score = 0;

function preload() {
  backgroundImg = loadImage("./assets/background.gif");
  towerImage = loadImage("./assets/tower.png");
  boatSpriteData = loadJSON("assets/boat/boat.json");
  boatSpriteSheet = loadImage("assets/boat/boat.png");
  brokenBoatSpriteData = loadJSON("assets/boat/brokenBoat.json");
  brokenBoatSpriteSheet = loadImage("assets/boat/brokenBoat.png");
  splashSpriteData = loadJSON("assets/waterSplash/waterSplash.json");
  splashSpriteSheet = loadImage("assets/waterSplash/waterSplash.png");
  laught = loadSound("assets/assets_pirate_laught.mp3");
  music = loadSound("assets/assets_background.mp3");
  explotion = loadSound("assets/assets_cannon_explosion.mp3");
  water = loadSound("assets/assets_cannon_water.mp3");
}

function setup() {
  canvas = createCanvas(1200, 600);
  engine = Engine.create();
  world = engine.world;

  angleMode(DEGREES);
  angle = 15;


  ground = Bodies.rectangle(0, height - 1, width * 2, 1, { isStatic: true });
  World.add(world, ground);

  tower = Bodies.rectangle(160, 350, 160, 310, { isStatic: true });
  World.add(world, tower);

  cannon = new Cannon(180, 110, 130, 100, angle);

  var boatFrames = boatSpriteData.frames;

  for(var i = 0; i < boatFrames.length; i++){
    var pos = boatFrames[i].position;
    var img = boatSpriteSheet.get(pos.x, pos.y, pos.w, pos.h);
    boatAnimation.push(img);
  }

  var brokenBoatFrames = brokenBoatSpriteData.frames;

  for(var i = 0; i < brokenBoatFrames.length; i++){
    var pos = brokenBoatFrames[i].position;
    var img = brokenBoatSpriteSheet.get(pos.x, pos.y, pos.w, pos.h);
    brokenBoatAnimation.push(img);
  }

  var splashFrames = splashSpriteData.frames;

  for(var i = 0; i < splashFrames.length; i++){
    var pos = splashFrames[i].position;
    var img = splashSpriteSheet.get(pos.x, pos.y, pos.w, pos.h);
    splashAnimation.push(img);
  }
  
}

function draw() {
  background(189);
  image(backgroundImg, 0, 0, width, height);

  if(!music.isPlaying()){
    music.play();
    music.setVolume(0.07);
  }

  Engine.update(engine);

  push();
  translate(ground.position.x, ground.position.y);
  fill("brown");
  rectMode(CENTER);
  rect(0, 0, width * 2, 1);
  pop();

  push();
  translate(tower.position.x, tower.position.y);
  rotate(tower.angle);
  imageMode(CENTER);
  image(towerImage, 0, 0, 160, 310);
  pop();

  showBoats();

  for (var i = 0; i < balls.length; i++) {
    showCannonBalls(balls[i], i);
    collisionWithBoat(i);
  }

  cannon.display();

  textSize(40);
  text("Puntuacion: "+score,width-200,50);
  textAlign(CENTER,CENTER);


}

function collisionWithBoat(index) {
  for (var i = 0; i < boats.length; i++) {
    if (balls[index] !== undefined && boats[i] !== undefined) {
      var collision = Matter.SAT.collides(balls[index].body, boats[i].body);

      if (collision.collided) {
        score+=5
        boats[i].remove(i);

        Matter.World.remove(world, balls[index].body);
        delete balls[index];
      }
    }
  }
}

function keyPressed() {
  if (keyCode === DOWN_ARROW) {
    var cannonBall = new CannonBall(cannon.x, cannon.y);
    cannonBall.trajectory = [];
    Matter.Body.setAngle(cannonBall.body, cannon.angle);
    balls.push(cannonBall);
  }
}

function showCannonBalls(ball, index) {
  if (ball) {
    ball.display();
    ball.animate();
    if (ball.body.position.x >= width || ball.body.position.y >= height - 50) {
      water.play();
      ball.remove(index);
    }
  }
}

function showBoats() {
  if (boats.length > 0) {
    if (boats.length<4 && boats[boats.length - 1].body.position.x < width - 300) {
     
      var positions = [-40, -60, -70, -20];
      var position = random(positions);
      var boat = new Boat(width, height - 100, 170, 170, position, boatAnimation);

      boats.push(boat);
    }

    for (var i = 0; i < boats.length; i++) {
     
        Matter.Body.setVelocity(boats[i].body, {x: -0.8, y: 0});

        boats[i].display();
        boats[i].animate();
        var collision = Matter.SAT.collides(this.tower,boats[i].body);
        if(collision.collided && !boats[i].isBroken){
          if(!isLaughting && !laught.isPlaying()){
            laught.play();
            isLaughting = true;
          }
          isGameOver = true;
          gameOver();
        }
    }
  } else {
    var boat = new Boat(width, height - 60, 170, 170, -60, boatAnimation);
    boats.push(boat);
  }
}

function keyReleased() {
  if (keyCode === DOWN_ARROW && !isGameOver) {
    explotion.play();
    balls[balls.length - 1].shoot();
  }
}

function gameOver(){
  swal({
    title:`¡Fin del juego!`,
    text:`Gracias por jugar :D`,
    imageUrl:"https://raw.githubusercontent.com/whitehatjr/PiratesInvasion/main/assets/boat.png",
    imageSize: "150x150",
    confirmButtonText: "Jugar de nuevo"
  },
  function(isConfirm){
    if(isConfirm){
      location.reload();
    }
  })
}

