
export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

export function createFloatingText(text, x, y, color, size = 16, game) {
    game.floatingTexts.push({
        text: text, x: x, y: y, color: color, size: size,
        opacity: 1, lift: 0, duration: 90, life: 90,
        update: function() {
            this.life--;
            this.lift += 0.5;
            this.opacity = Math.max(0, this.life / this.duration);
        },
        draw: function(ctx) {
            ctx.font = `bold ${this.size}px Arial`;
            let r = 255, g = 255, b = 255;
            if (this.color.startsWith('#')) {
                const parsedColor = hexToRgb(this.color); 
                if(parsedColor) { r = parsedColor.r; g = parsedColor.g; b = parsedColor.b;}
            } else if (this.color.startsWith('rgb')) {
                const parts = this.color.match(/[\d.]+/g);
                if (parts && parts.length >= 3) {
                    r = parseInt(parts[0]);
                    g = parseInt(parts[1]);
                    b = parseInt(parts[2]);
                }
            }
            ctx.fillStyle = `rgba(${r},${g},${b},${this.opacity})`;
            ctx.fillText(this.text, this.x, this.y - this.lift);
        }
    });
}

export function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

export function applyColorTint(baseHex, tint) {
    let rgb = hexToRgb(baseHex);
    if (!rgb) return baseHex;

    rgb.r = Math.max(0, Math.min(255, rgb.r + tint.r));
    rgb.g = Math.max(0, Math.min(255, rgb.g + tint.g));
    rgb.b = Math.max(0, Math.min(255, rgb.b + tint.b));

    return `rgb(${rgb.r},${rgb.g},${rgb.b})`;
}


export function isMobileDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
    const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    
    return isMobile || (hasTouch && window.innerWidth < 768);
}
export function lightenColor(hex, percent) {
    const rgbColor = hexToRgb(hex);
    if (!rgbColor) return hex; 
    let { r, g, b } = rgbColor;
    r = Math.min(255, Math.floor(r * (1 + percent / 100)));
    g = Math.min(255, Math.floor(g * (1 + percent / 100)));
    b = Math.min(255, Math.floor(b * (1 + percent / 100)));
    return `rgb(${r},${g},${b})`;
}

export function darkenColor(hex, percent) {
    const rgbColor = hexToRgb(hex);
    if (!rgbColor) return hex; 
    let { r, g, b } = rgbColor;
    r = Math.max(0, Math.floor(r * (1 - percent / 100)));
    g = Math.max(0, Math.floor(g * (1 - percent / 100)));
    b = Math.max(0, Math.floor(b * (1 - percent / 100)));
    return `rgb(${r},${g},${b})`;
}