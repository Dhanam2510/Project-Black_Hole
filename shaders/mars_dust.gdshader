shader_type spatial;
render_mode blend_mix, depth_draw_opaque;

uniform vec4 dust_color : source_color = vec4(0.85, 0.45, 0.2, 1.0);
uniform float wind_speed : hint_range(0.1, 5.0) = 1.2;
uniform float storm_density : hint_range(0.0, 1.0) = 0.6;

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
	vec2 wind_uv = UV * 6.0 + vec2(TIME * wind_speed, TIME * wind_speed * 0.3);
	float n = noise(wind_uv);
	ALBEDO = dust_color.rgb * (0.8 + 0.4 * n);
	ROUGHNESS = 0.95;
	METALLIC = 0.0;
}
