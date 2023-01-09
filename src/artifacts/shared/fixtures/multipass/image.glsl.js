const image = `#version 300 es

precision highp float;

uniform sampler2D iChannel0;

out vec4 fragColor;

void main() {
    vec4 data = vec4(texelFetch(iChannel0, ivec2(gl_FragCoord.xy), 0));
    vec3 col = data.rgb / data.w;
    
    // gamma correction
    col = max(vec3(0), col - 0.004);
    col = (col * (6.2 * col + .5)) / (col * (6.2 * col + 1.7) + 0.06);
    
    // Output to screen
    fragColor = vec4(col, 1.0);
}
`;

export default image;
