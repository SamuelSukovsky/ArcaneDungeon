// Import classes
import Tile from './tile.js';
import Physics from '../engine/physics.js';
import Enemy from './enemy.js';
import {Images} from '../engine/resources.js';

class Attack extends Tile
{
    constructor(x, y, colour, image = null, source = null, damage = 0, damageType = null)
    {
        // Call parent's constructor
        super(x, y, colour, image);
        this.addComponent(new Physics({x:0, y:0}, {x:0, y:0}));

        this.source = source;
        this.damage = damage;
        this.damageType = damageType;
    }

    start()
    {
        console.log(this.damage);
    }

    endTurn()
    {
        this.game.removeGameObject(this);
    }

    update(deltaTime)
    {
        const physics = this.getComponent(Physics);
        // Check if the hitbox is colliding with a gameObject
        const gameObjects = this.game.gameObjects.filter((gameObject) => gameObject instanceof Enemy);
        gameObjects.push(this.game.player);
        for(const gameObject of gameObjects)
        {
            if(gameObject != this.source && physics.isColliding(gameObject.getComponent(Physics)))
            {
                gameObject.takeDamage(this.damage, this.damageType);
                console.log(gameObject.hp);
            }
        }
    }
}
  
// The Attack class is exported as the default export of this module.
export default Attack;