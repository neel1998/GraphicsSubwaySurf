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
function main() {

  	
  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  player = new cube(gl, [-1.2, 0, 0]);
  grd = new ground(gl, [0,-1,0]);
  rails1 = new Rails(gl, [-2, -0.98, 0]);
  rails2 = new Rails(gl, [2, -0.98, 0]);
  wall1 = new Wall(gl, [-5, 0, 0]);
  wall2 = new Wall(gl, [5, 0, 0]);
  obstacle1_list = [];
  obstacle2_list = [];
  for (var x = 0; x < 20 ; x ++){
  	if (Math.random() < 0.5){
  		obstacle1_list.push(new Obstacle1(gl, [-1.5, -1.5, (Math.random())*(-1000)]));
  	}
  	else {
  		obstacle1_list.push(new Obstacle1(gl, [2, -1.5, (Math.random())*(-1000)]));
  	}
  }
  for (var x = 0; x < 10 ; x ++){
  	if (Math.random() < 0.5){
  		obstacle2_list.push(new Obstacle2(gl, [-1.5, -1, (Math.random())*(-1000)]));
  	}
  	else {
  		obstacle2_list.push(new Obstacle2(gl, [2, -1, (Math.random())*(-1000)]));
  	}
  }
   // If we don't have a GL context, give up now
  document.addEventListener('keydown', function(event){
  	console.log(event.keyCode);
    if (event.keyCode == 37){//left
    	track = 1;
    }
    if (event.keyCode == 39){//right
    	track = 2;
    }
    if (event.keyCode == 32){
    	if (player.pos[1] == 0){
    		player.jump = 1;
    	}
    }
    if (event.keyCode == 40){
    	player.pos[1]  = -1;
    }
  });
  // document.addEventListener('keyup', function(event){
  //   if (event.keyCode == 40){
  //   	player.pos[1]  = 0;
  //   }
  // });
  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program

  const vsSource = `
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

  // Fragment shader program

  const fsSource = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVevrtexColor and also
  // look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
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
    drawScene(gl, programInfo, deltaTime);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}
function tick() {
	player.tick();
	if (track == 1 && player.pos[0] >= -1.2){
		player.pos[0] -= 0.3;
	}
	else if (track == 2 && player.pos[0] <= 1.8){
		player.pos[0] += 0.3;
	}
	cam_pos = [0, player.pos[1] + 4, player.pos[2] + 15];
	look_at = [0, player.pos[1], player.pos[2]]; 
}
//
// Draw the scene.
//
function drawScene(gl, programInfo, deltaTime) {
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

  player.drawCube(gl, viewProjectionMatrix, programInfo, deltaTime);
  grd.drawGround(gl, viewProjectionMatrix, programInfo, deltaTime);
  rails1.drawRails(gl, viewProjectionMatrix, programInfo, deltaTime);
  rails2.drawRails(gl, viewProjectionMatrix, programInfo, deltaTime);
  wall1.drawWall(gl, viewProjectionMatrix, programInfo, deltaTime);
  wall2.drawWall(gl, viewProjectionMatrix, programInfo, deltaTime);

  for (var x = 0; x < 20; x ++){
  	obstacle1_list[x].drawObstacle1(gl, viewProjectionMatrix, programInfo, deltaTime);
  }
  for (var x = 0; x < 10; x ++){
  	obstacle2_list[x].drawObstacle2(gl, viewProjectionMatrix, programInfo, deltaTime);
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
