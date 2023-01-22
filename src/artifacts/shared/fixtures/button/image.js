const image = `

precision highp float;

uniform vec2 iResolution;
uniform float iHue;

vec3 rgb2hsl(vec3 color) {
    vec3 hsl; // init to 0 to avoid warnings ? (and reverse if + remove first part)

    float fmin = min(min(color.r, color.g), color.b); //Min. value of RGB
    float fmax = max(max(color.r, color.g), color.b); //Max. value of RGB
    float delta = fmax - fmin; //Delta RGB value

    hsl.z = (fmax + fmin) / 2.0; // Luminance

    if (delta == 0.0) {
        hsl.x = 0.0; // Hue
        hsl.y = 0.0; // Saturation
    } else {
        if (hsl.z < 0.5)
            hsl.y = delta / (fmax + fmin); // Saturation
        else
            hsl.y = delta / (2.0 - fmax - fmin); // Saturation

        float deltaR = (((fmax - color.r) / 6.0) + (delta / 2.0)) / delta;
        float deltaG = (((fmax - color.g) / 6.0) + (delta / 2.0)) / delta;
        float deltaB = (((fmax - color.b) / 6.0) + (delta / 2.0)) / delta;

        if (color.r == fmax)
            hsl.x = deltaB - deltaG; // Hue
        else if (color.g == fmax)
            hsl.x = (1.0 / 3.0) + deltaR - deltaB; // Hue
        else if (color.b == fmax)
            hsl.x = (2.0 / 3.0) + deltaG - deltaR; // Hue

        if (hsl.x < 0.0)
            hsl.x += 1.0; // Hue
        else if (hsl.x > 1.0)
            hsl.x -= 1.0; // Hue
    }

    return hsl;
}

vec3 hue2rgb(float hue) {
    hue = fract(hue);
    return clamp(vec3(
        abs(hue * 6. - 3.) - 1.,
        2. - abs(hue * 6. - 2.),
        2. - abs(hue * 6. - 4.)
    ), 0., 1.);
}

vec3 hsl2rgb(vec3 hsl) {
    if (hsl.y == 0.) {
        return vec3(hsl.z); //Luminance.
    } else {
        float b;
        if(hsl.z < .5) {
            b = hsl.z * (1. + hsl.y);
        } else {
            b = hsl.z + hsl.y - hsl.y * hsl.z;
        }
        float a = 2. * hsl.z - b;
        return a + hue2rgb(hsl.x) * (b - a);
    }
}

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;

    // vec3 col = rgb2hsl(vec3(uv, 1.0));
    vec3 col = vec3(iHue / 360.0, 1.0, 0.5);

    bool divide = (8.0 * pow((uv.y - 0.5), 2.0)) + 0.28 < uv.x;
    if (uv.y > 0.5) {
        col.b = divide ? pow(uv.y, 0.5) : 1.0;
    } else {
        col.b = divide ? uv.y : 0.0;
        col.g = 0.95;
    }

    gl_FragColor = vec4(hsl2rgb(col), 1.0);
}
`;

export default image;
