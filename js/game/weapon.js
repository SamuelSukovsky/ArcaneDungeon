// Import the Images object from the 'engine' directory. This object contains all the game's image resources
import {Images} from '../engine/resources.js';

class Weapon
{
  constructor(damage = { min: 0, max: 0 }, stat, damageType, range)
  {
    this.damage = damage;
    this.stat = stat;
    this.damageType = damageType;
    this.range = range;
  }
}
  
// The Weapon class is exported as the default export of this module.
export default Weapon;