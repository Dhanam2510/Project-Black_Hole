shader_type spatial;
render_mode blend_add, depth_draw_never, cull_front, unshaded;

uniform vec4 atmosphere_color : source_color = vec4(0.3, 0.7, 1.0, 1.0);
uniform float atmosphere_intensity : hint_range(0.0, 5.0) = 2.0;
uniform float falloff_power : hint_range(0.1, 10.0) = 3.5;

void fragment() {
	float fresnel = 1.0 - abs(dot(NORMAL, VIEW));
	fresnel = pow(fresnel, falloff_power);
	ALBEDO = atmosphere_color.rgb * fresnel * atmosphere_intensity;
	ALPHA = fresnel * atmosphere_color.a;
}
