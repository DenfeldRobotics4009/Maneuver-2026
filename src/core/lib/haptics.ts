class HapticFeedback {
    private isIOS: boolean;
    private isInstalled: boolean;
    private debugInfo: {
        isIOS: boolean;
        isInstalled: boolean;
        userAgent: string;
        displayMode: boolean;
        vibrateSupport: boolean;
        vibrateFunction: string;
        hostname: string;
        attempts: Array<{ pattern: number | number[], result: boolean, timestamp: string }>;
    };

    constructor() {
        this.isIOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);
        this.isInstalled = typeof window !== "undefined" && window.matchMedia('(display-mode: standalone)').matches;

        // Store debug info for mobile display
        this.debugInfo = {
            isIOS: this.isIOS,
            isInstalled: this.isInstalled,
            userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
            displayMode: typeof window !== "undefined" && window.matchMedia('(display-mode: standalone)').matches,
            vibrateSupport: typeof navigator !== "undefined" && 'vibrate' in navigator,
            vibrateFunction: typeof navigator !== "undefined" ? typeof navigator.vibrate : "undefined",
            hostname: typeof location !== "undefined" ? location.hostname : "localhost",
            attempts: []
        };
    }

    private canVibrate(): boolean {
        if (typeof navigator === "undefined" || !('vibrate' in navigator) || !navigator.vibrate) {
            return false;
        }

        // iOS Safari does not support the Vibration API at all
        if (this.isIOS) {
            return false;
        }

        return true;
    }

    vibrate(pattern: number | number[] = 50) {
        const canVib = this.canVibrate();
        let result = false;

        if (canVib && typeof navigator !== "undefined" && 'vibrate' in navigator) {
            result = navigator.vibrate(pattern);
        }

        // Store attempt for debugging
        this.debugInfo.attempts.push({
            pattern,
            result,
            timestamp: new Date().toLocaleTimeString()
        });

        // For iOS, provide visual feedback instead
        if (this.isIOS && !result) {
            this.visualFeedback();
        }
    }

    // Visual feedback alternative for iOS
    private visualFeedback() {
        if (typeof document === "undefined") return;
        const originalFilter = document.body.style.filter;
        document.body.style.filter = 'brightness(1.1)';
        document.body.style.transition = 'filter 0.05s ease';

        setTimeout(() => {
            document.body.style.filter = originalFilter;
            setTimeout(() => {
                document.body.style.transition = '';
            }, 50);
        }, 50);
    }

    light() {
        this.vibrate(25);
    }

    medium() {
        this.vibrate(50);
    }

    strong() {
        this.vibrate(100);
    }

    success() {
        this.vibrate([50, 100, 50]);
    }

    error() {
        this.vibrate([100, 50, 100, 50, 100]);
    }

    notification() {
        this.vibrate([100, 50, 100]);
    }

    selection() {
        this.vibrate(15);
    }

    warning() {
        this.vibrate([150, 100, 150]);
    }

    isSupported(): boolean {
        return this.canVibrate();
    }

    getDebugInfo() {
        return this.debugInfo;
    }
}

export const haptics = new HapticFeedback();
