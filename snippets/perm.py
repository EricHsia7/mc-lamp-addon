L = []
# 0: air/hide
# 1: glass/display
directions = ['up', 'down', 'north', 'east', 'south', 'west']

allBones = ['b000000', 'b000001', 'b000010', 'b000011', 'b000100', 'b000101', 'b000110', 'b000111', 'b001000', 'b001001', 'b001010', 'b001011', 'b001100', 'b001101', 'b001110', 'b001111', 'b010000', 'b010001', 'b010010', 'b010011', 'b010100', 'b010101', 'b010110', 'b010111', 'b011000', 'b011001', 'b011010', 'b011011', 'b011100', 'b011101', 'b011110', 'b011111', 'b100000', 'b100001', 'b100010', 'b100011', 'b100100', 'b100101', 'b100110', 'b100111', 'b101000', 'b101001', 'b101010', 'b101011', 'b101100', 'b101101', 'b101110', 'b101111', 'b110000', 'b110001', 'b110010', 'b110011', 'b110100', 'b110101', 'b110110', 'b110111', 'b111000', 'b111001', 'b111010', 'b111011', 'b111100', 'b111101', 'b111110', 'b111111']

zero = [0 for x in range(4)]

for up in range(2):
    for down in range(2):
        for north in range(2):
            for east in range(2):
                for south in range(2):
                    for west in range(2):
                        perm = {
                            "condition": [],
                            "components": {
                                "minecraft:geometry": {
                                    "identifier": "geometry.lamp.luminous_glass",
                                    "bone_visibility": {}
                                }
                            }
                        }
                        for bone in allBones:
                            perm['components']['minecraft:geometry']['bone_visibility'][bone] = False
                        perm['components']['minecraft:geometry']['bone_visibility'][f"b{up}{down}{north}{east}{south}{west}"] = True
                        directionIndex = 0
                        for direction in [up, down, north, east, south, west]:
                            prefix = ''
                            if direction == 0:
                                prefix = '!'
                            perm['condition'].append(f"{prefix}q.block_state('lamp:connection_{directions[directionIndex]}')")
                            directionIndex += 1
                        perm['condition'] = (" && ").join(perm['condition'])
                        L.append(perm)

with open('perm.txt', 'w') as f:
    print(L, file=f)