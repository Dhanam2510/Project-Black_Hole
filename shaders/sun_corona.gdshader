shader_type spatial;
render_mode blend_add, depth_draw_never, unshaded;

uniform vec4 core_color : source_color = vec4(1.0, 0.9, 0.4, 1.0);
uniform vec4 corona_color : source_color = vec4(1.0, 0.45, 0.05, 1.0);
uniform float speed : hint_range(0.1, 5.0) = 0.8;
uniform float turbulence_scale : hint_range(1.0, 20.0) = 8.0;

// Simple procedural hash noise
float hash(vec2 p) {
	return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
	vec2 i = floor(p);
	vec2 f = fract(p);
	vec2 u = f * f * (3.0 - 2.0 * f);
	return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
	           mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

void fragment() {
	vec2 uv_scaled = UV * turbulence_scale;
	float n = noise(uv_scaled + vec2(TIME * speed * 0.2, TIME * speed * 0.3));
	float fresnel = 1.0 - abs(dot(NORMAL, VIEW));
	
	float flare = pow(fresnel, 2.5) * (0.8 + 0.4 * n);
	vec3 col = mix(corona_color.rgb, core_color.rgb, flare);
	
	ALBEDO = col * 2.5;
	ALPHA = clamp(flare, 0.0, 1.0);
}
