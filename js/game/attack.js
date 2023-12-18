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
        // Add a Renderer component
        this.addComponent(new Renderer(colour, 64, 64, image));
        // Add a Physics component to handle interactions
        this.addComponent(new Physics({x:0, y:0}, {x:0, y:0}));

        // Set the source of the attack
        this.source = source;
        // Set the damage of the attack
        this.damage = damage;
        // Set the damage type of the attack
        this.damageType = damageType;
        // Create an array to hold all the objects already hit by the attack
        this.objectsHit = [];
    }

    // At the end of turn, remove the attack from the game
    endTurn()
    {
        this.game.removeGameObject(this);
    }

    // Each frame
    update()
    {
        const physics = this.getComponent(Physics); // Get the physics component
        // Get all enemy objects and the player
        const gameObjects = this.game.gameObjects.filter((obj) => obj instanceof Enemy);
        gameObjects.push(this.game.player);
        // For each object
        for(const obj of gameObjects)
        {
            // If the object is not the source of the attack, the object hasn't already been hit, and the object is colliding with the attack
            if(obj != this.source && !this.objectsHit.includes(obj) && physics.isColliding(obj.getComponent(Physics)))
            {
                // Deal damage to the object
                obj.takeDamage(this.damage, this.damageType);
                // If the attack's source has a higher strength than the target, stagger the target
                if(this.source.stats[0] > obj.stats[0])
                {
                    obj.bounce();
                }
                // Add the object to the list of objects hit
                this.objectsHit.push(obj);
            }
        }
    }
}
  
// The Attack class is exported as the default export of this module.
export default Attack;