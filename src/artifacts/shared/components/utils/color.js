const HEX_CHECK = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;

function* group(data, size = 2) {
    const collection = [];
    for (const item of data) {
        const length = collection.length;
        if (length < size) {
            collection.push(item);
        } else {
            yield parseInt(`0x${collection.join('')}`);
            collection.splice(0, length, item);
        }
    }
    yield parseInt(`0x${collection.join('')}`);
}

export function hexToRgb(hex, color = hex.toLowerCase()) {
    if (!color || !HEX_CHECK.test(color)) throw new TypeError("invalid hex color");

    let [, ...data] = [...color];

    if (color.length === 4)
        data.splice(0, 3, ...data.map(value => [value, value]).flat());

    return Array.from(group(data));
}

export function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min){
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
            default: break;
        }
        h /= 6;
    }

    return [h, s, l];
}
