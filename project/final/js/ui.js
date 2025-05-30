// ui.js - UI elements and display for the 3D driving game

// UI class to handle all UI-related functionality
class UI {
    constructor(scene) {
        this.scene = scene;
        this.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');
        
        // Store UI elements
        this.uiElements = {};
        
        // Map settings
        this.mapSize = 2000; // Should match environment.js mapSize
        this.cityCenter = new BABYLON.Vector3(-500, 0, -500);
        this.highwayStart = new BABYLON.Vector3(-500, 0, 0);
        this.countrysideCenter = new BABYLON.Vector3(500, 0, 500);
        
        // Initialize the UI
        this.init();
    }
    
    // Initialize the UI
    init() {
        // Create speedometer
        this.createSpeedometer();
        
        // Create gear indicator
        this.createGearIndicator();
        
        // Create camera mode indicator
        this.createCameraModeIndicator();
        
        // Create position display
        this.createPositionDisplay();
        
        // Create enhanced minimap
        this.createEnhancedMinimap();
        
        // Create help panel
        this.createHelpPanel();
        
        // Create game controls info
        this.createControlsInfo();
        
        // Register update loop
        this.scene.registerBeforeRender(() => {
            this.update();
        });
    }
    
    // Create speedometer
    createSpeedometer() {
        // Create speedometer container
        const speedContainer = new BABYLON.GUI.Rectangle();
        speedContainer.width = "200px";
        speedContainer.height = "80px";
        speedContainer.cornerRadius = 10;
        speedContainer.color = "white";
        speedContainer.thickness = 2;
        speedContainer.background = "rgba(0, 0, 0, 0.5)";
        speedContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        speedContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        speedContainer.top = "-100px";
        speedContainer.left = "-20px";
        this.advancedTexture.addControl(speedContainer);
        
        // Create speed text
        const speedText = new BABYLON.GUI.TextBlock();
        speedText.text = "0";
        speedText.color = "white";
        speedText.fontSize = 40;
        speedText.fontWeight = "bold";
        speedText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        speedText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        speedText.top = "-10px";
        speedContainer.addControl(speedText);
        
        // Create km/h label
        const speedLabel = new BABYLON.GUI.TextBlock();
        speedLabel.text = "km/h";
        speedLabel.color = "white";
        speedLabel.fontSize = 16;
        speedLabel.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        speedLabel.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        speedLabel.top = "20px";
        speedContainer.addControl(speedLabel);
        
        // Store speedometer elements
        this.uiElements.speedometer = {
            container: speedContainer,
            text: speedText,
            label: speedLabel
        };
    }
    
    // Create gear indicator
    createGearIndicator() {
        // Create gear container
        const gearContainer = new BABYLON.GUI.Rectangle();
        gearContainer.width = "60px";
        gearContainer.height = "60px";
        gearContainer.cornerRadius = 30;
        gearContainer.color = "white";
        gearContainer.thickness = 2;
        gearContainer.background = "rgba(0, 0, 0, 0.5)";
        gearContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        gearContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        gearContainer.top = "-110px";
        gearContainer.left = "-240px";
        this.advancedTexture.addControl(gearContainer);
        
        // Create gear text
        const gearText = new BABYLON.GUI.TextBlock();
        gearText.text = "D";
        gearText.color = "white";
        gearText.fontSize = 30;
        gearText.fontWeight = "bold";
        gearText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        gearText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        gearContainer.addControl(gearText);
        
        // Store gear indicator elements
        this.uiElements.gearIndicator = {
            container: gearContainer,
            text: gearText
        };
    }
    
    // Create camera mode indicator
    createCameraModeIndicator() {
        // Create camera mode container
        const cameraModeContainer = new BABYLON.GUI.Rectangle();
        cameraModeContainer.width = "150px";
        cameraModeContainer.height = "40px";
        cameraModeContainer.cornerRadius = 10;
        cameraModeContainer.color = "white";
        cameraModeContainer.thickness = 2;
        cameraModeContainer.background = "rgba(0, 0, 0, 0.5)";
        cameraModeContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        cameraModeContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        cameraModeContainer.top = "20px";
        cameraModeContainer.left = "-20px";
        this.advancedTexture.addControl(cameraModeContainer);
        
        // Create camera mode text
        const cameraModeText = new BABYLON.GUI.TextBlock();
        cameraModeText.text = "Follow Camera";
        cameraModeText.color = "white";
        cameraModeText.fontSize = 16;
        cameraModeText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        cameraModeText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        cameraModeContainer.addControl(cameraModeText);
        
        // Store camera mode indicator elements
        this.uiElements.cameraModeIndicator = {
            container: cameraModeContainer,
            text: cameraModeText
        };
    }
    
    // Create position display
    createPositionDisplay() {
        // Create position container
        const positionContainer = new BABYLON.GUI.Rectangle();
        positionContainer.width = "200px";
        positionContainer.height = "40px";
        positionContainer.cornerRadius = 10;
        positionContainer.color = "white";
        positionContainer.thickness = 2;
        positionContainer.background = "rgba(0, 0, 0, 0.5)";
        positionContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        positionContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        positionContainer.top = "20px";
        positionContainer.left = "20px";
        this.advancedTexture.addControl(positionContainer);
        
        // Create position text
        const positionText = new BABYLON.GUI.TextBlock();
        positionText.text = "Position: (0, 0, 0)";
        positionText.color = "white";
        positionText.fontSize = 14;
        positionText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        positionText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        positionContainer.addControl(positionText);
        
        // Store position display elements
        this.uiElements.positionDisplay = {
            container: positionContainer,
            text: positionText
        };
    }
    
    // Create enhanced minimap
    createEnhancedMinimap() {
        // Create minimap container
        const minimapContainer = new BABYLON.GUI.Rectangle();
        minimapContainer.width = "250px";
        minimapContainer.height = "250px";
        minimapContainer.cornerRadius = 10;
        minimapContainer.color = "white";
        minimapContainer.thickness = 2;
        minimapContainer.background = "rgba(0, 0, 0, 0.7)";
        minimapContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        minimapContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        minimapContainer.top = "-20px";
        minimapContainer.left = "20px";
        this.advancedTexture.addControl(minimapContainer);
        
        // Create minimap title
        const minimapTitle = new BABYLON.GUI.TextBlock();
        minimapTitle.text = "MINIMAP";
        minimapTitle.color = "white";
        minimapTitle.fontSize = 14;
        minimapTitle.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        minimapTitle.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        minimapTitle.top = "10px";
        minimapContainer.addControl(minimapTitle);
        
        // Create minimap background (the actual map)
        const minimapBackground = new BABYLON.GUI.Rectangle();
        minimapBackground.width = "220px";
        minimapBackground.height = "220px";
        minimapBackground.cornerRadius = 5;
        minimapBackground.color = "transparent";
        minimapBackground.background = "rgba(100, 100, 100, 0.3)";
        minimapBackground.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        minimapBackground.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        minimapBackground.top = "10px";
        minimapContainer.addControl(minimapBackground);
        
        // Create city area indicator on minimap
        const cityArea = new BABYLON.GUI.Ellipse();
        cityArea.width = "80px";
        cityArea.height = "80px";
        cityArea.background = "rgba(150, 150, 150, 0.5)";
        cityArea.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        cityArea.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        // Position based on city center coordinates
        const cityPos = this.mapCoordinatesToMinimap(this.cityCenter.x, this.cityCenter.z);
        cityArea.left = cityPos.x + "px";
        cityArea.top = cityPos.y + "px";
        minimapBackground.addControl(cityArea);
        
        // Create city label
        const cityLabel = new BABYLON.GUI.TextBlock();
        cityLabel.text = "CITY";
        cityLabel.color = "white";
        cityLabel.fontSize = 10;
        cityLabel.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        cityLabel.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        cityArea.addControl(cityLabel);
        
        // Create countryside area indicator on minimap
        const countrysideArea = new BABYLON.GUI.Ellipse();
        countrysideArea.width = "100px";
        countrysideArea.height = "100px";
        countrysideArea.background = "rgba(100, 200, 100, 0.5)";
        countrysideArea.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        countrysideArea.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        // Position based on countryside center coordinates
        const countrysidePos = this.mapCoordinatesToMinimap(this.countrysideCenter.x, this.countrysideCenter.z);
        countrysideArea.left = countrysidePos.x + "px";
        countrysideArea.top = countrysidePos.y + "px";
        minimapBackground.addControl(countrysideArea);
        
        // Create countryside label
        const countrysideLabel = new BABYLON.GUI.TextBlock();
        countrysideLabel.text = "COUNTRYSIDE";
        countrysideLabel.color = "white";
        countrysideLabel.fontSize = 10;
        countrysideLabel.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        countrysideLabel.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        countrysideArea.addControl(countrysideLabel);
        
        // Create highway indicator on minimap
        const highway = new BABYLON.GUI.Rectangle();
        highway.width = "10px";
        highway.height = "150px";
        highway.background = "rgba(200, 200, 100, 0.8)";
        highway.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        highway.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        
        // Calculate highway position and rotation
        const highwayStartPos = this.mapCoordinatesToMinimap(this.highwayStart.x, this.highwayStart.z);
        const highwayEndPos = this.mapCoordinatesToMinimap(this.countrysideCenter.x, this.countrysideCenter.z);
        
        // Calculate midpoint for positioning
        const highwayMidX = (highwayStartPos.x + highwayEndPos.x) / 2;
        const highwayMidY = (highwayStartPos.y + highwayEndPos.y) / 2;
        
        // Calculate length and angle
        const dx = highwayEndPos.x - highwayStartPos.x;
        const dy = highwayEndPos.y - highwayStartPos.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        highway.left = highwayMidX + "px";
        highway.top = highwayMidY + "px";
        highway.rotation = angle + Math.PI/2;
        highway.height = length + "px";
        minimapBackground.addControl(highway);
        
        // Create highway label
        const highwayLabel = new BABYLON.GUI.TextBlock();
        highwayLabel.text = "HIGHWAY";
        highwayLabel.color = "white";
        highwayLabel.fontSize = 10;
        highwayLabel.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        highwayLabel.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        highwayLabel.rotation = -angle - Math.PI/2;
        highway.addControl(highwayLabel);
        
        // Create player indicator on minimap
        const playerIndicator = new BABYLON.GUI.Ellipse();
        playerIndicator.width = "15px";
        playerIndicator.height = "15px";
        playerIndicator.background = "red";
        playerIndicator.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        playerIndicator.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        minimapBackground.addControl(playerIndicator);
        
        // Create player direction indicator (triangle)
        const playerDirection = new BABYLON.GUI.Rectangle();
        playerDirection.width = "0px";
        playerDirection.height = "0px";
        playerDirection.thickness = 0;
        playerDirection.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        playerDirection.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        
        // Create a triangle shape using a container with a custom draw function
        const triangle = new BABYLON.GUI.Container();
        triangle.width = "15px";
        triangle.height = "15px";
        triangle.isPointerBlocker = false;
        
        triangle.onBeforeDrawObservable.add((context) => {
            context.save();
            context.beginPath();
            context.moveTo(0, -7.5);
            context.lineTo(7.5, 7.5);
            context.lineTo(-7.5, 7.5);
            context.closePath();
            context.fillStyle = "white";
            context.fill();
            context.restore();
        });
        
        playerDirection.addControl(triangle);
        playerIndicator.addControl(playerDirection);
        
        // Create compass on minimap
        const compass = new BABYLON.GUI.Ellipse();
        compass.width = "30px";
        compass.height = "30px";
        compass.background = "rgba(0, 0, 0, 0.5)";
        compass.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        compass.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        compass.top = "10px";
        compass.left = "-10px";
        minimapBackground.addControl(compass);
        
        // Create compass needle
        const compassNeedle = new BABYLON.GUI.Rectangle();
        compassNeedle.width = "2px";
        compassNeedle.height = "15px";
        compassNeedle.background = "red";
        compassNeedle.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        compassNeedle.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        compassNeedle.top = "-5px";
        compass.addControl(compassNeedle);
        
        // Create N indicator
        const northIndicator = new BABYLON.GUI.TextBlock();
        northIndicator.text = "N";
        northIndicator.color = "white";
        northIndicator.fontSize = 10;
        northIndicator.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        northIndicator.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        northIndicator.top = "2px";
        compass.addControl(northIndicator);
        
        // Store minimap elements
        this.uiElements.minimap = {
            container: minimapContainer,
            background: minimapBackground,
            title: minimapTitle,
            cityArea: cityArea,
            countrysideArea: countrysideArea,
            highway: highway,
            playerIndicator: playerIndicator,
            playerDirection: playerDirection,
            compass: compass,
            compassNeedle: compassNeedle
        };
    }
    
    // Convert world coordinates to minimap coordinates
    mapCoordinatesToMinimap(x, z) {
        // The minimap is 220px x 220px
        const minimapSize = 220;
        
        // Scale the world coordinates to minimap coordinates
        // Map is 2000x2000 units centered at origin
        const mapHalfSize = this.mapSize / 2;
        
        // Calculate normalized position (-1 to 1)
        const normalizedX = x / mapHalfSize;
        const normalizedZ = z / mapHalfSize;
        
        // Convert to minimap coordinates
        const minimapX = normalizedX * (minimapSize / 2);
        const minimapZ = normalizedZ * (minimapSize / 2);
        
        return { x: minimapX, y: minimapZ };
    }
    
    // Create help panel
    createHelpPanel() {
        // Create help panel container
        const helpContainer = new BABYLON.GUI.Rectangle();
        helpContainer.width = "400px";
        helpContainer.height = "350px";
        helpContainer.cornerRadius = 10;
        helpContainer.color = "white";
        helpContainer.thickness = 2;
        helpContainer.background = "rgba(0, 0, 0, 0.8)";
        helpContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        helpContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        helpContainer.isVisible = false;
        this.advancedTexture.addControl(helpContainer);
        
        // Create help title
        const helpTitle = new BABYLON.GUI.TextBlock();
        helpTitle.text = "CONTROLS";
        helpTitle.color = "white";
        helpTitle.fontSize = 24;
        helpTitle.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        helpTitle.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        helpTitle.top = "20px";
        helpContainer.addControl(helpTitle);
        
        // Create help content
        const helpContent = new BABYLON.GUI.TextBlock();
        helpContent.text = 
            "W / Up Arrow: Accelerate\n" +
            "S / Down Arrow: Reverse\n" +
            "A / Left Arrow: Turn Left\n" +
            "D / Right Arrow: Turn Right\n" +
            "Space: Brake\n" +
            "Shift: Handbrake\n" +
            "C: Change Camera View\n" +
            "R: Reset Vehicle\n" +
            "H: Toggle Help\n\n" +
            "Explore the city, highway, and countryside areas.\n" +
            "Use the minimap to navigate between different regions.";
        helpContent.color = "white";
        helpContent.fontSize = 18;
        helpContent.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        helpContent.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        helpContent.top = "70px";
        helpContent.left = "30px";
        helpContent.lineSpacing = "10px";
        helpContainer.addControl(helpContent);
        
        // Create close button
        const closeButton = BABYLON.GUI.Button.CreateSimpleButton("closeHelp", "CLOSE");
        closeButton.width = "100px";
        closeButton.height = "40px";
        closeButton.color = "white";
        closeButton.background = "rgba(255, 0, 0, 0.5)";
        closeButton.cornerRadius = 10;
        closeButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        closeButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        closeButton.top = "-20px";
        closeButton.onPointerClickObservable.add(() => {
            helpContainer.isVisible = false;
        });
        helpContainer.addControl(closeButton);
        
        // Store help panel elements
        this.uiElements.helpPanel = {
            container: helpContainer,
            title: helpTitle,
            content: helpContent,
            closeButton: closeButton
        };
        
        // Add keyboard shortcut to toggle help panel
        this.scene.onKeyboardObservable.add((kbInfo) => {
            if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN && kbInfo.event.key.toLowerCase() === 'h') {
                helpContainer.isVisible = !helpContainer.isVisible;
            }
        });
    }
    
    // Create game controls info
    createControlsInfo() {
        // Create controls info container
        const controlsContainer = new BABYLON.GUI.Rectangle();
        controlsContainer.width = "300px";
        controlsContainer.height = "40px";
        controlsContainer.cornerRadius = 10;
        controlsContainer.color = "white";
        controlsContainer.thickness = 2;
        controlsContainer.background = "rgba(0, 0, 0, 0.5)";
        controlsContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        controlsContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        controlsContainer.top = "-20px";
        this.advancedTexture.addControl(controlsContainer);
        
        // Create controls info text
        const controlsText = new BABYLON.GUI.TextBlock();
        controlsText.text = "WASD: Drive | Space: Brake | H: Help";
        controlsText.color = "white";
        controlsText.fontSize = 16;
        controlsText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        controlsText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        controlsContainer.addControl(controlsText);
        
        // Store controls info elements
        this.uiElements.controlsInfo = {
            container: controlsContainer,
            text: controlsText
        };
    }
    
    // Get terrain type at position
    getTerrainTypeAtPosition(x, z) {
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
        
        // Determine terrain type based on closest region
        if (distToHighway < 50) {
            return "highway";
        } else if (distToCity < distToCountryside && distToCity < 800) {
            return "city";
        } else if (distToCountryside < 1000) {
            return "countryside";
        } else {
            return "unknown";
        }
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
    
    // Update UI elements
    update() {
        // Update speedometer if vehicle is available
        if (window.vehicle && typeof window.vehicle.getSpeedKmh === 'function') {
            const speed = window.vehicle.getSpeedKmh();
            this.uiElements.speedometer.text.text = Math.floor(speed).toString();
            
            // Update gear indicator
            if (speed === 0) {
                this.uiElements.gearIndicator.text.text = "N";
            } else if (window.vehicle.speed > 0) {
                this.uiElements.gearIndicator.text.text = "D";
            } else {
                this.uiElements.gearIndicator.text.text = "R";
            }
        }
        
        // Update camera mode indicator
        if (window.vehicle && window.vehicle.cameraMode) {
            let cameraText = "Follow Camera";
            
            switch (window.vehicle.cameraMode) {
                case "follow":
                    cameraText = "Follow Camera";
                    break;
                case "chase":
                    cameraText = "Chase Camera";
                    break;
                case "firstPerson":
                    cameraText = "First Person";
                    break;
            }
            
            this.uiElements.cameraModeIndicator.text.text = cameraText;
        }
        
        // Update position display
        if (window.vehicle && typeof window.vehicle.getPosition === 'function') {
            const vehiclePos = window.vehicle.getPosition();
            this.uiElements.positionDisplay.text.text = `Position: (${Math.floor(vehiclePos.x)}, ${Math.floor(vehiclePos.z)})`;
            
            // Get terrain type at current position
            const terrainType = this.getTerrainTypeAtPosition(vehiclePos.x, vehiclePos.z);
            
            // Update position display with terrain type
            this.uiElements.positionDisplay.text.text = `${terrainType.toUpperCase()} (${Math.floor(vehiclePos.x)}, ${Math.floor(vehiclePos.z)})`;
            
            // Update minimap player indicator position
            const minimapPos = this.mapCoordinatesToMinimap(vehiclePos.x, vehiclePos.z);
            
            // Update player indicator position
            this.uiElements.minimap.playerIndicator.left = minimapPos.x + "px";
            this.uiElements.minimap.playerIndicator.top = minimapPos.y + "px";
            
            // Update player indicator color based on terrain
            switch (terrainType) {
                case "city":
                    this.uiElements.minimap.playerIndicator.background = "red";
                    break;
                case "highway":
                    this.uiElements.minimap.playerIndicator.background = "yellow";
                    break;
                case "countryside":
                    this.uiElements.minimap.playerIndicator.background = "green";
                    break;
                default:
                    this.uiElements.minimap.playerIndicator.background = "white";
            }
            
            // Rotate player indicator based on vehicle rotation
            if (window.vehicle.rotation !== undefined) {
                this.uiElements.minimap.playerDirection.rotation = -window.vehicle.rotation;
            }
            
            // Update compass
            if (this.uiElements.minimap.compassNeedle) {
                // Compass should always point north, so rotate opposite to vehicle rotation
                this.uiElements.minimap.compassNeedle.rotation = window.vehicle.rotation || 0;
            }
        }
    }
}

// Initialize the UI when the scene is ready
let ui;
window.addEventListener('DOMContentLoaded', () => {
    // Wait for the scene to be created
    const checkScene = setInterval(() => {
        if (window.scene) {
            ui = new UI(window.scene);
            window.ui = ui;
            clearInterval(checkScene);
        }
    }, 100);
});