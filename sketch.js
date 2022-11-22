var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;

let theShader;
let shaderTexture;

let theta = 0;

let x, y, dragX, dragY;
let outsideRadius = 200;
let insideRadius = 100;
let noise1;
let noise2;
var distance, audio;


function preload(){
  theShader = loadShader('texture.vert','texture.frag');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();

  // initialize the createGraphics layers
  shaderTexture = createGraphics(windowWidth, windowHeight, WEBGL);

  // turn off the createGraphics layers stroke
  shaderTexture.noStroke();

   x = -50;
   y = 0;
   dragX = 0;
   dragY = 0;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function p5StartAudio(){
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }
  audio = 'play';
  noise1 = new p5.Noise();
  noise1.setType('brown');
  noise1.amp(Math.random());
  noise2 = new p5.Noise();
  noise2.setType('white');
  noise2.amp(Math.random());
  noise1.start();
  noise2.start();
  console.log('touch');
}

function p5StopAudio(){
  audio = 'stop';
  noise1.stop();
  noise2.stop();
  console.log('stoping noise');
}

async function speed(){
  let mouse_x_1 = mouseX;
  let mouse_y_1 = mouseY;
  await sleep(50);
  let mouse_x_2 = mouseX;
  let mouse_y_2 = mouseY;
  distance = Math.sqrt((Math.pow(mouse_x_1-mouse_x_2,2))+(Math.pow(mouse_y_1-mouse_y_2,2)));
  console.log(distance);
  if(audio == 'play'){
    p5SetGain();
    setTimeout('speed()', 10);
  }
}

async function p5SetGain(){
  noise1.stop();
  noise2.stop();
  let amp1 = Math.random()*(distance/200+0.1);
  let amp2 = Math.random()*(distance/300+0.05);
  // console.log('in set gain : ' + distance);
  if(amp1 > 0.5 || amp2 > 0.2){
    amp1 = 0.5;
    amp2 = 0.2;
  }
  noise1.amp(amp1);
  noise2.amp(amp2);
  await sleep(10);
  noise1.start();
  noise2.start();
  // console.log('gain');
  if(audio == 'stop'){
    p5StopAudio();
  }
}



function draw() {

  let locX = mouseX - height / 2;
  let locY = mouseY - width / 2;

  pointLight(0, 0, 255, locX, locY, 250);
  ambientLight(100);

  // instead of just setting the active shader we are passing it to the createGraphics layer
  shaderTexture.shader(theShader);

  // here we're using setUniform() to send our uniform values to the shader
  theShader.setUniform("resolution", [width, height]);
  theShader.setUniform("time", millis() / 1000.0);
  theShader.setUniform("mouse", [mouseX, map(mouseY, 0, height, height, 0)]);

  // passing the shaderTexture layer geometry to render on
  shaderTexture.rect(0,0,width,height);

  background(255);

  // pass the shader as a texture
  // anything drawn after this will have this texture.
  texture(shaderTexture);

  translate(0, 0, 600);
  push();
  rotateX(dragY * 0.01);
  rotateY(dragX * 0.01);
  // rotateZ(dragX * 0.01);
  // theta += 0.05;
  sphere(300, 30);
  pop();

  /* when you put a texture or shader on an ellipse it is rendered in 3d,
     so a fifth parameter that controls the # vertices in it becomes necessary,
     or else you'll have sharp corners. setting it to 100 is smooth. */
  // let ellipseFidelity = int(map(mouseX, 0, width, 8, 100));
  // ellipse(260, 0, 200, 200, ellipseFidelity);
}

function mouseDragged() {
  dragX = mouseX;
  dragY = mouseY;
  // console.log(dragX);
}
