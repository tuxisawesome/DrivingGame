// main.js - Main initialization file for the 3D driving game

// Global variables
let canvas, engine, scene;
const loadingScreen = document.getElementById('loadingScreen');
const errorScreen = document.getElementById('errorScreen');
const errorMessage = document.getElementById('errorMessage');

// Initialize function - called when the page loads
async function initGame() {
    try {
        // Get the canvas element
        canvas = document.getElementById('renderCanvas');
        if (!canvas) {
            throw new Error('Canvas element not found');
        }

        // Initialize the Babylon.js engine
        engine = new BABYLON.Engine(canvas, true, { 
            preserveDrawingBuffer: true, 
            stencil: true,
            disableWebGL2Support: false,
            adaptToDeviceRatio: true
        });

        // Create the scene
        scene = await createScene();
        
        // Make the scene available globally
        window.scene = scene;
        
        // Register a render loop to repeatedly render the scene
        engine.runRenderLoop(() => {
            if (scene) {
                scene.render();
            }
        });

        // Watch for browser/canvas resize events
        window.addEventListener('resize', () => {
            engine.resize();
        });

        // Hide loading screen when everything is ready
        loadingScreen.classList.add('hidden');
    } catch (error) {
        console.error('Error initializing game:', error);
        showError(error.message || 'Failed to initialize the game');
    }
}

// Create the scene
async function createScene() {
    // Create a basic scene
    const scene = new BABYLON.Scene(engine);
    
    // Set a clear color for the scene (sky blue)
    scene.clearColor = new BABYLON.Color4(0.5, 0.8, 0.9, 1);
    
    // Enable collisions
    scene.collisionsEnabled = true;
    scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
    
    // Create and position a free camera for initial setup
    // This will be replaced by a vehicle camera later
    const camera = new BABYLON.FreeCamera('mainCamera', new BABYLON.Vector3(0, 100, -300), scene);
    camera.setTarget(new BABYLON.Vector3(0, 0, 0));
    camera.attachControl(canvas, true);
    
    // Enable camera collisions
    camera.checkCollisions = true;
    camera.applyGravity = true;
    camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);
    
    // Add keyboard controls for the camera
    camera.keysUp.push(87);    // W
    camera.keysDown.push(83);  // S
    camera.keysLeft.push(65);  // A
    camera.keysRight.push(68); // D
    
    // Adjust camera speed
    camera.speed = 10;
    camera.angularSensibility = 4000;
    
    // Create a basic light
    const hemisphericLight = new BABYLON.HemisphericLight('hemisphericLight', new BABYLON.Vector3(0, 1, 0), scene);
    hemisphericLight.intensity = 0.7;
    
    // Add a directional light for shadows
    const directionalLight = new BABYLON.DirectionalLight('directionalLight', new BABYLON.Vector3(-0.5, -1, -0.5), scene);
    directionalLight.intensity = 0.5;
    directionalLight.position = new BABYLON.Vector3(100, 100, 100);
    
    // Enable shadows
    const shadowGenerator = new BABYLON.ShadowGenerator(1024, directionalLight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;
    
    // Store shadow generators for other modules to use
    window.lighting = {
        shadowGenerators: [shadowGenerator]
    };
    
    // Add environment helper for reflections
    const envHelper = scene.createDefaultEnvironment({
        enableGroundShadow: false,
        createGround: false,
        skyboxSize: 1000,
        groundSize: 0
    });
    
    // Try to initialize Havok physics
    try {
        // Check if Havok is available
        if (window.HavokPhysics) {
            console.log("Initializing Havok physics...");
            const havokInstance = await window.HavokPhysics();
            const havokPlugin = new BABYLON.HavokPlugin(true, havokInstance);
            
            // Enable physics in the scene
            scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), havokPlugin);
            console.log("Havok physics initialized successfully");
        } else {
            console.log("Havok physics not available, physics will be initialized by vehicle.js");
        }
    } catch (error) {
        console.error("Error initializing Havok physics:", error);
        console.log("Physics will be initialized by vehicle.js");
    }
    
    // Add a simple debug UI
    addDebugUI(scene);
    
    return scene;
}

// Add debug UI
function addDebugUI(scene) {
    // Create a simple debug UI
    const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');
    
    // Store UI for other modules to use
    window.ui = {
        advancedTexture: advancedTexture
    };
    
    // FPS counter
    const fpsText = new BABYLON.GUI.TextBlock();
    fpsText.text = 'FPS: 0';
    fpsText.color = 'white';
    fpsText.fontSize = 16;
    fpsText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    fpsText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    fpsText.left = 10;
    fpsText.top = 10;
    advancedTexture.addControl(fpsText);
    
    // Position display
    const positionText = new BABYLON.GUI.TextBlock();
    positionText.text = 'Position: (0, 0, 0)';
    positionText.color = 'white';
    positionText.fontSize = 16;
    positionText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    positionText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    positionText.left = 10;
    positionText.top = 30;
    advancedTexture.addControl(positionText);
    
    // Speed display
    const speedText = new BABYLON.GUI.TextBlock();
    speedText.text = 'Speed: 0 km/h';
    speedText.color = 'white';
    speedText.fontSize = 16;
    speedText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    speedText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    speedText.left = 10;
    speedText.top = 50;
    advancedTexture.addControl(speedText);
    
    // Update the debug info
    scene.registerBeforeRender(() => {
        fpsText.text = `FPS: ${engine.getFps().toFixed(2)}`;
        
        if (scene.activeCamera) {
            const pos = scene.activeCamera.position;
            positionText.text = `Position: (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)})`;
        }
        
        // Update speed if vehicle is available
        if (window.vehicle && typeof window.vehicle.getSpeedKmh === 'function') {
            speedText.text = `Speed: ${window.vehicle.getSpeedKmh().toFixed(1)} km/h`;
        }
    });
    
    // Add help text
    const helpText = new BABYLON.GUI.TextBlock();
    helpText.text = 'WASD: Drive, Space: Brake, Shift: Handbrake, C: Change Camera';
    helpText.color = 'white';
    helpText.fontSize = 16;
    helpText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    helpText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    helpText.left = -10;
    helpText.top = -10;
    advancedTexture.addControl(helpText);
    
    // Add reset vehicle button (R key)
    scene.onKeyboardObservable.add((kbInfo) => {
        if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN && kbInfo.event.key === 'r') {
            if (window.vehicle && typeof window.vehicle.reset === 'function') {
                window.vehicle.reset();
            } else {
                scene.activeCamera.position = new BABYLON.Vector3(0, 100, -300);
                scene.activeCamera.setTarget(new BABYLON.Vector3(0, 0, 0));
            }
        }
    });
}

// Show error message
function showError(message) {
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
    }
    
    if (errorScreen && errorMessage) {
        errorMessage.textContent = message;
        errorScreen.classList.remove('hidden');
    }
}

// Check for WebGL support
function checkWebGLSupport() {
    try {
        const canvas = document.createElement('canvas');
        return !!window.WebGLRenderingContext && 
            (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch (e) {
        return false;
    }
}

// Initialize the game when the window loads
window.addEventListener('DOMContentLoaded', () => {
    if (!checkWebGLSupport()) {
        showError('WebGL is not supported in your browser. Please try a different browser or update your current one.');
        return;
    }
    
    initGame();
});