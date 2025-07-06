export function isMobileDevice(): boolean {
    // Check user agent
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    
    // Check for mobile user agents
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    const isMobileUA = mobileRegex.test(userAgent.toLowerCase());
    
    // Check for touch capability
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Check screen size (mobile typically < 768px width)
    const isSmallScreen = window.innerWidth < 768;
    
    // Consider it mobile if any of these conditions are true
    return isMobileUA || (hasTouch && isSmallScreen);
}

export function isDesktop(): boolean {
    return !isMobileDevice();
}

export function getDeviceType(): 'mobile' | 'desktop' {
    return isMobileDevice() ? 'mobile' : 'desktop';
}

export function logDeviceInfo(): void {
    console.log('Device Detection:', {
        userAgent: navigator.userAgent,
        isMobile: isMobileDevice(),
        isDesktop: isDesktop(),
        deviceType: getDeviceType(),
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        hasTouch: 'ontouchstart' in window,
        maxTouchPoints: navigator.maxTouchPoints
    });
}
