import { world, system } from '@minecraft/server';

function mainTick() {
  if (system.currentTick === 400) {
    world.sendMessage('All systems GO!');
  }
  system.run(mainTick);
}

system.run(mainTick);

// Function to get inverse direction
function getInverseDirection(direction) {
  switch (direction) {
    case 'north':
      return 'south';
      break;
    case 'south':
      return 'north';
      break;
    case 'up':
      return 'down';
      break;
    case 'down':
      return 'up';
      break;
    case 'west':
      return 'east';
      break;
    case 'east':
      return 'west';
      break;
    default:
      return 'error';
      break;
  }
}

// Function to check blocks and set connection states
function updateBlockConnections(replacedBlock) {
  const directions = {
    north: { x: 0, y: 0, z: -1 },
    east: { x: 1, y: 0, z: 0 },
    south: { x: 0, y: 0, z: 1 },
    west: { x: -1, y: 0, z: 0 },
    up: { x: 0, y: 1, z: 0 },
    down: { x: 0, y: -1, z: 0 }
  };

  const replacedBlockType = replacedBlock.typeId;
  const replacedBlockLocation = replacedBlock.location;
  const dimension = replacedBlock.dimension;
  const placedBlock = dimension.getBlock({
    x: replacedBlockLocation.x,
    y: replacedBlockLocation.y,
    z: replacedBlockLocation.z
  });
  const placedBlockType = placedBlock.typeId;

  for (const [direction, offset] of Object.entries(directions)) {
    const neighborLocation = {
      x: replacedBlockLocation.x + offset.x,
      y: replacedBlockLocation.y + offset.y,
      z: replacedBlockLocation.z + offset.z
    };

    const neighborBlock = dimension.getBlock(neighborLocation);

    if (neighborBlock && neighborBlock.typeId === placedBlockType) {
      placedBlock.setPermutation(placedBlock.permutation.withState(`lamp:connection_${direction}`, true));
      neighborBlock.setPermutation(neighborBlock.permutation.withState(`lamp:connection_${getInverseDirection(direction)}`, true));
    } else {
      placedBlock.setPermutation(placedBlock.permutation.withState(`lamp:connection_${direction}`, false));
      neighborBlock.setPermutation(neighborBlock.permutation.withState(`lamp:connection_${getInverseDirection(direction)}`, false));
    }
  }
}

// Event listener for block placement
world.afterEvents.playerPlaceBlock.subscribe((event) => {
  const replacedBlock = event.block; // this is the block replaced by the placed block
  updateBlockConnections(replacedBlock);
});

// Subscribe to block break event
world.afterEvents.playerBreakBlock.subscribe((event) => {
  const brokenBlock = event.block;
  updateBlockConnections(brokenBlock);
});
