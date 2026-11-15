extends Node3D

@onready var terrain_root: Node3D = $TerrainRoot
@onready var actor_root: Node3D = $ActorRoot
@onready var camera: Camera3D = $Camera3D

# HUD
@onready var title_lbl: Label = $HUD/HeaderPanel/TitleLbl
@onready var objective_lbl: Label = $HUD/ObjectivePanel/ObjectiveLbl
@onready var samples_lbl: Label = $HUD/StatsPanel/SamplesLbl
@onready var action_btn: Button = $HUD/ActionBtn
@onready var complete_btn: Button = $HUD/CompleteBtn
@onready var log_lbl: Label = $HUD/LogPanel/LogLbl

var is_astronaut_mode: bool = true
var samples_collected: int = 0
var max_samples: int = 4
var actor_3d: Node3D = null

# Interactive Science Locations
var science_steps = [
	{ "title": "Collect Lunar Regolith Soil Sample", "desc": "Scooping fine electrostatic dust from Descartes Highlands rim.", "fact": "Lunar dust is extremely abrasive because there is no atmosphere or wind on the Moon to erode sharp rock edges." },
	{ "title": "Examine Anorthosite Bedrock", "desc": "Using magnifying hand lens / microscopic imager on white plagioclase rock.", "fact": "Anorthosite is part of the ancient Lunar Magma Ocean that solidified 4.4 billion years ago." },
	{ "title": "Deploy Passive Seismic Experiment", "desc": "Setting up seismometer on surface bedrock to listen for moonquakes.", "fact": "Deep moonquakes are caused by tidal gravitational pull from planet Earth!" },
	{ "title": "High-Definition Surface Panorama & Data Uplink", "desc": "Broadcasting 360-degree geological survey data back to Earth mission control.", "fact": "Radio signals take approximately 1.3 seconds to travel between the Moon and Earth." }
]
var current_step_idx: int = 0

func _ready() -> void:
	is_astronaut_mode = (GameManager.current_mission == GameManager.MissionType.MOON_ASTRONAUT)
	_setup_lunar_terrain()
	_setup_player_actor()
	action_btn.pressed.connect(_on_action_pressed)
	complete_btn.pressed.connect(_on_complete_mission)
	complete_btn.disabled = true
	_update_hud_step()

func _process(delta: float) -> void:
	# Bouncy lunar low-gravity movement animation
	if actor_3d:
		var bounce_freq = 3.0 if is_astronaut_mode else 1.5
		var bounce_amp = 0.12 if is_astronaut_mode else 0.03
		actor_3d.position.y = abs(sin(Time.get_ticks_msec() * 0.001 * bounce_freq)) * bounce_amp

func _setup_lunar_terrain() -> void:
	# Procedural Crater Floor
	var ground = MeshInstance3D.new()
	var plane = PlaneMesh.new()
	plane.size = Vector2(80, 80)
	ground.mesh = plane

	var mat = StandardMaterial3D.new()
	mat.albedo_color = Color(0.55, 0.55, 0.58) # Lunar gray
	mat.roughness = 0.95
	ground.material_override = mat
	terrain_root.add_child(ground)

	# Boulders and impact craters
	for i in range(12):
		var rock = MeshInstance3D.new()
		var sph = SphereMesh.new()
		sph.radius = randf_range(0.4, 1.2)
		sph.height = sph.radius * 1.5
		rock.mesh = sph
		rock.material_override = mat
		rock.position = Vector3(randf_range(-20, 20), sph.height * 0.3, randf_range(-20, 20))
		terrain_root.add_child(rock)

	# Earth visible in the black sky
	var earth_sky = ProceduralPlanetBuilder.build_earth(4.0)
	earth_sky.position = Vector3(30, 25, -45)
	add_child(earth_sky)

func _setup_player_actor() -> void:
	if is_astronaut_mode:
		actor_3d = ProceduralMeshBuilder.build_astronaut()
		title_lbl.text = "MOON EXPLORATION: ASTRONAUT SURFACE EVA (Gravity: 1.62 m/s²)"
	else:
		actor_3d = ProceduralMeshBuilder.build_rover()
		title_lbl.text = "MOON EXPLORATION: ROBOTIC ROVER RESEARCH (Autonomous Surface Ops)"

	actor_root.add_child(actor_3d)

func _update_hud_step() -> void:
	if current_step_idx < science_steps.size():
		var step = science_steps[current_step_idx]
		objective_lbl.text = "OBJECTIVE (%d/%d): %s\n%s" % [current_step_idx + 1, science_steps.size(), step.title, step.desc]
		action_btn.text = step.title
	else:
		objective_lbl.text = "ALL LUNAR MISSION RESEARCH OBJECTIVES COMPLETED!"
		action_btn.disabled = true
		complete_btn.disabled = false

	samples_lbl.text = "Lunar Samples & Data: %d/%d" % [samples_collected, science_steps.size()]

func _on_action_pressed() -> void:
	if current_step_idx < science_steps.size():
		AudioManager.play_sfx_discovery()
		var step = science_steps[current_step_idx]
		samples_collected += 1
		GameManager.samples_analyzed_count += 1
		GameManager.record_discovery(step.title, step.fact, 250)

		log_lbl.text = "[SCIENCE LOG]: " + step.fact
		current_step_idx += 1
		_update_hud_step()

		if current_step_idx >= science_steps.size():
			if is_astronaut_mode:
				Progression.award_badge("lunar_walker")
			else:
				Progression.award_badge("lunar_trailblazer")

func _on_complete_mission() -> void:
	AudioManager.play_sfx_click()
	Progression.unlock_mission(2) # Unlock Mars Mission!
	get_tree().change_scene_to_file("res://scenes/MissionResults.tscn")
