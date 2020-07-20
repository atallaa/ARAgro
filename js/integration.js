var scene, camera, renderer, clock, deltaTime, totalTime, CSVTable;
var arToolkitSource, arToolkitContext;
var xLine, yLine, zLine, treeGroup, treeClone;
var markerTriedre, trihedralGroup;
var Position;
var mesh;
var growthIteration = 4;
var markerOBJTreeTable = [];
var markerGLBTreeTable = [];
var markerCropTable = [];


function onProgress(xhr) { /*console.log( (xhr.loaded / xhr.total * 100) + '% loaded' ); */ }
function onError(xhr) { /*console.log( 'An error happened' ); */}

function OBJtree(marker)
// Gives an OBJ tree to a specific marker
{
	// Remove the previous tree (the children, if there is one) from the marker.
	for( var i = marker.children.length - 1; i >= 0; i--){
		obj = marker.children[i];
		marker.remove(obj);
	}

	// Add the new tree.
	new THREE.MTLLoader()
		.setPath( 'models/Noyer/' )
		.load( Object.values(CSVTable[growthIteration])[2], function ( materials ) {
			materials.preload();
			new THREE.OBJLoader()
				.setMaterials( materials )
				.setPath( 'models/Noyer/' )
				.load( Object.values(CSVTable[growthIteration])[3], function ( group ) {
					mesh = group.children[0];
					mesh.material.side = THREE.DoubleSide;
					mesh.scale.set(0.25,0.25,0.25);
					mesh.castShadow = false;
					mesh.receiveShadow = false;
					marker.add(mesh);
				}, onProgress, onError );
		});
}

function GLBtree(marker)
// Gives a GLB tree to a specific marker
{
	// Add the new tree
	var loader = new THREE.GLTFLoader();
	loader.load( 'models/lollypop5.glb', function ( gltf ) {
		gltf.scene.traverse( function( node ) {
        if ( node.isMesh ) { node.castShadow = true; }
        node.scale.set(0.75, 0.75, 0.75);
    } );

		marker.add( gltf.scene );
	}, undefined, function ( error ) {
		console.error( error );
	} );
}

function OBJcrop(marker)
// Gives an OBJ crop to a specific marker
{
	// Add the new crop.
	new THREE.MTLLoader()
		.setPath( 'models/Wheat/' )
		.load('10458_Wheat_Field_v1_max2010_it2.mtl', function ( materials ) {
			materials.preload();
			new THREE.OBJLoader()
				.setMaterials( materials )
				.setPath( 'models/Wheat/' )
				.load('10458_Wheat_Field_v1_max2010_it2.obj', function ( group ) {
					mesh = group.children[0];
					mesh.material.side = THREE.DoubleSide;
					mesh.rotation.x = -1.5;
					mesh.scale.set(0.01,0.01,0.01);
					mesh.castShadow = true;
					mesh.receiveShadow = true;
					marker.add(mesh);
					for(let i=0; i<=5; i++){
						for(let j=0; j<=5; j++){
							meshClone = mesh.clone();
							meshClone.position.x = (i-2.5)/5;
							meshClone.position.z = (j-2.5)/5;
							marker.add(meshClone);
						}
					}
				}, onProgress, onError );
		});
}



// --- Here starts the main code.
d3.csv("models/noyer.csv").then(function(data) {
  	CSVTable = Array.from(data);

initialize();
animate();

function initialize()
{
	scene = new THREE.Scene();
	growthIteration = 0;
	let ambientLight = new THREE.AmbientLight( 0xcccccc, 2.8 );
	scene.add( ambientLight );
				
	camera = new THREE.Camera();
	scene.add(camera);

	renderer = new THREE.WebGLRenderer({
		antialias : true,
		alpha: true
	});
	renderer.setClearColor(new THREE.Color('lightgrey'), 0)
	renderer.setSize( 640, 480 );
	renderer.domElement.style.position = 'absolute'
	renderer.domElement.style.top = '0px'
	renderer.domElement.style.left = '0px'
	document.body.appendChild( renderer.domElement );

	clock = new THREE.Clock();
	deltaTime = 0;
	totalTime = 0;
	
	////////////////////////////////////////////////////////////
	// setup arToolkitSource
	////////////////////////////////////////////////////////////

	arToolkitSource = new THREEx.ArToolkitSource({
		sourceType : 'webcam',
	});

	function onResize()
	{
		arToolkitSource.onResize()	
		arToolkitSource.copySizeTo(renderer.domElement)	
		if ( arToolkitContext.arController !== null )
		{
			arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)	
		}	
	}

	arToolkitSource.init(function onReady(){
		onResize()
	});
	
	// handle resize event
	window.addEventListener('resize', function(){
		onResize()
	});
	
	////////////////////////////////////////////////////////////
	// setup arToolkitContext
	////////////////////////////////////////////////////////////	

	// create atToolkitContext
	arToolkitContext = new THREEx.ArToolkitContext({
		cameraParametersUrl: 'data/camera_para.dat',
		detectionMode: 'mono'
	});
	
	// copy projection matrix to camera when initialization complete
	arToolkitContext.init( function onCompleted(){
		camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
	});


	////////////////////////////////////////////////////////////
	// SETUP THE MARKERS 
	////////////////////////////////////////////////////////////

	//___________________________ Setup the growing tree markers._______________________________
	markerP1 = new THREE.Group();
	scene.add(markerP1);
	markerP1.name = "Marker P1";
	let markerControls1 = new THREEx.ArMarkerControls(arToolkitContext, markerP1, {
		type: 'pattern', patternUrl: "Pattern/pattern-P1.patt",
	});
	markerOBJTreeTable.push(markerP1);

	markerP2 = new THREE.Group();
	markerP2.name = "Marker P2";
	scene.add(markerP2);
	let markerControls2 = new THREEx.ArMarkerControls(arToolkitContext, markerP2, {
		type: 'pattern', patternUrl: "Pattern/pattern-P2.patt",
	});
	markerOBJTreeTable.push(markerP2);

	markerP3 = new THREE.Group();
	markerP3.name = "Marker P3";
	scene.add(markerP3);
	let markerControls3 = new THREEx.ArMarkerControls(arToolkitContext, markerP3, {
		type: 'pattern', patternUrl: "Pattern/pattern-P3.patt",
	});
	markerOBJTreeTable.push(markerP3);

	markerP4 = new THREE.Group();
	markerP4.name = "Marker P4";
	scene.add(markerP4);
	let markerControls4 = new THREEx.ArMarkerControls(arToolkitContext, markerP4, {
		type: 'pattern', patternUrl: "Pattern/pattern-P4.patt",
	});
	markerOBJTreeTable.push(markerP4);

	markerP5 = new THREE.Group();
	markerP5.name = "Marker P5";
	scene.add(markerP5);
	let markerControls5 = new THREEx.ArMarkerControls(arToolkitContext, markerP5, {
		type: 'pattern', patternUrl: "Pattern/pattern-P5.patt",
	});
	markerOBJTreeTable.push(markerP5);

	// _______________________ Non-growing tree markers ______________________________
	markerN1 = new THREE.Group();
	markerN1.name = "Marker N1";
	scene.add(markerN1);
	let markerControls6 = new THREEx.ArMarkerControls(arToolkitContext, markerN1, {
		type: 'pattern', patternUrl: "Pattern/pattern-N1.patt",
	});
	markerGLBTreeTable.push(markerN1);

	markerN2 = new THREE.Group();
	markerN2.name = "Marker N2";
	scene.add(markerN2);
	let markerControls7 = new THREEx.ArMarkerControls(arToolkitContext, markerN2, {
		type: 'pattern', patternUrl: "Pattern/pattern-N2.patt",
	});
	markerGLBTreeTable.push(markerN2);

	markerN3 = new THREE.Group();
	markerN3.name = "Marker N3";
	scene.add(markerN3);
	let markerControls8 = new THREEx.ArMarkerControls(arToolkitContext, markerN3, {
		type: 'pattern', patternUrl: "Pattern/pattern-N3.patt",
	});
	markerGLBTreeTable.push(markerN3);

	markerN4 = new THREE.Group();
	markerN4.name = "Marker N4";
	scene.add(markerN4);
	let markerControls9 = new THREEx.ArMarkerControls(arToolkitContext, markerN4, {
		type: 'pattern', patternUrl: "Pattern/pattern-N4.patt",
	});
	markerGLBTreeTable.push(markerN4);

	markerN5 = new THREE.Group();
	markerN5.name = "Marker N5";
	scene.add(markerN5);
	let markerControls10 = new THREEx.ArMarkerControls(arToolkitContext, markerN5, {
		type: 'pattern', patternUrl: "Pattern/pattern-N5.patt",
	});
	markerGLBTreeTable.push(markerN5);

	// _______________________ Crop markers ______________________________
	markerC1 = new THREE.Group();
	markerC1.name = "Marker C1";
	scene.add(markerC1);
	let markerControls11 = new THREEx.ArMarkerControls(arToolkitContext, markerC1, {
		type: 'pattern', patternUrl: "Pattern/pattern-C1.patt",
	});
	markerCropTable.push(markerC1);

	markerC2 = new THREE.Group();
	markerC2.name = "Marker C2";
	scene.add(markerC2);
	let markerControls12 = new THREEx.ArMarkerControls(arToolkitContext, markerC2, {
		type: 'pattern', patternUrl: "Pattern/pattern-C2.patt",
	});
	markerCropTable.push(markerC2);

	markerC3 = new THREE.Group();
	markerC3.name = "Marker C3";
	scene.add(markerC3);
	let markerControls13 = new THREEx.ArMarkerControls(arToolkitContext, markerC3, {
		type: 'pattern', patternUrl: "Pattern/pattern-C3.patt",
	});
	markerCropTable.push(markerC3);

	markerC4 = new THREE.Group();
	markerC4.name = "Marker C4";
	scene.add(markerC4);
	let markerControls14 = new THREEx.ArMarkerControls(arToolkitContext, markerC4, {
		type: 'pattern', patternUrl: "Pattern/pattern-C4.patt",
	});
	markerCropTable.push(markerC4);

	markerC5 = new THREE.Group();
	markerC5.name = "Marker C5";
	scene.add(markerC5);
	let markerControls15 = new THREEx.ArMarkerControls(arToolkitContext, markerC5, {
		type: 'pattern', patternUrl: "Pattern/pattern-C5.patt",
	});
	markerCropTable.push(markerC5);

	// Setup the marker for the trihedral
	markerTriedre = new THREE.Group();
	markerTriedre.name = "Marker Trihedral";
	scene.add(markerTriedre);
	let markerControlsTriedre = new THREEx.ArMarkerControls(arToolkitContext, markerTriedre, {
		type: 'pattern', patternUrl: "Pattern/pattern-triedre.patt",
	});


	// Setup the marker for the "sun"
	markerSun = new THREE.Group();
	markerSun.name = "Marker Sun";
	scene.add(markerSun);
	let markerControlsSun = new THREEx.ArMarkerControls(arToolkitContext, markerSun, {
		type: 'pattern', patternUrl: "Pattern/pattern-sun.patt",
	});



	////////////////////////////////////////////////////////////
	// setting up the scene
	////////////////////////////////////////////////////////////
	
	renderer.shadowMap.enabled = true;
	renderer.shadowMapType = THREE.PCFSoftShadowMap;
	renderer.physicallyCorrectLights = true;

	////////////////////////
	// Creating the trees //
	////////////////////////
	for(let i=0 ; i < (markerOBJTreeTable.length); i++) {
      	OBJtree(markerOBJTreeTable[i]);
    }

	for(let i=0 ; i < (markerGLBTreeTable.length); i++) {
      	GLBtree(markerGLBTreeTable[i]);
    }

    for(let i=0 ; i < (markerCropTable.length); i++) {
      	OBJcrop(markerCropTable[i]);
    }

	//////////////////////
	// Creating the sun //
	//////////////////////
	let lightGroup = new THREE.Group();

	// Creating the floor for the shadows
	let floorGeometry = new THREE.PlaneGeometry( 20,20 );
	let floorMaterial = new THREE.ShadowMaterial();
	floorMaterial.opacity = 0.4;
	let floorMesh = new THREE.Mesh( floorGeometry, floorMaterial );
	floorMesh.rotation.x = -Math.PI/2;
	floorMesh.position.y = -0.2;
	floorMesh.receiveShadow = true;
	lightGroup.add( floorMesh );

	// Creating the light
	let light = new THREE.PointLight( 0xffffff, 2, 100 );
	light.position.set( 0,2,0 ); // default; light shining from top
	light.castShadow = true;
	light.shadow.mapSize.width = 2048;
	light.shadow.mapSize.height = 2048;
	lightGroup.add( light );
	
	let lightSphere = new THREE.Mesh(
		new THREE.SphereGeometry(0.1),
		new THREE.MeshBasicMaterial({
			color: 0xffffff, 
			transparent: true,
			opacity: 0
		})
	);
	lightSphere.position.copy( light.position );
	lightGroup.add( lightSphere );
	markerSun.add( lightGroup );

	// --- Creating the trihedral
	trihedralGroup = new THREE.Group();
	let zVector = new THREE.Vector3();
	let xVector = new THREE.Vector3();
	let yVector = new THREE.Vector3();
	let wp1 = markerTriedre.getWorldPosition();
	zVector = markerTriedre.up;
	markerTriedre.getWorldDirection(xVector);
	yVector.fromArray(math.cross(zVector.toArray(), xVector.toArray()));

	zLine = new THREE.ArrowHelper(zVector, wp1, 1, 0xff0000);
	xLine = new THREE.ArrowHelper(xVector, wp1, 1, 0x0000ff);
	yLine = new THREE.ArrowHelper(yVector, wp1, 1, 0x00ff00);
	trihedralGroup.add(zLine);
	trihedralGroup.add(xLine);
	trihedralGroup.add(yLine);
	markerTriedre.add(trihedralGroup);
		
}
});

// --- We get the position of the Marker when our trihedral is the new basis and origin of the coordinate system.
function transformation(marker)
{
	// --- Here we calculate the 3 vectors of the new basis.
	let xDir = new THREE.Vector3().fromArray(math.subtract(xLine.cone.getWorldPosition().toArray(), markerTriedre.getWorldPosition().toArray()));
	let yDir = new THREE.Vector3().fromArray(math.subtract(yLine.cone.getWorldPosition().toArray(), markerTriedre.getWorldPosition().toArray()));
	let zDir = new THREE.Vector3().fromArray(math.subtract(zLine.cone.getWorldPosition().toArray(), markerTriedre.getWorldPosition().toArray()));
	
	// --- Here we translate the origin.
	let WorldPosition = marker.getWorldPosition();
	let TriedreWorldPosition = markerTriedre.getWorldPosition();
	let RealPosition = new THREE.Vector3();
	RealPosition.fromArray(math.subtract(WorldPosition.toArray(), TriedreWorldPosition.toArray()));

	// --- And finally, we change the basis.
	let transformationMatrix = math.matrix([xDir.toArray(), yDir.toArray(), zDir.toArray()]);
	let FinalPosition = math.multiply(transformationMatrix, RealPosition.toArray());
	return FinalPosition;
}

function update()
{
	if ( arToolkitSource.ready !== false )
		arToolkitContext.update( arToolkitSource.domElement );
}


function render()
{
	renderer.render( scene, camera );
}


function animate()
{
	requestAnimationFrame(animate);
	deltaTime = clock.getDelta();
	totalTime += deltaTime;
	update();
	render();
}




// Function to execute for the growth button 
function growth() {
	// We modify every visible tree in the scene :
    for(let i=0 ; i < (markerOBJTreeTable.length); i++) {
      	OBJtree(markerOBJTreeTable[i]);
    }

    //We increment the years, until we reach the 5th iteration.
	if(growthIteration==5){
		growthIteration=0;
	} else {
		growthIteration++;  
	}       
}

// Function for the save button
function save() {
	// First we check if the trihedral marker is there.
	if(!markerTriedre.visible){
		window.alert("Trihedral marker not visible.")
	}
	else {
		//Save all the growing tree markers and theirs positions in an array.
		var positionTable = [];
	    for(let i=0 ; i < markerOBJTreeTable.length; i++) {
	     	if(markerOBJTreeTable[i].visible) {
	      		var position = transformation(markerOBJTreeTable[i]).toArray();
	      		var marker = {marker: markerOBJTreeTable[i], position: position};
	      		positionTable.push(marker);
	      	}
	    }

	    //Save all the non-growing tree markers and theirs positions in an array.
	    for(let i=0 ; i < markerGLBTreeTable.length; i++) {
	     	if(markerGLBTreeTable[i].visible) {
	      		var position = transformation(markerGLBTreeTable[i]).toArray();
	      		var marker = {marker: markerGLBTreeTable[i], position: position};
	      		positionTable.push(marker);

	      	}
	    }

	    //Save all the crop markers and theirs positions in an array.
	    for(let i=0 ; i < markerCropTable.length; i++) {
	     	if(markerCropTable[i].visible) {
	      		var position = transformation(markerCropTable[i]).toArray();
	      		var marker = {marker: markerCropTable[i], position: position};
	      		positionTable.push(marker);

	      	}
	    }

	    if(markerSun.visible){
		    var sunPosition = transformation(markerSun).toArray();
		    var sunMarker = {marker: markerSun, position: sunPosition};
		    positionTable.push(sunMarker);
		    console.log(positionTable);
		}

	    // Display every marker in an alert.
	    for(let i=0; i<positionTable.length; i++) {
	    	window.alert(positionTable[i].marker.name + " : [" + positionTable[i].position[0].toFixed(2) + "," + positionTable[i].position[1].toFixed(2) + "," + positionTable[i].position[2].toFixed(2) + "]");
	    }
	}
}


