extends Node3D

@onready var rocket_pivot: Node3D = $RocketPivot
@onready var launch_pad: Node3D = $LaunchPad
@onready var camera: Camera3D = $Camera3D

# HUD References
@onready var countdown_lbl: Label = $HUD/CountdownPanel/CountdownLbl
@onready var altitude_lbl: Label = $HUD/TelemetryPanel/VBox/AltitudeLbl
@onready var speed_lbl: Label = $HUD/TelemetryPanel/VBox/SpeedLbl
@onready var max_q_lbl: Label = $HUD/TelemetryPanel/VBox/MaxQLbl
@onready var status_lbl: Label = $HUD/TelemetryPanel/VBox/StatusLbl
@onready var throttle_slider: HSlider = $HUD/ControlsPanel/VBox/ThrottleSlider
@onready var throttle_lbl: Label = $HUD/ControlsPanel/VBox/ThrottleLbl
@onready var stage_btn: Button = $HUD/ControlsPanel/VBox/StageBtn
@onready var hint_lbl: Label = $HUD/HintPanel/HintLbl

# Rocket Parts
var rocket_nodes: Dictionary = {}
var stage1_node: Node3D = null
var stage2_node: Node3D = null
var fairing_left: Node3D = null
var fairing_right: Node3D = null
var payload_mount: Marker3D = null

# Flight State
enum LaunchPhase {
	COUNTDOWN,
	STAGE1_ASCENT,
	STAGING_READY,
	STAGE2_ASCENT,
	FAIRINGS_JETTISONED,
	ORBITAL_INSERTION_BURN,
	ORBIT_ACHIEVED
}

var current_phase: LaunchPhase = LaunchPhase.COUNTDOWN
var countdown_timer: float = 6.0
var altitude_km: float = 0.0
var speed_kms: float = 0.0
var throttle: float = 1.0 # 0.0 to 1.0
var flight_accuracy: float = 100.0

var stage1_exhaust_particles: GPUParticles3D = null
var stage2_exhaust_particles: GPUParticles3D = null

func _ready() -> void:
	_setup_3d_environment()
	_setup_rocket_and_payload()
	_setup_exhaust_particles()
	_setup_hud()
	AudioManager.set_thruster_power(0.0)

func _setup_3d_environment() -> void:
	# Add procedural launch pad
	var pad = ProceduralMeshBuilder.build_launch_pad()
	launch_pad.add_child(pad)

func _setup_rocket_and_payload() -> void:
	var rocket_data = GameManager.selected_rocket
	if not rocket_data and not GameManager.available_rockets_catalog.is_empty():
		rocket_data = GameManager.available_rockets_catalog[1]
		GameManager.selected_rocket = rocket_data

	rocket_nodes = ProceduralMeshBuilder.build_full_rocket(rocket_data)
	rocket_pivot.add_child(rocket_nodes.root)

	stage1_node = rocket_nodes.stage1
	stage2_node = rocket_nodes.stage2
	fairing_left = rocket_nodes.fairing_left
	fairing_right = rocket_nodes.fairing_right
	payload_mount = rocket_nodes.payload_mount

	# Attach the player's custom satellite to the payload mount!
	var sat_root = Node3D.new()
	sat_root.name = "PlayerSatellitePayload"
	sat_root.scale = Vector3(0.7, 0.7, 0.7)
	payload_mount.add_child(sat_root)

	for s_name in GameManager.installed_parts.keys():
		var part: SpacecraftPart = GameManager.installed_parts[s_name]
		var p_mesh: Node3D = null
		match part.category:
			SpacecraftPart.Category.CHASSIS: p_mesh = ProceduralMeshBuilder.build_satellite_chassis(part.id)
			SpacecraftPart.Category.SOLAR_PANELS: p_mesh = ProceduralMeshBuilder.build_solar_panel(part.id)
			SpacecraftPart.Category.ANTENNA: p_mesh = ProceduralMeshBuilder.build_antenna(part.id)
			SpacecraftPart.Category.CAMERAS: p_mesh = ProceduralMeshBuilder.build_camera(part.id)
			SpacecraftPart.Category.INSTRUMENTS: p_mesh = ProceduralMeshBuilder.build_instrument(part.id)
			SpacecraftPart.Category.BATTERIES: p_mesh = ProceduralMeshBuilder.build_battery(part.id)
			SpacecraftPart.Category.THERMAL_SHIELD: p_mesh = ProceduralMeshBuilder.build_thermal_shield(part.id)
		if p_mesh:
			sat_root.add_child(p_mesh)

func _setup_exhaust_particles() -> void:
	# Create GPU Particles for Stage 1 Engine Exhaust
	stage1_exhaust_particles = GPUParticles3D.new()
	stage1_exhaust_particles.amount = 120
	stage1_exhaust_particles.lifetime = 0.5
	stage1_exhaust_particles.emitting = false

	var part_mat = ParticleProcessMaterial.new()
	part_mat.direction = Vector3(0, -1, 0)
	part_mat.spread = 15.0
	part_mat.initial_velocity_min = 12.0
	part_mat.initial_velocity_max = 20.0
	part_mat.gravity = Vector3(0, -2, 0)
	part_mat.color = Color(1.0, 0.6, 0.1, 0.9)
	stage1_exhaust_particles.process_material = part_mat

	var draw_pass = SphereMesh.new()
	draw_pass.radius = 0.4
	draw_pass.height = 0.8
	draw_pass.material = ProceduralMeshBuilder.create_pbr_material(Color(1.0, 0.5, 0.1), 0.0, 0.5, Color(1.0, 0.4, 0.1), 3.0)
	stage1_exhaust_particles.draw_pass_1 = draw_pass

	stage1_exhaust_particles.position = Vector3(0, -0.6, 0)
	if stage1_node:
		stage1_node.add_child(stage1_exhaust_particles)

func _setup_hud() -> void:
	throttle_slider.value_changed.connect(_on_throttle_changed)
	stage_btn.pressed.connect(_trigger_stage_separation)
	stage_btn.disabled = true
	hint_lbl.text = "T-Minus 5 Seconds. Systems are Go for Launch!"

func _on_throttle_changed(value: float) -> void:
	throttle = value / 100.0
	throttle_lbl.text = "Throttle: %d%%" % int(value)
	if current_phase != LaunchPhase.COUNTDOWN:
		AudioManager.set_thruster_power(throttle)

func _input(event: InputEvent) -> void:
	if event.is_action_pressed("stage_separate") and not stage_btn.disabled:
		_trigger_stage_separation()
	elif event.is_action_pressed("throttle_up"):
		throttle_slider.value = min(throttle_slider.value + 10, 100)
	elif event.is_action_pressed("throttle_down"):
		throttle_slider.value = max(throttle_slider.value - 10, 0)

func _process(delta: float) -> void:
	match current_phase:
		LaunchPhase.COUNTDOWN:
			_process_countdown(delta)
		LaunchPhase.STAGE1_ASCENT:
			_process_stage1_ascent(delta)
		LaunchPhase.STAGING_READY:
			_process_staging_ready(delta)
		LaunchPhase.STAGE2_ASCENT:
			_process_stage2_ascent(delta)
		LaunchPhase.FAIRINGS_JETTISONED:
			_process_fairing_and_orbital_burn(delta)
		LaunchPhase.ORBITAL_INSERTION_BURN:
			_process_orbital_insertion(delta)
		LaunchPhase.ORBIT_ACHIEVED:
			pass

	_update_hud()
	_update_camera_tracking(delta)

func _process_countdown(delta: float) -> void:
	countdown_timer -= delta
	var count = int(ceil(countdown_timer))
	if count > 0:
		countdown_lbl.text = "T-%d" % count
	else:
		countdown_lbl.text = "LIFTOFF!"
		current_phase = LaunchPhase.STAGE1_ASCENT
		stage1_exhaust_particles.emitting = true
		AudioManager.set_thruster_power(throttle)
		hint_lbl.text = "Full Throttle! Keep rocket pointed vertical during initial ascent."

func _process_stage1_ascent(delta: float) -> void:
	var thrust_accel = 22.0 * throttle
	var gravity = 9.8
	var net_accel = (thrust_accel - gravity)

	speed_kms += (net_accel * delta) * 0.001
	altitude_km += speed_kms * delta * 100.0

	# Physical upward translation of the rocket
	rocket_pivot.position.y += speed_kms * delta * 200.0

	# Dynamic Pressure (Max-Q around 14 km)
	if altitude_km > 10.0 and altitude_km < 18.0:
		max_q_lbl.text = "DYNAMIC PRESSURE: MAX-Q (Peak Stress)"
		max_q_lbl.add_theme_color_override("font_color", Color(1.0, 0.6, 0.1))
	else:
		max_q_lbl.text = "DYNAMIC PRESSURE: NOMINAL"
		max_q_lbl.add_theme_color_override("font_color", Color(0.3, 0.8, 1.0))

	# Booster Burnout (MECO) at 60 km
	if altitude_km >= 60.0:
		current_phase = LaunchPhase.STAGING_READY
		stage_btn.disabled = false
		stage1_exhaust_particles.emitting = false
		AudioManager.set_thruster_power(0.0)
		AudioManager.play_sfx_alarm()
		hint_lbl.text = "[STAGE 1 MECO]: Press SPACEBAR or click 'SEPARATE STAGE' to decouple booster!"

func _process_staging_ready(_delta: float) -> void:
	status_lbl.text = "STATUS: STAGE 1 CUTOFF - READY FOR DECOUPLING"
	status_lbl.add_theme_color_override("font_color", Color(1.0, 0.9, 0.2))

func _trigger_stage_separation() -> void:
	if current_phase == LaunchPhase.STAGING_READY:
		AudioManager.play_sfx_stage_separate()
		stage_btn.disabled = true
		current_phase = LaunchPhase.STAGE2_ASCENT
		AudioManager.set_thruster_power(throttle)
		status_lbl.text = "STATUS: STAGE 2 VACUUM BURN"
		status_lbl.add_theme_color_override("font_color", Color(0.2, 1.0, 0.4))
		hint_lbl.text = "Stage 2 Vacuum Engine active! Accelerating to orbital velocity (7.8 km/s)."

		# Separate Stage 1 booster physically
		if stage1_node:
			stage1_node.reparent(self)
			var tween = create_tween()
			tween.tween_property(stage1_node, "position:y", stage1_node.position.y - 150.0, 5.0)
			tween.parallel().tween_property(stage1_node, "rotation:z", 1.5, 5.0)

func _process_stage2_ascent(delta: float) -> void:
	speed_kms += 15.0 * throttle * delta * 0.001
	altitude_km += speed_kms * delta * 120.0
	rocket_pivot.position.y += speed_kms * delta * 150.0

	# Gravity turn tilt toward horizontal orbit
	rocket_pivot.rotation.z = lerp(rocket_pivot.rotation.z, deg_to_rad(-45.0), delta * 0.5)

	# Fairing Jettison crossing 100 km (Kármán line)
	if altitude_km >= 100.0 and current_phase == LaunchPhase.STAGE2_ASCENT:
		current_phase = LaunchPhase.FAIRINGS_JETTISONED
		_jettison_fairings()

func _jettison_fairings() -> void:
	AudioManager.play_sfx_stage_separate()
	hint_lbl.text = "[KÁRMÁN LINE CROSSED (100km)]: Fairings jettisoned! Satellite exposed to space vacuum."

	# Clamshell fairing separation animation
	if fairing_left:
		fairing_left.reparent(self)
		var tween = create_tween()
		tween.tween_property(fairing_left, "position:x", fairing_left.position.x - 25.0, 3.0)
		tween.parallel().tween_property(fairing_left, "position:y", fairing_left.position.y - 40.0, 3.0)
	if fairing_right:
		fairing_right.reparent(self)
		var tween2 = create_tween()
		tween2.tween_property(fairing_right, "position:x", fairing_right.position.x + 25.0, 3.0)
		tween2.parallel().tween_property(fairing_right, "position:y", fairing_right.position.y - 40.0, 3.0)

func _process_fairing_and_orbital_burn(delta: float) -> void:
	speed_kms += 25.0 * throttle * delta * 0.001
	altitude_km += speed_kms * delta * 80.0
	rocket_pivot.position.y += speed_kms * delta * 100.0

	if speed_kms >= 7.8:
		current_phase = LaunchPhase.ORBIT_ACHIEVED
		_on_orbit_achieved()

func _process_orbital_insertion(_delta: float) -> void:
	pass

func _on_orbit_achieved() -> void:
	AudioManager.set_thruster_power(0.0)
	AudioManager.play_sfx_discovery()
	GameManager.launch_success = true
	GameManager.telemetry_altitude_km = altitude_km
	GameManager.telemetry_speed_kms = speed_kms
	GameManager.flight_accuracy_percent = flight_accuracy
	Progression.award_badge("orbital_insertion")

	hint_lbl.text = "ORBITAL INSERTION ACHIEVED! Deploying payload into target mission orbit..."
	hint_lbl.add_theme_color_override("font_color", Color(0.2, 1.0, 0.4))

	# Wait 2.5 seconds and transition to target mission operational scene
	var timer = get_tree().create_timer(2.5)
	timer.timeout.connect(_transition_to_mission_ops)

func _transition_to_mission_ops() -> void:
	match GameManager.current_mission:
		GameManager.MissionType.EARTH_OBSERVATION:
			get_tree().change_scene_to_file("res://scenes/EarthOrbitOps.tscn")
		GameManager.MissionType.MOON_ASTRONAUT, GameManager.MissionType.MOON_ROVER:
			get_tree().change_scene_to_file("res://scenes/MoonSurface.tscn")
		GameManager.MissionType.MARS_ROVER:
			get_tree().change_scene_to_file("res://scenes/MarsSurface.tscn")
		GameManager.MissionType.SUN_OBSERVATION:
			get_tree().change_scene_to_file("res://scenes/SunOrbitOps.tscn")

func _update_hud() -> void:
	altitude_lbl.text = "Altitude: %.1f km" % altitude_km
	speed_lbl.text = "Orbital Velocity: %.2f km/s (%.0f km/h)" % [speed_kms, speed_kms * 3600.0]

func _update_camera_tracking(delta: float) -> void:
	if current_phase != LaunchPhase.COUNTDOWN:
		var target_pos = rocket_pivot.position + Vector3(0, 5, 25)
		camera.position = camera.position.lerp(target_pos, delta * 3.0)
		camera.look_at(rocket_pivot.position + Vector3(0, 8, 0))
