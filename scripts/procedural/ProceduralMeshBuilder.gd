class_name ProceduralMeshBuilder
extends RefCounted

# Generates clean, realistic 3D PBR models in code with zero external asset dependencies

static func create_pbr_material(albedo: Color, metallic: float = 0.1, roughness: float = 0.5, emission: Color = Color.BLACK, emission_energy: float = 0.0) -> StandardMaterial3D:
	var mat = StandardMaterial3D.new()
	mat.albedo_color = albedo
	mat.metallic = metallic
	mat.roughness = roughness
	if emission_energy > 0.0:
		mat.emission_enabled = true
		mat.emission = emission
		mat.emission_energy_multiplier = emission_energy
	return mat

# --- SATELLITE COMPONENTS ---

static func build_satellite_chassis(type: String) -> Node3D:
	var root = Node3D.new()
	root.name = "ChassisRoot"
	
	var is_hex = type.contains("hex")
	var mesh_inst = MeshInstance3D.new()
	
	if is_hex:
		var cyl = CylinderMesh.new()
		cyl.top_radius = 0.7
		cyl.bottom_radius = 0.7
		cyl.height = 1.2
		cyl.radial_segments = 6 # Hexagonal prism!
		mesh_inst.mesh = cyl
		mesh_inst.material_override = create_pbr_material(Color(0.2, 0.22, 0.25), 0.8, 0.3) # Carbon composite
	else:
		var box = BoxMesh.new()
		box.size = Vector3(1.0, 1.2, 1.0)
		mesh_inst.mesh = box
		# Gold foil MLI blanket aesthetic
		mesh_inst.material_override = create_pbr_material(Color(0.9, 0.75, 0.2), 0.9, 0.2)
	
	root.add_child(mesh_inst)

	# Avionics core detail rings
	var ring = MeshInstance3D.new()
	var ring_mesh = TorusMesh.new()
	ring_mesh.inner_radius = 0.65
	ring_mesh.outer_radius = 0.72
	ring.mesh = ring_mesh
	ring.position.y = 0.5
	ring.material_override = create_pbr_material(Color(0.8, 0.8, 0.85), 0.9, 0.2)
	root.add_child(ring)

	return root

static func build_solar_panel(type: String) -> Node3D:
	var root = Node3D.new()
	root.name = "SolarPanelRoot"

	# Mounting hinge strut
	var strut = MeshInstance3D.new()
	var cyl = CylinderMesh.new()
	cyl.top_radius = 0.04
	cyl.bottom_radius = 0.04
	cyl.height = 0.5
	strut.mesh = cyl
	strut.rotation.z = deg_to_rad(90)
	strut.position.x = 0.25
	strut.material_override = create_pbr_material(Color(0.3, 0.3, 0.35), 0.7, 0.4)
	root.add_child(strut)

	# Solar Wing (Photovoltaic Grid)
	var panel = MeshInstance3D.new()
	var box = BoxMesh.new()
	var is_tracking = type.contains("tracking") or type.contains("gaas")
	box.size = Vector3(1.4, 0.03, 0.7) if is_tracking else Vector3(1.0, 0.02, 0.5)
	panel.mesh = box
	panel.position.x = 0.5 + (box.size.x * 0.5)
	
	# Deep blue antireflective solar cell shader color
	var cell_color = Color(0.04, 0.12, 0.35) if is_tracking else Color(0.08, 0.18, 0.4)
	panel.material_override = create_pbr_material(cell_color, 0.2, 0.15)
	root.add_child(panel)

	return root

static func build_antenna(type: String) -> Node3D:
	var root = Node3D.new()
	root.name = "AntennaRoot"

	if type.contains("dish") or type.contains("parabolic") or type.contains("ka"):
		# Parabolic Dish Reflector
		var dish = MeshInstance3D.new()
		var cyl = CylinderMesh.new()
		cyl.top_radius = 0.5
		cyl.bottom_radius = 0.1
		cyl.height = 0.2
		dish.mesh = cyl
		dish.rotation.x = deg_to_rad(45)
		dish.material_override = create_pbr_material(Color(0.9, 0.9, 0.95), 0.8, 0.25)
		root.add_child(dish)

		# Central Feedhorn Subreflector
		var feed = MeshInstance3D.new()
		var feed_mesh = CylinderMesh.new()
		feed_mesh.top_radius = 0.03; feed_mesh.bottom_radius = 0.03; feed_mesh.height = 0.3
		feed.mesh = feed_mesh
		feed.position = Vector3(0, 0.15, 0.15)
		feed.material_override = create_pbr_material(Color(0.95, 0.75, 0.1), 0.9, 0.2)
		root.add_child(feed)
	else:
		# Whip / Helix Omnidirectional Antenna
		var mast = MeshInstance3D.new()
		var cyl = CylinderMesh.new()
		cyl.top_radius = 0.015; cyl.bottom_radius = 0.03; cyl.height = 0.9
		mast.mesh = cyl
		mast.position.y = 0.45
		mast.material_override = create_pbr_material(Color(0.85, 0.85, 0.9), 0.9, 0.2)
		root.add_child(mast)

	return root

static func build_camera(type: String) -> Node3D:
	var root = Node3D.new()
	root.name = "CameraRoot"

	# Optical Barrel
	var barrel = MeshInstance3D.new()
	var cyl = CylinderMesh.new()
	cyl.top_radius = 0.18; cyl.bottom_radius = 0.22; cyl.height = 0.45
	barrel.mesh = cyl
	barrel.rotation.x = deg_to_rad(90)
	barrel.material_override = create_pbr_material(Color(0.15, 0.15, 0.18), 0.5, 0.3)
	root.add_child(barrel)

	# Glass Optical Aperture Lens
	var lens = MeshInstance3D.new()
	var lens_mesh = CylinderMesh.new()
	lens_mesh.top_radius = 0.16; lens_mesh.bottom_radius = 0.16; lens_mesh.height = 0.02
	lens.mesh = lens_mesh
	lens.rotation.x = deg_to_rad(90)
	lens.position.z = 0.225
	# Glowing optical reflection
	var lens_color = Color(0.1, 0.8, 1.0) if type.contains("coronagraph") else Color(0.2, 0.5, 0.9)
	lens.material_override = create_pbr_material(lens_color, 0.1, 0.05, lens_color, 0.4)
	root.add_child(lens)

	return root

static func build_instrument(type: String) -> Node3D:
	var root = Node3D.new()
	root.name = "InstrumentRoot"

	var box_inst = MeshInstance3D.new()
	var box = BoxMesh.new()
	box.size = Vector3(0.3, 0.25, 0.3)
	box_inst.mesh = box
	box_inst.material_override = create_pbr_material(Color(0.7, 0.72, 0.75), 0.6, 0.4)
	root.add_child(box_inst)

	# Sensor probe head
	var probe = MeshInstance3D.new()
	var sph = SphereMesh.new()
	sph.radius = 0.08; sph.height = 0.16
	probe.mesh = sph
	probe.position.y = 0.18
	var probe_col = Color(0.9, 0.2, 0.1) if type.contains("radiation") else Color(0.2, 0.8, 0.3)
	probe.material_override = create_pbr_material(probe_col, 0.4, 0.2, probe_col, 0.6)
	root.add_child(probe)

	return root

static func build_thermal_shield(type: String) -> Node3D:
	var root = Node3D.new()
	root.name = "ThermalShieldRoot"

	var shield = MeshInstance3D.new()
	var is_carbon = type.contains("carbon")
	
	if is_carbon:
		# Heavy concave circular heat shield (Parker Solar Probe style)
		var cyl = CylinderMesh.new()
		cyl.top_radius = 1.1; cyl.bottom_radius = 1.15; cyl.height = 0.12
		shield.mesh = cyl
		shield.rotation.x = deg_to_rad(90)
		shield.material_override = create_pbr_material(Color(0.95, 0.95, 0.96), 0.1, 0.8) # Alumina white coating
	else:
		# MLI blanket panel
		var box = BoxMesh.new()
		box.size = Vector3(1.2, 1.4, 0.05)
		shield.mesh = box
		shield.material_override = create_pbr_material(Color(0.95, 0.7, 0.15), 0.95, 0.2)
		
	root.add_child(shield)
	return root

static func build_battery(type: String) -> Node3D:
	var root = Node3D.new()
	root.name = "BatteryRoot"

	if type.contains("rtg"):
		# RTG with cooling fins
		var core = MeshInstance3D.new()
		var cyl = CylinderMesh.new()
		cyl.top_radius = 0.15; cyl.bottom_radius = 0.15; cyl.height = 0.6
		core.mesh = cyl
		core.material_override = create_pbr_material(Color(0.3, 0.3, 0.35), 0.8, 0.3)
		root.add_child(core)

		# 4 radial cooling fins
		for i in range(4):
			var fin = MeshInstance3D.new()
			var fin_box = BoxMesh.new()
			fin_box.size = Vector3(0.02, 0.5, 0.2)
			fin.mesh = fin_box
			fin.rotation.y = deg_to_rad(i * 45)
			fin.position.z = 0.15
			fin.material_override = create_pbr_material(Color(0.2, 0.2, 0.22), 0.9, 0.4)
			root.add_child(fin)
	else:
		var cell = MeshInstance3D.new()
		var box = BoxMesh.new()
		box.size = Vector3(0.35, 0.2, 0.35)
		cell.mesh = box
		cell.material_override = create_pbr_material(Color(0.1, 0.5, 0.3), 0.4, 0.3)
		root.add_child(cell)

	return root

# --- FULL ROCKET WITH SEPARABLE STAGES ---

static func build_full_rocket(data: RocketData) -> Dictionary:
	var rocket_root = Node3D.new()
	rocket_root.name = "RocketRoot"

	var body_col = data.rocket_color if data else Color(0.95, 0.95, 1.0)
	var mat_body = create_pbr_material(body_col, 0.3, 0.4)
	var mat_metal = create_pbr_material(Color(0.25, 0.25, 0.28), 0.8, 0.3)
	var mat_engine = create_pbr_material(Color(0.15, 0.15, 0.18), 0.9, 0.25)

	# 1. STAGE 1 (Booster Stage)
	var stage1 = Node3D.new()
	stage1.name = "Stage1"
	
	var booster_mesh = MeshInstance3D.new()
	var b_cyl = CylinderMesh.new()
	b_cyl.top_radius = 1.0; b_cyl.bottom_radius = 1.0; b_cyl.height = 10.0
	booster_mesh.mesh = b_cyl
	booster_mesh.position.y = 5.0
	booster_mesh.material_override = mat_body
	stage1.add_child(booster_mesh)

	# Engine Bells on Stage 1
	var bell1 = MeshInstance3D.new()
	var b_cone = CylinderMesh.new()
	b_cone.top_radius = 0.3; b_cone.bottom_radius = 0.65; b_cone.height = 1.2
	bell1.mesh = b_cone
	bell1.position.y = -0.6
	bell1.material_override = mat_engine
	stage1.add_child(bell1)

	# Aerodynamic Stabilizer Fins
	for i in range(4):
		var fin = MeshInstance3D.new()
		var fin_prism = PrismMesh.new()
		fin_prism.size = Vector3(0.08, 1.5, 1.2)
		fin.mesh = fin_prism
		fin.rotation.y = deg_to_rad(i * 90)
		fin.position = Vector3(sin(deg_to_rad(i * 90)) * 1.4, 1.0, cos(deg_to_rad(i * 90)) * 1.4)
		fin.material_override = mat_metal
		stage1.add_child(fin)

	rocket_root.add_child(stage1)

	# 2. STAGE 2 (Upper Stage)
	var stage2 = Node3D.new()
	stage2.name = "Stage2"
	stage2.position.y = 10.0

	var stage2_mesh = MeshInstance3D.new()
	var s2_cyl = CylinderMesh.new()
	s2_cyl.top_radius = 0.95; s2_cyl.bottom_radius = 0.95; s2_cyl.height = 4.5
	stage2_mesh.mesh = s2_cyl
	stage2_mesh.position.y = 2.25
	stage2_mesh.material_override = mat_body
	stage2.add_child(stage2_mesh)

	# Stage 2 Vacuum Engine Bell
	var bell2 = MeshInstance3D.new()
	var b2_cone = CylinderMesh.new()
	b2_cone.top_radius = 0.2; b2_cone.bottom_radius = 0.55; b2_cone.height = 1.0
	bell2.mesh = b2_cone
	bell2.position.y = -0.5
	bell2.material_override = mat_engine
	stage2.add_child(bell2)

	rocket_root.add_child(stage2)

	# 3. PAYLOAD FAIRINGS (Left & Right Clamshells)
	var fairing_left = Node3D.new()
	fairing_left.name = "FairingLeft"
	fairing_left.position.y = 14.5

	var fl_mesh = MeshInstance3D.new()
	var fl_cone = CylinderMesh.new()
	fl_cone.top_radius = 0.05; fl_cone.bottom_radius = 0.95; fl_cone.height = 3.5
	fl_mesh.mesh = fl_cone
	fl_mesh.position = Vector3(-0.1, 1.75, 0)
	fl_mesh.material_override = mat_metal
	fairing_left.add_child(fl_mesh)
	rocket_root.add_child(fairing_left)

	var fairing_right = Node3D.new()
	fairing_right.name = "FairingRight"
	fairing_right.position.y = 14.5

	var fr_mesh = MeshInstance3D.new()
	var fr_cone = CylinderMesh.new()
	fr_cone.top_radius = 0.05; fr_cone.bottom_radius = 0.95; fr_cone.height = 3.5
	fr_mesh.mesh = fr_cone
	fr_mesh.position = Vector3(0.1, 1.75, 0)
	fr_mesh.material_override = mat_metal
	fairing_right.add_child(fr_mesh)
	rocket_root.add_child(fairing_right)

	# 4. PAYLOAD ADAPTER ATTACH POINT
	var payload_mount = Marker3D.new()
	payload_mount.name = "PayloadMount"
	payload_mount.position = Vector3(0, 15.0, 0)
	rocket_root.add_child(payload_mount)

	return {
		"root": rocket_root,
		"stage1": stage1,
		"stage2": stage2,
		"fairing_left": fairing_left,
		"fairing_right": fairing_right,
		"payload_mount": payload_mount
	}

# --- ROVER 3D MODEL (Rocker-Bogie 6-Wheeler) ---

static func build_rover() -> Node3D:
	var root = Node3D.new()
	root.name = "RoverRoot"

	# Chassis body
	var body = MeshInstance3D.new()
	var box = BoxMesh.new()
	box.size = Vector3(1.4, 0.5, 1.8)
	body.mesh = box
	body.position.y = 0.7
	body.material_override = create_pbr_material(Color(0.85, 0.85, 0.9), 0.4, 0.3)
	root.add_child(body)

	# Top solar power deck
	var deck = MeshInstance3D.new()
	var deck_box = BoxMesh.new()
	deck_box.size = Vector3(1.3, 0.04, 1.6)
	deck.mesh = deck_box
	deck.position.y = 0.97
	deck.material_override = create_pbr_material(Color(0.05, 0.12, 0.3), 0.2, 0.2)
	root.add_child(deck)

	# High camera mast
	var mast = MeshInstance3D.new()
	var cyl = CylinderMesh.new()
	cyl.top_radius = 0.04; cyl.bottom_radius = 0.04; cyl.height = 1.0
	mast.mesh = cyl
	mast.position = Vector3(0.4, 1.45, 0.6)
	mast.material_override = create_pbr_material(Color(0.3, 0.3, 0.35), 0.7, 0.4)
	root.add_child(mast)

	# Mastcam Head with dual stereo cameras
	var head = MeshInstance3D.new()
	var head_box = BoxMesh.new()
	head_box.size = Vector3(0.25, 0.15, 0.2)
	head.mesh = head_box
	head.position = Vector3(0.4, 1.95, 0.6)
	head.material_override = create_pbr_material(Color(0.8, 0.8, 0.85), 0.8, 0.3)
	root.add_child(head)

	# 6 Rugged Wheels
	var wheel_mat = create_pbr_material(Color(0.18, 0.18, 0.2), 0.9, 0.4)
	var wheel_positions = [
		Vector3(-0.9, 0.35,  0.7), Vector3(0.9, 0.35,  0.7), # Front
		Vector3(-0.95, 0.35, 0.0), Vector3(0.95, 0.35, 0.0), # Middle
		Vector3(-0.9, 0.35, -0.7), Vector3(0.9, 0.35, -0.7)  # Rear
	]
	for pos in wheel_positions:
		var wheel = MeshInstance3D.new()
		var w_cyl = CylinderMesh.new()
		w_cyl.top_radius = 0.35; w_cyl.bottom_radius = 0.35; w_cyl.height = 0.2
		wheel.mesh = w_cyl
		wheel.rotation.z = deg_to_rad(90)
		wheel.position = pos
		wheel.material_override = wheel_mat
		root.add_child(wheel)

	return root

# --- ASTRONAUT 3D MODEL (NASA Style EVA Spacesuit) ---

static func build_astronaut() -> Node3D:
	var root = Node3D.new()
	root.name = "AstronautRoot"

	var suit_mat = create_pbr_material(Color(0.95, 0.95, 0.96), 0.05, 0.7)
	var joint_mat = create_pbr_material(Color(0.3, 0.3, 0.35), 0.2, 0.5)
	var visor_mat = create_pbr_material(Color(1.0, 0.8, 0.2), 0.98, 0.1, Color(0.8, 0.6, 0.1), 0.2) # Gold reflective visor

	# Torso
	var torso = MeshInstance3D.new()
	var t_box = BoxMesh.new()
	t_box.size = Vector3(0.65, 0.8, 0.45)
	torso.mesh = t_box
	torso.position.y = 1.2
	torso.material_override = suit_mat
	root.add_child(torso)

	# Life Support Backpack (PLSS)
	var plss = MeshInstance3D.new()
	var p_box = BoxMesh.new()
	p_box.size = Vector3(0.55, 0.75, 0.3)
	plss.mesh = p_box
	plss.position = Vector3(0, 1.25, -0.32)
	plss.material_override = suit_mat
	root.add_child(plss)

	# Helmet
	var helmet = MeshInstance3D.new()
	var h_sph = SphereMesh.new()
	h_sph.radius = 0.28; h_sph.height = 0.56
	helmet.mesh = h_sph
	helmet.position.y = 1.82
	helmet.material_override = suit_mat
	root.add_child(helmet)

	# Gold Visor
	var visor = MeshInstance3D.new()
	var v_sph = SphereMesh.new()
	v_sph.radius = 0.22; v_sph.height = 0.35
	visor.mesh = v_sph
	visor.position = Vector3(0, 1.82, 0.14)
	visor.material_override = visor_mat
	root.add_child(visor)

	# Legs & Boots
	for side in [-0.2, 0.2]:
		var leg = MeshInstance3D.new()
		var l_cyl = CylinderMesh.new()
		l_cyl.top_radius = 0.14; l_cyl.bottom_radius = 0.13; l_cyl.height = 0.75
		leg.mesh = l_cyl
		leg.position = Vector3(side, 0.45, 0)
		leg.material_override = suit_mat
		root.add_child(leg)

		var boot = MeshInstance3D.new()
		var b_box = BoxMesh.new()
		b_box.size = Vector3(0.2, 0.15, 0.35)
		boot.mesh = b_box
		boot.position = Vector3(side, 0.08, 0.05)
		boot.material_override = joint_mat
		root.add_child(boot)

	return root

# --- LAUNCH PAD & GANTRY TOWER ---

static func build_launch_pad() -> Node3D:
	var root = Node3D.new()
	root.name = "LaunchPadRoot"

	# Launch Table Concrete Base
	var base = MeshInstance3D.new()
	var b_box = BoxMesh.new()
	b_box.size = Vector3(24.0, 3.0, 24.0)
	base.mesh = b_box
	base.position.y = -1.5
	base.material_override = create_pbr_material(Color(0.4, 0.42, 0.45), 0.1, 0.85)
	root.add_child(base)

	# Flame Trench Opening
	var trench = MeshInstance3D.new()
	var t_cyl = CylinderMesh.new()
	t_cyl.top_radius = 3.5; t_cyl.bottom_radius = 4.0; t_cyl.height = 3.1
	trench.mesh = t_cyl
	trench.position.y = -1.5
	trench.material_override = create_pbr_material(Color(0.15, 0.15, 0.17), 0.2, 0.9)
	root.add_child(trench)

	# Steel Truss Umbilical Gantry Tower
	var tower = Node3D.new()
	tower.position = Vector3(-5.0, 0, 0)
	var tower_mat = create_pbr_material(Color(0.85, 0.25, 0.15), 0.4, 0.5) # Red umbilical tower

	for level in range(6):
		var platform = MeshInstance3D.new()
		var p_box = BoxMesh.new()
		p_box.size = Vector3(2.5, 0.2, 2.5)
		platform.mesh = p_box
		platform.position.y = level * 3.5
		platform.material_override = tower_mat
		tower.add_child(platform)

		# 4 Truss Columns
		for cx in [-1.1, 1.1]:
			for cz in [-1.1, 1.1]:
				var col = MeshInstance3D.new()
				var c_cyl = CylinderMesh.new()
				c_cyl.top_radius = 0.06; c_cyl.bottom_radius = 0.06; c_cyl.height = 3.5
				col.mesh = c_cyl
				col.position = Vector3(cx, (level * 3.5) + 1.75, cz)
				col.material_override = tower_mat
				tower.add_child(col)

	# Umbilical Swing Arm
	var arm = MeshInstance3D.new()
	var arm_box = BoxMesh.new()
	arm_box.size = Vector3(4.2, 0.4, 0.6)
	arm.mesh = arm_box
	arm.position = Vector3(2.1, 15.0, 0)
	arm.material_override = tower_mat
	tower.add_child(arm)

	root.add_child(tower)
	return root
