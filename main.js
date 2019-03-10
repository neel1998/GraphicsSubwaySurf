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
var obstacle3_list;
var coins;
var flying_coins;
var rail_texture;
var wall_texture;
var player_texture;
var ground_texture;
var coin_texture;
var obstacle1_texture;
var jump_pu_list;
var jump_texture;
var boost_pu_list;
var boost_texture;
var jump_pu_count = 0;
var jump_pu = false;
var police;
var police_texture;
var sky;
var sky_texture;
var obstacle2_texture;
var gray_scale = false;
var flash = false;
var end;
var end_flag = false;
function main() {

  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);	

  document.getElementById("grayscale_btn").addEventListener('click', function(event){
  	 gray_scale = !gray_scale;
  });
  setInterval(function(){
  	 flash = !flash;
  }, 500);
  rail_texture = loadTexture(gl, './Textures/rails_texture.jpg');
  wall_texture = loadTexture(gl, './Textures/wall_texture3.png');
  player_texture = loadTexture(gl, './Textures/player_texture.jpeg');
  ground_texture = loadTexture(gl, './Textures/ground_texture.png');
  coin_texture = loadTexture(gl, './Textures/coin_texture.png');
  obstacle1_texture = loadTexture(gl, './Textures/obstacle1_texture3.jpg');
  obstacle3_texture = loadTexture(gl, './Textures/obstacle3_texture.jpg');
  jump_texture = loadTexture(gl, './Textures/jump_texture.png');
  boost_texture = loadTexture(gl, './Textures/boost_texture.png');
  police_texture = loadTexture(gl, './Textures/police_texture.jpg');
  sky_texture = loadTexture(gl, './Textures/sky_texture.jpg');
  obstacle2_texture = loadTexture(gl, './Textures/obstacle2_texture.jpg');
  end_texture = loadTexture(gl, './Textures/end_texture.png');

  player = new cube(gl, [-1.2, -1, 0]);
  police = new Police(gl, [-1.2, -1, 3]);
  grd = new ground(gl, [0,-1,0]);
  rails1 = new Rails(gl, [-2, -0.98, 0]);
  rails2 = new Rails(gl, [2, -0.98, 0]);
  wall1 = new Wall(gl, [-5, 0, 0]);
  wall2 = new Wall(gl, [5, 0, 0]);
  sky = new Sky(gl, [0, 0, 0]);
  end = new End(gl, [0, 5, -3000]);
  obstacle1_list = [];
  obstacle2_list = [];
  obstacle3_list = [];
  coins = [];
  flying_coins = [];
  jump_pu_list = [];
  boost_pu_list = [];
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
  		obstacle2_list.push(new Obstacle2(gl, [-1.5, -1, (Math.random())*(-5000)]));
  		obstacle3_list.push(new Obstacle3(gl, [-1.5, -1.5, (Math.random())*(-5000)]));

  	}
  	else {
  		obstacle1_list.push(new Obstacle1(gl, [2, -1.5, (Math.random())*(-5000)]));
  		obstacle2_list.push(new Obstacle2(gl, [2, -1, (Math.random())*(-5000)]));
  		obstacle3_list.push(new Obstacle3(gl, [2, -1.5, (Math.random())*(-5000)]));

  	}
  }
  for (var x = 0; x < 30 ; x ++){
  	if (Math.random() < 0.5){
  		jump_pu_list.push(new JumpPower(gl, [-1.5, -1.5, (Math.random())*(-5000)]));
  	}
  	else {
  		jump_pu_list.push(new JumpPower(gl, [2, -1.5, (Math.random())*(-5000)]));
  	}
  }
  for (var x = 0; x < 30 ; x ++){
  	if (Math.random() < 0.5){
  		boost_pu_list.push(new BoostPower(gl, [-1.5, -1.5, (Math.random())*(-5000)]));
  	}
  	else {
  		boost_pu_list.push(new BoostPower(gl, [2, -1.5, (Math.random())*(-5000)]));
  	}
  }
  for (var x = 0; x < 30; x ++){
  	if (x < 15){
  		flying_coins.push(new Coin(gl, [-1.5, 4, x]));
  	}	
  	else {
  		flying_coins.push(new Coin(gl, [2, 4, x]));
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
    	if (jump_pu) {
    		jump_pu_count += 1;
    		if (jump_pu_count > 3) {
    			jump_pu_count = 0;
    			jump_pu = false;
    		}
    		if (player.pos[1] == -1){
	    		player.jump = 1.5;
	    	}
    	}
    	else {
	    	if (player.pos[1] == -1){
	    		player.jump = 0.7;
	    	}
    	}
    }
    if (event.keyCode == 40 && !player.fly){
    	player.down = true;
    	player.pos[1]  = -2;
    }
  });
  document.addEventListener('keyup', function(event){
    if (event.keyCode == 40 && !player.fly){
    	player.pos[1]  = -1;
    	player.down = false;
    }
  });
  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program

  // const vsSource1 = `
  //   attribute vec4 aVertexPosition;
  //   attribute vec4 aVertexColor;

  //   uniform mat4 uModelViewMatrix;
  //   uniform mat4 uProjectionMatrix;

  //   varying lowp vec4 vColor;

  //   void main(void) {
  //     gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  //     vColor = aVertexColor;
  //   }
  // `;
  const vsSource1 = `
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

  // temp = vColor;	
  // gl_FragColor = vec4( (temp.r + temp.g + temp.b)/3.0, (temp.r + temp.g + temp.b)/3.0, (temp.r + temp.g + temp.b)/3.0, temp.a );
  // const fsSource1 = `
  //   varying lowp vec4 vColor;
  //   highp vec4 temp;
  //   void main(void) {
  //     gl_FragColor = vColor;
  //   }
  // `;
  // temp = texture2D(uSampler, vTextureCoord);	
  // gl_FragColor = vec4( (temp.r + temp.g + temp.b)/3.0, (temp.r + temp.g + temp.b)/3.0, (temp.r + temp.g + temp.b)/3.0, temp.a );
  const fsSource1 = `
    varying highp vec2 vTextureCoord;
    highp vec4 temp;

    uniform sampler2D uSampler;

    void main(void) {
	      gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
  `;
  const fsSource2 = `
    varying highp vec2 vTextureCoord;
    highp vec4 temp;

    uniform sampler2D uSampler;

    void main(void) {
	    temp = texture2D(uSampler, vTextureCoord);	
  		gl_FragColor = vec4( (temp.r + temp.g + temp.b)/3.0, (temp.r + temp.g + temp.b)/3.0, (temp.r + temp.g + temp.b)/3.0, temp.a );
    }
  `;
  const fsSource3 = `
    varying highp vec2 vTextureCoord;
    highp vec4 temp;

    uniform sampler2D uSampler;

    void main(void) {
	    temp = texture2D(uSampler, vTextureCoord);	
  		gl_FragColor = vec4( 1.2*temp.r, 1.2*temp.g, 1.2*temp.b, temp.a );
    }
  `;
  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram1 = initShaderProgram(gl, vsSource1, fsSource1);
  const shaderProgram2 = initShaderProgram(gl, vsSource1, fsSource2);
  const shaderProgram3 = initShaderProgram(gl, vsSource1, fsSource3);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVevrtexColor and also
  // look up uniform locations.
  const programInfo1 = {
    program: shaderProgram1,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram1, 'aVertexPosition'),
      textureCoord: gl.getAttribLocation(shaderProgram1, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram1, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram1, 'uModelViewMatrix'),
      uSampler: gl.getUniformLocation(shaderProgram1, 'uSampler'),
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
  const programInfo3 = {
    program: shaderProgram3,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram3, 'aVertexPosition'),
      textureCoord: gl.getAttribLocation(shaderProgram3, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram3, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram3, 'uModelViewMatrix'),
      uSampler: gl.getUniformLocation(shaderProgram3, 'uSampler'),
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
    if (gray_scale){
    	drawScene(gl, programInfo2, programInfo2, deltaTime);
    }
    else {
    	drawScene(gl, programInfo1, programInfo3, deltaTime);
    }

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}
function tick() {
  if (player.score >= 2000 && !end_flag) {
    end_flag = true;
    end.pos[2] = player.pos[2] - 100;
  }
  if (player.pos[2] < end.pos[2]) {
    window.alert("You Won " + "Coins: " + player.coins + " Score: " + player.score);
    window.location.reload();
  }
	document.getElementById("score_text").innerHTML = "Score:" + player.score;
	document.getElementById("coin_text").innerHTML = "Coins:" + player.coins;
	player.tick();
	police.tick();
	if (Math.abs(player.pos[2] - police.pos[2]) >= 15){
		police.caught = false;
	}
	if (track == 1 && player.pos[0] >= -1.2){
		player.pos[0] -= 0.3;
		police.pos[0] -= 0.3;

	}
	else if (track == 2 && player.pos[0] <= 1.8){
		player.pos[0] += 0.3;
		police.pos[0] += 0.3;
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
function drawScene(gl, programInfo, programInfo2, deltaTime) {
  gl.clearColor(1, 1, 1, 1.0);  // Clear to black, fully opaque
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
  const zFar = 3000.0;
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

  player.drawCube(gl, viewProjectionMatrix, programInfo, deltaTime, player_texture);
  police.drawPolice(gl, viewProjectionMatrix, programInfo, deltaTime, police_texture);
  grd.drawGround(gl, viewProjectionMatrix, programInfo, deltaTime, ground_texture);
  rails1.drawRails(gl, viewProjectionMatrix, programInfo, deltaTime, rail_texture);
  rails2.drawRails(gl, viewProjectionMatrix, programInfo, deltaTime, rail_texture);
  wall1.drawWall(gl, viewProjectionMatrix, (flash)?programInfo2:programInfo, deltaTime, wall_texture);
  wall2.drawWall(gl, viewProjectionMatrix, (flash)?programInfo2:programInfo, deltaTime, wall_texture);
  sky.drawSky(gl, viewProjectionMatrix, programInfo, deltaTime, sky_texture);
  end.drawEnd(gl, viewProjectionMatrix, programInfo, deltaTime, end_texture);

  for (var x = 0; x < 50; x ++){
  	if (Math.abs(obstacle1_list[x].pos[0] - player.pos[0]) <= 0.5 && Math.abs(obstacle1_list[x].pos[1] - player.pos[1]) <= 0.5 && Math.abs(obstacle1_list[x].pos[2] - player.pos[2]) <= 0.5){
  		window.alert("Game Over");
  		window.location.reload();
	}
  	else{
  		obstacle1_list[x].drawObstacle1(gl, viewProjectionMatrix, programInfo, deltaTime, obstacle1_texture);
  	}
  }
  for (var x = 0; x < 50; x ++){
  	if (Math.abs(obstacle2_list[x].pos[0] - player.pos[0]) <= 0.5 && Math.abs(obstacle2_list[x].pos[1] - player.pos[1]) <= 2 && Math.abs(obstacle2_list[x].pos[2] - player.pos[2]) <= 0.5 && !player.down){
  		window.alert("Game Over");
 		window.location.reload();
  	}
  	else{
  		obstacle2_list[x].drawObstacle2(gl, viewProjectionMatrix, programInfo, deltaTime, obstacle2_texture);
  	}
  }
  for (var x = 0; x < 50; x ++){
  	if (Math.abs(obstacle3_list[x].pos[0] - player.pos[0]) <= 0.5 && Math.abs(obstacle3_list[x].pos[1] - player.pos[1]) <= 0.5 && Math.abs(obstacle3_list[x].pos[2] - player.pos[2]) <= 0.5 && !obstacle3_list[x].collided){
  		obstacle3_list[x].collided = true;
  		if (!police.caught){
  			police.pos[2] = player.pos[2] + 3;
  			police.caught = true;
  			break;
  		}
  		else{
  			police.pos[2] = player.pos[2] + 1;
  			window.alert("Caught By Police");
 			window.location.reload();
  		}
  	}
  	else{
  		obstacle3_list[x].drawObstacle3(gl, viewProjectionMatrix, programInfo, deltaTime, obstacle3_texture);
  	}
  }
  for (var x = 0; x < 500; x ++){
  	if (Math.abs(coins[x].pos[0] - player.pos[0]) <= 0.5 && Math.abs(coins[x].pos[1] - player.pos[1]) <= 0.5 && Math.abs(coins[x].pos[2] - player.pos[2]) <= 0.5){
  		coins[x].pos[2] = 1000;
  		player.coins += 1;
  	}
  	else {
  		coins[x].drawCoin(gl, viewProjectionMatrix, programInfo, deltaTime, coin_texture);
  	}
  }
  for (var x = 0; x < 30; x ++){
  	if (Math.abs(jump_pu_list[x].pos[0] - player.pos[0]) <= 0.5 && Math.abs(jump_pu_list[x].pos[1] - player.pos[1]) <= 0.5 && Math.abs(jump_pu_list[x].pos[2] - player.pos[2]) <= 0.5){
  		jump_pu_list[x].pos[2] = 1000;
  		jump_pu_count = 0;
  		jump_pu = true;
  	}
  	else {
  		jump_pu_list[x].drawJumpPower(gl, viewProjectionMatrix, programInfo, deltaTime, jump_texture);
  	}
  }
  for (var x = 0; x < 30; x ++){
  	if (Math.abs(boost_pu_list[x].pos[0] - player.pos[0]) <= 0.5 && Math.abs(boost_pu_list[x].pos[1] - player.pos[1]) <= 0.5 && Math.abs(boost_pu_list[x].pos[2] - player.pos[2]) <= 0.5){
  		player.fly = true;
  		player.flydown = false;
  		for (var y = 0; y < 30; y ++){
  			flying_coins[y].pos[1] = 4;
  			flying_coins[y].pos[2] = y + (player.pos[2] - 50);
  		}
  		setTimeout(function(){ player.fly = false; player.flydown = true }, 3000);
  	}
  	else {
  		boost_pu_list[x].drawBoostPower(gl, viewProjectionMatrix, programInfo, deltaTime, boost_texture);
  	}
  }
  if (player.fly){
  	for (var y = 0; y < 30; y ++){
  		if (Math.abs(flying_coins[y].pos[0] - player.pos[0]) <= 0.5 && Math.abs(flying_coins[y].pos[1] - player.pos[1]) <= 0.5 && Math.abs(flying_coins[y].pos[2] - player.pos[2]) <= 0.5){
  			flying_coins[y].pos[1] = 1000;
  			player.coins += 1;
  		}
  		else {
  			flying_coins[y].drawCoin(gl, viewProjectionMatrix, programInfo, deltaTime, coin_texture);
  		}
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
      gl.generateMipmap(gl.TEXTURE_2D);
    };
    image.src = url;
    return texture;
 }