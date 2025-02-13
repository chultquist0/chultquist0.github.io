// Create a scene

// Bucket List
// title stuff
// reset camera button
// all correct animation
// clicking on clue allows you to 
// numbers less fuzzy


const scene = new THREE.Scene();

let selected_seq = [];
let selected_cube_index = 0;
let seq_dir = 0;

const SEQDIR = {
    y: 2,
    x: 0,
    z: 1,
};

const REVERSE_SEQDIR = {
    2: { dir: "y", name: "deep" },
    0: { dir: "x", name: "across" },
    1: { dir: "z", name: "down" },
};

// Create a camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 4;
camera.position.y = 8;
camera.position.x = 2;

camera.lookAt(2, 0, 0);

// Create a renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(0xeeeeee);
renderer.setSize(window.innerWidth - 30, window.innerHeight - 30);
document.body.appendChild(renderer.domElement);

const gridSize = 4; // Size of the grid
const spacing = 1.1; // Spacing between cubes
const group = new THREE.Group();
// group.rotation.x = Math.PI / 4;
// group.rotation.y = Math.PI / 4;
// group.rotation.z = Math.PI / 4;
const labelgroup = new THREE.Group();

function highlightClue(clueId) {
    // Remove highlight from all clues
    document.querySelectorAll('.clue').forEach(clue => {
        clue.classList.remove('selected');
    });

    // Highlight the selected clue
    const selectedClue = document.querySelector(`.clue[data-clue-id="${clueId}"]`);
    console.log('highlight selected clue=',selectedClue)
    if (selectedClue) {
        selectedClue.classList.add('selected');

        // Scroll the selected clue into view
        const cluesContainer = document.getElementById('clues-container');
        const containerHeight = cluesContainer.clientHeight;
        const clueHeight = selectedClue.clientHeight;
        const offsetTop = selectedClue.offsetTop - cluesContainer.offsetTop;
        const scrollPosition = offsetTop - (containerHeight / 2) + (clueHeight / 2);
        
        cluesContainer.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
        });
    }
}


function get_selected_clue() {
    for (let i = 0; i < gridSize; i++) {
        const cube = selected_seq[i];
        const hint_number =
            cubenumber[3 - cube.grid_pos.y][cube.grid_pos.z][cube.grid_pos.x];

        // check if hint exists for this direction
        const hint_str = REVERSE_SEQDIR[seq_dir].dir;
        const hint = hints[hint_str][hint_number];

        if (hint) {
            return `${hint_number} ${REVERSE_SEQDIR[seq_dir].name}: ${hint}`;
        }
    }
}


function refresh_colors() {
    for (cube of group.children) {
        if (selected_seq[selected_cube_index] == cube) {
            cube.material.color.setHex(0x999900);
            cube.material.needsUpdate = true;
        } else if (selected_seq.includes(cube)) {
            cube.material.color.setHex(0x6fa8dc);
            cube.material.needsUpdate = true;
            //cube.needsUpdate = true;
        } else {
            cube.material.color.setHex(0x337799);
            cube.material.needsUpdate = true;
        }
    }

    const currentClueP = document.getElementById("current-clue");

    if (currentClueP) {
        currentClueP.innerText = get_selected_clue();
    }

    const selectedClue = get_selected_clue();
    console.log('Selected Clue:', selectedClue); // Add this line for debugging
    if (selectedClue) {
        const clueParts = selectedClue.split(' ');
        if (clueParts.length >= 2) {
            const clueNumber = clueParts[0];
            const directionName = clueParts[1].toLowerCase().replace(/:$/, '');;
            console.log(clueNumber, directionName)
            
            // Find the direction key (x, y, z) based on the direction name
            let directionKey = '';
            for (const [key, value] of Object.entries(REVERSE_SEQDIR)) {
                if (value.name === directionName) {
                    directionKey = value.dir;
                    break;
                }
            }

            const clueId = `${directionKey}-${clueNumber}`; // Use direction key (x, y, z) as prefix
            console.log(clueId)
            highlightClue(clueId);
        }
    }
}




for (let x = 0; x < gridSize; x++) {
    for (let y = gridSize - 1; y >= 0; y--) {
        for (let z = 0; z < gridSize; z++) {
            if (
                z === 0 ||
                z === gridSize - 1 ||
                y == 0 ||
                y === gridSize - 1 ||
                x == 0 ||
                x == gridSize - 1
            ) {
                // Create cube geometry and material
                const geometry = new THREE.BoxGeometry();

                //cubegeometry.name=Math.random();
                const geometryLabel = new THREE.BoxGeometry();//getCubeGeometry()
                
                const material = new THREE.MeshBasicMaterial({ color: 0x337799 });
                const labelMaterial = new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 1,
                });

                // Create cube mesh
                const cubeMesh = new THREE.Mesh(geometry, material);
                const labelMesh = new THREE.Mesh(geometryLabel, labelMaterial);

                // Position the cubeMesh in the grid
                cubeMesh.position.set(
                    (x - (gridSize - 1) / 2) * spacing,
                    (y - (gridSize - 1) / 2) * spacing,
                    (z - (gridSize - 1) / 2) * spacing
                );
                labelMesh.position.set(
                    cubeMesh.position.x,
                    cubeMesh.position.y,
                    cubeMesh.position.z
                );

                cubeMesh.grid_pos = { x: x, y: y, z: z };
                cubeMesh.letter = "";

                if (z == 0 && y == 3) selected_seq.push(cubeMesh);

                //faceMaterial.map = createTextTexture(`${x} ${y} ${z}`,1);

                let labelTexture = createNumberTexture(
                    cubenumber[3 - y][z][x] ,
                    512,true
                );

                labelMaterial.map = labelTexture;



                const wireframeGeometry = new THREE.EdgesGeometry(geometry);
                const wireframeMaterial = new THREE.LineBasicMaterial({
                    color: 0x000000,
                }); // Outline color
                const wireframe = new THREE.LineSegments(
                    wireframeGeometry,
                    wireframeMaterial
                );
                cubeMesh.add(wireframe); // Add wireframe to the cube


                // Add cube to the scene
                // group.add(cube);
                group.add(cubeMesh);
                //scenegroup.add(cubeMesh);
                labelgroup.add(labelMesh);
            }
        }
    }
}

//scene.add(group)
const axesHelper = new THREE.AxesHelper(5);
//scene.add(axesHelper);
scene.add(group);
scene.add(labelgroup);

refresh_colors();



function populateClues() {
    const cluesContainer = document.getElementById('clues');
    if (!cluesContainer) {
        console.error('Clues container not found');
        return;
    }

    cluesContainer.innerHTML = `
        <section class="clues-section">
            <header class="clues-header">Across</header>
            <div id="clues-x" class="clues-list"></div>    
        </section>
        <section class="clues-section">
            <header class="clues-header">Down</header>
            <div id="clues-z" class="clues-list"></div>
        </section>
        <section class="clues-section">
            <header class="clues-header">Deep</header>
            <div id="clues-y" class="clues-list"></div>
        </section>
    `;

    const cluesYContainer = document.getElementById('clues-y');
    const cluesXContainer = document.getElementById('clues-x');
    const cluesZContainer = document.getElementById('clues-z');

    const hints = window.hints;

    Object.keys(hints.y).forEach(key => {
        const clueElement = document.createElement('div');
        clueElement.className = 'clue';
        clueElement.textContent = `${key}. ${hints.y[key]}`;
        clueElement.dataset.clueId = `y-${key}`;
        cluesYContainer.appendChild(clueElement);
    });

    Object.keys(hints.x).forEach(key => {
        const clueElement = document.createElement('div');
        clueElement.className = 'clue';
        clueElement.textContent = `${key}. ${hints.x[key]}`;
        clueElement.dataset.clueId = `x-${key}`;
        cluesXContainer.appendChild(clueElement);
    });

    Object.keys(hints.z).forEach(key => {
        const clueElement = document.createElement('div');
        clueElement.className = 'clue';
        clueElement.textContent = `${key}. ${hints.z[key]}`;
        clueElement.dataset.clueId = `z-${key}`;
        cluesZContainer.appendChild(clueElement);
    });
}



// Mouse control variables
let isDragging = false;
let previousMousePosition = {
    x: 0,
    y: 0,
};

let originalX = 0;
let originalY = 0;

// Mouse events
renderer.domElement.addEventListener("mousedown", (event) => {
    originalX = event.clientX;
    originalY = event.clientY;

    isDragging = true;
});

renderer.domElement.addEventListener("mouseup", (event) => {
    isDragging = false;
});

window.addEventListener("mousemove", (event) => {
    if (isDragging) {
        const deltaMove = {
            x: event.offsetX - previousMousePosition.x,
            y: event.offsetY - previousMousePosition.y,
        };

        labelgroup.rotation.x += deltaMove.y * 0.01;
        labelgroup.rotation.y += deltaMove.x * 0.01;
        group.rotation.x += deltaMove.y * 0.01;
        group.rotation.y += deltaMove.x * 0.01;

        axesHelper.rotation.x += deltaMove.y * 0.01;
        axesHelper.rotation.y += deltaMove.x * 0.01;
    }

    previousMousePosition = {
        x: event.offsetX,
        y: event.offsetY,
    };
});

function createNumberTexture(text, size, reverse) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    size = 64;

    context.save()

    canvas.width = size;
    canvas.height = size;
    context.font = "Bold 16px Arial";
    context.fillStyle = "#000000";
    context.textAlign = "left";
    context.textBaseline = "top";
    context.fillText(text, 5, 5);
    context.save()
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
}

function createTextTexture(text, size) {
    console.log("Creating texture with text:", text);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    //const size = 256;

    canvas.width = size;
    canvas.height = size;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, size, size);
    context.font = "Bold 100px Arial";
    context.fillStyle = "#000000";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, size / 2, size / 2);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
}

document.addEventListener("keydown", (event) => {
    if (event.key != "Backspace") return;

    const cube_selected = selected_seq[selected_cube_index];
    let dir_mult = 0;
    if (cube_selected.letter == "" && selected_cube_index != 0) {
        //delete previous, go back to previous
        dir_mult = 1;
    } else if (cube_selected.letter == "") return;

    console.log(event.key);
    const cube = selected_seq[selected_cube_index - 1 * dir_mult];
    const faceMaterial = cube.material;
    if (Array.isArray(faceMaterial)) {
        // If cube has multiple materials, use the material corresponding to the clicked face
        faceMaterial = faceMaterial[intersect.face.materialIndex];
    }

    faceMaterial.map = createTextTexture("", 256);
    cube.letter = "";
    let dir = 1;
    function backwards(num) {
        let mod = num % (2 * Math.PI);
        mod = mod < 0 ? mod + 2 * Math.PI : mod;
        return Math.abs(mod - Math.PI) < Math.PI / 2;
    }

    if (backwards(group.rotation.y)) {
        console.log("Switching Direction", seq_dir);
        if (seq_dir == 0) dir = -1;
    }
    if (backwards(group.rotation.x)) {
        console.log("Switching Direction", seq_dir);
        if (seq_dir == 2) dir = -1;
    }

    selected_cube_index = (selected_cube_index - dir_mult * dir) % gridSize;
    refresh_colors();
});

document.addEventListener("keypress", (event) => {
    const cube = selected_seq[selected_cube_index];
    const faceMaterial = cube.material;
    if (Array.isArray(faceMaterial)) {
        // If cube has multiple materials, use the material corresponding to the clicked face
        faceMaterial = faceMaterial[intersect.face.materialIndex];
    }

    //if event.key
    if (!event.key) return;
    faceMaterial.map = createTextTexture(event.key.toUpperCase(), 256);
    faceMaterial.needsUpdate = true;

    cube.letter = event.key.toLowerCase();

    let dir = 1;

    function backwards(num) {
        let mod = num % (2 * Math.PI);
        mod = mod < 0 ? mod + 2 * Math.PI : mod;
        return Math.abs(mod - Math.PI) < Math.PI / 2;
    }

    if (backwards(group.rotation.y)) {
        console.log("Switching Direction", seq_dir);
        if (seq_dir == 0) dir = -1;
    }
    if (backwards(group.rotation.x)) {
        console.log("Switching Direction", seq_dir);
        if (seq_dir == 2) dir = -1;
    }

    selected_cube_index = (selected_cube_index + dir) % gridSize;
    refresh_colors();
});
// Add event listener for mouse click

renderer.domElement.addEventListener("click", (event) => {
    // Calculate mouse position relative to the canvas
    if (isDragging) return;

    dist =
        (event.clientX - originalX) * (event.clientX - originalX) +
        (event.clientY - originalY) * (event.clientY - originalY);

    if (dist > 5) return;

    const mouse = {
        x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
        y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
    };
    //console.log(event.clientX,event.clientY);

    // Raycast from camera to determine intersected face
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(group.children, false);
    console.log(intersects);
    const sorted_intersects = intersects.sort((a, b) => a.distance - b.distance);
    let closest_cube = null;
    if (intersects.length <= 0) return;

    for (i in sorted_intersects) {
        const objtocheck = sorted_intersects[i].object;
        console.log(objtocheck);
        if (group.getObjectById(objtocheck.id) != undefined) {
            closest_cube = sorted_intersects[i].object;
            break;
        }
    }

    const cube = closest_cube;

    if (!cube) return;
    console.log(cube);

    if (cube == selected_seq[selected_cube_index]) {
        seq_dir = (seq_dir + 1) % 3;
    }

    const middlex = cube.grid_pos.x > 0 && cube.grid_pos.x < gridSize - 1;
    const middley = cube.grid_pos.y > 0 && cube.grid_pos.y < gridSize - 1;
    const middlez = cube.grid_pos.z > 0 && cube.grid_pos.z < gridSize - 1;
    if (middlex && middley && seq_dir == 1) seq_dir = 2;
    if (middley && middlez && seq_dir == 0) seq_dir = 1;
    if (middlex && middlez && seq_dir == 2) seq_dir = 0;
    //console.log('Clicked on cube:', cube);

    //Update selected sequence
    //find y and z of cube
    selected_seq = [];
    for (pot_cube of group.children) {
        if (seq_dir == 0) {
            if (
                pot_cube.grid_pos.y == cube.grid_pos.y &&
                pot_cube.grid_pos.z == cube.grid_pos.z
            ) {
                selected_seq.push(pot_cube);
            }
        } else if (seq_dir == 1) {
            if (
                pot_cube.grid_pos.y == cube.grid_pos.y &&
                pot_cube.grid_pos.x == cube.grid_pos.x
            ) {
                selected_seq.push(pot_cube);
            }
        } else if (seq_dir == 2) {
            if (
                pot_cube.grid_pos.z == cube.grid_pos.z &&
                pot_cube.grid_pos.x == cube.grid_pos.x
            ) {
                selected_seq.push(pot_cube);
            }
        }
    }
    //console.log(cube.grid_pos)

    if (seq_dir == SEQDIR.x)
        selected_seq = selected_seq.sort((a, b) => a.grid_pos.x - b.grid_pos.x);
    if (seq_dir == SEQDIR.z)
        selected_seq = selected_seq.sort((a, b) => a.grid_pos.z - b.grid_pos.z);
    if (seq_dir == SEQDIR.y)
        selected_seq = selected_seq.sort((a, b) => b.grid_pos.y - a.grid_pos.y);
    for (i in selected_seq) {
        if (selected_seq[i] == cube) selected_cube_index = parseInt(i);
    }
    refresh_colors();
});

// Prevent scroll event on clues container from affecting the camera
function preventScrollPropagation() {
    const cluesContainer = document.getElementById('clues-container');
    if (!cluesContainer) {
        console.error('Clues container not found');
        return;
    }
    cluesContainer.addEventListener('wheel', function(event) {
        event.stopPropagation();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    populateClues();
    preventScrollPropagation();
    highlightClue('x-1');

    // Reset Camera View
    function resetCameraView() {
        console.log('button clicked')
        camera.position.set(2, 8, 4);
        console.log(`Camera Position: x=${camera.position.x}, y=${camera.position.y}, z=${camera.position.z}`); 
        camera.lookAt(new THREE.Vector3(2, 0, 0));
        camera.fov = 75;
        camera.updateProjectionMatrix();
        labelgroup.rotation.set(0, 0, 0);
        group.rotation.set(0, 0, 0);
        axesHelper.rotation.set(0, 0, 0);
    }

    document.getElementById('reset-camera-button').addEventListener('click', resetCameraView);
});



function onScroll(event) {
    // Adjust camera field of view based on the scroll direction
    camera.fov += event.deltaY * 0.05;
    // Clamp the field of view to some reasonable limits
    camera.fov = Math.max(20, Math.min(100, camera.fov));
    camera.updateProjectionMatrix();
}



window.addEventListener("wheel", onScroll);

window.onload = populateClues;
window.onload = highlightClue('x-1');


// Render loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();