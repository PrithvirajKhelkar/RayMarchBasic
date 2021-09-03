#ifdef GL_ES
precision mediump float;
#endif

// global constants
#define MAX_STEPS 100
#define MAX_DIST 100.0
#define SURF_DIST 0.01

// Function to return the minimum distance to a surface
float GetDist(vec3 p) {
    // Position of the Sphere
    vec4 s = vec4(0.0, 1.0, 6.0, 1.0);

    // Distance of the surface of the sphere to the point p
    float sphereDist = length(p-s.xyz) - s.w;

    // Distance to the surface plane. Plane is xz hence distance is y
    float planeDist = p.y;

    float d = min(sphereDist, planeDist);
    return d;
}

// Ray Marching Function
float RayMarch(vec3 ro, vec3 rd) {
    // Distance from Origin
    float dO=0.0;

    for(int i=0; i<MAX_STEPS; i++){
        // Current Marching Location
        vec3 p = ro + rd * dO;

        // Distance to the scene
        float dS = GetDist(p);

        dO += dS;

        //break if distance exceeds max dist or if it's close enough to a surface
        if(dO > MAX_DIST || dS < SURF_DIST) break;
    }
    return dO;
}

vec3 GetNormal(vec3 p){
    float d = GetDist(p);
    vec2 e = vec2(0.01, 0.0);

    vec3 n = d - vec3(
        GetDist(p-e.xyy),
        GetDist(p-e.yxy),
        GetDist(p-e.yyx)
    );

    return normalize(n);
}

// Lighting function
float GetLight(vec3 p){
    // Position of the light
    vec3 lightPos = vec3(0.0, 5.0, 6.0);

    // Rotate the light above the scene
    lightPos.xz += vec2(sin(iTime), cos(iTime))*2.0;

    vec3 l = normalize(lightPos-p);
    vec3 n = GetNormal(p);

    float dif = clamp(dot(n, l), 0.0, 1.0);

    // Shadow
    float d = RayMarch(p+n*SURF_DIST*2.0, l);
    if(d<length(lightPos-p)) dif *= 0.1;

    return dif;
}

void main() {
    vec2 uv = (vec2(gl_FragCoord)-.5*iResolution.xy)/iResolution.y;
    vec3 col = vec3(0.0);

    // Ray Origin
    vec3 ro = vec3(0.0, 1.0, 0.0);

    // Ray Direction
    vec3 rd = normalize(vec3(uv.x, uv.y, 1));

    float d = RayMarch(ro, rd);

    vec3 p = ro + rd * d;
    float dif = GetLight(p); 
    // d /= 6.;
    col = vec3(dif);
    
    gl_FragColor = vec4(col, 1.0);
}