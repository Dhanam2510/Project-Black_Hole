extends Node3D

@onready var terrain_root: Node3D = $TerrainRoot
@onready var rover_root: Node3D = $RoverRoot
@onready var sky_env: WorldEnvironment = $WorldEnvironment

# HUD
@onready var objective_lbl: Label = $HUD/ObjectivePanel/ObjectiveLbl
@onready var storm_status_lbl: Label = $HUD/StatsPanel/StormLbl
@onready var action_btn: Button = $HUD/ActionBtn
@onready var complete_btn: Button = $HUD/CompleteBtn
@onready var log_lbl: Label = $HUD/LogPanel/LogLbl

var mars_science_steps = [
	{ "title": "Analyze Jezero Delta Rock with Laser Spectrometer", "fact": "Laser-induced breakdown spectroscopy (LIBS) vaporizes a pinhead of rock into glowing plasma to detect elemental Iron, Magnesium, and Silica." },
	{ "title": "Drill Core Sample for Subsurface Water-Ice", "fact": "Liquid water cannot exist on Mars' low-pressure surface today, but vast sheets of pure water ice are frozen beneath the red dust!" },
	{ "title": "Monitor Approaching Martian Dust Storm", "fact": "Martian dust storms can swell to encompass the entire planet! Dust particles are electrostatically charged and stick to solar panels." },
	{ "title": "Atmospheric Composition & MOXIE Oxygen Experiment", "fact": "Mars' atmosphere is 95% Carbon Dioxide (CO2). MOXIE extracts breathable Oxygen (O2) from CO2 by heating it to 800°C." },
	{ "title": "Evaluate Site for Future Human Base Camp", "fact": "Lava tubes and deep crater rims offer natural shielding against deadly cosmic radiation and solar flares for future human astronauts." }
]
var current_step_idx: int = 0
var storm_active: bool = false

func _ready() -> void:
	_setup_mars_terrain()
	_setup_mars_rover()
	action_btn.pressed.connect(_on_action_pressed)
	complete_btn.pressed.connect(_on_complete_mission)
	complete_btn.disabled = true
	_update_hud_step()

func _setup_mars_terrain() -> void:
	# Reddish-orange terrain
	var ground = MeshInstance3D.new()
	var plane = PlaneMesh.new()
	plane.size = Vector2(90, 90)
	ground.mesh = plane

	var mat = StandardMaterial3D.new()
	mat.albedo_color = Color(0.78, 0.32, 0.15) # Mars red iron oxide
	mat.roughness = 0.92
	ground.material_override = mat
	terrain_root.add_child(ground)

	# Scattered Martian Basalt Boulders
	var rock_mat = StandardMaterial3D.new()
	rock_mat.albedo_color = Color(0.35, 0.22, 0.18)
	rock_mat.roughness = 0.85

	for i in range(16):
		var rock = MeshInstance3D.new()
		var box = BoxMesh.new()
		box.size = Vector3(randf_range(0.6, 1.8), randf_range(0.4, 1.0), randf_range(0.6, 1.8))
		rock.mesh = box
		rock.material_override = rock_mat
		rock.position = Vector3(randf_range(-25, 25), box.size.y * 0.5, randf_range(-25, 25))
		rock.rotation.y = randf_range(0, PI)
		terrain_root.add_child(rock)

func _setup_mars_rover() -> void:
	var rover = ProceduralMeshBuilder.build_rover()
	rover_root.add_child(rover)

func _update_hud_step() -> void:
	if current_step_idx < mars_science_steps.size():
		var step = mars_science_steps[current_step_idx]
		objective_lbl.text = "MARS SCIENCE (%d/%d): %s" % [current_step_idx + 1, mars_science_steps.size(), step.title]
		action_btn.text = step.title
	else:
		objective_lbl.text = "ALL MARS ROBOTIC EXPLORATION OBJECTIVES ACHIEVED!"
		action_btn.disabled = true
		complete_btn.disabled = false

func _on_action_pressed() -> void:
	if current_step_idx < mars_science_steps.size():
		AudioManager.play_sfx_discovery()
		var step = mars_science_steps[current_step_idx]
		GameManager.record_discovery(step.title, step.fact, 300)
		log_lbl.text = "[MARS SCIENCE INSIGHT]: " + step.fact

		# Trigger dynamic dust storm at step 3
		if current_step_idx == 2:
			_trigger_dust_storm()

		current_step_idx += 1
		_update_hud_step()

		if current_step_idx >= mars_science_steps.size():
			Progression.award_badge("martian_geologist")

func _trigger_dust_storm() -> void:
	storm_active = true
	GameManager.dust_storms_monitored += 1
	storm_status_lbl.text = "ENVIRONMENT: DUST STORM IN PROGRESS (Visibility 15%)"
	storm_status_lbl.add_theme_color_override("font_color", Color(1.0, 0.4, 0.1))
	AudioManager.play_sfx_alarm()
	Progression.award_badge("dust_survivor")

func _on_complete_mission() -> void:
	AudioManager.play_sfx_click()
	Progression.unlock_mission(3) # Unlock Sun Mission!
	get_tree().change_scene_to_file("res://scenes/MissionResults.tscn")
