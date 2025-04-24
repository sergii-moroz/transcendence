export class View {

    constructor(api, router) {
        this.element = document.createElement('div');
        // this.element.classList.add('view'); //maybe for css
        this.eventListeners = [];
        
        this.api = api;
        this.router = router;
        
        this.getContent = this.getContent.bind(this);
        this.mount = this.mount.bind(this);
        this.unmount = this.unmount.bind(this);
    }
    
    getContent(input) {
        this.element.innerHTML = '<h1>Base View. SHOULD BE OVERWRITTEN</h1>';
    }
    
    async mount(parent) {
        parent.innerHTML = '';
        
        const input = await this.prehandler();
        this.getContent(input);
        parent.append(this.element);
        this.setupEventListeners();
    }

    async prehandler()
    {
        // Should be overridden by subclasses if needed
        return {};
    }
    
    setupEventListeners() {
        // Should be overridden by subclasses if needed
    }

    addEventListener(element, type, handler)
    {
        element.addEventListener(type, handler);
        this.eventListeners.push({element, type, handler});
    }
    
    unmount() {
        this.cleanupEventListeners();

        if (this.element.parentElement) {
            this.element.remove();
        }
    }
    
    cleanupEventListeners() {
        this.eventListeners.forEach( ({element, type, handler}) => {
            element.removeEventListener(type, handler);
        });
        this.eventListeners = [];
    }
}
