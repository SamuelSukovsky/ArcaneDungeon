// This class depends on the Component, which is a separate module and needs to be imported.
import Component from './component.js';

// The Input class is responsible for handling keyboard and gamepad input.
class Input extends Component 
{
  // The constructor initializes a new instance of the Input class.
  constructor() 
  {
    // Call the constructor of the parent class (Component).
    super();
    // An object to store the state of each key. The keys are the keyboard key codes, and the values are boolean indicating whether the key is down.
    this.keys = {};
    this.mousePos = { x: 0, y: 0 };
    // The index of the gamepad that this input component is listening to.
    this.gamepadIndex = null;

    // Add event listeners for the keydown and keyup events.
    // When a keydown event is fired, the corresponding key in the keys object is set to true.
    // When a keyup event is fired, the corresponding key in the keys object is set to false.
    document.addEventListener('keydown', (event) => (this.keys[event.code] = true));
    document.addEventListener('keyup', (event) => (this.keys[event.code] = false));
    // Add event listeners for the mousedown and mouseup events.
    document.addEventListener('mousedown', (event) => (this.keys[event.button] = true));
    document.addEventListener('mouseup', (event) => (this.keys[event.button] = false));
    // Add event listeners for the mousemove event.
    document.addEventListener('mousemove', (event) => (this.mousePos = { x: event.clientX - window.innerWidth / 2, y: event.clientY - window.innerHeight / 2 }));
    // Add event listeners for the contextmenu event. This prevents the context menu from appearing when the right mouse button is clicked. (Written by co-pilot)
    document.addEventListener('contextmenu', event => event.preventDefault());
  }

  // This method checks if a particular key is down.
  isKeyDown(key) 
  {
    // If the key is in the keys object and its value is true, return true. Otherwise, return false.
    return this.keys[key] || false;
  }

  // This method checks if a particular mouse button is down.
  isMouseDown(key) 
  {
    // If the key is in the keys object and its value is true, return true. Otherwise, return false.
    return this.keys[key] || false;
  }
}

// The Input class is then exported as the default export of this module.
export default Input;
