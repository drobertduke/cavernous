var scene, camera, renderer, controls;
var geometry, material, mesh;

var gridWidth = 200;
var gridHeight = 200;

// A hidden canvas element stores the 2d heightmap we will generate
document.getElementById('heightmap').setAttribute('width', gridWidth);
document.getElementById('heightmap').setAttribute('height', gridHeight);
document.getElementById('heightmap').style.display = 'none';

var parameters = {
  alea: RAND_DEFAULT,
  generator: PN_GENERATOR,
  width: gridWidth,
  height: gridHeight,
  widthSegments: gridWidth,
  heightSegments: gridHeight,
  depth: 150,
  param: 3,
  filterparam: 1,
  filter: [ BLUR_FILTER ],
  canvas: document.getElementById('heightmap')
};

// Generate the heightmap with perlin noise
PN_GENERATOR.Get(parameters);

var context = parameters.canvas.getContext('2d'),
  imgData = context.getImageData( 0, 0, parameters.canvas.width, parameters.canvas.height ),
  pixels = imgData.data;

var scaleZ = 20 / 255;

// Create the 2d array we will populate later
var tileMap = initEmptyArray(gridWidth, gridHeight);

init(pixels, gridWidth, gridHeight);

animate();

function init(pixels, terrainWidth, terrainHeight) {

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );

  camera.position.z = 1000;

  controls = new THREE.TrackballControls( camera );
  controls.rotateSpeed = 1.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;

  controls.noZoom = false;
  controls.noPan = false;

  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;

  controls.keys = [ 65, 83, 68 ];

  // Create a single hexagon
  var hexRadius = 20;
  var hexRadiusVector = new THREE.Vector3( 0, hexRadius, 0 );
  var hexFirstRotation = new THREE.Vector3( 0, hexRadius, 0 );
  var hexRotation = new THREE.Euler( 0, 0, Math.PI / 3, 'XYZ' );
  hexFirstRotation.applyEuler(hexRotation);
  var hexagon = new THREE.Shape();
  hexagon.moveTo(hexRadiusVector.x, hexRadiusVector.y);
  for (i = 0; i < 6; i++ ) {
    hexRadiusVector.applyEuler(hexRotation);
    hexagon.lineTo(hexRadiusVector.x, hexRadiusVector.y);
  }
  var hexGeom = new THREE.ShapeGeometry( hexagon );
  material = new THREE.MeshLambertMaterial( { color:0x888888, shading: THREE.FlatShading } );
  mesh = new THREE.Mesh( hexGeom, material );

  // Populate all hexagons using heightmap pixel data to determine Z
  pixelId = 0;
  var tileMap = [];
  for (var i = 0; i < terrainWidth; i++) {
    for (var j = 0; j < terrainHeight; j++ ) {
      if (tileMap[i] == undefined) {
        tileMap[i] = [];
      }
      xOffset = (j % 2 == 0)? 0 : hexFirstRotation.x;
      newMesh = mesh.clone();
      newMesh.position = new THREE.Vector3(
        i * hexFirstRotation.x * 2 + xOffset,
        j * (hexRadius * 2 - (hexRadius - hexFirstRotation.y)),
        scaleZ * pixels[pixelId * 4 + 1] * 30 );
      tileMap[i][j] = newMesh;
      scene.add( newMesh );
      pixelId++;
    }
  }

  var ambientLight = new THREE.AmbientLight(0x000000);
  scene.add(ambientLight);

  var directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(1, 1, 1).normalize();
  scene.add(directionalLight);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );

  document.body.appendChild( renderer.domElement );

}

function initEmptyArray(width, height) {
  var tileMap = [];
  for (var i = 0; i < width; i++) {
    for (var j = 0; j < height; j++ ) {
      if (tileMap[i] == undefined) {
        tileMap[i] = [];
      }
      tileMap[i][j] = true;
    }
  }
  return tileMap;
}

function animate() {

  // note: three.js includes requestAnimationFrame shim
  requestAnimationFrame( animate );

  controls.update();

  renderer.render( scene, camera );

}

function rain() {

}


