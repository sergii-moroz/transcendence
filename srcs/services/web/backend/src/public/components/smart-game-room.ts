import { GameRoom } from "./game.js";
import { Game3D } from "./GameRoom3D.js";
import { isMobileDevice, logDeviceInfo } from "../utils/device-detection.js";

export class SmartGameRoom extends HTMLElement {
    private gameComponent: GameRoom | Game3D | null = null;

    constructor() {
        super();
    }

    connectedCallback() {
        // Log device information for debugging
        logDeviceInfo();
        
        // Check for URL parameter to force 2D mode
        const urlParams = new URLSearchParams(window.location.search);
        const force2D = urlParams.get('mode') === '2d';
        
        const deviceType = isMobileDevice() ? 'mobile' : 'desktop';
        console.log(`Device detected as: ${deviceType}`);
        
        if (force2D) {
            console.log("Forcing 2D mode due to URL parameter");
        }
        
        // Choose the appropriate game component based on device or URL parameter
        if (isMobileDevice() || force2D) {
            console.log("Loading 2D game for mobile device or forced 2D mode");
            this.gameComponent = new GameRoom();
        } else {
            console.log("Loading 3D game for desktop device");
            this.gameComponent = new Game3D();
        }
        
        // Add the chosen component to the DOM
        this.appendChild(this.gameComponent);
    }

    disconnectedCallback() {
        if (this.gameComponent) {
            this.removeChild(this.gameComponent);
            this.gameComponent = null;
        }
    }
}
