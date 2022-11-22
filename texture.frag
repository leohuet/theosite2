#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265358979323846
#define exp 2.71828

uniform vec2 resolution;
uniform float time;
uniform vec2 mouse;

float random (in vec2 _st) {
    return fract(sin(dot(_st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define NUM_OCTAVES 5

float fbm ( in vec2 _st) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5),
                    -sin(0.5), cos(0.50));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(_st);
        _st = rot * _st * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

vec2 rotate2D (vec2 _st, float _angle) {
    _st -= 0.5;
    _st =  mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle)) * _st;
    _st += 0.5;
    return _st;
}

vec2 tile (vec2 _st, float _zoom) {
    _st *= _zoom;
    return fract(_st);
}

vec2 rotateTilePattern(vec2 _st){

    //  Scale the coordinate system by 2x2
    _st *= 2.0;

    //  Give each cell an index number
    //  according to its position
    float index = 0.0;
    index += step(1., mod(_st.x,2.0));
    index += step(1., mod(_st.y,2.0))*2.0;

    //      |
    //  2   |   3
    //      |
    //--------------
    //      |
    //  0   |   1
    //      |

    // Make each cell between 0.0 - 1.0
    _st = fract(_st);

    // Rotate each cell according to the index
    if(index == 1.0){
        //  Rotate cell 1 by 90 degrees
        _st = rotate2D(_st,PI*0.5);
    } else if(index == 2.0){
        //  Rotate cell 2 by -90 degrees
        _st = rotate2D(_st,PI*-0.5);
    } else if(index == 3.0){
        //  Rotate cell 3 by 180 degrees
        _st = rotate2D(_st,PI);
    }

    return _st;
}

float concentricCircles(in vec2 st, in vec2 radius, in float res, in float scale) {
    float dist = distance(st,radius);
    float pct = floor(dist*res)/scale;
    return pct;
}

float lfo(in float x) {
    float coloring = sin(x/time);
    return coloring;
}

void main (void) {
    // vec2 st = gl_FragCoord.xy/resolution.xy;

    // vec2 mst = gl_FragCoord.xy/mouse.xy;
    // float mdist= distance(vec2(1.0,1.0), mst);

    // float dist = distance(st,vec2(sin(time/10.0),cos(time/10.0)));
    // st = tile(st, 1.0);
    // mst = tile(mst, 1.0);

    // st = rotate2D(st,dist/(mdist/5.0)*PI*2.0);
    // mst = rotate2D(st,dist/(mdist/5.0)*PI*2.0);

    // gl_FragColor = vec4(lfo(mouse.x)*mst.x, lfo(mouse.y)*mst.y, st.x/mst.x, 1.0);

    vec2 st = gl_FragCoord.xy/resolution.xy*3.;
    st += st * abs(sin(time*0.1)*3.0);
    vec3 color = vec3(0.0);

    vec2 q = vec2(0.);
    q.x = fbm( st + 0.00*time);
    q.y = fbm( st + vec2(1.0));

    vec2 r = vec2(0.);
    r.x = fbm( st + 1.0*q + vec2(1.7,9.2)+ 0.15*time*(mouse.x*0.01));
    r.y = fbm( st + 1.0*q + vec2(8.3,2.8)+ 0.126*time*(mouse.y*0.01));

    float f = fbm(st+r);

    color = mix(vec3(0.1,0.619608,0.666667),
                vec3(0.666667,0.666667,0.498039),
                clamp((f*f)*4.0,0.0,1.0));

    color = mix(color,
                vec3(0,0,0.164706),
                clamp(length(q),0.0,1.0));

    color = mix(color,
                vec3(0.666667,1,1),
                clamp(length(r.x),0.0,1.0));

    float siny = sin(mouse.y/10.0);
    float moinssiny = -sin(mouse.y/10.0);

    vec3 color1 = vec3(color.r, color.g, color.b)*siny;
    vec3 color2 = vec3(1.0-color.r, 1.0-color.g, 1.0-color.b)*moinssiny;

    color = mix(color1,
                color2,
                0.5);

    gl_FragColor = vec4((f*f*f+.6*f*f+.5*f)*color*5.0,1.0);
}
