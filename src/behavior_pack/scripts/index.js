import { world, BlockPermutation } from '@minecraft/server';

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
function updateBlockConnections(block) {
  const directions = {
    north: { x: 0, y: 0, z: -1 },
    east: { x: 1, y: 0, z: 0 },
    south: { x: 0, y: 0, z: 1 },
    west: { x: -1, y: 0, z: 0 },
    up: { x: 0, y: 1, z: 0 },
    down: { x: 0, y: -1, z: 0 }
  };

  const blockType = block.typeId;
  const blockLocation = block.location;
  const dimension = block.dimension;

  for (const [direction, offset] of Object.entries(directions)) {
    const neighborLocation = {
      x: blockLocation.x + offset.x,
      y: blockLocation.y + offset.y,
      z: blockLocation.z + offset.z
    };

    const neighborBlock = dimension.getBlock(neighborLocation);

    if (neighborBlock && neighborBlock.typeId === blockType) {
      block.setPermutation(block.permutation.withState(`lamp:connection_${direction}`, true));
      neighborBlock.setPermutation(neighborBlock.permutation.withState(`lamp:connection_${getInverseDirection(direction)}`, true));
    } else {
      block.setPermutation(block.permutation.withState(`lamp:connection_${direction}`, false));
      neighborBlock.setPermutation(neighborBlock.permutation.withState(`lamp:connection_${getInverseDirection(direction)}`, false));
    }
  }
}

// Event listener for block placement
world.afterEvents.blockPlace.subscribe((event) => {
  const placedBlock = event.block;
  updateBlockConnections(placedBlock);
});

// Subscribe to block break event
world.afterEvents.blockBreak.subscribe((event) => {
  const brokenBlock = event.block;
  updateBlockConnections(brokenBlock);
});
