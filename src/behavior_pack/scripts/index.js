import { world, system } from '@minecraft/server';

const directions = {
  north: { x: 0, y: 0, z: -1 },
  east: { x: 1, y: 0, z: 0 },
  south: { x: 0, y: 0, z: 1 },
  west: { x: -1, y: 0, z: 0 },
  up: { x: 0, y: 1, z: 0 },
  down: { x: 0, y: -1, z: 0 }
};

// Function to get inverse direction
function getInverseDirection(direction) {
  const inverseDirections = {
    north: 'south',
    south: 'north',
    up: 'down',
    down: 'up',
    west: 'east',
    east: 'west'
  };

  return inverseDirections[direction] || 'error';
}

function isRedstoneRelated(block) {
  const qualifiedList = ['minecraft:redstone_wire', 'minecraft:powered_repeater', 'minecraft:unpowered_repeater', 'minecraft:powered_comparator', 'minecraft:unpowered_comparator', 'minecraft:daylight_detector', 'minecraft:daylight_detector_inverted'];
  const blockTypeId = block.typeId;
  if (qualifiedList.indexOf(blockTypeId) > -1) {
    return true;
  } else {
    return false;
  }
}

function parseCoordinates(inputString) {
  // @param {string} inputString - "x y z x1 y1 z1"
  const pattern = /^([\d.\-\~]+)\s+([\d.\-\~]+)\s+([\d.\-\~]+)\s+([\d.\-\~]+)\s+([\d.\-\~]+)\s+([\d.\-\~]+)$/;
  const match = inputString.trim().match(pattern);
  if (match) {
    return match.slice(1).map((p) => String(p).trim());
  } else {
    // Return null if input doesn't match the expected format
    return null;
  }
}

// Function to check blocks and set connection states
function updatePlacedBlockConnections(event) {
  const replacedBlock = event.block; // This is the block replaced by the placed block (air is also a type of blocks)
  const replacedBlockType = replacedBlock.typeId;
  const replacedBlockLocation = replacedBlock.location;
  const dimension = replacedBlock.dimension;
  const placedBlock = dimension.getBlock({
    x: replacedBlockLocation.x,
    y: replacedBlockLocation.y,
    z: replacedBlockLocation.z
  });
  const placedBlockType = placedBlock.typeId;
  const placedBlockConnectable = placedBlock.hasTag('lamp:connectable');

  for (const [direction, offset] of Object.entries(directions)) {
    const neighborLocation = {
      x: replacedBlockLocation.x + offset.x,
      y: replacedBlockLocation.y + offset.y,
      z: replacedBlockLocation.z + offset.z
    };

    const neighborBlock = dimension.getBlock(neighborLocation);
    const neighborBlockType = neighborBlock.typeId;
    const neighborBlockConnectable = neighborBlock.hasTag('lamp:connectable');

    if (neighborBlock && neighborBlockType === placedBlockType && neighborBlockConnectable) {
      placedBlock.setPermutation(placedBlock.permutation.withState(`lamp:connection_${direction}`, true));
      neighborBlock.setPermutation(neighborBlock.permutation.withState(`lamp:connection_${getInverseDirection(direction)}`, true));
    } else {
      if (placedBlockConnectable) {
        placedBlock.setPermutation(placedBlock.permutation.withState(`lamp:connection_${direction}`, false));
      }
    }
  }
}

function updateBrokenBlockConnections(event) {
  const replacedBlock = event.block;
  const replacedBlockType = event.block.typeId; // minecraft:air
  const replacedBlockLocation = replacedBlock.location;
  const brokenBlockType = event.brokenBlockPermutation.type.id;
  const dimension = replacedBlock.dimension;

  for (const [direction, offset] of Object.entries(directions)) {
    const neighborLocation = {
      x: replacedBlockLocation.x + offset.x,
      y: replacedBlockLocation.y + offset.y,
      z: replacedBlockLocation.z + offset.z
    };

    const neighborBlock = dimension.getBlock(neighborLocation);
    const neighborBlockType = neighborBlock.typeId;
    const neighborBlockConnectable = neighborBlock.hasTag('lamp:connectable');
    if (neighborBlock && neighborBlockType === brokenBlockType && neighborBlockConnectable) {
      neighborBlock.setPermutation(neighborBlock.permutation.withState(`lamp:connection_${getInverseDirection(direction)}`, false));
    }
  }
}

function updatePistonPushedBlockConnections(event) {
  const pistonState = event.piston.state;
  const pistonLocation = event.piston.block.location;
  const pistonBlock = event.dimension.getBlock(pistonLocation);
  const pistonFacingDirectionIndex = pistonBlock.permutation.getState('facing_direction');
  const pistonFacingDirection = ['down', 'up', 'south', 'north', 'east', 'west'][pistonFacingDirectionIndex];
  const locationOffset = directions[pistonFacingDirection];
  const attatchedBlocks = event.piston.getAttachedBlocks();

  system.runTimeout(function () {
    if (typeof attatchedBlocks === 'object' && Array.isArray(attatchedBlocks)) {
      for (const attatchedBlockPreviousLocation of attatchedBlocks) {
        let attatchedBlockCurrentLocation = {
          x: attatchedBlockPreviousLocation.x,
          y: attatchedBlockPreviousLocation.y,
          z: attatchedBlockPreviousLocation.z
        };

        if (pistonState === 'Expanding') {
          attatchedBlockCurrentLocation.x += locationOffset.x;
          attatchedBlockCurrentLocation.y += locationOffset.y;
          attatchedBlockCurrentLocation.z += locationOffset.z;
        }

        if (pistonState === 'Retracting') {
          attatchedBlockCurrentLocation.x -= locationOffset.x;
          attatchedBlockCurrentLocation.y -= locationOffset.y;
          attatchedBlockCurrentLocation.z -= locationOffset.z;
        }

        // Scans the blocks around after being pushed
        const attatchedBlock = event.dimension.getBlock(attatchedBlockCurrentLocation);
        const attatchedBlockType = attatchedBlock.typeId;
        const attatchedBlockConnectable = attatchedBlock.hasTag('lamp:connectable');
        if (attatchedBlockConnectable) {
          const attatchedBlockLocation = attatchedBlock.location;
          for (const [direction, offset] of Object.entries(directions)) {
            const neighborLocation = {
              x: attatchedBlockLocation.x + offset.x,
              y: attatchedBlockLocation.y + offset.y,
              z: attatchedBlockLocation.z + offset.z
            };
            const neighborBlock = event.dimension.getBlock(neighborLocation);
            const neighborBlockType = neighborBlock.typeId;
            const neighborBlockConnectable = neighborBlock.hasTag('lamp:connectable');
            if (neighborBlock && neighborBlockType === attatchedBlockType && neighborBlockConnectable) {
              attatchedBlock.setPermutation(attatchedBlock.permutation.withState(`lamp:connection_${direction}`, true));
              neighborBlock.setPermutation(neighborBlock.permutation.withState(`lamp:connection_${getInverseDirection(direction)}`, true));
            } else {
              if (attatchedBlockConnectable) {
                attatchedBlock.setPermutation(attatchedBlock.permutation.withState(`lamp:connection_${direction}`, false));
              }
            }
          }
        }

        // Scans the blocks around the previous location
        for (const [direction, offset] of Object.entries(directions)) {
          const neighborLocation = {
            x: attatchedBlockPreviousLocation.x + offset.x,
            y: attatchedBlockPreviousLocation.y + offset.y,
            z: attatchedBlockPreviousLocation.z + offset.z
          };
          const neighborBlock = event.dimension.getBlock(neighborLocation);
          const neighborBlockType = neighborBlock.typeId;
          const neighborBlockConnectable = neighborBlock.hasTag('lamp:connectable');

          for (const [extendedDirection, offset] of Object.entries(directions)) {
            const extendedNeighborLocation = {
              x: neighborLocation.x + offset.x,
              y: neighborLocation.y + offset.y,
              z: neighborLocation.z + offset.z
            };
            const extendedNeighborBlock = event.dimension.getBlock(extendedNeighborLocation);
            const extendedNeighborBlockType = extendedNeighborBlock.typeId;
            const extendedNeighborBlockConnectable = extendedNeighborBlock.hasTag('lamp:connectable');
            if (extendedNeighborBlock && extendedNeighborBlockType === neighborBlockType && extendedNeighborBlockConnectable) {
              neighborBlock.setPermutation(neighborBlock.permutation.withState(`lamp:connection_${extendedDirection}`, true));
              extendedNeighborBlock.setPermutation(extendedNeighborBlock.permutation.withState(`lamp:connection_${getInverseDirection(extendedDirection)}`, true));
            } else {
              if (neighborBlockConnectable) {
                neighborBlock.setPermutation(neighborBlock.permutation.withState(`lamp:connection_${extendedDirection}`, false));
              }
            }
          }
        }
      }
    }
  }, 4);
}

function updateCommandCalledBlockConnections(sourceParty, eventMessage) {
  const sourcePartyDimension = sourceParty.dimension;
  const sourcePartyLocation = sourceParty.location;
  const selectionCoordinates = parseCoordinates(eventMessage);
  let processedSelectionCoordinates = [];
  let index = 0;
  for (const selectionCoordinate of selectionCoordinates) {
    let relativeCoordinate = 0;
    if (index === 0 || index === 3) {
      relativeCoordinate = sourcePartyLocation.x;
    }
    if (index === 1 || index === 4) {
      relativeCoordinate = sourcePartyLocation.y;
    }
    if (index === 2 || index === 5) {
      relativeCoordinate = sourcePartyLocation.z;
    }
    if (!isNaN(parseFloat(selectionCoordinate))) {
      processedSelectionCoordinates.push(parseFloat(selectionCoordinate));
    }
    if (selectionCoordinate === '~') {
      processedSelectionCoordinates.push(relativeCoordinate);
    }
    if (/~[\d\-]+/.test(selectionCoordinate)) {
      processedSelectionCoordinates.push(relativeCoordinate + parseFloat(selectionCoordinate.match(/~([\d\-]+)/)[1]));
    }
    index += 1;
  }

  const minX = Math.min(processedSelectionCoordinates[0], processedSelectionCoordinates[3]);
  const maxX = Math.max(processedSelectionCoordinates[0], processedSelectionCoordinates[3]);
  const minY = Math.min(processedSelectionCoordinates[1], processedSelectionCoordinates[4]);
  const maxY = Math.max(processedSelectionCoordinates[1], processedSelectionCoordinates[4]);
  const minZ = Math.min(processedSelectionCoordinates[2], processedSelectionCoordinates[5]);
  const maxZ = Math.max(processedSelectionCoordinates[2], processedSelectionCoordinates[5]);

  const sizeX = Math.abs(maxX - minX);
  const sizeY = Math.abs(maxY - minY);
  const sizeZ = Math.abs(maxZ - minZ);

  if (sizeX * sizeY * sizeZ <= 32768) {
    for (let i = minX - 1; i < maxX + 1; i++) {
      for (let j = minY - 1; j < maxY + 1; j++) {
        for (let k = minZ - 1; k < maxZ + 1; k++) {
          const location = {
            x: i,
            y: j,
            z: k
          };
          const block = sourcePartyDimension.getBlock(location);
          const blockType = block.typeId;
          const connectable = block.hasTag('lamp:connectable');
          if (connectable) {
            for (const [direction, offset] of Object.entries(directions)) {
              const neighborLocation = {
                x: location.x + offset.x,
                y: location.y + offset.y,
                z: location.z + offset.z
              };
              const neighborBlock = sourcePartyDimension.getBlock(neighborLocation);
              const neighborBlockType = neighborBlock.typeId;
              const neighborBlockConnectable = neighborBlock.hasTag('lamp:connectable');
              if (neighborBlock && neighborBlockType === blockType && neighborBlockConnectable) {
                block.setPermutation(block.permutation.withState(`lamp:connection_${direction}`, true));
                neighborBlock.setPermutation(neighborBlock.permutation.withState(`lamp:connection_${getInverseDirection(direction)}`, true));
              } else {
                block.setPermutation(block.permutation.withState(`lamp:connection_${direction}`, false));
              }
            }
          }
        }
      }
    }
  }
}

// Event listener for block placement
world.afterEvents.playerPlaceBlock.subscribe((event) => {
  updatePlacedBlockConnections(event);
});

// Event listener for block break
world.afterEvents.playerBreakBlock.subscribe((event) => {
  updateBrokenBlockConnections(event);
});

// Event listener for piston pushes
world.afterEvents.pistonActivate.subscribe((event) => {
  updatePistonPushedBlockConnections(event);
});

// Event lister for command execution
system.afterEvents.scriptEventReceive.subscribe((event) => {
  const sourceType = event.sourceType;
  let sourceParty = {};
  switch (sourceType) {
    case 'Block':
      sourceParty = event.sourceBlock;
      break;
    case 'Entity':
      sourceParty = event.sourceEntity;
      break;
    case 'NPCDialogue':
      sourceParty = event.sourceEntity;
      break;
    case 'Server':
      sourceParty = {};
      break;
    default:
      sourceParty = {};
      break;
  }
  const eventId = event.id;
  const eventMessage = event.message;
  switch (eventId) {
    case 'lamp:update_block_connections':
      updateCommandCalledBlockConnections(sourceParty, eventMessage);
      break;
    case 'lamp:ubc':
      updateCommandCalledBlockConnections(sourceParty, eventMessage);
      break;
    default:
      break;
  }
});

const LampBistableComponent = {
  onPlayerInteract({ block, dimension }) {
    const isBistable = block.hasTag('lamp:bistable');
    if (isBistable) {
      const isTrue = block.permutation.getState('lamp:bistable_status');
      const sound = isTrue ? 'close.wooden_trapdoor' : 'open.wooden_trapdoor';
      block.setPermutation(block.permutation.withState('lamp:bistable_status', !isTrue));
      dimension.playSound(sound, block.center(), {
        pitch: 0.9,
        volume: 0.9
      });
    }
  }
};

const LampAdjustableLightnessComponent = {
  onPlayerInteract({ block, dimension }) {
    const isAdjustable = block.hasTag('lamp:adjustable_lightness');
    if (isAdjustable) {
      const lightness = block.permutation.getState('lamp:adjustable_lightness');
      let newLightness = 0;
      switch (lightness) {
        case 0:
          newLightness = 5;
          break;
        case 5:
          newLightness = 10;
          break;
        case 10:
          newLightness = 15;
          break;
        case 15:
          newLightness = 0;
          break;
        default:
          newLightness = 0;
          break;
      }
      const sound = newLightness === 0 ? 'close.wooden_trapdoor' : 'open.wooden_trapdoor';
      block.setPermutation(block.permutation.withState('lamp:adjustable_lightness', newLightness));
      dimension.playSound(sound, block.center(), {
        pitch: 0.9,
        volume: 0.9
      });
    }
  }
};

const LampRedstoneResponsiveComponent = {
  onTick({ block, dimension }) {
    const isRedstoneResponsive = block.hasTag('lamp:redstone_responsive');
    if (isRedstoneResponsive) {
      const blockLocation = block.location;
      let receivedRedstonePowers = [0];
      for (const [direction, offset] of Object.entries(directions)) {
        const neighborLocation = {
          x: blockLocation.x + offset.x,
          y: blockLocation.y + offset.y,
          z: blockLocation.z + offset.z
        };

        const neighborBlock = dimension.getBlock(neighborLocation);
        if (neighborBlock) {
          const neighborBlockRedstoneRelated = isRedstoneRelated(neighborBlock);
          if (neighborBlockRedstoneRelated) {
            const neighborBlockRedstonePower = neighborBlock.getRedstonePower();
            receivedRedstonePowers.push(neighborBlockRedstonePower);
          }
        }
      }
      const determiningRestonePower = Math.max(...receivedRedstonePowers);
      block.setPermutation(block.permutation.withState('lamp:redstone_signal', determiningRestonePower));
    }
  }
};

world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
  blockComponentRegistry.registerCustomComponent('lamp:bistable_component', LampBistableComponent);
  blockComponentRegistry.registerCustomComponent('lamp:adjustable_lightness_component', LampAdjustableLightnessComponent);
  blockComponentRegistry.registerCustomComponent('lamp:redstone_responsive_component', LampRedstoneResponsiveComponent);
});
