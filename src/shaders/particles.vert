#pragma glslify: snoise4 = require(./simplexNoiseDerivatives4)

uniform float size;
uniform float scale;
uniform float uTime;

uniform float uNoiseFrequency1;
uniform float uNoiseTimeScale1;
uniform float uNoiseAmount1;

uniform float uNoiseFrequency2;
uniform float uNoiseTimeScale2;
uniform float uNoiseAmount2;

uniform float uNoiseAmount;

uniform sampler2D uMousePosTexture;

varying vec2 particleUV;

#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {

    particleUV = (position.xy + 1.0) / 2.0;

	#include <color_vertex>
	#include <begin_vertex>

    vec3 noisePos1 = snoise4(
        vec4(
            transformed.xyz * uNoiseFrequency1,
            uTime * uNoiseTimeScale1
        )
    ).xyz * uNoiseAmount1;

    vec3 noisePos2 = snoise4(
        vec4(
            transformed.xyz * uNoiseFrequency2,
            uTime * uNoiseTimeScale2
        )
    ).xyz * uNoiseAmount2;

    vec3 noisePos = noisePos1 * noisePos2;

    transformed.z += noisePos.z * uNoiseAmount;

    vec4 mvPosition2 = vec4( transformed, 1.0 );
    mvPosition2 = modelViewMatrix * mvPosition2;
    vec4 newPos = projectionMatrix * mvPosition2;
    newPos /= newPos.w;

    vec4 mousePos = texture2D(uMousePosTexture, ((newPos.xy + 1.0) / 2.0)  );
    if (mousePos.z > 0.1) {
        transformed.z += mousePos.z * 0.1;
    }

	#include <morphtarget_vertex>
	#include <project_vertex>

	gl_PointSize = size * (scale * 0.001);

	#ifdef USE_SIZEATTENUATION

		bool isPerspective = isPerspectiveMatrix( projectionMatrix );

		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );

	#endif

	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>

}
