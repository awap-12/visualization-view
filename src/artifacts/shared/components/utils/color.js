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
    const cMax = Math.max(r, g, b), cMin = Math.min(r, g, b), delta = cMax - cMin;
    let h, s, l = (cMax + cMin) / 2;

    if (delta === 0){
        h = s = 0; // achromatic
    } else {
        s = l > 0.5
            ? delta / (2 - cMax - cMin) :
            delta / (cMax + cMin);
        const deltaR = (((cMax - r) / 6) + (delta / 2)) / delta;
        const deltaG = (((cMax - g) / 6) + (delta / 2)) / delta;
        const deltaB = (((cMax - b) / 6) + (delta / 2)) / delta;
        switch(cMax) {
            case r: h = deltaB - deltaG; break;
            case g: h = (1 / 3) + deltaR - deltaB; break;
            case b: h = (2 / 3) + deltaG - deltaR; break;
            default: break;
        }
        if (h < 0)
            h += 1;
        else if (h > 1.0)
            h -= 1;
    }

    return [h, s, l];
}
