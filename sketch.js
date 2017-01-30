// canvas
var w = 1450;
var h = 900;
var scl = 10;
var cols;
var rows;

// flow field
var inc = 0.1;
var zoff= 0;
var field;

// particle
var population = 2000;
var particles;
var maxSpeed = 4;

var fr;
function setup() {
  createCanvas( w, h);
  background( 'white' );
  colorMode(HSB, 255);
  
  fr = createP('');
  
  cols = w / scl;
  rows = h / scl;
  
  particles = _initializeParticlePopulation( population );
  field = new FlowField();
  
}

function draw() {
  // erase content with this color
  // background( 'white' );
  
  fr.html(floor(frameRate()));
  
  field.simulateField();
  
  var particle;
  for ( var i = 0; i < population; i++ ) {
    particle = particles[i];
    particle.simulateParticle(field.getFieldVector(particle.pos));
  }
}


function FlowField() {
  this.vectorFields = [];
  
  this.simulateField = function() {
    this.update();
    // this.show();
  }
  
  this.update = function() {
    var yoff = 0;
    for ( var y = 0; y < rows; y++ ) {
      var xoff = 0;
      for ( var x = 0; x < cols; x++ ) {
        var index = x + y * w;
        
        var angle = noise(xoff, yoff, zoff) * TWO_PI * 2;
        var vector = p5.Vector.fromAngle( angle ).setMag(1);
        this.vectorFields[index] = vector;
    
        xoff += inc;
      }
      yoff += inc;
      zoff += 0.0003;
    }
  }
  
  // Draw flow fields
  this.show = function() {
    stroke(0);
    strokeWeight(1);
     for ( var y = 0; y < rows; y++ ) {
      for ( var x = 0; x < cols; x++ ) {
        var index = x + y * w;
        var vector = this.vectorFields[index];
        push();
          translate(x * scl, y * scl);
          rotate(vector.heading());
          line(0,0, scl, 0);
        pop();
      }
    }
  }
  
  this.getFieldVector = function( position ) {
    var x = floor(position.x / scl);
    var y = floor(position.y / scl);
    var index = x + y * w;
    return this.vectorFields[index];
  }
}

function _initializeParticlePopulation( size ) {
  var particles = [];
  for ( var i = 0; i < size; i++ ) {
    particles[i] = new Particle();
  }
  return particles;
}

function Particle() {
  this.pos = createVector(random(w), random(h));
  this.prevPos = this.pos.copy();
  this.vel = createVector(0,0);
  this.acceleration = createVector(0,0);
  this.color = 0;
  
  this.simulateParticle = function(force) {
    this.follow(force);
    this.update();
    this.checkEdge();
    this.show();
  }
  
  this.update = function() {
    this.updatePrevPos();
    this.vel.add(this.acceleration).limit(maxSpeed);
    this.pos.add(this.vel);
    this.acceleration.mult(0);
  }
  
  this.show = function() {
    if ( this.color++ > 255 ) {
      this.color = 0;
    }
    // stroke(0);
    // strokeWeight(3);
    // point( this.pos.x, this.pos.y);
    stroke( this.color, 255, 255, 25 );
    line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
  }
  
  this.follow = function( force ) {
    this.acceleration.add( force );
  }
  
  this.checkEdge = function() {
    if ( this.pos.x > w ) {
      this.pos.x = 0;
      this.updatePrevPos();
    }
    
    if ( this.pos.x < 0 ) {
      this.pos.x = w;
      this.updatePrevPos();
    }
    
    if ( this.pos.y > w ) {
      this.pos.y = 0;
      this.updatePrevPos();
    }
    
    if ( this.pos.y < 0 ) {
      this.pos.y = h;
      this.updatePrevPos();
    }
  }
  
  this.updatePrevPos = function() {
    this.prevPos.x = this.pos.x;
    this.prevPos.y = this.pos.y;
  }
}