// Import the Images object from the 'engine' directory. This object contains all the game's image resources
import {Images} from '../engine/resources.js';

class Weapon
{
  constructor(damage = { min: 0, max: 0 }, stat, damageType, range)
  {
    // Set the weapons damage range
    this.damage = damage;
    // Set the stat that the weapon uses (0-2)
    this.stat = stat;
    // Set the damage type of the weapon
    this.damageType = damageType;
    // Set the range of the weapon
    this.range = range;
  }
}
  
// The Weapon class is exported as the default export of this module.
export default Weapon;