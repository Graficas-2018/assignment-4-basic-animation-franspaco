// ORBIT CONTROLS!!!!

var scene = null;
var renderer = null;
var materials = {};
var controls = null;

async function startUp(){
    var canvas = document.getElementById("webglcanvas");
    var container = $("#container");
    canvas.width = container.width();
    canvas.height = container.height();
    // create the scene
    createScene(canvas);
    await createObjects();
    run();
}

function run() {
    requestAnimationFrame(function() {
        run();
    });
    // Render the scene
    renderer.render(scene, camera);

    // Animate
    KF.update();

    // Update the camera controller
    // orbitControls.update();
    controls.update();
}

function createMaterials() {
    var texture = THREE.ImageUtils.loadTexture("img/checker_large.gif");
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    materials['surface'] = new THREE.MeshLambertMaterial({map: texture, side: THREE.DoubleSide});
}

function deg2rad(val) {
    return (val / 180.0) * Math.PI;
}

function createScene(canvas) {
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.shadowMapEnabled = true;
    renderer.shadowMapType = THREE.PCFSoftShadowMap;

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);

    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Image background
    scene.background = new THREE.Color(0.0, 0.0, 0.0);

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera(
        45,
        canvas.width / canvas.height,
        1,
        4000
    );
    controls = new THREE.OrbitControls(camera, canvas);
    camera.position.set(0, 20, 20);
    controls.update();
    scene.add(camera);

    // Create materials
    createMaterials();

    var light = new THREE.PointLight(0xffffff, 1.2);
    light.position.set(0, 20, 20);
    light.shadowCameraVisible = true;
    light.shadowDarkness = 1;
    light.castShadow = true;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    light.shadowCameraVisible = true;
    scene.add(light);

    var amLight = new THREE.AmbientLight(0x333333);
    scene.add(amLight);
}

async function createObjects(){

    var plane = new THREE.PlaneGeometry(50, 50);
    var surface = new THREE.Mesh(plane, materials['surface']);
    surface.rotation.x = -Math.PI/2;
    surface.receiveShadow = true;
    scene.add(surface);

    var loader = new THREE.OBJLoader();
    var obj = await new Promise(resolve => {
        loader.load("cerberus/Cerberus.obj", resolve);
    });
    var geometry = null;
    var texture = new THREE.TextureLoader().load('cerberus/Cerberus_A.jpg');
    var normalMap = new THREE.TextureLoader().load('cerberus/Cerberus_N.jpg');
    var specularMap = new THREE.TextureLoader().load('cerberus/Cerberus_M.jpg');

    obj.traverse( function ( child ) {
        if ( child instanceof THREE.Mesh ) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.material.map = texture;
            child.material.normalMap = normalMap;
            child.material.specularMap = specularMap;
        }
    });

    var object = obj;

    object.scale.set(3,3,3);

    if(object.rotateAnimation)
        object.rotateAnimation.stop();

    object.position.set(1,2,0);
    object.rotation.set(0,0,0);

    object.rotateAnimation = new KF.KeyFrameAnimator;
    object.rotateAnimation.init({
        interps: [
            {
                keys: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1.0],
                values: [
                    {x:  10.0000, y:  2.0000, z: -0.0000},
                    {x:  7.0711, y:  2.0000, z: -7.0711},
                    {x:  0.0000, y:  2.0000, z: -10.0000},
                    {x: -7.0711, y:  2.0000, z: -7.0711},
                    {x: -10.0000, y:  2.0000, z: -0.0000},
                    {x: -7.0711, y:  2.0000, z:  7.0711},
                    {x: -0.0000, y:  2.0000, z:  10.0000},
                    {x:  7.0711, y:  2.0000, z:  7.0711},
                    {x:  10.0000, y:  2.0000, z:  0.0000},
                ],
                target: object.position
            },
            {
                keys: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1.0],
                values: [
                    {y:0.0},
                    {y:0.7853981633974483},
                    {y:1.5707963267948966},
                    {y:2.356194490192345},
                    {y:3.141592653589793},
                    {y:3.9269908169872414},
                    {y:4.71238898038469},
                    {y:5.497787143782138},
                    {y:6.283185307179586}
                ],
                target: object.rotation
            }
        ],
        loop: true,
        duration:15000,
        easing:TWEEN.Easing.None,
    });
    object.rotateAnimation.start();

    scene.add(object);
}