L = []
# 0: air/hide
# 1: glass/display

geo = {
	"format_version": "1.21.40",
	"minecraft:geometry": [
		{
			"description": {
				"identifier": "geometry.lamp.luminous_glass",
				"texture_width": 320,
				"texture_height": 320,
				"visible_bounds_width": 2,
				"visible_bounds_height": 2.5,
				"visible_bounds_offset": [0, 0.75, 0]
			},
			"bones": []
		}
	]
}


textureCoordinates = {
    "t0000": [3, 3],
    "t0001": [3, 2],
    "t0010": [3, 1],
    "t0011": [3, 0],
    "t0100": [2, 3],
    "t0101": [2, 2],
    "t0110": [2, 1],
    "t0111": [2, 0],
    "t1000": [1, 3],
    "t1001": [1, 2],
    "t1010": [1, 1],
    "t1011": [1, 0],
    "t1100": [0, 3],
    "t1101": [0, 2],
    "t1110": [0, 1],
    "t1111": [0, 0],
    "hide": [0, 4]
}

def getUV(key, upOrDown):
    uv = [textureCoordinates[key][1] * 64, textureCoordinates[key][0] * 64]
    uvSize = [64, 64]
    if upOrDown:
        uv = [uv[0] + 64, uv[1] + 64]
        uvSize = [-64, -64]
    return {"uv": uv, "uv_size": uvSize}

directions = ['up', 'down', 'north', 'east', 'south', 'west']
allBones = ['b000000', 'b000001', 'b000010', 'b000011', 'b000100', 'b000101', 'b000110', 'b000111', 'b001000', 'b001001', 'b001010', 'b001011', 'b001100', 'b001101', 'b001110', 'b001111', 'b010000', 'b010001', 'b010010', 'b010011', 'b010100', 'b010101', 'b010110', 'b010111', 'b011000', 'b011001', 'b011010', 'b011011', 'b011100', 'b011101', 'b011110', 'b011111', 'b100000', 'b100001', 'b100010', 'b100011', 'b100100', 'b100101', 'b100110', 'b100111', 'b101000', 'b101001', 'b101010', 'b101011', 'b101100', 'b101101', 'b101110', 'b101111', 'b110000', 'b110001', 'b110010', 'b110011', 'b110100', 'b110101', 'b110110', 'b110111', 'b111000', 'b111001', 'b111010', 'b111011', 'b111100', 'b111101', 'b111110', 'b111111']

a, b, c, d, e, f, g, h, i, j, k, l = [1 for x in range(12)]

for up in range(2):
    for down in range(2):
        for north in range(2):
            for east in range(2):
                for south in range(2):
                    for west in range(2):
                        if down == 1:
                            a *= 0
                            b *= 0
                            c *= 0
                            d *= 0
                        if up == 1:
                            l *= 0
                            j *= 0
                            i *= 0
                            k *= 0
                        if west == 1:
                            i *= 0
                            a *= 0
                            e *= 0
                            f *= 0
                        if south == 1:
                            j *= 0
                            b *= 0
                            f *= 0
                            g *= 0
                        if east == 1:
                            k *= 0
                            c *= 0
                            g *= 0
                            h *= 0
                        if north == 1:
                            l *= 0
                            d *= 0
                            h *= 0
                            e *= 0
                        northT = f"t{l}{d}{h}{e}"
                        eastT = f"t{k}{c}{g}{h}"
                        southT = f"t{j}{b}{f}{g}"
                        westT = f"t{i}{a}{e}{f}"
                        upT = f"t{l}{j}{i}{k}"
                        downT = f"t{b}{d}{a}{c}"
                        if north == 1:
                            northT = "hide"
                        if east == 1:
                            eastT = "hide"
                        if south == 1:
                            southT = "hide"
                        if west == 1:
                            westT = "hide"
                        if up == 1:
                            upT = "hide"
                        if down == 1:
                            downT = "hide"
                        cube = {
                            "name": f"b{up}{down}{north}{east}{south}{west}",
                            "pivot": [0, 0, 0],
                            "cubes": [
                                {
                                    "origin": [-8, 0, -8],
                                    "size": [16, 16, 16],
                                    "uv": {
                                        "north": getUV(northT, False),
                                        "east": getUV(eastT, False),
                                        "south": getUV(southT, False),
                                        "west": getUV(westT, False),
                                        "up": getUV(upT, True),
                                        "down": getUV(downT, True)
                                    }
                                }
                            ]
                        }
                        L.append(cube)
                        a, b, c, d, e, f, g, h, i, j, k, l = [1 for x in range(12)]


with open('bones.txt', 'w') as f:
    print(L, file=f)