var cubeRotation = 0.0;

main();

//
// Start here
//

var c;
var c1;
var grd;
var rails1;
var rails2;
var cam_pos = [0, 4, 15];
var look_at = [0, 0, 0];
var track = 1;
var jump = false;
var wall1;
var wall2;
var obstacle1_list;
var obstacle2_list;
var coins;
var player_texture;
var ground_texture;
var wall_texture;
var rails_texture;
function main() {

  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  player_texture = loadTexture(gl, './cubetexture.png');
  ground_texture = loadTexture(gl, './ground_texture.png');	
  wall_texture = loadTexture(gl, './wall_texture3.png');	
  rails_texture = loadTexture(gl, './rails_texture.jpg');	
  player = new cube(gl, [-1.2, -1, 0]);
  grd = new ground(gl, [0,-1,0]);
  rails1 = new Rails(gl, [-2, -0.98, 0]);
  rails2 = new Rails(gl, [2, -0.98, 0]);
  wall1 = new Wall(gl, [-5, 0, 0]);
  wall2 = new Wall(gl, [5, 0, 0]);
  obstacle1_list = [];
  obstacle2_list = [];
  coins = [];
  for (var x = 0; x < 500 ; x ++){
  	if (Math.random() < 0.5){
  		coins.push(new Coin(gl, [-1.5, -1.5, (Math.random())*(-5000)]));
  	}
  	else {
  		coins.push(new Coin(gl, [2, -1.5, (Math.random())*(-5000)]));
  	}
  }
  for (var x = 0; x < 50 ; x ++){
  	if (Math.random() < 0.5){
  		obstacle1_list.push(new Obstacle1(gl, [-1.5, -1.5, (Math.random())*(-5000)]));
  	}
  	else {
  		obstacle1_list.push(new Obstacle1(gl, [2, -1.5, (Math.random())*(-5000)]));
  	}
  }
  for (var x = 0; x < 50 ; x ++){
  	if (Math.random() < 0.5){
  		obstacle2_list.push(new Obstacle2(gl, [-1.5, -1, (Math.random())*(-5000)]));
  	}
  	else {
  		obstacle2_list.push(new Obstacle2(gl, [2, -1, (Math.random())*(-5000)]));
  	}
  }
   // If we don't have a GL context, give up now
  document.addEventListener('keydown', function(event){
    if (event.keyCode == 37){//left
    	track = 1;
    }
    if (event.keyCode == 39){//right
    	track = 2;
    }
    if (event.keyCode == 32){
    	if (player.pos[1] == -1){
    		player.jump = 1;
    	}
    }
    if (event.keyCode == 40){
    	player.down = true;
    	player.pos[1]  = -2;
    }
  });
  document.addEventListener('keyup', function(event){
    if (event.keyCode == 40){
    	player.pos[1]  = -1;
    	player.down = false;
    }
  });
  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program

  const vsSource1 = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;
  const vsSource2 = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;
    }
  `;
  // Fragment shader program

  const fsSource1 = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;
  const fsSource2 = `
    varying highp vec2 vTextureCoord;

    uniform sampler2D uSampler;

    void main(void) {
      gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
  `;
  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram1 = initShaderProgram(gl, vsSource1, fsSource1);
  const shaderProgram2 = initShaderProgram(gl, vsSource2, fsSource2);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVevrtexColor and also
  // look up uniform locations.
  const programInfo1 = {
    program: shaderProgram1,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram1, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram1, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram1, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram1, 'uModelViewMatrix'),
    },
  };
  const programInfo2 = {
    program: shaderProgram2,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram2, 'aVertexPosition'),
      textureCoord: gl.getAttribLocation(shaderProgram2, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram2, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram2, 'uModelViewMatrix'),
      uSampler: gl.getUniformLocation(shaderProgram2, 'uSampler'),
    },
  };
  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  //const buffers

  var then = 0;

  // Draw the scene repeatedly
  function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;
    tick();
    drawScene(gl, programInfo1, programInfo2, deltaTime);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}
function tick() {
	document.getElementById("score_text").innerHTML = "Score:" + player.score;
	document.getElementById("coin_text").innerHTML = "Coins:" + player.coins;
	player.tick();
	if (track == 1 && player.pos[0] >= -1.2){
		player.pos[0] -= 0.3;
	}
	else if (track == 2 && player.pos[0] <= 1.8){
		player.pos[0] += 0.3;
	}
	if (player.down) {
		cam_pos = [0, 3, player.pos[2] + 15];
		look_at = [0, -1, player.pos[2]]; 
	}
	else {
		cam_pos = [0, player.pos[1] + 4, player.pos[2] + 15];
		look_at = [0, player.pos[1], player.pos[2]]; 
	}
	
}
//
// Draw the scene.
//
function drawScene(gl, programInfo1, programInfo2, deltaTime) {
  gl.clearColor(128/256, 212/256, 255/256, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
    var cameraMatrix = mat4.create();
    mat4.translate(cameraMatrix, cameraMatrix, cam_pos);
    var cameraPosition = [
      cameraMatrix[12],
      cameraMatrix[13],
      cameraMatrix[14],
    ];

    var up = [0, 1, 0];

    mat4.lookAt(cameraMatrix, cameraPosition, look_at, up);

    var viewMatrix = cameraMatrix;//mat4.create();

    //mat4.invert(viewMatrix, cameraMatrix);

    var viewProjectionMatrix = mat4.create();

    mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);

  player.drawCube(gl, viewProjectionMatrix, programInfo2, deltaTime, player_texture);
  grd.drawGround(gl, viewProjectionMatrix, programInfo2, deltaTime, ground_texture);
  rails1.drawRails(gl, viewProjectionMatrix, programInfo2, deltaTime, rails_texture);
  rails2.drawRails(gl, viewProjectionMatrix, programInfo2, deltaTime, rails_texture);
  wall1.drawWall(gl, viewProjectionMatrix, programInfo2, deltaTime, wall_texture);
  wall2.drawWall(gl, viewProjectionMatrix, programInfo2, deltaTime, wall_texture);

  for (var x = 0; x < 50; x ++){
  	obstacle1_list[x].drawObstacle1(gl, viewProjectionMatrix, programInfo1, deltaTime);
  }
  for (var x = 0; x < 50; x ++){
  	obstacle2_list[x].drawObstacle2(gl, viewProjectionMatrix, programInfo1, deltaTime);
  }
  for (var x = 0; x < 500; x ++){
  	if (Math.abs(coins[x].pos[0] - player.pos[0]) <= 0.5 && Math.abs(coins[x].pos[1] - player.pos[1]) <= 0.5 && Math.abs(coins[x].pos[2] - player.pos[2]) <= 0.5){
  		coins[x].pos[2] = 1000;
  		player.coins += 1;
  	}
  	else {
  		coins[x].drawCoin(gl, viewProjectionMatrix, programInfo1, deltaTime);
  	}
  }
  //c1.drawCube(gl, projectionMatrix, programInfo, deltaTime);

}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}
function loadTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because images have to be download over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);

  const image = new Image();
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  srcFormat, srcType, image);

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
       // Yes, it's a power of 2. Generate mips.
       gl.generateMipmap(gl.TEXTURE_2D);
    } else {
       // No, it's not a power of 2. Turn off mips and set
       // wrapping to clamp to edge
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;

  return texture;
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}