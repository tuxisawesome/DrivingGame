// lighting.js - Advanced lighting and ray-tracing effects for the 3D driving game

// Lighting class to handle all lighting-related functionality
class Lighting {
    constructor(scene) {
        this.scene = scene;
        this.lights = [];
        this.shadowGenerators = [];
        this.reflectionProbes = [];
        
        // Initialize lighting
        this.init();
    }
    
    // Initialize lighting
    init() {
        // Setup PBR environment
        this.setupPBREnvironment();
        
        // Create the main lighting
        this.createMainLighting();
        
        // Create environment lighting
        this.createEnvironmentLighting();
        
        // Create reflection probes
        this.createReflectionProbes();
        
        // Create post-processing effects
        this.createPostProcessing();
        
        // Setup screen space reflections
        this.setupScreenSpaceReflections();
    }
    
    // Setup PBR environment for realistic materials
    setupPBREnvironment() {
        // Create and set the environment texture for PBR materials
        const envTexture = new BABYLON.CubeTexture("textures/environment.png", this.scene);
        this.scene.environmentTexture = envTexture;
        
        // Configure the image processing for better visual quality
        if (!this.scene.imageProcessingConfiguration) {
            this.scene.imageProcessingConfiguration = new BABYLON.ImageProcessingConfiguration();
        }
        
        // Enable tone mapping for better HDR to LDR conversion
        this.scene.imageProcessingConfiguration.toneMappingEnabled = true;
        this.scene.imageProcessingConfiguration.toneMappingType = BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;
        
        // Adjust exposure for better lighting balance
        this.scene.imageProcessingConfiguration.exposure = 1.2;
        
        // Enable contrast enhancement
        this.scene.imageProcessingConfiguration.contrast = 1.1;
        
        // Create a skybox using the environment texture
        const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, this.scene);
        const skyboxMaterial = new BABYLON.StandardMaterial("skyBoxMaterial", this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = envTexture.clone();
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.disableLighting = true;
        skybox.material = skyboxMaterial;
        skybox.infiniteDistance = true;
    }
    
    // Create main lighting (sun/moon)
    createMainLighting() {
        // Create a directional light (sun)
        const sunLight = new BABYLON.DirectionalLight('sunLight', new BABYLON.Vector3(-0.5, -1, -0.5), this.scene);
        sunLight.intensity = 1.0; // Increased intensity for better illumination
        sunLight.position = new BABYLON.Vector3(500, 500, 500);
        
        // Set light color to warm sunlight
        sunLight.diffuse = new BABYLON.Color3(1, 0.95, 0.8);
        sunLight.specular = new BABYLON.Color3(1, 0.95, 0.8);
        
        // Create high-quality shadows from the sun
        const shadowGenerator = new BABYLON.ShadowGenerator(2048, sunLight);
        
        // Use Percentage Closer Filtering for better shadow quality
        shadowGenerator.usePercentageCloserFiltering = true;
        shadowGenerator.filteringQuality = BABYLON.ShadowGenerator.QUALITY_HIGH;
        
        // Use contact hardening for more realistic shadows
        shadowGenerator.contactHardeningLightSizeUVRatio = 0.05;
        
        // Adjust bias to prevent shadow acne
        shadowGenerator.bias = 0.001;
        
        // Use blur exponential shadow map for smoother shadows
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.blurKernel = 32;
        shadowGenerator.depthScale = 50;
        
        // Store the shadow generator
        this.shadowGenerators.push(shadowGenerator);
        
        // Add the light to the list
        this.lights.push(sunLight);
        
        // Create a hemispheric light for ambient lighting
        const hemisphericLight = new BABYLON.HemisphericLight('hemisphericLight', new BABYLON.Vector3(0, 1, 0), this.scene);
        hemisphericLight.intensity = 0.5;
        hemisphericLight.groundColor = new BABYLON.Color3(0.2, 0.2, 0.3); // Bluish ground color
        hemisphericLight.specular = new BABYLON.Color3(0.1, 0.1, 0.1);
        
        // Add the light to the list
        this.lights.push(hemisphericLight);
    }
    
    // Create environment lighting (street lights, building lights, etc.)
    createEnvironmentLighting() {
        // Add street lights along the roads
        this.createStreetLights();
        
        // Add building lights in the city
        this.createBuildingLights();
        
        // Add area lights for more realistic lighting
        this.createAreaLights();
    }
    
    // Create area lights for more realistic lighting
    createAreaLights() {
        // Wait for the environment to be created
        const checkEnvironment = setInterval(() => {
            if (window.environment) {
                // Clear the interval
                clearInterval(checkEnvironment);
                
                // Create area lights in key locations
                this.createAreaLight(
                    new BABYLON.Vector3(100, 10, 100),
                    new BABYLON.Vector3(20, 0, 20),
                    new BABYLON.Color3(1, 0.9, 0.7),
                    0.8
                );
                
                this.createAreaLight(
                    new BABYLON.Vector3(-100, 10, -100),
                    new BABYLON.Vector3(15, 0, 15),
                    new BABYLON.Color3(0.8, 0.9, 1),
                    0.6
                );
            }
        }, 100);
    }
    
    // Create an area light
    createAreaLight(position, size, color, intensity) {
        // Create a rectangle light
        const areaLight = new BABYLON.HemisphericLight(
            `areaLight-${position.x}-${position.z}`,
            new BABYLON.Vector3(0, -1, 0),
            this.scene
        );
        
        areaLight.position = position;
        areaLight.intensity = intensity;
        areaLight.diffuse = color;
        areaLight.specular = color;
        
        // Add the light to the list
        this.lights.push(areaLight);
        
        // Create a plane to visualize the area light
        const plane = BABYLON.MeshBuilder.CreatePlane(
            `areaLightPlane-${position.x}-${position.z}`,
            { width: size.x, height: size.z },
            this.scene
        );
        
        plane.position = position;
        plane.rotation.x = Math.PI / 2;
        
        // Create an emissive material for the plane
        const material = new BABYLON.StandardMaterial(`areaLightMaterial-${position.x}-${position.z}`, this.scene);
        material.diffuseColor = new BABYLON.Color3(0, 0, 0);
        material.specularColor = new BABYLON.Color3(0, 0, 0);
        material.emissiveColor = color;
        material.disableLighting = true;
        
        plane.material = material;
    }
    
    // Create street lights along the roads
    createStreetLights() {
        // Wait for the environment to be created
        const checkEnvironment = setInterval(() => {
            if (window.environment && window.environment.roadMeshes) {
                // Clear the interval
                clearInterval(checkEnvironment);
                
                // Add street lights along the roads
                for (const road of window.environment.roadMeshes) {
                    // Get road position and dimensions
                    const roadPos = road.position;
                    const roadWidth = road.getBoundingInfo().boundingBox.extendSize.x * 2;
                    const roadLength = road.getBoundingInfo().boundingBox.extendSize.z * 2;
                    const roadRotation = road.rotation.y;
                    
                    // Add street lights along the road
                    const lightSpacing = 100; // Space between lights
                    const lightHeight = 10;   // Height of the light
                    
                    // Calculate the number of lights based on road length
                    const numLights = Math.max(2, Math.floor(roadLength / lightSpacing));
                    
                    for (let i = 0; i < numLights; i++) {
                        // Calculate light position along the road
                        let lightX, lightZ;
                        
                        if (Math.abs(Math.sin(roadRotation)) < 0.1) {
                            // Road runs along X-axis
                            lightX = roadPos.x - roadLength / 2 + i * (roadLength / (numLights - 1));
                            lightZ = roadPos.z + roadWidth / 2 + 5; // Offset from the edge of the road
                        } else {
                            // Road runs along Z-axis
                            lightX = roadPos.x + roadWidth / 2 + 5; // Offset from the edge of the road
                            lightZ = roadPos.z - roadLength / 2 + i * (roadLength / (numLights - 1));
                        }
                        
                        // Create a street light
                        this.createStreetLight(lightX, lightZ, lightHeight);
                    }
                }
            }
        }, 100);
    }
    
    // Create a single street light with PBR materials
    createStreetLight(x, z, height) {
        // Create a point light for the street light
        const light = new BABYLON.PointLight(`streetLight-${x}-${z}`, new BABYLON.Vector3(x, height, z), this.scene);
        light.intensity = 0.8; // Increased intensity
        light.diffuse = new BABYLON.Color3(1, 0.9, 0.7); // Warm light color
        light.specular = new BABYLON.Color3(1, 0.9, 0.7);
        light.range = 50; // Light range
        
        // Add the light to the list
        this.lights.push(light);
        
        // Create a light pole mesh
        const pole = BABYLON.MeshBuilder.CreateCylinder(`lightPole-${x}-${z}`, {
            height: height,
            diameter: 0.5
        }, this.scene);
        
        pole.position = new BABYLON.Vector3(x, height / 2, z);
        
        // Create PBR material for the pole
        const poleMaterial = new BABYLON.PBRMaterial(`poleMaterial-${x}-${z}`, this.scene);
        poleMaterial.metallic = 0.8;
        poleMaterial.roughness = 0.4;
        poleMaterial.albedoColor = new BABYLON.Color3(0.2, 0.2, 0.2); // Dark gray
        pole.material = poleMaterial;
        
        // Create a light fixture
        const fixture = BABYLON.MeshBuilder.CreateSphere(`lightFixture-${x}-${z}`, {
            diameter: 1.5,
            segments: 16 // Increased segments for smoother appearance
        }, this.scene);
        
        fixture.position = new BABYLON.Vector3(x, height, z);
        
        // Create PBR material for the fixture
        const fixtureMaterial = new BABYLON.PBRMaterial(`fixtureMaterial-${x}-${z}`, this.scene);
        fixtureMaterial.metallic = 0.5;
        fixtureMaterial.roughness = 0.2;
        fixtureMaterial.albedoColor = new BABYLON.Color3(0.8, 0.8, 0.6);
        fixtureMaterial.emissiveColor = new BABYLON.Color3(0.8, 0.8, 0.6);
        fixtureMaterial.emissiveIntensity = 0.8;
        fixture.material = fixtureMaterial;
        
        // Add a light cone effect with PBR material
        const cone = BABYLON.MeshBuilder.CreateCylinder(`lightCone-${x}-${z}`, {
            height: 10,
            diameterTop: 0.5,
            diameterBottom: 8,
            tessellation: 32, // Increased tessellation for smoother appearance
            subdivisions: 4   // Increased subdivisions for better quality
        }, this.scene);
        
        cone.position = new BABYLON.Vector3(x, height - 5, z);
        cone.rotation.x = Math.PI; // Point downward
        
        // Create PBR material for the cone
        const coneMaterial = new BABYLON.PBRMaterial(`coneMaterial-${x}-${z}`, this.scene);
        coneMaterial.albedoColor = new BABYLON.Color3(1, 0.9, 0.7);
        coneMaterial.emissiveColor = new BABYLON.Color3(1, 0.9, 0.7);
        coneMaterial.emissiveIntensity = 0.5;
        coneMaterial.alpha = 0.2; // Make it transparent
        coneMaterial.metallic = 0;
        coneMaterial.roughness = 0.4;
        coneMaterial.transparencyMode = BABYLON.PBRMaterial.PBRMATERIAL_ALPHABLEND;
        coneMaterial.disableLighting = true;
        cone.material = coneMaterial;
        
        // Add shadows to the street light
        for (const shadowGenerator of this.shadowGenerators) {
            shadowGenerator.addShadowCaster(pole);
            shadowGenerator.addShadowCaster(fixture);
        }
    }
    
    // Create building lights in the city
    createBuildingLights() {
        // Wait for the environment to be created
        const checkEnvironment = setInterval(() => {
            if (window.environment && window.environment.buildingMeshes) {
                // Clear the interval
                clearInterval(checkEnvironment);
                
                // Add lights to some buildings
                for (let i = 0; i < window.environment.buildingMeshes.length; i += 5) {
                    const building = window.environment.buildingMeshes[i];
                    
                    // Get building position and dimensions
                    const buildingPos = building.position;
                    const buildingHeight = building.getBoundingInfo().boundingBox.extendSize.y * 2;
                    
                    // Create a light at the top of the building
                    const light = new BABYLON.PointLight(`buildingLight-${i}`, 
                        new BABYLON.Vector3(
                            buildingPos.x, 
                            buildingHeight + 5, 
                            buildingPos.z
                        ), 
                        this.scene
                    );
                    
                    light.intensity = 0.5;
                    light.diffuse = new BABYLON.Color3(0.8, 0.8, 1.0); // Bluish light
                    light.specular = new BABYLON.Color3(0.8, 0.8, 1.0);
                    light.range = 80; // Increased range
                    
                    // Add the light to the list
                    this.lights.push(light);
                    
                    // Create a light emitter mesh
                    const emitter = BABYLON.MeshBuilder.CreateBox(`buildingLightEmitter-${i}`, {
                        width: 2,
                        height: 1,
                        depth: 2
                    }, this.scene);
                    
                    emitter.position = new BABYLON.Vector3(
                        buildingPos.x, 
                        buildingHeight + 2, 
                        buildingPos.z
                    );
                    
                    // Create PBR material for the emitter
                    const emitterMaterial = new BABYLON.PBRMaterial(`emitterMaterial-${i}`, this.scene);
                    emitterMaterial.albedoColor = new BABYLON.Color3(0.2, 0.2, 0.2);
                    emitterMaterial.emissiveColor = new BABYLON.Color3(0.8, 0.8, 1.0);
                    emitterMaterial.emissiveIntensity = 1.0;
                    emitterMaterial.metallic = 0.8;
                    emitterMaterial.roughness = 0.2;
                    emitter.material = emitterMaterial;
                }
            }
        }, 100);
    }
    
    // Create reflection probes for realistic reflections
    createReflectionProbes() {
        // Wait for the environment to be created
        const checkEnvironment = setInterval(() => {
            if (window.environment) {
                // Clear the interval
                clearInterval(checkEnvironment);
                
                // Create reflection probes in key areas
                this.createReflectionProbe(new BABYLON.Vector3(0, 50, 0), 200);
                
                // Create additional reflection probes for different areas
                if (window.environment.cityCenter) {
                    this.createReflectionProbe(window.environment.cityCenter, 150);
                }
                
                if (window.environment.highwayCenter) {
                    this.createReflectionProbe(window.environment.highwayCenter, 300);
                }
                
                if (window.environment.countrysideCenter) {
                    this.createReflectionProbe(window.environment.countrysideCenter, 500);
                }
            }
        }, 100);
    }
    
    // Create a reflection probe at the specified position
    createReflectionProbe(position, renderSize) {
        // Create a reflection probe
        const probe = new BABYLON.ReflectionProbe(`reflectionProbe-${position.x}-${position.z}`, renderSize || 512, this.scene);
        
        // Set the probe position
        probe.position = position;
        
        // Add the probe to the list
        this.reflectionProbes.push(probe);
        
        return probe;
    }
    
    // Setup screen space reflections
    setupScreenSpaceReflections() {
        try {
            // Check if the browser supports WebGPU for advanced rendering
            if (this.scene.getEngine().supportsWebGPU) {
                // Create a screen space reflection post-process
                const ssrRenderPipeline = new BABYLON.ScreenSpaceReflectionPostProcess(
                    "ssr",
                    this.scene,
                    1.0,
                    this.scene.activeCamera
                );
                
                // Configure SSR parameters
                ssrRenderPipeline.threshold = 0.5;
                ssrRenderPipeline.reflectionSpecularFalloffExponent = 3;
                ssrRenderPipeline.strength = 0.8;
                ssrRenderPipeline.reflectionEnabled = true;
                
                console.log("Screen Space Reflections enabled");
            } else {
                console.log("WebGPU not supported, using fallback reflection techniques");
                
                // Use environment reflections as fallback
                this.scene.environmentTexture = new BABYLON.CubeTexture("textures/environment.png", this.scene);
            }
        } catch (error) {
            console.warn("Error setting up screen space reflections:", error);
            console.log("Using fallback reflection techniques");
        }
    }
    
    // Create post-processing effects
    createPostProcessing() {
        // Create a default pipeline
        const pipeline = new BABYLON.DefaultRenderingPipeline(
            "defaultPipeline", 
            true, 
            this.scene, 
            [this.scene.activeCamera]
        );
        
        // Enable anti-aliasing
        pipeline.samples = 4;
        pipeline.fxaaEnabled = true;
        
        // Enable bloom with improved settings
        pipeline.bloomEnabled = true;
        pipeline.bloomThreshold = 0.7;
        pipeline.bloomWeight = 0.5;
        pipeline.bloomKernel = 64;
        pipeline.bloomScale = 0.5;
        
        // Enable depth of field with improved settings
        pipeline.depthOfFieldEnabled = true;
        pipeline.depthOfFieldBlurLevel = BABYLON.DepthOfFieldEffectBlurLevel.Medium;
        pipeline.depthOfField.focalLength = 150;
        pipeline.depthOfField.fStop = 1.4;
        pipeline.depthOfField.focusDistance = 2000;
        
        // Enable tone mapping
        pipeline.imageProcessingEnabled = true;
        pipeline.imageProcessing.toneMappingEnabled = true;
        pipeline.imageProcessing.toneMappingType = BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;
        pipeline.imageProcessing.exposure = 1.2;
        pipeline.imageProcessing.contrast = 1.1;
        
        // Enable chromatic aberration
        pipeline.chromaticAberrationEnabled = true;
        pipeline.chromaticAberration.aberrationAmount = 0.5;
        pipeline.chromaticAberration.radialIntensity = 0.5;
        
        // Enable vignette effect
        pipeline.imageProcessing.vignetteEnabled = true;
        pipeline.imageProcessing.vignetteCentreX = 0;
        pipeline.imageProcessing.vignetteCentreY = 0;
        pipeline.imageProcessing.vignetteWeight = 1.5;
        pipeline.imageProcessing.vignetteStretch = 0.5;
        pipeline.imageProcessing.vignetteColor = new BABYLON.Color4(0, 0, 0, 0);
        pipeline.imageProcessing.vignetteBlendMode = BABYLON.ImageProcessingConfiguration.VIGNETTEMODE_MULTIPLY;
        
        // Create a lens flare effect for the sun
        this.createLensFlare();
    }
    
    // Create a lens flare effect for the sun
    createLensFlare() {
        // Wait for the scene to be fully loaded
        this.scene.executeWhenReady(() => {
            // Create a lens flare system
            const lensFlareSystem = new BABYLON.LensFlareSystem("lensFlareSystem", this.lights[0], this.scene);
            
            // Create lens flare textures
            const flareTexture = new BABYLON.Texture("textures/flare.png", this.scene);
            
            // Add flares with improved settings
            new BABYLON.LensFlare(0.2, 0, new BABYLON.Color3(1, 1, 1), flareTexture, lensFlareSystem);
            new BABYLON.LensFlare(0.5, 0.2, new BABYLON.Color3(0.5, 0.5, 1), flareTexture, lensFlareSystem);
            new BABYLON.LensFlare(0.2, 1.0, new BABYLON.Color3(1, 1, 0.5), flareTexture, lensFlareSystem);
            new BABYLON.LensFlare(0.4, 0.4, new BABYLON.Color3(1, 0.5, 1), flareTexture, lensFlareSystem);
            new BABYLON.LensFlare(0.1, 0.6, new BABYLON.Color3(0.5, 1, 1), flareTexture, lensFlareSystem);
            new BABYLON.LensFlare(0.3, 0.8, new BABYLON.Color3(1, 1, 1), flareTexture, lensFlareSystem);
        });
    }
    
    // Create PBR materials for a mesh
    createPBRMaterial(mesh, options = {}) {
        // Create a PBR material
        const material = new BABYLON.PBRMaterial(mesh.name + "-material", this.scene);
        
        // Set material properties
        material.metallic = options.metallic !== undefined ? options.metallic : 0.5;
        material.roughness = options.roughness !== undefined ? options.roughness : 0.3;
        material.albedoColor = options.albedoColor || new BABYLON.Color3(1, 1, 1);
        
        // Set reflectivity
        if (options.reflectivity !== undefined) {
            material.reflectivity = options.reflectivity;
        }
        
        // Set emissive color
        if (options.emissiveColor) {
            material.emissiveColor = options.emissiveColor;
            
            if (options.emissiveIntensity !== undefined) {
                material.emissiveIntensity = options.emissiveIntensity;
            }
        }
        
        // Set alpha if specified
        if (options.alpha !== undefined) {
            material.alpha = options.alpha;
            material.transparencyMode = BABYLON.PBRMaterial.PBRMATERIAL_ALPHABLEND;
        }
        
        // Set clear coat if specified
        if (options.clearCoat) {
            material.clearCoat.isEnabled = true;
            material.clearCoat.intensity = options.clearCoat.intensity || 1.0;
            material.clearCoat.roughness = options.clearCoat.roughness || 0.1;
        }
        
        // Apply the material to the mesh
        mesh.material = material;
        
        return material;
    }
    
    // Add shadows to a mesh
    addShadowCaster(mesh) {
        for (const shadowGenerator of this.shadowGenerators) {
            shadowGenerator.addShadowCaster(mesh);
        }
    }
    
    // Enable shadows for a mesh
    enableShadowReceiver(mesh) {
        mesh.receiveShadows = true;
    }
    
    // Apply PBR materials to the vehicle
    applyVehicleMaterials(vehicle) {
        if (!vehicle || !vehicle.mesh) return;
        
        // Apply PBR material to the vehicle body
        this.createPBRMaterial(vehicle.mesh, {
            metallic: 0.9,
            roughness: 0.15,
            albedoColor: vehicle.color || new BABYLON.Color3(0.8, 0.1, 0.1),
            clearCoat: {
                intensity: 1.0,
                roughness: 0.1
            }
        });
        
        // Apply materials to vehicle parts if they exist
        if (vehicle.wheels) {
            for (const wheel of vehicle.wheels) {
                this.createPBRMaterial(wheel, {
                    metallic: 0.5,
                    roughness: 0.6,
                    albedoColor: new BABYLON.Color3(0.1, 0.1, 0.1)
                });
            }
        }
        
        if (vehicle.windows) {
            this.createPBRMaterial(vehicle.windows, {
                metallic: 0.0,
                roughness: 0.05,
                albedoColor: new BABYLON.Color3(0.3, 0.3, 0.5),
                alpha: 0.7
            });
        }
        
        // Add the vehicle as a shadow caster
        this.addShadowCaster(vehicle.mesh);
    }
    
    // Apply PBR materials to the environment
    applyEnvironmentMaterials() {
        // Wait for the environment to be created
        const checkEnvironment = setInterval(() => {
            if (window.environment) {
                // Clear the interval
                clearInterval(checkEnvironment);
                
                // Apply materials to roads
                if (window.environment.roadMeshes) {
                    for (const road of window.environment.roadMeshes) {
                        this.createPBRMaterial(road, {
                            metallic: 0.1,
                            roughness: 0.8,
                            albedoColor: new BABYLON.Color3(0.2, 0.2, 0.2)
                        });
                        
                        // Enable shadows for the road
                        this.enableShadowReceiver(road);
                    }
                }
                
                // Apply materials to buildings
                if (window.environment.buildingMeshes) {
                    for (const building of window.environment.buildingMeshes) {
                        // Create a random color for the building
                        const color = new BABYLON.Color3(
                            0.5 + Math.random() * 0.5,
                            0.5 + Math.random() * 0.5,
                            0.5 + Math.random() * 0.5
                        );
                        
                        this.createPBRMaterial(building, {
                            metallic: 0.2,
                            roughness: 0.6,
                            albedoColor: color
                        });
                        
                        // Add the building as a shadow caster
                        this.addShadowCaster(building);
                        
                        // Enable shadows for the building
                        this.enableShadowReceiver(building);
                    }
                }
                
                // Apply materials to terrain
                if (window.environment.terrainMesh) {
                    this.createPBRMaterial(window.environment.terrainMesh, {
                        metallic: 0.0,
                        roughness: 0.9,
                        albedoColor: new BABYLON.Color3(0.3, 0.5, 0.2)
                    });
                    
                    // Enable shadows for the terrain
                    this.enableShadowReceiver(window.environment.terrainMesh);
                }
                
                // Apply materials to water if it exists
                if (window.environment.waterMesh) {
                    this.createPBRMaterial(window.environment.waterMesh, {
                        metallic: 0.0,
                        roughness: 0.1,
                        albedoColor: new BABYLON.Color3(0.0, 0.3, 0.5),
                        alpha: 0.8
                    });
                    
                    // Enable shadows for the water
                    this.enableShadowReceiver(window.environment.waterMesh);
                }
            }
        }, 100);
    }
    
    // Create a day/night cycle
    createDayNightCycle() {
        // Create a day/night cycle controller
        const dayNightController = {
            time: 0, // 0 to 1 (0 = midnight, 0.25 = sunrise, 0.5 = noon, 0.75 = sunset)
            cycleSpeed: 0.0001, // Speed of the day/night cycle
            paused: false
        };
        
        // Update the day/night cycle
        this.scene.registerBeforeRender(() => {
            if (dayNightController.paused) return;
            
            // Update the time
            dayNightController.time += dayNightController.cycleSpeed;
            if (dayNightController.time > 1) {
                dayNightController.time -= 1;
            }
            
            // Calculate sun position
            const sunAngle = dayNightController.time * Math.PI * 2;
            const sunHeight = Math.sin(sunAngle);
            const sunDirection = new BABYLON.Vector3(
                Math.cos(sunAngle),
                sunHeight,
                Math.sin(sunAngle) * 0.5
            ).normalize();
            
            // Update the sun light
            if (this.lights[0]) {
                this.lights[0].direction = sunDirection.scale(-1);
                
                // Adjust light intensity based on time of day
                let intensity = Math.max(0.1, sunHeight);
                this.lights[0].intensity = intensity;
                
                // Adjust light color based on time of day
                if (sunHeight > 0.2) {
                    // Daytime - warm sunlight
                    this.lights[0].diffuse = new BABYLON.Color3(1, 0.95, 0.8);
                    this.lights[0].specular = new BABYLON.Color3(1, 0.95, 0.8);
                } else if (sunHeight > 0) {
                    // Sunrise/sunset - orange/red
                    const t = sunHeight / 0.2;
                    this.lights[0].diffuse = new BABYLON.Color3(1, 0.5 + t * 0.45, 0.3 + t * 0.5);
                    this.lights[0].specular = new BABYLON.Color3(1, 0.5 + t * 0.45, 0.3 + t * 0.5);
                } else {
                    // Night - blue moonlight
                    this.lights[0].diffuse = new BABYLON.Color3(0.2, 0.2, 0.5);
                    this.lights[0].specular = new BABYLON.Color3(0.2, 0.2, 0.5);
                }
            }
            
            // Adjust hemispheric light
            if (this.lights[1]) {
                this.lights[1].intensity = 0.2 + Math.max(0, sunHeight) * 0.3;
            }
            
            // Adjust sky color
            if (this.scene.clearColor) {
                if (sunHeight > 0.2) {
                    // Daytime - blue sky
                    this.scene.clearColor = new BABYLON.Color4(0.5, 0.8, 0.9, 1);
                } else if (sunHeight > 0) {
                    // Sunrise/sunset - orange/red sky
                    const t = sunHeight / 0.2;
                    this.scene.clearColor = new BABYLON.Color4(0.8, 0.5 + t * 0.3, 0.5 + t * 0.4, 1);
                } else if (sunHeight > -0.2) {
                    // Dusk/dawn - dark blue
                    const t = (sunHeight + 0.2) / 0.2;
                    this.scene.clearColor = new BABYLON.Color4(0.1 + t * 0.7, 0.1 + t * 0.4, 0.3 + t * 0.2, 1);
                } else {
                    // Night - dark
                    this.scene.clearColor = new BABYLON.Color4(0.05, 0.05, 0.1, 1);
                }
            }
            
            // Enable/disable street lights based on time of day
            for (let i = 2; i < this.lights.length; i++) {
                if (this.lights[i]) {
                    // Street lights are brighter at night
                    this.lights[i].intensity = Math.max(0.1, 0.8 - sunHeight);
                }
            }
        });
        
        // Store the controller
        this.dayNightController = dayNightController;
        
        return dayNightController;
    }
}

// Initialize lighting when the scene is ready
let lighting;
window.addEventListener('DOMContentLoaded', () => {
    // Wait for the scene to be created
    const checkScene = setInterval(() => {
        if (window.scene) {
            lighting = new Lighting(window.scene);
            
            // Apply PBR materials to the environment
            lighting.applyEnvironmentMaterials();
            
            // Wait for the vehicle to be created
            const checkVehicle = setInterval(() => {
                if (window.vehicle) {
                    // Apply PBR materials to the vehicle
                    lighting.applyVehicleMaterials(window.vehicle);
                    clearInterval(checkVehicle);
                }
            }, 100);
            
            // Create a day/night cycle (optional)
            // Uncomment to enable
            // const dayNightCycle = lighting.createDayNightCycle();
            
            clearInterval(checkScene);
        }
    }, 100);
});