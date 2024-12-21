import { world } from '@minecraft/server';

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

// Event listener for block placement
world.afterEvents.playerPlaceBlock.subscribe((event) => {
  updatePlacedBlockConnections(event);
});

// Event listener for block break
world.afterEvents.playerBreakBlock.subscribe((event) => {
  updateBrokenBlockConnections(event);
});

function updateBistableBlock(event) {
  const interactedBlock = event.block;
  const interactedBlockBistable = interactedBlock.hasTag('lamp:bistable');
  if (interactedBlockBistable) {
    const bistableStatus = interactedBlock.permutation.getState('lamp:bistable_status');
    if (bistableStatus) {
      interactedBlock.setPermutation(interactedBlock.permutation.withState('lamp:bistable_status', false));
    } else {
      interactedBlock.setPermutation(interactedBlock.permutation.withState('lamp:bistable_status', true));
    }
  }
}

// Event listener for interaction with block
world.afterEvents.playerInteractWithBlock.subscribe((event) => {
  updateBistableBlock(event);
});
