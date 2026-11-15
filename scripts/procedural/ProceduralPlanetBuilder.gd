class_name ProceduralPlanetBuilder
extends RefCounted

static func build_earth(radius: float = 10.0) -> Node3D:
	var root = Node3D.new()
	root.name = "EarthSphere"

	# Ocean & Continents Surface
	var surface = MeshInstance3D.new()
	var sph = SphereMesh.new()
	sph.radius = radius; sph.height = radius * 2.0
	sph.radial_segments = 64; sph.rings = 32
	surface.mesh = sph

	var mat = StandardMaterial3D.new()
	# Ocean blue albedo with specular highlight
	mat.albedo_color = Color(0.08, 0.25, 0.55)
	mat.roughness = 0.2
	mat.metallic = 0.1
	surface.material_override = mat
	root.add_child(surface)

	# Atmospheric Rayleigh scattering haze halo
	var atmo = MeshInstance3D.new()
	var atmo_sph = SphereMesh.new()
	atmo_sph.radius = radius * 1.025; atmo_sph.height = radius * 2.05
	atmo_sph.radial_segments = 64; atmo_sph.rings = 32
	atmo.mesh = atmo_sph

	var atmo_mat = StandardMaterial3D.new()
	atmo_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	atmo_mat.albedo_color = Color(0.3, 0.65, 1.0, 0.25)
	atmo_mat.emission_enabled = true
	atmo_mat.emission = Color(0.2, 0.5, 0.9)
	atmo_mat.emission_energy_multiplier = 0.8
	atmo.material_override = atmo_mat
	root.add_child(atmo)

	return root

static func build_moon(radius: float = 6.0) -> Node3D:
	var root = Node3D.new()
	root.name = "MoonSphere"

	var surface = MeshInstance3D.new()
	var sph = SphereMesh.new()
	sph.radius = radius; sph.height = radius * 2.0
	sph.radial_segments = 64; sph.rings = 32
	surface.mesh = sph

	var mat = StandardMaterial3D.new()
	# Lunar regolith gray, matte non-reflective
	mat.albedo_color = Color(0.62, 0.62, 0.65)
	mat.roughness = 0.95
	mat.metallic = 0.0
	surface.material_override = mat
	root.add_child(surface)

	return root

static func build_mars(radius: float = 7.5) -> Node3D:
	var root = Node3D.new()
	root.name = "MarsSphere"

	var surface = MeshInstance3D.new()
	var sph = SphereMesh.new()
	sph.radius = radius; sph.height = radius * 2.0
	sph.radial_segments = 64; sph.rings = 32
	surface.mesh = sph

	var mat = StandardMaterial3D.new()
	# Red oxidized iron rust albedo
	mat.albedo_color = Color(0.82, 0.38, 0.22)
	mat.roughness = 0.88
	mat.metallic = 0.05
	surface.material_override = mat
	root.add_child(surface)

	# Thin CO2 atmosphere rim haze
	var haze = MeshInstance3D.new()
	var haze_sph = SphereMesh.new()
	haze_sph.radius = radius * 1.018; haze_sph.height = radius * 2.036
	haze.mesh = haze_sph

	var haze_mat = StandardMaterial3D.new()
	haze_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	haze_mat.albedo_color = Color(0.9, 0.5, 0.3, 0.2)
	haze_mat.emission_enabled = true
	haze_mat.emission = Color(0.8, 0.4, 0.2)
	haze_mat.emission_energy_multiplier = 0.4
	haze.material_override = haze_mat
	root.add_child(haze)

	return root

static func build_sun(radius: float = 18.0) -> Node3D:
	var root = Node3D.new()
	root.name = "SunSphere"

	# Core blinding photosphere
	var core = MeshInstance3D.new()
	var sph = SphereMesh.new()
	sph.radius = radius; sph.height = radius * 2.0
	sph.radial_segments = 64; sph.rings = 32
	core.mesh = sph

	var mat = StandardMaterial3D.new()
	mat.albedo_color = Color(1.0, 0.95, 0.8)
	mat.emission_enabled = true
	mat.emission = Color(1.0, 0.85, 0.3)
	mat.emission_energy_multiplier = 4.0
	core.material_override = mat
	root.add_child(core)

	# Dynamic Corona Plasma Halo
	var corona = MeshInstance3D.new()
	var c_sph = SphereMesh.new()
	c_sph.radius = radius * 1.25; c_sph.height = radius * 2.5
	corona.mesh = c_sph

	var c_mat = StandardMaterial3D.new()
	c_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	c_mat.albedo_color = Color(1.0, 0.5, 0.1, 0.35)
	c_mat.emission_enabled = true
	c_mat.emission = Color(1.0, 0.6, 0.1)
	c_mat.emission_energy_multiplier = 2.5
	corona.material_override = c_mat
	root.add_child(corona)

	# Solar Light Source
	var light = OmniLight3D.new()
	light.light_color = Color(1.0, 0.96, 0.88)
	light.light_energy = 5.0
	light.omni_range = 500.0
	root.add_child(light)

	return root
