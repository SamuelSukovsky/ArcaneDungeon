// Import necessary classes and resources
import Game from '../engine/game.js';
import Enemy from './enemy.js';
import Tile from './tile.js';
import Wall from './wall.js';
import PlayerUI from './playerUI.js';
import Collectible from './collectible.js';

// Define a class Level that extends the Game class from the engine
class Level extends Game
{
  // Define the constructor for this class, which takes one argument for the canvas ID
  constructor(canvasId)
  {
    // Call the constructor of the superclass (Game) with the canvas ID
    super(canvasId);

    // Set the maximum dimensions of the map
    this.mapX = 6;
    this.mapY = 6;
    // Set the width of corridors
    this.mapScale = 3;

    let spawn = this.generate(this.mapX, this.mapY, this.mapScale);
    this.player.resetPlayerState(spawn[0], spawn[1]);
    this.addTile(this.player.pointAt);
    this.addGameObject(this.player);
    
    // Add the player UI object to the game
    this.addGameObject(new PlayerUI(10, 10));

    // Set the game's camera target to the player
    this.camera.target = this.player;
  }

  // Define the generate method, which generates the level and returns the player object
  generate(mapX, mapY, mapScale)
  {
    // Define the possible room types
    const corridors = ['NE', 'NS', 'NW', 'ES', 'EW', 'SW', 'NES', 'NEW', 'NSW', 'ESW', 'NESW'];
    const endCorridors = ['N', 'E', 'S', 'W'];
    
    // Create the map template
    var mapCore = [];
    for(let i = 0; i < mapY + 2; i++)
    {
      mapCore[i] = [];
      for(let j = 0; j < mapX + 2; j++)
      {
        mapCore[i][j] = 'O';
      }
    }

    // Add the border to the map
    for(let i = 0; i < mapX + 2; i++)
    {
      mapCore[0][i] = 'X';
      mapCore[mapY + 1][i] = 'X';
    }
    for(let i = 0; i < mapY + 2; i++)
    {
      mapCore[i][0] = 'X';
      mapCore[i][mapX + 1] = 'X';
    }

    // Calculate the minimum number of rooms to generate
    const targetRooms = Math.floor(mapX * mapY * .7);
    var generated = false;
    var spawnX;
    var spawnY;
    var map;

    // Generate the map
    while(!generated)
    {
      // Reset the map to the template
      map = [];
      for(var i = 0; i < mapCore.length; i++)
      {
        map[i] = mapCore[i].slice();
      }
      
      // Place the starting corridor
      spawnX = Math.floor(Math.random() * mapX) + 1;
      spawnY = Math.floor(Math.random() * mapY) + 1;
      var availableRooms = this.legalRoomTypes(map, spawnX, spawnY, endCorridors);
      map[spawnY][spawnX] = availableRooms[Math.floor(Math.random() * availableRooms.length)];

      // Start placing rooms
      var placedRooms = 1;
      var roomSelection = [];

      // While the minimum number of rooms has not been placed
      for(let k = 0; k < (mapX + mapY) / 5; k++)
      {
        var failed = true;
        // For each cell on the map grid
        for(let i = 1; i < mapY + 1; i++)
        {
          for(let j = 1; j < mapX + 1; j++)
          {
            // If the cell is empty and has an adjacent room
            if(map[i][j] == 'O' && this.checkAdjacency(map, j, i) > 0)
            {
              // Get the legal room types for this cell
              roomSelection = this.legalRoomTypes(map, j, i, corridors);
              // If there are legal room types
              if(roomSelection.length > 0)
              {
                // Place a random room from selection
                map[i][j] = roomSelection[Math.floor(Math.random() * roomSelection.length)];
                placedRooms++;
                // Declare that the generation cycle has not failed
                failed = false;
              }
            }
          }
        }

        // If the generation cycle has failed
        if(failed)
        {
          // break cycle
          break;
        }
      }

      for(let i = 1; i < mapY + 1; i++)
      {
        for(let j = 1; j < mapX + 1; j++)
        {
          // If the cell is empty and has adjecent rooms
          if(map[i][j] == 'O' && this.checkAdjacency(map, j, i) > 0)
          {
            // Get the legal room types for this cell
            var roomSelection = this.legalRoomTypes(map, j, i, endCorridors.concat(corridors));
            // place corridor with least connections
            map[i][j] = roomSelection[0];
            placedRooms++;
          }
        }
      }

      // If enough rooms have been placed
      if(placedRooms >= targetRooms)
      {
        // End map generation
        generated = true;
      }
    }

    // Spawn the rooms
    for(let i = 0; i < mapY; i++)
    {
      for(let j = 0; j < mapX; j++)
      {
        this.spawnRoom(j, i, map[i + 1][j + 1], mapScale);
      }
    }

    // Spawn the player in the spawn room
    return [((spawnX * 3 - 2) * mapScale + Math.floor(mapScale / 2)), ((spawnY * 3 - 2) * mapScale + Math.floor(mapScale / 2))];
  }

  // Define the legalRoomTypes method, which returns the room types a given cell can be
  legalRoomTypes(map, x, y, availableRooms)
  {
    // If the above cell has a south exit, all available rooms must have a north exit
    if(map[y - 1][x].includes('S'))
    {
      availableRooms = availableRooms.filter(item => item.includes('N'));
    }
    // Else if the above cell is not a border and does not have a south exit, all available rooms must not have a north exit
    else if (map[y - 1][x] != 'O' && !map[y - 1][x].includes('S'))
    {
      availableRooms = availableRooms.filter(item => !item.includes('N'));
    }

    // If the below cell has a north exit, all available rooms must have a south exit
    if(map[y + 1][x].includes('N'))
    {
      availableRooms = availableRooms.filter(item => item.includes('S'));
    }
    // Else if the below cell is not a border and does not have a north exit, all available rooms must not have a south exit
    else if (map[y + 1][x] != 'O' && !map[y + 1][x].includes('N'))
    {
      availableRooms = availableRooms.filter(item => !item.includes('S'));
    }

    // If the left cell has an east exit, all available rooms must have a west exit
    if(map[y][x - 1].includes('E'))
    {
      availableRooms = availableRooms.filter(item => item.includes('W'));
    }
    // Else if the left cell is not a border and does not have an east exit, all available rooms must not have a west exit
    else if (map[y][x - 1] != 'O' && !map[y][x - 1].includes('E'))
    {
      availableRooms = availableRooms.filter(item => !item.includes('W'));
    }

    // If the right cell has a west exit, all available rooms must have an east exit
    if(map[y][x + 1].includes('W'))
    {
      availableRooms = availableRooms.filter(item => item.includes('E'));
    }
    // Else if the right cell is not a border and does not have a west exit, all available rooms must not have an east exit
    else if (map[y][x + 1] != 'O' && !map[y][x + 1].includes('W'))
    {
      availableRooms = availableRooms.filter(item => !item.includes('E'));
    }

    // Return the array of available rooms
    return availableRooms;
  }

  // Define the checkAdjacency method, which returns true if a given cell has a connection from another room
  checkAdjacency(map, x, y)
  {
    // Default adjacent to false
    var adjacent = 0;
    // If the above cell has a south exit, return true
    if(map[y - 1][x].includes('S'))
    {
      adjacent++;
    }
    // If the below cell has a north exit, return true
    if(map[y + 1][x].includes('N'))
    {
      adjacent++;
    }
    // If the left cell has an east exit, return true
    if(map[y][x - 1].includes('E'))
    {
      adjacent++;
    }
    // If the right cell has a west exit, return true
    if(map[y][x + 1].includes('W'))
    {
      adjacent++;
    }
    // Return adjacent
    return adjacent;
  }

  // Define the spawnRoom method, which spawns tiles for a room at a given location
  spawnRoom(x, y, roomType, mapScale)
  {
    // If a room is present
    if(roomType != 'O' && roomType != 'X')
    {
      let shift = 0;
      // Spawn the room tiles
      for(let i = 0; i < mapScale; i++)
      {
        for(let j = 0; j < mapScale; j++)
        {
          this.addTile(new Tile(((x * 3 + 1) * mapScale + j), ((y * 3 + 1) * mapScale + i), 'brown', null));
        }
      }
      // Create room edge walls
      this.addTile(new Wall(((x * 3 + 1) * mapScale - 1), ((y * 3 + 1) * mapScale - 1), '#222', null));
      this.addTile(new Wall(((x * 3 + 2) * mapScale), ((y * 3 + 1) * mapScale - 1), '#222', null));
      this.addTile(new Wall(((x * 3 + 1) * mapScale - 1), ((y * 3 + 2) * mapScale), '#222', null));
      this.addTile(new Wall(((x * 3 + 2) * mapScale), ((y * 3 + 2) * mapScale), '#222', null));

      // If the room has a north exit
      if(roomType.includes('N'))
      {
        // Spawn the north exit tiles
        // Spawn the south exit tiles
        for(let i = -1; i < mapScale + 1; i++)
        {
          if (i == -1 || i == mapScale)
          {
            for (let j = 1; j < mapScale; j++)
            {
              this.addTile(new Wall(((x * 3 + 1) * mapScale + i), ((y * 3) * mapScale + j - 1), '#222', null));
            }
          }
          else
          {
            for(let j = 0; j < mapScale; j++)
            {
              this.addTile(new Tile(((x * 3 + 1) * mapScale + i), ((y * 3) * mapScale + j), 'brown', null));
            }
          }
        }
      }
      // Else create the north wall
      else
      {
        for(let i = 0; i < mapScale; i++)
        {
          this.addTile(new Wall(((x * 3 + 1) * mapScale + i), ((y * 3 + 1) * mapScale - 1), '#222', null));
        }
      }

      // If the room has a south exit
      if(roomType.includes('S'))
      {
        // Spawn the south exit tiles
        for(let i = -1; i < mapScale + 1; i++)
        {
          if (i == -1 || i == mapScale)
          {
            for (let j = 1; j < mapScale; j++)
            {
              this.addTile(new Wall(((x * 3 + 1) * mapScale + i), ((y * 3 + 2) * mapScale + j), '#222', null));
            }
          }
          else
          {
            for(let j = 0; j < mapScale; j++)
            {
              this.addTile(new Tile(((x * 3 + 1) * mapScale + i), ((y * 3 + 2) * mapScale + j), 'brown', null));
            }
          }
        }
      }
      // Else create the south wall
      else
      {
        for(let i = 0; i < mapScale; i++)
        {
          this.addTile(new Wall(((x * 3 + 1) * mapScale + i), ((y * 3 + 2) * mapScale), '#222', null));
        }
      }
       
      // If the room has an east exit
      if(roomType.includes('E'))
      {
        // Spawn the east exit tiles
        for(let i = -1; i < mapScale + 1; i++)
        {
          if (i == -1 || i == mapScale)
          {
            for (let j = 1; j < mapScale; j++)
            {
              this.addTile(new Wall(((x * 3 + 2) * mapScale + j), ((y * 3 + 1) * mapScale + i), '#222', null));
            }
          }
          else
          {
            for(let j = 0; j < mapScale; j++)
            {
              this.addTile(new Tile(((x * 3 + 2) * mapScale + j), ((y * 3 + 1) * mapScale + i), 'brown', null));
            }
          }
        }
      }
      // Else create the east wall
      else
      {
        for(let i = 0; i < mapScale; i++)
        {
          this.addTile(new Wall(((x * 3 + 2) * mapScale), ((y * 3 + 1) * mapScale + i), '#222', null));
        }
      }

      // If the room has a west exit
      if(roomType.includes('W'))
      {
        // Spawn the west exit tiles
        for(let i = -1; i < mapScale + 1; i++)
        {
          if (i == -1 || i == mapScale)
          {
            for (let j = 0; j < mapScale - 1; j++)
            {
              this.addTile(new Wall(((x * 3) * mapScale + j), ((y * 3 + 1) * mapScale + i), '#222', null));
            }
          }
          else
          {
            for(let j = 0; j < mapScale; j++)
            {
              this.addTile(new Tile(((x * 3) * mapScale + j), ((y * 3 + 1) * mapScale + i), 'brown', null));
            }
          } 
        }
      }
      // Else create the west wall
      else
      {
        for(let i = 0; i < mapScale; i++)
        {
          this.addTile(new Wall(((x * 3 + 1) * mapScale - 1), ((y * 3 + 1) * mapScale + i), '#222', null));
        }
      }
    }
  }
}

// Export the Level class as the default export of this module
export default Level;
