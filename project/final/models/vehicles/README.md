# Vehicle Model Placeholder

This directory is intended to store the 3D vehicle model files for the driving game.

## Required Model

Download a free CC0-licensed car model from Sketchfab, such as one of the following:
- "FREE Concept Car 003" (https://sketchfab.com/3d-models/free-concept-car-003-77664fc474c444f4947e9834ed0d30ad)
- "FREE Concept Car 025" (https://sketchfab.com/3d-models/free-concept-car-025-e3a65443d3e44c33b594cec591c01c05)

## Instructions

1. Download the model in glTF/GLB format from Sketchfab
2. Save the downloaded file as `concept_car_003.glb` in this directory
3. If the model includes separate texture files, place them in this directory as well

## Model Requirements

- Format: glTF or GLB (preferred)
- License: CC0 or other license that permits use in this project
- Size: Optimized for web use (under 10MB if possible)

## Note

The vehicle.js file is configured to load a model named `concept_car_003.glb`. If you use a different filename, update the `modelPath` variable in the `loadVehicleModel` function in vehicle.js.