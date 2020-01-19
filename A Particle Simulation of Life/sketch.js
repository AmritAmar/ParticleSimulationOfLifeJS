/** 
Controls:
SPACE - Change particle placing state
LEFT CLICK - Place a particle
NAVIGATE - Arrows or WASD
T - Toggle tracking mode
E - Reset camera
N - Create new canvas with same rule
R - Re-randomize rule
P - Print rule values
**/

//Options
var updatesPerFrame = 1;
var randGen = true;
var maxParticles = 250;
var curParticles = 180
var trackingMode = false;

//Rule variables   
var psize = 10; //Size of the particle
var repelPercent = 100; //Repelling force when particles hit each other
var maxInteractionLimit = 500;
var interactionLimit = 100; //Limit of where the rule applies (distance)
var fric = 0.4; //Universal Friction

//Graphics variables
var gridSpacing = 50;
var backgroundCol = [20, 20, 30];
var partColors = [ //States (0 -> n) - Add your own particles here!
    [200, 50, 50],
    [50, 200, 50],
    [50, 50, 200], 
    [200, 50, 200], 
    [255, 255, 255],
]
var particles = [];
var interaction = [];

//Change this for different ways of generating new universes
//currently initial speed is 0 for every particle
function resetSimulation() {
  particles = [];
  n = curParticles > maxParticles ? maxParticles : curParticles;
  if (randGen) {
        for (var i = 0; i < n; i++) {
            particles.push(new Particle(createVector((Math.random(-(width / 2)) - 0.5) * width, (Math.random() - 0.5) * height), Math.floor(Math.random() * partColors.length), createVector(0, 0)));
        }
    }
}

//Change this if you want different values!
function changeInteractionRules() {
  for (var i = 0; i < partColors.length; i++) {
    for (var j = 0; j < partColors.length; j++) {
      interaction[[i,j]] = Math.random() - 0.5;
    }
  }
}

//UI
let sliderGenNum;
let sliderInteraction;
let trackingModeOption;
let resetSimulOption;
let newRuleOption;
let particleSel;

function setup() {
    createCanvas(720, 800);
    resetSimulation();
    changeInteractionRules();
    translate(width / 2, height / 2);
    background(backgroundCol[0], backgroundCol[1], backgroundCol[2]);
    if (zoom >= 1) {
        drawGrid();
    }
  
    sliderGenNum = createSlider(10, maxParticles, curParticles);
    sliderGenNum.position(10, 10);
    sliderGenNum.style('width', '200px');
    sliderGenNum.input(updateGenDensity);
  
    sliderInteraction = createSlider(0, maxInteractionLimit, interactionLimit);
    sliderInteraction.position(10, 40);
    sliderInteraction.style('width', '200px');
    sliderInteraction.input(updateInteractiveRadius);
  
    trackingModeOption = createButton('Toggle Tracking Mode');
    trackingModeOption.position(355, 10);
    trackingModeOption.mousePressed(trackingModeFunc);
  
    resetSimulOption = createButton('Reset Simulation');
    resetSimulOption.position(590, 10);
    resetSimulOption.mousePressed(resSimul);
  
    newRuleOption = createButton('New Rule');
    newRuleOption.position(510, 10);
    newRuleOption.mousePressed(resRule);
  
    particleSel = createSelect();
    particleSel.position(668, 40);
    for (var i = 0; i < partColors.length; i++) {
      particleSel.option(i);
    }
    particleSel.changed(updateParticleSelected);

}

function updateGenDensity() {
  curParticles = sliderGenNum.value()
  resetSimulation();
}

function updateInteractiveRadius() {
  interactionLimit = sliderInteraction.value()
}

function trackingModeFunc() {
  if (!trackingMode) {
    trackingMode = true;
  } else {
    trackingMode = false;
  }
}

function resSimul() {
  resetSimulation();
}

function resRule() {
  changeInteractionRules();
}

function updateParticleSelected() {
  typeToPlace = parseInt(particleSel.value());
}

//Camera variables
{
    var camX = 0;
    var camY = 0;
    var camVel = 1.5;
    var maxCamSpeed = 18;
    var zoom = 1;
}

var typeToPlace = 0;
var camClear = false;
var focus = false;

function mouseClicked() {
    if (sliderGenNum.value() < maxParticles) {
      if (mouseButton === LEFT && focus) {
          particles.push(new Particle(createVector(((mouseX - camX) - width / 2) / zoom, ((mouseY - camY) - height / 2) / zoom), typeToPlace, createVector(0, 0)));
      }
    }
    sliderGenNum.value(sliderGenNum.value() + 1);
    focus = true;
}

function keyPressed() {
    if (key === " ") {
        typeToPlace = (typeToPlace + 1) % partColors.length;
        particleSel.value(typeToPlace);
        console.log("Cycled placing type to " + typeToPlace);
    } else if (key === "t") {
        trackingMode = !trackingMode;
        console.log("Toggled tracking to " + trackingMode);
    } else if (key === "e") {
        camX = 0;
        camY = 0;
        zoom = 1;
      	camClear = true;
        console.log("Reset camera to default position");
    } else if (key === "n") {
      	camClear = true;
        particles = [];
        console.log("Created new canvas with same rule");
        resetSimulation();
    } else if (key === "r") {
        changeInteractionRules();
        console.log("Randomized rule");
    } else if (key === "p") {
        console.log("Printing rule to console...\n-");
        console.log("psize = " + psize + ";");
        console.log("repelPercent = " + repelPercent + ";");
        console.log("interactionLimit = " + interactionLimit + ";");
        console.log("fric = " + fric + ";");
        console.log("---");
        for (var i = 0; i < partColors.length; i++) {
          for (var j = 0; j < partColors.length; j++) {
            console.log("Interaction between (" + i + ", " + j + ") is: " + interaction[[i,j]])
          }
        }  
    }
}

var Particle = function(pos, type, vel) {
    this.pos = pos;
    this.ppos = this.pos;
    this.type = type;
    this.vel = vel;
};

Particle.prototype.split = function() {
    particles.push(new Particle(this.pos, this.type, -this.vel));
}; //Not in use yet

Particle.prototype.update = function() {
    for (var i = 0; i < particles.length; i++) {
        if (!(particles[i].pos.x == this.pos.x && particles[i].pos.y == this.pos.y)) {
            var ang = Math.atan2((this.pos.y - particles[i].pos.y), (this.pos.x - particles[i].pos.x));
            var atr = 0;
            if (this.pos.dist(particles[i].pos) <= interactionLimit && this.pos.dist(particles[i].pos) > 10) {
                atr = interaction[[this.type, particles[i].type]] * (100 - (Math.abs(this.pos.dist(particles[i].pos)) - 90) + 90) / 100;
            }
            if (this.pos.dist(particles[i].pos) <= psize) {
                atr = -(((psize / 100) * repelPercent) - (this.pos.dist(particles[i].pos)));
            } else if (this.pos.dist(particles[i].ppos) <= psize) {
                atr = -(((psize / 100) * repelPercent) - (this.pos.dist(particles[i].ppos)));
                console.log("true");
            } // Theoretically could improve physics if i can get it to work
            this.vel.sub(createVector(Math.cos(ang), Math.sin(ang)).mult(atr));
        }
    }
    this.vel.mult(fric);
};

Particle.prototype.update2 = function() {
    this.ppos = this.pos;
    this.pos.add(this.vel);
}

Particle.prototype.display = function() {
    strokeWeight(2);
    if (trackingMode) {
        stroke(255 - backgroundCol[0], 255 - backgroundCol[1], 255 - backgroundCol[2], 10);
        strokeWeight(4);
    } else {
        stroke(partColors[this.type][0], partColors[this.type][1], partColors[this.type][2], 100);
    }
    fill(partColors[this.type][0], partColors[this.type][1], partColors[this.type][2], partColors[this.type][3]);
    ellipse(this.pos.x + camX, this.pos.y + camY, psize, psize);
};

var drawGrid = function() {
    noStroke();
    fill(255 - backgroundCol[0], 255 - backgroundCol[1], 255 - backgroundCol[2], 50);
    rectMode(CENTER);
    rect(0.5 + camX, 0.5 + camY, 12, 12);
    for (var i = camX; i < width * zoom; i += gridSpacing) {
        stroke(255 - backgroundCol[0], 255 - backgroundCol[1], 255 - backgroundCol[2], 50);
        strokeWeight(1);
        line(i, 0 - width * zoom, i, height * zoom);
    }
    for (i = camY; i < height * zoom; i += gridSpacing) {
        stroke(255 - backgroundCol[0], 255 - backgroundCol[1], 255 - backgroundCol[2], 50);
        strokeWeight(1);
        line(0 - height * zoom, i, width * zoom, i);
    }

    for (i = camX; i > 0 - width * zoom; i -= gridSpacing) {
        stroke(255 - backgroundCol[0], 255 - backgroundCol[1], 255 - backgroundCol[2], 50);
        strokeWeight(1);
        line(i, 0 - width * zoom, i, height * zoom);
    }
    for (i = camY; i > 0 - height * zoom; i -= gridSpacing) {
        stroke(255 - backgroundCol[0], 255 - backgroundCol[1], 255 - backgroundCol[2], 50);
        strokeWeight(1);
        line(0 - height * zoom, i, width * zoom, i);
    }
}

var cameraHandler = function() {
    translate(width / 2, height / 2);
    if (keyIsPressed === true && keyCode === DOWN_ARROW || keyIsPressed === true && key === "s") {
        camY -= constrain(camVel, 1.5 / zoom, maxCamSpeed / zoom);
        camVel += 0.3;
      	camClear = true;
    } else if (keyIsPressed === true && keyCode === RIGHT_ARROW || keyIsPressed === true && key === "d") {
        camX -= constrain(camVel, 1.5 / zoom, maxCamSpeed / zoom);
        camVel += 0.3;
      	camClear = true;
    } else if (keyIsPressed === true && keyCode === UP_ARROW || keyIsPressed === true && key === "w") {
        camY += constrain(camVel, 1.5 / zoom, maxCamSpeed / zoom);
        camVel += 0.3;
      	camClear = true;
    } else if (keyIsPressed === true && keyCode === LEFT_ARROW || keyIsPressed === true && key === "a") {
        camX += constrain(camVel, 1.5 / zoom, maxCamSpeed / zoom);
        camVel += 0.3;
      	camClear = true;
    } else {
        camVel = 1.5;
    }
    zoom = constrain(zoom, 0.1, 5);
};


function draw() {
    //specialCursor();
    cameraHandler();
    scale(zoom);
		
    if (!trackingMode || camClear) {
        background(backgroundCol[0], backgroundCol[1], backgroundCol[2]);
        if (zoom >= 1) {
            drawGrid();
        }
    }

    for (var j = 0; j < updatesPerFrame - 1; j++) {
        for (var i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
        }
        for (i = particles.length - 1; i >= 0; i--) {
            particles[i].update2();
        }
    }
    for (var i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
    }
    for (i = particles.length - 1; i >= 0; i--) {
        particles[i].update2();
        particles[i].display();
    }
  
  // Instructions
  textAlign(CENTER, TOP);
  textSize(16);
  stroke(60);
  fill(255);
  
  //GenNum Text
  text(sliderGenNum.value() + "/" + maxParticles + " Particles", -75, -720/2, 200, 50)
  text(sliderInteraction.value() + "/" + maxInteractionLimit + " Interaction Radius", -43, -720/2 + 30, 200, 50)
  text("Click to place particle selected:", 190, -720/2 + 25, 300, 50)
  textAlign(CENTER, BOTTOM);
  text("ASDF to move Camera. E to reset position. N to create new universe. R to change rule. Space to switch which particle to place. P to print details in console (F12)", 0, 320, 720, 100)
  
    if (!focused) {
        focus = false;
    }
  	camClear = false;
}