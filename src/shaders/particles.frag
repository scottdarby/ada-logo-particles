uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D uMap;

varying vec2 particleUV;

#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {



	#include <clipping_planes_fragment>

	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );

    // round particles
    vec2 uv = (  vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;

    float border = 0.1;
    float radius = 0.35;
    float dist = radius - distance(uv, vec2(0.5));
    float t = smoothstep(0.0, border, dist);

    diffuseColor.a = t;

    if (diffuseColor.a < 0.6) {
        discard;
    }

	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>

    vec4 texColor = texture2D(uMap, particleUV);
    // diffuseColor.rgb = texColor.rgb;

	outgoingLight = texColor.rgb;
    
	gl_FragColor = vec4( outgoingLight, diffuseColor.a );

	// #include <tonemapping_fragment>
	// #include <encodings_fragment>
	// #include <fog_fragment>
	// #include <premultiplied_alpha_fragment>

}
