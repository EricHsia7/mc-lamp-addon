import itertools
import json

# Define directions
directions = ["up", "down", "north", "south", "east", "west"]

# Generate all possible combinations of True/False for the six directions
combinations = list(itertools.product([True, False], repeat=6))

# Function to generate conditions and components for each combination
def generate_configurations(combinations, directions):
    configurations = []
    for combo in combinations:
        # Map the directions to their states
        state = dict(zip(directions, combo))
        
        # Build the condition string
        condition_parts = []
        for direction, connected in state.items():
            if connected:
                condition_parts.append(f"q.block_state('lamp:connection_{direction}')")
            else:
                condition_parts.append(f"!q.block_state('lamp:connection_{direction}')")
        condition = " && ".join(condition_parts)
        
        # Build the components dictionary
        components = {
            "minecraft:geometry": {
                "identifier": "geometry.lamp.light_tube",
                "bone_visibility": {
                    "frame": True,
                    **{
                        f"face_{direction}": not connected
                        for direction, connected in state.items()
                    },
                    **{
                        f"connection_{direction}": connected
                        for direction, connected in state.items()
                    },
                }
            }
        }
        
        # Append the configuration to the list
        configurations.append({
            "condition": condition,
            "components": components
        })
    return configurations

# Generate all configurations
configurations = generate_configurations(combinations, directions)

# Save to a JSON file for easy viewing
output_path = "/mnt/data/lamp_configurations.json"
with open(output_path, "w") as file:
    json.dump(configurations, file, indent=2)

output_path