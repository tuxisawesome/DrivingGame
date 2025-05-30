// vehicle.js - Enhanced vehicle controls and physics for the 3D driving game

// Vehicle class to handle all vehicle-related functionality
class Vehicle {
    constructor(scene) {
        this.scene = scene;
        this.mesh = null;
        this.carModel = null;
        this.wheelMeshes = [];
        this.wheelJoints = [];
        this.wheelRaycasts = [];
        
        // Physics properties
        this.chassisBody = null;
        this.wheelBodies = [];
        this.vehiclePhysics = null;
        
        // Vehicle characteristics
        this.speed = 0;
        this.maxSpeed = 80;
        this.acceleration = 0.5;
        this.deceleration = 0.2;
        this.brakeForce = 1.5;
        this.turnSpeed = 0.05;
        this.wheelBase = 4; // Distance between front and rear wheels
        this.wheelTrack = 2; // Distance between left and right wheels
        this.wheelRadius = 0.7;
        this.steeringAngle = 0;
        this.maxSteeringAngle = Math.PI / 6; // 30 degrees
        this.position = new BABYLON.Vector3(0, 0, 0);
        this.rotation = 0;
        
        // Suspension properties
        this.suspensionRestLength = 0.6;
        this.suspensionStiffness = 30;
        this.suspensionDamping = 4.4;
        this.suspensionCompression = 2.3;
        this.suspensionTravel = 0.3;
        
        // Wheel properties
        this.wheelFriction = 1000;
        this.wheelRollInfluence = 0.1;
        
        // Terrain interaction
        this.terrainFrictionModifiers = {
            road: 1.0,
            dirt: 0.7,
            grass: 0.5,
            sand: 0.3
        };
        
        // Camera properties
        this.cameraMode = "follow"; // follow, chase, first-person
        this.cameras = {};
        
        // Controls
        this.controls = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            brake: false,
            handbrake: false,
            cameraToggle: false
        };
        
        // Initialize the vehicle
        this.init();
    }
    
    // Initialize the vehicle
    async init() {
        // Create a parent mesh for the vehicle
        this.mesh = new BABYLON.Mesh('vehicle', this.scene);
        
        // Load the 3D model
        await this.loadVehicleModel();
        
        // Setup physics
        await this.setupPhysics();
        
        // Setup camera
        this.setupCameras();
        
        // Setup controls
        this.setupControls();
        
        // Register update loop
        this.scene.registerBeforeRender(() => {
            this.update();
        });
    }
    
    // Load the 3D vehicle model
    async loadVehicleModel() {
        try {
            console.log("Loading 3D vehicle model...");
            
            // Create a loading indicator
            const loadingText = new BABYLON.GUI.TextBlock();
            loadingText.text = "Loading vehicle model...";
            loadingText.color = "white";
            loadingText.fontSize = 24;
            
            // Add the loading text to the UI if available
            if (window.ui && window.ui.advancedTexture) {
                window.ui.advancedTexture.addControl(loadingText);
            }
            
            // Load the model asynchronously
            const result = await BABYLON.SceneLoader.ImportMeshAsync(
                "", 
                "models/vehicles/", 
                "ToyCar.glb", 
                this.scene
            );
            
            // Remove the loading text
            if (window.ui && window.ui.advancedTexture) {
                window.ui.advancedTexture.removeControl(loadingText);
            }
            
            console.log("Vehicle model loaded successfully!");
            
            // Store the imported model
            this.carModel = result.meshes[0];
            
            // Parent the model to our vehicle mesh
            this.carModel.parent = this.mesh;
            
            // Scale the model appropriately (adjust as needed)
            this.carModel.scaling = new BABYLON.Vector3(5, 5, 5);
            
            // Position the model to align with the vehicle's center
            this.carModel.position.y = 0;
            
            // Rotate the model to face the correct direction
            this.carModel.rotation.y = Math.PI;
            
            // Enable shadows for the vehicle
            if (window.lighting && window.lighting.shadowGenerators) {
                for (const shadowGenerator of window.lighting.shadowGenerators) {
                    for (const mesh of result.meshes) {
                        shadowGenerator.addShadowCaster(mesh);
                    }
                }
            }
            
            // Create collision box for the vehicle
            this.createCollisionBox();
            
            // Create wheels (we'll use simple wheels for physics, but they'll be invisible)
            this.createWheels();
            
            // Create headlights
            this.createHeadlights();
            
        } catch (error) {
            console.error("Error loading vehicle model:", error);
            
            // Fallback to simple vehicle mesh if model loading fails
            console.log("Falling back to simple vehicle mesh...");
            this.createSimpleVehicleMesh();
        }
    }
    
    // Create a simple vehicle mesh as fallback
    createSimpleVehicleMesh() {
        // Create the vehicle body
        const body = BABYLON.MeshBuilder.CreateBox('vehicleBody', {
            width: 2.5,
            height: 1.5,
            depth: 5
        }, this.scene);
        
        // Position the body
        body.position = new BABYLON.Vector3(0, 1, 0);
        
        // Create a material for the body
        const bodyMaterial = new BABYLON.StandardMaterial('vehicleBodyMaterial', this.scene);
        bodyMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.8); // Blue
        bodyMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        body.material = bodyMaterial;
        
        // Create the cabin
        const cabin = BABYLON.MeshBuilder.CreateBox('vehicleCabin', {
            width: 2,
            height: 1.2,
            depth: 2.5
        }, this.scene);
        
        // Position the cabin
        cabin.position = new BABYLON.Vector3(0, 2.1, -0.5);
        
        // Create a material for the cabin
        const cabinMaterial = new BABYLON.StandardMaterial('vehicleCabinMaterial', this.scene);
        cabinMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.8); // Blue
        cabinMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        cabin.material = cabinMaterial;
        
        // Create windows
        const windshield = BABYLON.MeshBuilder.CreateBox('vehicleWindshield', {
            width: 1.9,
            height: 1,
            depth: 0.1
        }, this.scene);
        
        // Position the windshield
        windshield.position = new BABYLON.Vector3(0, 2.1, 0.7);
        
        // Create a material for the windows
        const glassMaterial = new BABYLON.StandardMaterial('vehicleGlassMaterial', this.scene);
        glassMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        glassMaterial.alpha = 0.5;
        glassMaterial.specularColor = new BABYLON.Color3(1, 1, 1);
        windshield.material = glassMaterial;
        
        // Parent all parts to the vehicle mesh
        body.parent = this.mesh;
        cabin.parent = this.mesh;
        windshield.parent = this.mesh;
        
        // Create wheels
        this.createWheels();
        
        // Create headlights
        this.createHeadlights();
        
        // Enable shadows for the vehicle
        if (window.lighting && window.lighting.shadowGenerators) {
            for (const shadowGenerator of window.lighting.shadowGenerators) {
                shadowGenerator.addShadowCaster(this.mesh);
            }
        }
    }
    
    // Create a collision box for the vehicle
    createCollisionBox() {
        // Create an invisible collision box
        const collisionBox = BABYLON.MeshBuilder.CreateBox('vehicleCollisionBox', {
            width: 2.5,
            height: 1.5,
            depth: 5
        }, this.scene);
        
        // Make it invisible
        collisionBox.isVisible = false;
        
        // Position it
        collisionBox.position = new BABYLON.Vector3(0, 1, 0);
        
        // Parent it to the vehicle
        collisionBox.parent = this.mesh;
        
        // Store for physics setup
        this.collisionBox = collisionBox;
    }
    
    // Create wheels
    createWheels() {
        // Wheel positions
        const wheelPositions = [
            new BABYLON.Vector3(-this.wheelTrack / 2, this.wheelRadius, this.wheelBase / 2), // Front left
            new BABYLON.Vector3(this.wheelTrack / 2, this.wheelRadius, this.wheelBase / 2),  // Front right
            new BABYLON.Vector3(-this.wheelTrack / 2, this.wheelRadius, -this.wheelBase / 2), // Rear left
            new BABYLON.Vector3(this.wheelTrack / 2, this.wheelRadius, -this.wheelBase / 2)   // Rear right
        ];
        
        // Create wheels
        for (let i = 0; i < 4; i++) {
            const wheel = BABYLON.MeshBuilder.CreateCylinder(`vehicleWheel${i}`, {
                height: 0.5,
                diameter: this.wheelRadius * 2,
                tessellation: 24
            }, this.scene);
            
            // Rotate the wheel to be horizontal
            wheel.rotation.z = Math.PI / 2;
            
            // Position the wheel
            wheel.position = wheelPositions[i];
            
            // Create a material for the wheel
            const wheelMaterial = new BABYLON.StandardMaterial(`vehicleWheelMaterial${i}`, this.scene);
            wheelMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2); // Dark gray
            wheel.material = wheelMaterial;
            
            // Make wheels invisible if we have a car model
            if (this.carModel) {
                wheel.isVisible = false;
            }
            
            // Add the wheel to the list
            this.wheelMeshes.push(wheel);
            
            // Parent the wheel to the vehicle
            wheel.parent = this.mesh;
        }
    }
    
    // Create headlights
    createHeadlights() {
        // Headlight positions
        const headlightPositions = [
            new BABYLON.Vector3(-0.8, 1, 2.5), // Left headlight
            new BABYLON.Vector3(0.8, 1, 2.5)   // Right headlight
        ];
        
        // Create headlights
        for (let i = 0; i < 2; i++) {
            // Skip creating visible headlight meshes if we have a car model
            if (!this.carModel) {
                const headlight = BABYLON.MeshBuilder.CreateSphere(`vehicleHeadlight${i}`, {
                    diameter: 0.5,
                    segments: 16
                }, this.scene);
                
                // Position the headlight
                headlight.position = headlightPositions[i];
                
                // Create a material for the headlight
                const headlightMaterial = new BABYLON.StandardMaterial(`vehicleHeadlightMaterial${i}`, this.scene);
                headlightMaterial.diffuseColor = new BABYLON.Color3(1, 1, 0.8);
                headlightMaterial.emissiveColor = new BABYLON.Color3(1, 1, 0.8);
                headlightMaterial.specularColor = new BABYLON.Color3(1, 1, 1);
                headlight.material = headlightMaterial;
                
                // Parent the headlight to the vehicle
                headlight.parent = this.mesh;
            }
            
            // Create a spotlight for the headlight
            const spotlight = new BABYLON.SpotLight(
                `vehicleSpotlight${i}`,
                headlightPositions[i],
                new BABYLON.Vector3(0, 0, 1),
                Math.PI / 4,
                2,
                this.scene
            );
            
            // Set the spotlight properties
            spotlight.diffuse = new BABYLON.Color3(1, 1, 0.8);
            spotlight.specular = new BABYLON.Color3(1, 1, 1);
            spotlight.intensity = 0.8;
            
            // Parent the spotlight to the vehicle
            spotlight.parent = this.mesh;
        }
    }
    
    // Setup multiple camera views
    setupCameras() {
        // Create a follow camera (third-person view)
        const followCamera = new BABYLON.FollowCamera('vehicleFollowCamera', 
            new BABYLON.Vector3(0, 5, -10), this.scene);
        followCamera.lockedTarget = this.mesh;
        followCamera.radius = 10; // Distance from the target
        followCamera.heightOffset = 4; // Height above the target
        followCamera.rotationOffset = 0; // Rotation around the target
        followCamera.cameraAcceleration = 0.05; // How fast the camera accelerates to follow the target
        followCamera.maxCameraSpeed = 20; // Maximum speed of the camera
        this.cameras.follow = followCamera;
        
        // Create a chase camera (closer third-person view)
        const chaseCamera = new BABYLON.FollowCamera('vehicleChaseCamera', 
            new BABYLON.Vector3(0, 3, -5), this.scene);
        chaseCamera.lockedTarget = this.mesh;
        chaseCamera.radius = 5; // Closer distance
        chaseCamera.heightOffset = 2; // Lower height
        chaseCamera.rotationOffset = 0;
        chaseCamera.cameraAcceleration = 0.1; // Faster acceleration
        chaseCamera.maxCameraSpeed = 30;
        this.cameras.chase = chaseCamera;
        
        // Create a first-person camera
        const firstPersonCamera = new BABYLON.FreeCamera('vehicleFirstPersonCamera', 
            new BABYLON.Vector3(0, 2, 0), this.scene);
        firstPersonCamera.parent = this.mesh;
        firstPersonCamera.position = new BABYLON.Vector3(0, 2, 1); // Position inside the vehicle
        firstPersonCamera.rotation = new BABYLON.Vector3(0, Math.PI, 0); // Looking forward
        this.cameras.firstPerson = firstPersonCamera;
        
        // Set the initial active camera
        this.setActiveCamera(this.cameraMode);
    }
    
    // Set the active camera based on camera mode
    setActiveCamera(mode) {
        this.cameraMode = mode;
        const camera = this.cameras[mode];
        if (camera) {
            this.scene.activeCamera = camera;
            camera.attachControl(this.scene.getEngine().getRenderingCanvas(), true);
        }
    }
    
    // Toggle between camera modes
    toggleCamera() {
        switch (this.cameraMode) {
            case 'follow':
                this.setActiveCamera('chase');
                break;
            case 'chase':
                this.setActiveCamera('firstPerson');
                break;
            case 'firstPerson':
                this.setActiveCamera('follow');
                break;
        }
    }
    
    // Setup controls
    setupControls() {
        // Keyboard controls
        this.scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
                case BABYLON.KeyboardEventTypes.KEYDOWN:
                    this.handleKeyDown(kbInfo.event.key);
                    break;
                case BABYLON.KeyboardEventTypes.KEYUP:
                    this.handleKeyUp(kbInfo.event.key);
                    break;
            }
        });
    }
    
    // Handle key down events
    handleKeyDown(key) {
        switch (key.toLowerCase()) {
            case 'w':
                this.controls.forward = true;
                break;
            case 's':
                this.controls.backward = true;
                break;
            case 'a':
                this.controls.left = true;
                break;
            case 'd':
                this.controls.right = true;
                break;
            case ' ':
                this.controls.brake = true;
                break;
            case 'shift':
                this.controls.handbrake = true;
                break;
            case 'c':
                if (!this.controls.cameraToggle) {
                    this.controls.cameraToggle = true;
                    this.toggleCamera();
                }
                break;
        }
    }
    
    // Handle key up events
    handleKeyUp(key) {
        switch (key.toLowerCase()) {
            case 'w':
                this.controls.forward = false;
                break;
            case 's':
                this.controls.backward = false;
                break;
            case 'a':
                this.controls.left = false;
                break;
            case 'd':
                this.controls.right = false;
                break;
            case ' ':
                this.controls.brake = false;
                break;
            case 'shift':
                this.controls.handbrake = false;
                break;
            case 'c':
                this.controls.cameraToggle = false;
                break;
        }
    }
    
    // Setup physics
    async setupPhysics() {
        // Check if Havok physics is available
        if (window.HavokPhysics) {
            try {
                // Initialize Havok physics
                const havokInstance = await window.HavokPhysics();
                const havokPlugin = new BABYLON.HavokPlugin(true, havokInstance);
                
                // Enable physics in the scene
                this.scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), havokPlugin);
                
                // Setup vehicle physics with Havok
                this.setupHavokVehiclePhysics();
            } catch (error) {
                console.error("Error initializing Havok physics:", error);
                // Fallback to basic physics
                this.setupBasicPhysics();
            }
        } else {
            console.log("Havok physics not available, using basic physics");
            // Add Havok physics script dynamically
            await this.loadHavokPhysics();
        }
    }
    
    // Load Havok physics dynamically
    async loadHavokPhysics() {
        return new Promise((resolve) => {
            // Create script element
            const havokScript = document.createElement('script');
            havokScript.src = 'https://cdn.babylonjs.com/havok/HavokPhysics_umd.js';
            havokScript.async = true;
            
            // Handle script load
            havokScript.onload = async () => {
                console.log("Havok physics loaded");
                try {
                    // Initialize Havok physics
                    const havokInstance = await window.HavokPhysics();
                    const havokPlugin = new BABYLON.HavokPlugin(true, havokInstance);
                    
                    // Enable physics in the scene
                    this.scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), havokPlugin);
                    
                    // Setup vehicle physics with Havok
                    this.setupHavokVehiclePhysics();
                    resolve();
                } catch (error) {
                    console.error("Error initializing Havok physics:", error);
                    // Fallback to basic physics
                    this.setupBasicPhysics();
                    resolve();
                }
            };
            
            // Handle script error
            havokScript.onerror = () => {
                console.error("Failed to load Havok physics");
                // Fallback to basic physics
                this.setupBasicPhysics();
                resolve();
            };
            
            // Add script to document
            document.body.appendChild(havokScript);
        });
    }
    
    // Setup Havok vehicle physics
    setupHavokVehiclePhysics() {
        // Create chassis physics body
        const chassisShape = new BABYLON.PhysicsShapeBox(
            new BABYLON.Vector3(2.5, 1.5, 5),
            new BABYLON.Quaternion()
        );
        
        // Create chassis physics body
        this.chassisBody = new BABYLON.PhysicsBody(
            this.collisionBox || this.mesh,
            BABYLON.PhysicsMotionType.DYNAMIC,
            false,
            this.scene
        );
        
        // Add chassis shape to body
        this.chassisBody.shape = chassisShape;
        this.chassisBody.setMassProperties({
            mass: 1500 // Vehicle mass in kg
        });
        
        // Set chassis center of mass
        this.chassisBody.setCenterOfMassTransform(
            new BABYLON.Vector3(0, -0.5, 0),
            new BABYLON.Quaternion()
        );
        
        // Create wheel physics bodies
        for (let i = 0; i < this.wheelMeshes.length; i++) {
            const wheel = this.wheelMeshes[i];
            
            // Create wheel shape
            const wheelShape = new BABYLON.PhysicsShapeCylinder(
                this.wheelRadius,
                0.5, // wheel width
                new BABYLON.Quaternion().setFromEulerAngles(0, 0, Math.PI / 2)
            );
            
            // Create wheel body
            const wheelBody = new BABYLON.PhysicsBody(
                wheel,
                BABYLON.PhysicsMotionType.DYNAMIC,
                false,
                this.scene
            );
            
            // Add wheel shape to body
            wheelBody.shape = wheelShape;
            wheelBody.setMassProperties({
                mass: 30 // Wheel mass in kg
            });
            
            // Store wheel body
            this.wheelBodies.push(wheelBody);
            
            // Create wheel joint
            const wheelJoint = new BABYLON.PhysicsConstraint6DOF(
                this.chassisBody,
                wheelBody,
                {
                    pivotA: wheel.position,
                    pivotB: new BABYLON.Vector3(0, 0, 0),
                    axisA: new BABYLON.Vector3(0, 1, 0),
                    axisB: new BABYLON.Vector3(0, 1, 0)
                }
            );
            
            // Configure joint for suspension
            wheelJoint.setLinearLimits(
                new BABYLON.Vector3(-0.1, -this.suspensionTravel, -0.1),
                new BABYLON.Vector3(0.1, this.suspensionTravel, 0.1)
            );
            
            // Allow rotation only around Z axis (wheel spin)
            wheelJoint.setAngularLimits(
                new BABYLON.Vector3(0, 0, -Math.PI),
                new BABYLON.Vector3(0, 0, Math.PI)
            );
            
            // Store wheel joint
            this.wheelJoints.push(wheelJoint);
            
            // Create raycast for wheel-terrain interaction
            this.createWheelRaycast(i);
        }
    }
    
    // Create raycast for wheel-terrain interaction
    createWheelRaycast(wheelIndex) {
        const wheel = this.wheelMeshes[wheelIndex];
        const raycastLength = this.suspensionRestLength + this.suspensionTravel + this.wheelRadius;
        
        // Create raycast helper
        const rayHelper = new BABYLON.RayHelper(
            new BABYLON.Ray(
                wheel.getAbsolutePosition(),
                new BABYLON.Vector3(0, -1, 0),
                raycastLength
            )
        );
        
        // Store raycast helper
        this.wheelRaycasts.push({
            ray: rayHelper.ray,
            helper: rayHelper,
            lastHitPoint: null,
            lastHitNormal: null,
            suspension: {
                compression: 0,
                velocity: 0,
                force: 0
            }
        });
    }
    
    // Setup basic physics (fallback if Havok is not available)
    setupBasicPhysics() {
        console.log("Setting up basic physics");
        
        // Create physics impostor for the vehicle body
        if (this.collisionBox) {
            this.collisionBox.physicsImpostor = new BABYLON.PhysicsImpostor(
                this.collisionBox,
                BABYLON.PhysicsImpostor.BoxImpostor,
                { mass: 1000, friction: 0.5, restitution: 0.2 },
                this.scene
            );
        } else {
            this.mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
                this.mesh,
                BABYLON.PhysicsImpostor.BoxImpostor,
                { mass: 1000, friction: 0.5, restitution: 0.2 },
                this.scene
            );
        }
        
        // Create physics impostors for wheels
        for (let i = 0; i < this.wheelMeshes.length; i++) {
            const wheel = this.wheelMeshes[i];
            
            wheel.physicsImpostor = new BABYLON.PhysicsImpostor(
                wheel,
                BABYLON.PhysicsImpostor.CylinderImpostor,
                { mass: 10, friction: 0.9, restitution: 0.1 },
                this.scene
            );
            
            // Create a joint between the wheel and the vehicle body
            const joint = new BABYLON.PhysicsJoint(
                BABYLON.PhysicsJoint.HingeJoint,
                {
                    mainPivot: wheel.position,
                    connectedPivot: new BABYLON.Vector3(0, 0, 0),
                    mainAxis: new BABYLON.Vector3(1, 0, 0),
                    connectedAxis: new BABYLON.Vector3(1, 0, 0)
                }
            );
            
            // Connect the joint
            if (this.collisionBox) {
                this.collisionBox.physicsImpostor.addJoint(wheel.physicsImpostor, joint);
            } else {
                this.mesh.physicsImpostor.addJoint(wheel.physicsImpostor, joint);
            }
            
            // Create raycast for wheel-terrain interaction
            this.createWheelRaycast(i);
        }
    }
    
    // Update the vehicle
    update() {
        // Update steering
        this.updateSteering();
        
        // Update speed
        this.updateSpeed();
        
        // Update wheel raycasts
        this.updateWheelRaycasts();
        
        // Update suspension
        this.updateSuspension();
        
        // Update wheel rotation
        this.updateWheels();
        
        // Update vehicle position and rotation if using basic physics
        if (!this.chassisBody) {
            this.updateBasicPhysics();
        }
    }
    
    // Update steering
    updateSteering() {
        // Reset steering angle towards center
        if (!this.controls.left && !this.controls.right) {
            if (this.steeringAngle > 0) {
                this.steeringAngle = Math.max(0, this.steeringAngle - this.turnSpeed / 2);
            } else if (this.steeringAngle < 0) {
                this.steeringAngle = Math.min(0, this.steeringAngle + this.turnSpeed / 2);
            }
        }
        
        // Apply steering input
        if (this.controls.left) {
            this.steeringAngle = Math.max(-this.maxSteeringAngle, this.steeringAngle - this.turnSpeed);
        }
        
        if (this.controls.right) {
            this.steeringAngle = Math.min(this.maxSteeringAngle, this.steeringAngle + this.turnSpeed);
        }
        
        // Reduce max steering angle at high speeds
        const speedFactor = Math.min(1, 1 - (Math.abs(this.speed) / this.maxSpeed) * 0.5);
        const effectiveSteeringAngle = this.steeringAngle * speedFactor;
        
        // Rotate front wheels
        if (this.wheelMeshes.length >= 2) {
            this.wheelMeshes[0].rotation.y = effectiveSteeringAngle;
            this.wheelMeshes[1].rotation.y = effectiveSteeringAngle;
            
            // Apply steering to wheel physics if using Havok
            if (this.wheelBodies && this.wheelBodies.length >= 2) {
                // Apply steering to front wheels
                const steeringQuat = new BABYLON.Quaternion().setFromEulerAngles(0, effectiveSteeringAngle, 0);
                this.wheelBodies[0].setAngularVelocity(new BABYLON.Vector3(0, effectiveSteeringAngle * 2, 0));
                this.wheelBodies[1].setAngularVelocity(new BABYLON.Vector3(0, effectiveSteeringAngle * 2, 0));
            }
        }
    }
    
    // Update speed
    updateSpeed() {
        // Apply brakes
        if (this.controls.brake) {
            if (this.speed > 0) {
                this.speed = Math.max(0, this.speed - this.brakeForce);
            } else if (this.speed < 0) {
                this.speed = Math.min(0, this.speed + this.brakeForce);
            }
            
            // Apply brake force to wheels if using Havok
            if (this.wheelBodies) {
                for (const wheelBody of this.wheelBodies) {
                    wheelBody.setAngularDamping(0.9);
                }
            }
            
            return;
        }
        
        // Reset wheel damping if not braking
        if (this.wheelBodies) {
            for (const wheelBody of this.wheelBodies) {
                wheelBody.setAngularDamping(0.1);
            }
        }
        
        // Apply handbrake (locks rear wheels)
        if (this.controls.handbrake && this.wheelBodies && this.wheelBodies.length >= 4) {
            this.wheelBodies[2].setAngularDamping(0.95);
            this.wheelBodies[3].setAngularDamping(0.95);
        }
        
        // Apply acceleration
        if (this.controls.forward) {
            // Gradually increase acceleration as speed increases up to a point
            const accelerationFactor = 1 - Math.min(0.7, Math.abs(this.speed) / this.maxSpeed);
            this.speed = Math.min(this.maxSpeed, this.speed + this.acceleration * accelerationFactor);
        } else if (this.controls.backward) {
            // Limit reverse speed to half of max speed
            this.speed = Math.max(-this.maxSpeed / 2, this.speed - this.acceleration);
        } else {
            // Apply natural deceleration
            if (this.speed > 0) {
                this.speed = Math.max(0, this.speed - this.deceleration);
            } else if (this.speed < 0) {
                this.speed = Math.min(0, this.speed + this.deceleration);
            }
        }
        
        // Apply engine force to wheels if using Havok
        if (this.wheelBodies) {
            // Calculate engine force based on speed
            const engineForce = this.speed * 50;
            
            // Apply to rear wheels (rear-wheel drive)
            if (this.wheelBodies.length >= 4) {
                const wheelTorque = new BABYLON.Vector3(engineForce, 0, 0);
                this.wheelBodies[2].applyTorque(wheelTorque);
                this.wheelBodies[3].applyTorque(wheelTorque);
            }
        }
    }
    
    // Update wheel raycasts
    updateWheelRaycasts() {
        for (let i = 0; i < this.wheelRaycasts.length; i++) {
            const raycast = this.wheelRaycasts[i];
            const wheel = this.wheelMeshes[i];
            
            // Update ray position and direction
            const wheelPos = wheel.getAbsolutePosition();
            raycast.ray.origin = new BABYLON.Vector3(wheelPos.x, wheelPos.y, wheelPos.z);
            
            // Get wheel's down direction in world space
            const downDirection = new BABYLON.Vector3(0, -1, 0);
            const wheelRotation = wheel.getWorldMatrix().getRotationMatrix();
            const worldDownDirection = BABYLON.Vector3.TransformNormal(downDirection, wheelRotation);
            raycast.ray.direction = worldDownDirection;
            
            // Cast the ray
            const hit = this.scene.pickWithRay(raycast.ray);
            
            if (hit.hit) {
                // Store hit information
                raycast.lastHitPoint = hit.pickedPoint;
                raycast.lastHitNormal = hit.getNormal();
                
                // Calculate suspension compression
                const hitDistance = BABYLON.Vector3.Distance(raycast.ray.origin, hit.pickedPoint);
                const rayLength = this.suspensionRestLength + this.wheelRadius;
                raycast.suspension.compression = Math.max(0, rayLength - hitDistance);
                
                // Calculate suspension velocity (change in compression)
                const oldCompression = raycast.suspension.compression;
                raycast.suspension.velocity = raycast.suspension.compression - oldCompression;
                
                // Calculate suspension force
                raycast.suspension.force = this.suspensionStiffness * raycast.suspension.compression;
                
                // Apply suspension force if using Havok
                if (this.wheelBodies && this.wheelBodies[i]) {
                    const suspensionForce = raycast.lastHitNormal.scale(raycast.suspension.force);
                    this.wheelBodies[i].applyForce(suspensionForce, raycast.lastHitPoint);
                    
                    // Apply opposite force to chassis
                    if (this.chassisBody) {
                        this.chassisBody.applyForce(suspensionForce.scale(-1), raycast.lastHitPoint);
                    }
                }
            } else {
                // Wheel is in the air
                raycast.lastHitPoint = null;
                raycast.lastHitNormal = null;
                raycast.suspension.compression = 0;
                raycast.suspension.velocity = 0;
                raycast.suspension.force = 0;
            }
        }
    }
    
    // Update suspension
    updateSuspension() {
        for (let i = 0; i < this.wheelMeshes.length; i++) {
            const wheel = this.wheelMeshes[i];
            const raycast = this.wheelRaycasts[i];
            
            if (raycast.lastHitPoint) {
                // Calculate wheel position based on suspension compression
                const compressionRatio = raycast.suspension.compression / this.suspensionTravel;
                const suspensionOffset = compressionRatio * this.suspensionTravel;
                
                // Adjust wheel position based on suspension compression
                const originalPos = wheel.position.clone();
                wheel.position.y = this.wheelRadius - suspensionOffset;
                
                // If using Havok, update wheel body position
                if (this.wheelBodies && this.wheelBodies[i]) {
                    const worldPos = wheel.getAbsolutePosition();
                    this.wheelBodies[i].setLinearVelocity(new BABYLON.Vector3(0, -raycast.suspension.velocity * 10, 0));
                }
            } else {
                // Wheel is in the air, reset to rest position
                wheel.position.y = this.wheelRadius;
            }
        }
    }
    
    // Update wheel rotation
    updateWheels() {
        // Rotate wheels based on speed
        const wheelRotation = this.speed * 0.1;
        
        for (let i = 0; i < this.wheelMeshes.length; i++) {
            // Apply rotation to visual wheels
            this.wheelMeshes[i].rotation.x += wheelRotation;
            
            // If using Havok, apply angular velocity to wheel bodies
            if (this.wheelBodies && this.wheelBodies[i]) {
                // Only apply to wheels that are in contact with the ground
                if (this.wheelRaycasts[i].lastHitPoint) {
                    const angularVelocity = new BABYLON.Vector3(this.speed * 2, 0, 0);
                    this.wheelBodies[i].setAngularVelocity(angularVelocity);
                }
            }
        }
    }
    
    // Update vehicle position and rotation for basic physics
    updateBasicPhysics() {
        if (this.speed !== 0) {
            // Calculate turn radius based on steering angle
            const turnRadius = this.wheelBase / Math.sin(Math.abs(this.steeringAngle) + 0.0001);
            
            // Calculate angular velocity
            const angularVelocity = this.speed / turnRadius * Math.sign(this.steeringAngle);
            
            // Update rotation
            this.rotation += angularVelocity;
            
            // Update position
            const moveX = Math.sin(this.rotation) * this.speed;
            const moveZ = Math.cos(this.rotation) * this.speed;
            
            // Apply movement
            this.mesh.position.x += moveX;
            this.mesh.position.z += moveZ;
            
            // Apply rotation
            this.mesh.rotation.y = this.rotation;
            
            // Adjust to terrain height
            this.adjustToTerrain();
        }
    }
    
    // Adjust vehicle to terrain height
    adjustToTerrain() {
        // Check if environment is available
        if (window.environment) {
            // Get the height at the vehicle's position
            const height = window.environment.getHeightAtPosition(
                this.mesh.position.x,
                this.mesh.position.z
            );
            
            // Adjust the vehicle's height
            if (height !== null) {
                // Smoothly adjust the height
                const targetY = height + this.wheelRadius;
                this.mesh.position.y = targetY;
                
                // Adjust the vehicle's pitch and roll based on terrain
                if (this.wheelRaycasts.length >= 4 && 
                    this.wheelRaycasts[0].lastHitPoint && 
                    this.wheelRaycasts[1].lastHitPoint && 
                    this.wheelRaycasts[2].lastHitPoint && 
                    this.wheelRaycasts[3].lastHitPoint) {
                    
                    // Calculate normal vector from wheel hit points
                    const frontMidpoint = BABYLON.Vector3.Lerp(
                        this.wheelRaycasts[0].lastHitPoint,
                        this.wheelRaycasts[1].lastHitPoint,
                        0.5
                    );
                    
                    const rearMidpoint = BABYLON.Vector3.Lerp(
                        this.wheelRaycasts[2].lastHitPoint,
                        this.wheelRaycasts[3].lastHitPoint,
                        0.5
                    );
                    
                    const leftMidpoint = BABYLON.Vector3.Lerp(
                        this.wheelRaycasts[0].lastHitPoint,
                        this.wheelRaycasts[2].lastHitPoint,
                        0.5
                    );
                    
                    const rightMidpoint = BABYLON.Vector3.Lerp(
                        this.wheelRaycasts[1].lastHitPoint,
                        this.wheelRaycasts[3].lastHitPoint,
                        0.5
                    );
                    
                    // Calculate forward and right vectors
                    const forwardVector = rearMidpoint.subtract(frontMidpoint).normalize();
                    const rightVector = leftMidpoint.subtract(rightMidpoint).normalize();
                    
                    // Calculate up vector (normal to the plane)
                    const upVector = BABYLON.Vector3.Cross(forwardVector, rightVector).normalize();
                    
                    // Create rotation matrix from vectors
                    const rotationMatrix = BABYLON.Matrix.FromXYZAxes(rightVector, upVector, forwardVector);
                    
                    // Extract rotation quaternion
                    const rotationQuaternion = BABYLON.Quaternion.FromRotationMatrix(rotationMatrix);
                    
                    // Apply rotation with smoothing
                    if (!this.mesh.rotationQuaternion) {
                        this.mesh.rotationQuaternion = rotationQuaternion;
                    } else {
                        // Smoothly interpolate rotation
                        BABYLON.Quaternion.SlerpToRef(
                            this.mesh.rotationQuaternion,
                            rotationQuaternion,
                            0.1,
                            this.mesh.rotationQuaternion
                        );
                    }
                }
            }
        }
    }
    
    // Get the vehicle's current speed in km/h
    getSpeedKmh() {
        return Math.abs(this.speed) * 20; // Arbitrary conversion to km/h
    }
    
    // Get the vehicle's current position
    getPosition() {
        return this.mesh.position;
    }
    
    // Reset the vehicle
    reset() {
        // Reset position and rotation
        this.mesh.position = new BABYLON.Vector3(0, 0, 0);
        this.mesh.rotation = new BABYLON.Vector3(0, 0, 0);
        
        // Reset speed and steering
        this.speed = 0;
        this.steeringAngle = 0;
        
        // Reset controls
        this.controls.forward = false;
        this.controls.backward = false;
        this.controls.left = false;
        this.controls.right = false;
        this.controls.brake = false;
        this.controls.handbrake = false;
    }
}

// Initialize the vehicle when the scene is ready
let vehicle;
window.addEventListener('DOMContentLoaded', () => {
    // Wait for the scene to be created
    const checkScene = setInterval(() => {
        if (window.scene) {
            // Wait for the environment to be created
            const checkEnvironment = setInterval(() => {
                if (window.environment) {
                    vehicle = new Vehicle(window.scene);
                    clearInterval(checkEnvironment);
                }
            }, 100);
            
            clearInterval(checkScene);
        }
    }, 100);
});