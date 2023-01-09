const constant = `
#define NOHIT 1e10

struct its
{
    float t;
    vec3 n;    //normal
};

const its NO_its = its(NOHIT, vec3(0));

struct span
{
    its n;
    its f;
    bool next;
};
/*----------------------------------
REFERENCE TABLE
(span 1= AB, span 2 = CD)

-------Union---Inter----Sub--
ABCD | AB, CD |  -   | AB
ACBD | AD     | CB   | AC
ACDB | AB     | CD   | AC, DB
CABD | CD     | AB   | -
CADB | CB     | AD   | DB
CDAB | CD, AB | -    | AB

if result is a double span:
use first span if in front of the viewer,
otherwise use second span
------------------------------------*/

span Inter(span a, span b) {
    bvec4 cp = bvec4(a.n.t < b.n.t, a.n.t < b.f.t, a.f.t < b.n.t, a.f.t < b.f.t);
    if      (b.n.t == NOHIT || a.n.t == NOHIT) return span(NO_its, NO_its, false);
    else if (cp.x && cp.z) return span(NO_its, NO_its, false);
    else if (cp.x && !cp.z && cp.w)  return span(b.n, a.f, false);
    else if (cp.x && !cp.z && !cp.w) return b;
    else if (!cp.x && cp.y && cp.w) return a;
    else if (!cp.x && cp.y && !cp.w) return span(a.n, b.f, false);
    else return span(NO_its, NO_its, false);
}

span Sub(span a, span b) {
    bvec4 cp = bvec4(a.n.t < b.n.t, a.n.t < b.f.t, a.f.t < b.n.t, a.f.t < b.f.t);
    if      (a.n.t == NOHIT) return span(NO_its, NO_its, false);
    else if (b.n.t == NOHIT) return a;
    else if (cp.x && cp.z) return a;
    else if (cp.x && !cp.z && cp.w)  return span(a.n, b.n, false);
    else if (cp.x && !cp.z && !cp.w && b.n.t > 0.) return span(a.n, b.n, true);
    else if (cp.x && !cp.z && !cp.w && b.n.t < 0.) return span(b.f, a.f, false); //+ secondary span =  span(b.f,a.f)
    else if (!cp.x && cp.y && cp.w) return span(NO_its, NO_its, false);
    else if (!cp.x && cp.y && !cp.w) return span(b.f, a.f, false);
    else return a;
}

// useful if transparent
span Union(span a, span b) {
    bvec4 cp = bvec4(a.n.t < b.n.t, a.n.t < b.f.t, a.f.t < b.n.t, a.f.t < b.f.t);

    if      (b.n.t == NOHIT) return a;
    else if (a.n.t == NOHIT) return b;
    else if (cp.z && a.f.t > 0.) return span(a.n, a.f, true);
    else if (cp.z && a.f.t < 0.) return b;
    else if (cp.x && !cp.z && cp.w) return span(a.n, b.f, false);
    else if (cp.x && !cp.z && !cp.w) return a;
    else if (!cp.x && cp.y && cp.w) return b;
    else if (!cp.x && cp.y && !cp.w) return span(b.n, a.f, false);
    else if (!cp.x && !cp.y && a.f.t > 0.) return span(b.n, b.f, true);
    else return a;
}


//-----------Intersection functions--(based on Iq)------------------
span iSphere(in vec3 ro, in vec3 rd, float ra) {
    vec3 oc = ro;
    float b = dot(oc, rd);
    float c = dot(oc, oc) - ra * ra;
    float h = b * b - c;
    if (h < 0.) return span(NO_its, NO_its, false); // no intersection
    h = sqrt(h);
    vec3 oNor = normalize(ro - (b + h) * rd);
    vec3 fNor = normalize(ro - (b - h) * rd);
    return span(its(-b - h, oNor), its(-b + h, -fNor), false);
}

span iBox(in vec3 ro, in vec3 rd, vec3 boxSize) {
    vec3 m = 1. / rd;
    vec3 n = m * ro;
    vec3 k = abs(m) * boxSize;

    vec3 t1 = -n - k;
    vec3 t2 = -n + k;
    float tN = max(max(t1.x, t1.y), t1.z);
    float tF = min(min(t2.x, t2.y), t2.z);
    if (tN > tF) return span(NO_its, NO_its, false); // no intersection
    vec3 oNor = - sign(rd) * step(t1.yzx, t1.xyz) * step(t1.zxy, t1.xyz);
    vec3 fNor = - sign(rd) * step(t2.xyz, t2.yzx) * step(t2.xyz, t2.zxy);
    return span(its(tN, oNor), its(tF, fNor), false);
}

span iRBox(in vec3 ro, in vec3 rd, vec3 boxSize, mat3 rot) {
    mat3 txx = inverse(rot);
    span s = iBox(txx * ro, txx * rd, boxSize);
    s.n.n = (rot * s.n.n).xyz;
    s.f.n = (rot * s.f.n).xyz;
    return s;
}


//  plane with thickness h
span iPlane(in vec3 ro, in vec3 rd, in vec3 n, float h) {
    float d1 = - dot(ro, n) / dot(rd, n), d2 = -(dot(ro - h * n, n)) / dot(rd, n);
    vec3 u = normalize(cross(n, vec3(0, 0, 1))), v = normalize(cross(u, n));
    vec3 oNor = n;
    if (d1 < d2) return span(its(d1, -oNor), its(d2, oNor), false);
    return span(its(d2, oNor), its(d1, -oNor), false);
}


span iCylinder(in vec3 ro, in vec3 rd, in vec3 ca, float cr) {
    vec3 oc = ro;
    float card = dot(ca, rd);
    float caoc = dot(ca, oc);
    float a = 1.0 - card * card;
    float b = dot(oc, rd) - caoc * card;
    float c = dot(oc, oc) - caoc * caoc - cr * cr;
    float h = b * b - a * c;
    if (h < 0.0) return span(NO_its, NO_its, false); //no intersection
    h = sqrt(h);
    vec2 t = vec2(-b - h, -b + h) / a;
    vec2 d = vec2(dot(oc + t.x * rd, ca), dot(oc + t.y * rd, ca));
    vec3 nN = normalize(oc + t.x * rd - d.x * ca), nF = normalize(oc + t.y * rd - d.y * ca);
    its iN = its(t.x, nN); //todo uv
    its iF = its(t.y, nF);
    return span(iN, iF, false);
}
`

const shader = `#version 300 es

precision highp float;

uniform vec2 iResolution;
uniform float iTime;
uniform int iFrame;
uniform vec2  iMouse;
uniform sampler2D iChannel0;

out vec4 fragColor;

${constant}

#define PATH_LENGTH 10
#define MAX_DIST 1e10

//alternate scene
//#define CYLINDERS

uint baseHash(uvec2 p) {
    p = 1103515245U * ((p >> 1U) ^ (p.yx));
    uint h32 = 1103515245U * ((p.x) ^ (p.y >> 3U));
    return h32 ^ (h32 >> 16);
}

float hash1(inout float seed) {
    uint n = baseHash(floatBitsToUint(vec2(seed += .1, seed += .1)));
    return float(n) / float(0xffffffffU);
}

vec2 hash2(inout float seed) {
    uint n = baseHash(floatBitsToUint(vec2(seed += .1, seed += .1)));
    uvec2 rz = uvec2(n, n * 48271U);
    return vec2(rz.xy & uvec2(0x7fffffffU)) / float(0x7fffffff);
}

//
// Ray tracer helper functions
//

float FresnelSchlickRoughness(float cosTheta, float F0, float roughness) {
    return F0 + (max((1. - roughness), F0) - F0) * pow(abs(1. - cosTheta), 5.0);
}

vec3 cosWeightedRandomHemisphereDirection(const vec3 n, inout float seed) {
    vec2 r = hash2(seed);
    vec3 uu = normalize(cross(n, abs(n.y) > .5 ? vec3(1., 0., 0.) : vec3(0., 1., 0.)));
    vec3 vv = cross(uu, n);
    float ra = sqrt(r.y);
    float rx = ra * cos(6.28318530718 * r.x);
    float ry = ra * sin(6.28318530718 * r.x);
    float rz = sqrt(1. - r.y);
    vec3 rr = vec3(rx * uu + ry * vv + rz * n);
    return normalize(rr);
}

vec3 modifyDirectionWithRoughness(const vec3 normal, const vec3 n, const float roughness, inout float seed) {
    vec2 r = hash2(seed);

    vec3 uu = normalize(cross(n, abs(n.y) > .5 ? vec3(1., 0., 0.) : vec3(0., 1., 0.)));
    vec3 vv = cross(uu, n);

    float a = roughness * roughness;

    float rz = sqrt(abs((1.0 - r.y) / clamp(1. + (a - 1.) * r.y, .00001, 1.)));
    float ra = sqrt(abs(1. - rz * rz));
    float rx = ra * cos(6.28318530718 * r.x);
    float ry = ra * sin(6.28318530718 * r.x);
    vec3 rr = vec3(rx * uu + ry * vv + rz * n);

    vec3 ret = normalize(rr);
    return dot(ret, normal) > 0. ? ret : n;
}

vec2 randomInUnitDisk(inout float seed) {
    vec2 h = hash2(seed) * vec2(1, 6.28318530718);
    float phi = h.y;
    float r = sqrt(h.x);
    return r * vec2(sin(phi), cos(phi));
}

//
// Scene description
//

vec3 rotateY(const in vec3 p, const in float t) {
    float co = cos(t);
    float si = sin(t);
    vec2 xz = mat2(co, si, -si, co) * p.xz;
    return vec3(xz.x, p.y, xz.y);
}

vec3 opU(vec3 d, span s, inout vec3 normal, float mat) {
    its ix = s.n;
    //if(ix.t<0.) ix=s.f;
    if (ix.t < d.y && ix.t > d.x) {
        normal = ix.n;
        d = vec3(d.x, ix.t, mat);
    }
    return d;
}


vec3 worldhit(in vec3 ro, in vec3 rd, in vec2 dist, out vec3 normal) {
    vec3 d = vec3(dist, 0.);

    d = opU(d, iPlane(ro, rd, - vec3(0, 1.1, 0), 1.), normal, 1.);

    span s2, s3, s4;
    float mat = 3.,
    #ifdef CYLINDERS
    tk = .05;
    #else
    tk = .2;
    #endif
    s2 = iCylinder(ro, rd, vec3(0, 1, 0), 1.2 + tk);
    s3 = iPlane(ro, rd, vec3(0, 1., 0), 1.);
    s2 = Inter(s2, s3);
    s4 = iCylinder(ro, rd, vec3(0, 1, 0), 1.2 - tk);

    //backward disk intersection
    span s5 = span(s4.f, s2.f, false);
    float d2 = s4.f.t;

    //front disk intersection
    s2 = Sub(s2, s4);

    //repetition on front disk
    if (s2.n.t < NOHIT) {
        vec2 p = s2.n.t < 0. ? ro.xz :
        (ro + rd * s2.n.t).xz;
        float n = 60.,
        an = atan(p.y, p.x) + 3.14,
        id = floor(an / 6.28 * n),
        anc = (id + .5) / n * 6.28,
        sg = sign(dot(vec2(- sin(anc), cos(anc)), rd.xz));
        for (float j = 0.; j < 2.1; j += 1.) {
            #ifdef CYLINDERS
            s3 = iCylinder(ro + vec3(cos(anc), 0., sin(anc)) * 1.2, rd, vec3(0, 1, 0), .05);
            #else
            vec3 nm = vec3(sin(anc), 0., - cos(anc)); s3 = iPlane(ro + nm * .02, rd, nm, .04);
            #endif
            s4 = Inter(s2, s3);
            mat = id * .1 + 6.;
            d = opU(d, s4, normal, mat);
            anc -= sg / n * 6.28;
            id -= sg;
        }
    }

    //repetition on backward disk (almost identical to the previous one)
    if (s2.n.t < NOHIT && s2.next) {
        vec2 p = (ro + rd * d2).xz;
        float n = 60.,
        an = atan(p.y, p.x) + 3.14,
        id = floor(an / 6.28 * n),
        anc = (id + .5) / n * 6.28,
        sg = sign(dot(vec2(- sin(anc), cos(anc)), rd.xz));
        for (float j = 0.; j < 1.1; j += 1.) {
            #ifdef CYLINDERS
            s3 = iCylinder(ro + vec3(cos(anc), 0., sin(anc)) * 1.2, rd, vec3(0, 1, 0), .05);
            #else
            vec3 nm = vec3(sin(anc), 0., - cos(anc)); s3 = iPlane(ro + nm * .02, rd, nm, .04);
            #endif
            s4 = Inter(s5, s3);
            mat = id * .1 + 6.;
            d = opU(d, s4, normal, mat);
            anc -= sg / n * 6.28;
            id -= sg;
        }

    }

    if (dot(rd, normal) > 0.) normal = -normal;
    return d;
}

//
// Palette by Íñigo Quílez:
// https://www.shadertoy.com/view/ll2GD3
//
vec3 pal(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {
    return a + b * cos(6.28318530718 * (c * t + d));
}

float checkerBoard(vec2 p) {
    return mod(floor(p.x) + floor(p.y), 2.);
}

vec3 getSkyColor(vec3 rd) {
    vec3 col = mix(vec3(1), vec3(.5, .7, 1), .5 + .5 * rd.y);
    float sun = clamp(dot(normalize(vec3(-.4, .7, -.6)), rd), 0., 1.);
    col += vec3(1, .6, .1) * (pow(sun, 4.) + 10. * pow(sun, 32.));
    return col;
}

#define LAMBERTIAN 0.
#define METAL 1.
#define DIELECTRIC 2.

float gpuIndepentHash(float p) {
    p = fract(p * .1031);
    p *= p + 19.19;
    p *= p + p;
    return fract(p);
}

void getMaterialProperties(in vec3 pos, in float mat, out vec3 albedo, out float type, out float roughness) {
    albedo = pal(mat * .59996323 + .5, vec3(.5), vec3(.5), vec3(1), vec3(0, .1, .2));

    if (mat < 1.5) {
        albedo = vec3(.25 + .25 * checkerBoard(pos.xz * 5.));
        roughness = .75 * albedo.x - .15;
        type = METAL;
    } else {
        type = floor(gpuIndepentHash(mat + .3) * 3.);
        roughness = (1. - type * .475) * gpuIndepentHash(mat);
    }
}

//
// Simple ray tracer
//

float schlick(float cosine, float r0) {
    return r0 + (1. - r0) * pow((1. - cosine), 5.);
}

vec3 render(in vec3 ro, in vec3 rd, inout float seed) {
    vec3 albedo, normal, col = vec3(1.);
    float roughness, type;

    for (int i = 0; i < PATH_LENGTH; ++i) {
        vec3 res = worldhit(ro, rd, vec2(.0001, 100), normal);
        if (res.z > 0.) {
            ro += rd * res.y;

            getMaterialProperties(ro, res.z, albedo, type, roughness);

            if (type < LAMBERTIAN + .5) { // Added/hacked a reflection term
                float F = FresnelSchlickRoughness(max(0., - dot(normal, rd)), .04, roughness);
                if (F > hash1(seed)) {
                    rd = modifyDirectionWithRoughness(normal, reflect(rd, normal), roughness, seed);
                } else {
                    col *= albedo;
                    rd = cosWeightedRandomHemisphereDirection(normal, seed);
                }
            } else if (type < METAL + .5) {
                col *= albedo;
                rd = modifyDirectionWithRoughness(normal, reflect(rd, normal), roughness, seed);
            } else { // DIELECTRIC
                vec3 normalOut, refracted;
                float ni_over_nt, cosine, reflectProb = 1.;
                if (dot(rd, normal) > 0.) {
                    normalOut = -normal;
                    ni_over_nt = 1.4;
                    cosine = dot(rd, normal);
                    cosine = sqrt(1. - (1.4 * 1.4) - (1.4 * 1.4) * cosine * cosine);
                } else {
                    normalOut = normal;
                    ni_over_nt = 1. / 1.4;
                    cosine = - dot(rd, normal);
                }

                // Refract the ray.
                refracted = refract(normalize(rd), normalOut, ni_over_nt);

                // Handle total internal reflection.
                if (refracted != vec3(0)) {
                    float r0 = (1. - ni_over_nt) / (1. + ni_over_nt);
                    reflectProb = FresnelSchlickRoughness(cosine, r0 * r0, roughness);
                }

                rd = hash1(seed) <= reflectProb ? reflect(rd, normal) : refracted;
                rd = modifyDirectionWithRoughness(-normalOut, rd, roughness, seed);
            }
        } else {
            col *= getSkyColor(rd);
            return col;
        }
    }
    return vec3(0);
}

mat3 setCamera(in vec3 ro, in vec3 ta, float cr) {
    vec3 cw = normalize(ta - ro);
    vec3 cp = vec3(sin(cr), cos(cr), 0.0);
    vec3 cu = normalize(cross(cw, cp));
    vec3 cv =          (cross(cu, cw));
    return mat3(cu, cv, cw);
}

void main() {
    bool reset = iFrame == 0;

    vec2 mo = iMouse.xy == vec2(0) ? vec2(.125) : abs(iMouse.xy) / iResolution.xy - .5;

    vec4 data = texelFetch(iChannel0, ivec2(0), 0);

    if (round(mo * iResolution.xy) != round(data.yz) || round(data.w) != round(iResolution.x)) {
        reset = true;
    }

    // camera
    vec3 ta = vec3(0., 0., 0.);
    vec3 ro = ta + vec3(2. * cos(1.5 + 6. * mo.x), 1. + 2. * mo.y, + 2. * +sin(1.5 + 6. * mo.x));
    // camera-to-world transformation
    mat3 ca = setCamera(ro, ta, 0.);

    vec3 normal;

    float fpd = data.x;
    if (all(equal(ivec2(gl_FragCoord.xy), ivec2(0)))) {
        // Calculate focus plane.
        float nfpd = worldhit(ro, normalize(vec3(.0, 0.4, 0) - ro), vec2(0, 100), normal).y;
        fragColor = vec4(nfpd, mo * iResolution.xy, iResolution.x);
    } else {
        vec2 p = (-iResolution.xy + 2. * gl_FragCoord.xy - 1.) / iResolution.y;
        float seed = float(baseHash(floatBitsToUint(p - iTime))) / float(0xffffffffU);

        // AA
        p += 2. * hash2(seed) / iResolution.y;
        vec3 rd = ca * normalize(vec3(p.xy, 1.6));

        // DOF
        vec3 fp = ro + rd * fpd;
        ro = ro + ca * vec3(randomInUnitDisk(seed), 0.) * .005;
        rd = normalize(fp - ro);

        vec3 col = render(ro, rd, seed);

        if (reset) {
           fragColor = vec4(col, 1);
        } else {
           fragColor = vec4(col, 1) + texelFetch(iChannel0, ivec2(gl_FragCoord.xy), 0);
        }
    }
}
`;

export default shader;
