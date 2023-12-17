import GameObject from '../engine/gameobject.js';
import UI from '../engine/ui.js';
import Player from './player.js';

// The PlayerUI class extends GameObject.
class PlayerUI extends GameObject
{
  constructor(x, y)
  {
    super(x, y); // Call the constructor of the GameObject class.

    // Create a new UI component with initial text and add it to this object's components.
    this.strengthDisplay = new UI('Strength: 3', x, y, '20px Arial', '#c00');
    this.addComponent(this.strengthDisplay);
    this.agilityDisplay = new UI('Agility: 3', x, y + 22, '20px Arial', '#0c0');
    this.addComponent(this.agilityDisplay);
    this.intelligenceDisplay = new UI('Intelligence: 3', x, y + 44, '20px Arial', '#00c');
    this.addComponent(this.intelligenceDisplay);
    this.player;
  }

  start()
  {
    // Find the player object in the game's gameObjects array.
    this.player = this.game.gameObjects.find((obj) => obj instanceof Player);
    this.strengthDisplay.setText(`Strength: ${this.player.stats[0]}`);
    this.agilityDisplay.setText(`Agility: ${this.player.stats[1]}`);
    this.intelligenceDisplay.setText(`Intelligence: ${this.player.stats[2]}`);
  }
  // The update method is called every frame.
  update(deltaTime)
  {
    // Update the text of the UI component to reflect the player's current lives and score.
    this.strengthDisplay.setText(`Strength: ${this.player.stats[0]}`);
    this.agilityDisplay.setText(`Agility: ${this.player.stats[1]}`);
    this.intelligenceDisplay.setText(`Intelligence: ${this.player.stats[2]}`);
  }
}

export default PlayerUI; // Export the PlayerUI class for use in other modules.
