// environment.js - Environment and map creation for the 3D driving game

// Environment class to handle all environment-related functionality
class Environment {
    constructor(scene) {
        this.scene = scene;
        this.groundMeshes = [];
        this.buildingMeshes = [];
        this.roadMeshes = [];
        this.treeMeshes = [];
        this.mapSize = 2000; // Increased map size for more expansive terrain
        this.cityCenter = new BABYLON.Vector3(-500, 0, -500);
        this.highwayStart = new BABYLON.Vector3(-500, 0, 0);
        this.countrysideCenter = new BABYLON.Vector3(500, 0, 500);
        
        // Initialize the environment
        this.init();
    }
    
    // Initialize the environment
    async init() {
        // Create the skybox first
        this.createSkybox();
        
        // Create the terrain using heightmap
        await this.createTerrain();
        
        // Create environment elements
        this.createRoads();
        this.createCityArea();
        this.createCountrysideArea();
        
        // Add collision detection to all ground meshes
        this.setupCollisions();
    }
    
    // Create the terrain using heightmap
    async createTerrain() {
        return new Promise((resolve) => {
            // Create a large ground from heightmap for the entire map
            BABYLON.MeshBuilder.CreateGroundFromHeightMap(
                'terrain',
                'textures/heightmap.png',
                {
                    width: this.mapSize,
                    height: this.mapSize,
                    subdivisions: 100,
                    minHeight: 0,
                    maxHeight: 50,
                    updatable: true,
                    onReady: (groundMesh) => {
                        // Store the ground mesh
                        this.groundMeshes.push(groundMesh);
                        
                        // Create a multi-material for the ground
                        this.applyTerrainMaterials(groundMesh);
                        
                        // Optimize the mesh
                        groundMesh.optimize(100);
                        
                        resolve();
                    }
                },
                this.scene
            );
        });
    }
    
    // Apply materials to the terrain based on regions
    applyTerrainMaterials(groundMesh) {
        // Create a multi-material for the ground
        const multimat = new BABYLON.MultiMaterial('terrainMaterial', this.scene);
        
        // City material (concrete/asphalt)
        const cityMaterial = new BABYLON.StandardMaterial('cityMaterial', this.scene);
        cityMaterial.diffuseTexture = new BABYLON.Texture('textures/environment.png', this.scene);
        cityMaterial.diffuseTexture.uScale = 20;
        cityMaterial.diffuseTexture.vScale = 20;
        cityMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        multimat.subMaterials.push(cityMaterial);
        
        // Highway material (asphalt)
        const highwayMaterial = new BABYLON.StandardMaterial('highwayMaterial', this.scene);
        highwayMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        highwayMaterial.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);
        multimat.subMaterials.push(highwayMaterial);
        
        // Countryside material (grass)
        const countrysideMaterial = new BABYLON.StandardMaterial('countrysideMaterial', this.scene);
        countrysideMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.6, 0.2);
        countrysideMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        multimat.subMaterials.push(countrysideMaterial);
        
        // Apply the multi-material to the ground mesh
        groundMesh.material = multimat;
        
        // Create a vertex color map to blend between materials
        this.applyVertexColors(groundMesh);
    }
    
    // Apply vertex colors to blend between different terrain types
    applyVertexColors(groundMesh) {
        // Get the vertices of the ground mesh
        const positions = groundMesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        const vertexCount = positions.length / 3;
        
        // Create colors array
        const colors = new Float32Array(vertexCount * 4);
        
        // For each vertex, determine its color based on position
        for (let i = 0; i < vertexCount; i++) {
            const x = positions[i * 3];
            const z = positions[i * 3 + 2];
            
            // Calculate distances to each region center
            const distToCity = BABYLON.Vector3.Distance(
                new BABYLON.Vector3(x, 0, z),
                this.cityCenter
            );
            
            const distToHighway = this.distanceToHighway(x, z);
            
            const distToCountryside = BABYLON.Vector3.Distance(
                new BABYLON.Vector3(x, 0, z),
                this.countrysideCenter
            );
            
            // Normalize distances (closer = higher value)
            const cityInfluence = Math.max(0, 1 - distToCity / 800);
            const highwayInfluence = Math.max(0, 1 - distToHighway / 200);
            const countrysideInfluence = Math.max(0, 1 - distToCountryside / 1000);
            
            // Set color components (RGB for material blending)
            colors[i * 4] = cityInfluence;     // R = City
            colors[i * 4 + 1] = highwayInfluence; // G = Highway
            colors[i * 4 + 2] = countrysideInfluence; // B = Countryside
            colors[i * 4 + 3] = 1;             // A = 1 (fully opaque)
        }
        
        // Apply the colors to the mesh
        groundMesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, colors);
    }
    
    // Calculate distance to the highway path
    distanceToHighway(x, z) {
        // Simplified highway path (line from highwayStart to countrysideCenter)
        const highwayVector = this.countrysideCenter.subtract(this.highwayStart);
        const highwayLength = highwayVector.length();
        const highwayDirection = highwayVector.normalize();
        
        const pointVector = new BABYLON.Vector3(x, 0, z).subtract(this.highwayStart);
        const projection = BABYLON.Vector3.Dot(pointVector, highwayDirection);
        
        // Check if the point projects onto the highway segment
        if (projection < 0) {
            return BABYLON.Vector3.Distance(new BABYLON.Vector3(x, 0, z), this.highwayStart);
        } else if (projection > highwayLength) {
            return BABYLON.Vector3.Distance(new BABYLON.Vector3(x, 0, z), this.countrysideCenter);
        } else {
            // Calculate perpendicular distance to the highway line
            const projectedPoint = this.highwayStart.add(highwayDirection.scale(projection));
            return BABYLON.Vector3.Distance(new BABYLON.Vector3(x, 0, z), projectedPoint);
        }
    }
    
    // Create a skybox
    createSkybox() {
        // Create a skybox
        const skybox = BABYLON.MeshBuilder.CreateBox('skybox', {
            size: this.mapSize * 2
        }, this.scene);
        
        // Create skybox material
        const skyboxMaterial = new BABYLON.StandardMaterial('skyboxMaterial', this.scene);
        skyboxMaterial.backFaceCulling = false;
        
        // Use the skybox texture if available
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture('textures/skybox.png', this.scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        
        // Set the skybox material
        skybox.material = skyboxMaterial;
        
        // Ensure the skybox follows the camera
        this.scene.registerBeforeRender(() => {
            if (this.scene.activeCamera) {
                skybox.position = this.scene.activeCamera.position;
            }
        });
    }
    
    // Create roads connecting different areas
    createRoads() {
        // Main highway from city to countryside
        this.createHighway(
            this.cityCenter.x, this.cityCenter.z,
            this.countrysideCenter.x, this.countrysideCenter.z,
            40 // Highway width
        );
        
        // City roads
        this.createCityRoads();
        
        // Countryside roads
        this.createCountrysideRoads();
    }
    
    // Create a highway between two points
    createHighway(startX, startZ, endX, endZ, width) {
        // Calculate the direction and length
        const dx = endX - startX;
        const dz = endZ - startZ;
        const length = Math.sqrt(dx * dx + dz * dz);
        const angle = Math.atan2(dz, dx);
        
        // Create the highway mesh
        const highway = BABYLON.MeshBuilder.CreateGround(`highway`, {
            width: length,
            height: width
        }, this.scene);
        
        // Position and rotate the highway
        highway.position = new BABYLON.Vector3(
            startX + dx / 2,
            0.1, // Slightly above ground to prevent z-fighting
            startZ + dz / 2
        );
        highway.rotation.y = angle;
        
        // Create highway material
        const highwayMaterial = new BABYLON.StandardMaterial(`highwayMaterial`, this.scene);
        
        // Create a dynamic texture for the highway
        const roadTexture = new BABYLON.DynamicTexture(`highwayTexture`, {
            width: 1024,
            height: 512
        }, this.scene);
        
        const roadContext = roadTexture.getContext();
        roadContext.fillStyle = '#333333';
        roadContext.fillRect(0, 0, 1024, 512);
        
        // Draw lane markings
        roadContext.fillStyle = '#FFFFFF';
        
        // Center divider (double yellow)
        roadContext.fillRect(506, 0, 4, 512);
        roadContext.fillRect(514, 0, 4, 512);
        
        // Lane markings (dashed white)
        for (let i = 0; i < 512; i += 40) {
            // Left side lanes
            roadContext.fillRect(256, i, 20, 20);
            
            // Right side lanes
            roadContext.fillRect(768, i, 20, 20);
        }
        
        // Shoulder lines (solid white)
        roadContext.fillRect(50, 0, 4, 512);
        roadContext.fillRect(970, 0, 4, 512);
        
        roadTexture.update();
        highwayMaterial.diffuseTexture = roadTexture;
        highwayMaterial.diffuseTexture.uScale = length / 50;
        highwayMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        
        highway.material = highwayMaterial;
        this.roadMeshes.push(highway);
    }
    
    // Create a grid of roads for the city area
    createCityRoads() {
        const citySize = 800;
        const blockSize = 100;
        const roadWidth = 20;
        
        // Create a grid of roads
        for (let x = -citySize / 2; x <= citySize / 2; x += blockSize) {
            this.createRoad(
                this.cityCenter.x + x,
                this.cityCenter.z,
                roadWidth,
                citySize,
                Math.PI / 2
            );
        }
        
        for (let z = -citySize / 2; z <= citySize / 2; z += blockSize) {
            this.createRoad(
                this.cityCenter.x,
                this.cityCenter.z + z,
                roadWidth,
                citySize,
                0
            );
        }
    }
    
    // Create countryside roads (more organic, winding roads)
    createCountrysideRoads() {
        // Create a few winding roads in the countryside
        this.createWindingRoad(
            this.countrysideCenter.x - 200,
            this.countrysideCenter.z - 200,
            400,
            15,
            8
        );
        
        this.createWindingRoad(
            this.countrysideCenter.x + 100,
            this.countrysideCenter.z + 100,
            300,
            15,
            6
        );
    }
    
    // Create a winding road with multiple segments
    createWindingRoad(startX, startZ, length, width, segments) {
        let currentX = startX;
        let currentZ = startZ;
        let currentAngle = Math.random() * Math.PI * 2;
        
        for (let i = 0; i < segments; i++) {
            // Calculate next point with some randomness
            const segmentLength = length / segments;
            const angleChange = (Math.random() - 0.5) * Math.PI / 4; // Max 45 degree turn
            currentAngle += angleChange;
            
            const nextX = currentX + Math.cos(currentAngle) * segmentLength;
            const nextZ = currentZ + Math.sin(currentAngle) * segmentLength;
            
            // Create road segment
            this.createRoad(
                (currentX + nextX) / 2,
                (currentZ + nextZ) / 2,
                width,
                segmentLength,
                currentAngle
            );
            
            // Update current position
            currentX = nextX;
            currentZ = nextZ;
        }
    }
    
    // Create a single road segment
    createRoad(x, z, width, length, rotation) {
        const road = BABYLON.MeshBuilder.CreateGround(`road-${x}-${z}`, {
            width: width,
            height: length
        }, this.scene);
        
        // Position and rotate the road
        road.position = new BABYLON.Vector3(x, 0.05, z); // Slightly above ground to prevent z-fighting
        road.rotation.y = rotation;
        
        // Create road material
        const roadMaterial = new BABYLON.StandardMaterial(`roadMaterial-${x}-${z}`, this.scene);
        roadMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2); // Dark gray for asphalt
        
        // Add a yellow line in the middle
        const roadTexture = new BABYLON.DynamicTexture(`roadTexture-${x}-${z}`, {
            width: 512,
            height: 512
        }, this.scene);
        
        const roadContext = roadTexture.getContext();
        roadContext.fillStyle = '#333333';
        roadContext.fillRect(0, 0, 512, 512);
        
        // Draw yellow lines
        roadContext.fillStyle = '#FFFF00';
        roadContext.fillRect(246, 0, 20, 512); // Center line
        
        roadTexture.update();
        roadMaterial.diffuseTexture = roadTexture;
        
        road.material = roadMaterial;
        this.roadMeshes.push(road);
    }
    
    // Create the city area with buildings
    createCityArea() {
        const citySize = 800;
        const blockSize = 100;
        const buildingMargin = 10;
        const maxBuildingsPerBlock = 4;
        
        // Create buildings in a grid pattern
        for (let x = -citySize / 2 + blockSize / 2; x < citySize / 2; x += blockSize) {
            for (let z = -citySize / 2 + blockSize / 2; z < citySize / 2; z += blockSize) {
                // Skip if this is a road intersection
                if (Math.abs(x) % blockSize < 20 || Math.abs(z) % blockSize < 20) {
                    continue;
                }
                
                // Create buildings in this block
                const buildingsInBlock = 1 + Math.floor(Math.random() * maxBuildingsPerBlock);
                
                for (let b = 0; b < buildingsInBlock; b++) {
                    // Calculate building position within the block
                    const offsetX = (Math.random() - 0.5) * (blockSize - buildingMargin * 2);
                    const offsetZ = (Math.random() - 0.5) * (blockSize - buildingMargin * 2);
                    
                    const buildingX = this.cityCenter.x + x + offsetX;
                    const buildingZ = this.cityCenter.z + z + offsetZ;
                    
                    // Create building with random dimensions
                    const height = 10 + Math.random() * 60;
                    const width = 10 + Math.random() * 20;
                    const depth = 10 + Math.random() * 20;
                    
                    this.createBuilding(buildingX, buildingZ, width, height, depth);
                }
            }
        }
    }
    
    // Create a single building
    createBuilding(x, z, width, height, depth) {
        const building = BABYLON.MeshBuilder.CreateBox(`building-${x}-${z}`, {
            width: width,
            height: height,
            depth: depth
        }, this.scene);
        
        // Position the building
        building.position = new BABYLON.Vector3(x, height / 2, z);
        
        // Create building material
        const buildingMaterial = new BABYLON.StandardMaterial(`buildingMaterial-${x}-${z}`, this.scene);
        
        // Randomize building color
        const r = 0.3 + Math.random() * 0.5;
        const g = 0.3 + Math.random() * 0.5;
        const b = 0.3 + Math.random() * 0.5;
        buildingMaterial.diffuseColor = new BABYLON.Color3(r, g, b);
        
        // Add windows texture
        const buildingTexture = new BABYLON.DynamicTexture(`buildingTexture-${x}-${z}`, {
            width: 512,
            height: 512
        }, this.scene);
        
        const buildingContext = buildingTexture.getContext();
        buildingContext.fillStyle = `rgb(${Math.floor(r * 255)}, ${Math.floor(g * 255)}, ${Math.floor(b * 255)})`;
        buildingContext.fillRect(0, 0, 512, 512);
        
        // Draw windows
        buildingContext.fillStyle = '#FFFF99';
        const windowSize = 20;
        const windowSpacing = 40;
        
        for (let wx = windowSpacing; wx < 512; wx += windowSpacing) {
            for (let wy = windowSpacing; wy < 512; wy += windowSpacing) {
                // Randomly skip some windows
                if (Math.random() > 0.3) {
                    buildingContext.fillRect(wx, wy, windowSize, windowSize);
                }
            }
        }
        
        buildingTexture.update();
        buildingMaterial.diffuseTexture = buildingTexture;
        
        building.material = buildingMaterial;
        this.buildingMeshes.push(building);
        
        // Add collision detection
        building.checkCollisions = true;
    }
    
    // Create countryside area with trees and natural elements
    createCountrysideArea() {
        const areaSize = 1000;
        const treeCount = 300;
        
        // Add trees in the countryside areas
        for (let i = 0; i < treeCount; i++) {
            // Generate random position within countryside area
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * areaSize / 2;
            
            const x = this.countrysideCenter.x + Math.cos(angle) * distance;
            const z = this.countrysideCenter.z + Math.sin(angle) * distance;
            
            // Check if position is away from roads
            if (this.isAwayFromRoads(x, z, 30)) {
                this.createTree(x, z);
            }
        }
        
        // Add some hills in the countryside
        this.createHills();
    }
    
    // Create hills in the countryside
    createHills() {
        const hillCount = 10;
        
        for (let i = 0; i < hillCount; i++) {
            // Generate random position within countryside area
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 400;
            
            const x = this.countrysideCenter.x + Math.cos(angle) * distance;
            const z = this.countrysideCenter.z + Math.sin(angle) * distance;
            
            // Create hill
            this.createHill(x, z);
        }
    }
    
    // Create a single hill
    createHill(x, z) {
        const radius = 50 + Math.random() * 100;
        const height = 10 + Math.random() * 20;
        
        const hill = BABYLON.MeshBuilder.CreateGroundFromHeightMap(
            `hill-${x}-${z}`,
            'textures/heightmap.png',
            {
                width: radius * 2,
                height: radius * 2,
                subdivisions: 20,
                minHeight: 0,
                maxHeight: height
            },
            this.scene
        );
        
        // Position the hill
        hill.position = new BABYLON.Vector3(x, 0, z);
        
        // Create hill material
        const hillMaterial = new BABYLON.StandardMaterial(`hillMaterial-${x}-${z}`, this.scene);
        hillMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.6, 0.2); // Green for grass
        hillMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        
        hill.material = hillMaterial;
        this.groundMeshes.push(hill);
    }
    
    // Check if a position is away from all roads
    isAwayFromRoads(x, z, minDistance) {
        for (const road of this.roadMeshes) {
            const roadPos = road.position;
            const distance = Math.sqrt(Math.pow(x - roadPos.x, 2) + Math.pow(z - roadPos.z, 2));
            
            if (distance < minDistance) {
                return false;
            }
        }
        return true;
    }
    
    // Create a simple tree
    createTree(x, z) {
        // Create tree trunk
        const trunk = BABYLON.MeshBuilder.CreateCylinder(`treeTrunk-${x}-${z}`, {
            height: 5,
            diameter: 1
        }, this.scene);
        
        trunk.position = new BABYLON.Vector3(x, 2.5, z);
        
        const trunkMaterial = new BABYLON.StandardMaterial(`trunkMaterial-${x}-${z}`, this.scene);
        trunkMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.3, 0.2);
        trunk.material = trunkMaterial;
        
        // Create tree top (leaves)
        const leaves = BABYLON.MeshBuilder.CreateSphere(`treeLeaves-${x}-${z}`, {
            diameter: 6,
            segments: 8
        }, this.scene);
        
        leaves.position = new BABYLON.Vector3(x, 7, z);
        
        const leavesMaterial = new BABYLON.StandardMaterial(`leavesMaterial-${x}-${z}`, this.scene);
        leavesMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.5, 0.1);
        leaves.material = leavesMaterial;
        
        this.treeMeshes.push(trunk, leaves);
        
        // Add collision detection
        trunk.checkCollisions = true;
        leaves.checkCollisions = true;
    }
    
    // Setup collision detection for all meshes
    setupCollisions() {
        // Enable collisions for all ground meshes
        for (const ground of this.groundMeshes) {
            ground.checkCollisions = true;
        }
        
        // Enable collisions for all road meshes
        for (const road of this.roadMeshes) {
            road.checkCollisions = true;
        }
    }
    
    // Get the height at a specific position (for vehicle placement)
    getHeightAtPosition(x, z) {
        // Use ray casting to find the height at the given position
        const ray = new BABYLON.Ray(
            new BABYLON.Vector3(x, 100, z),
            new BABYLON.Vector3(0, -1, 0),
            200
        );
        
        const pickInfo = this.scene.pickWithRay(ray);
        
        if (pickInfo.hit) {
            return pickInfo.pickedPoint.y;
        }
        
        return 0; // Default height if no ground is found
    }
}

// Initialize the environment when the scene is ready
let environment;
window.addEventListener('DOMContentLoaded', () => {
    // Wait for the scene to be created
    const checkScene = setInterval(() => {
        if (window.scene) {
            environment = new Environment(window.scene);
            clearInterval(checkScene);
        }
    }, 100);
});