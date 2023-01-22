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
    const rgb = { r: r / 255, g: g / 255, b: b / 255 };
    const [min, max] = getRange(rgb);
    const hue = getHue(rgb, [min, max]);
    const lightness = (min + max) / 2;
    const delta = max - min;

    const saturation = delta !== 0
        ? lightness > 0.5
            ? delta / (2 - max - min)
            : delta / (max + min)
        : 0;

    return [hue, saturation, lightness];
}

export function rgbToHwb(r, g, b) {
    const rgb = { r: r / 255, g: g / 255, b: b / 255 };
    const [min, max] = getRange(rgb);
    const hue = getHue(rgb, [min, max]);

    return [hue, min, 1 - max];
}

function getHue({ r, g, b }, [whiteness, value], fallback = 0) {
    const delta = value - whiteness;

    if (delta) {
        switch (value) {
            // calculate (segment + shift) * 60
            case r: return ((g - b) / delta + (g < b ? 6 : 0)) * 60;
            case g: return ((b - r) / delta + 2) * 60;
            case b: return ((r - g) / delta + 4) * 60;
            default: return fallback;
        }
    } else return fallback;
}

function getRange({ r, g, b }) {
    return [Math.min(r, g, b), Math.max(r, g, b)];
}
