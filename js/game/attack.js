// Import classes
import GameObject from '../engine/gameobject.js';
import Renderer from '../engine/renderer.js';
import Physics from '../engine/physics.js';
import Enemy from './enemy.js';
import {Images} from '../engine/resources.js';

class Attack extends GameObject
{
    constructor(x, y, colour, image = null, source = null, damage = 0, damageType = null)
    {
        // Call parent's constructor
        super(x, y);
        this.addComponent(new Renderer(colour, 64, 64, image));
        this.addComponent(new Physics({x:0, y:0}, {x:0, y:0}));

        this.source = source;
        this.damage = damage;
        this.damageType = damageType;
        this.objectsHit = [];
    }

    endTurn()
    {
        this.game.removeGameObject(this);
    }

    update(deltaTime)
    {
        const physics = this.getComponent(Physics);
        // Check if the hitbox is colliding with a gameObject
        const gameObjects = this.game.gameObjects.filter((obj) => obj instanceof Enemy);
        gameObjects.push(this.game.player);
        for(const obj of gameObjects)
        {
            if(obj != this.source && !this.objectsHit.includes(obj) && physics.isColliding(obj.getComponent(Physics)))
            {
                obj.takeDamage(this.damage, this.damageType);
                if(this.source.stats[0] > obj.stats[0])
                {
                    obj.bounce();
                }
                this.objectsHit.push(obj);
            }
        }
    }
}
  
// The Attack class is exported as the default export of this module.
export default Attack;