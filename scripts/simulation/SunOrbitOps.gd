extends Node3D

@onready var sun_pivot: Node3D = $SunPivot
@onready var probe_pivot: Node3D = $ProbePivot
@onready var heat_gauge: ProgressBar = $HUD/ThermalPanel/HeatGauge
@onready var temp_lbl: Label = $HUD/ThermalPanel/TempLbl
@onready var align_lbl: Label = $HUD/ThermalPanel/AlignLbl
@onready var objective_lbl: Label = $HUD/ObjectivePanel/ObjectiveLbl
@onready var action_btn: Button = $HUD/ActionBtn
@onready var complete_btn: Button = $HUD/CompleteBtn
@onready var log_lbl: Label = $HUD/LogPanel/LogLbl

var solar_science_steps = [
	{ "title": "Extreme-UV Coronagraph Solar Photography", "fact": "Sunspots appear dark only because they are cooler (3,800°C) than the surrounding boiling photosphere (5,500°C)." },
	{ "title": "Measure Photosphere vs Corona Temperature Gradient", "fact": "The Corona Mystery: The outer corona reaches over 1,000,000°C, while the surface is only 5,500°C! Magnetic reconnection is the primary heating cause." },
	{ "title": "Detect Ultraviolet & X-Ray Radiation Flares", "fact": "Solar flares release the equivalent energy of millions of 100-megaton hydrogen bombs exploding simultaneously!" },
	{ "title": "Monitor Coronal Mass Ejection (CME) Plasma Eruption", "fact": "A CME hurls billions of tons of magnetized plasma into space at speeds up to 3,000 km per second." },
	{ "title": "Solar Wind Particle Flux & Magnetic Field Mapping", "fact": "The solar wind is a continuous stream of charged protons and electrons blowing outward past Pluto to form the heliosphere bubble." },
	{ "title": "Transmit Solar Physics Telemetry Back to Earth", "fact": "Accurate solar storm forecasting protects Earth's electrical power grids, airline flights, and astronauts on the Moon." }
]
var current_step_idx: int = 0
var probe_temperature_k: float = 310.0
var max_safe_temp_k: float = 1600.0

func _ready() -> void:
	_setup_solar_environment()
	action_btn.pressed.connect(_on_action_pressed)
	complete_btn.pressed.connect(_on_complete_mission)
	complete_btn.disabled = true
	_update_hud_step()

func _process(delta: float) -> void:
	if sun_pivot:
		sun_pivot.rotate_y(0.08 * delta)
	if probe_pivot:
		probe_pivot.rotate_y(0.12 * delta)

	# Thermal Simulation: Shield keeping probe cool
	var thermal_rating = GameManager.get_average_thermal_rating()
	if thermal_rating >= 1800.0:
		probe_temperature_k = 320.0 + sin(Time.get_ticks_msec() * 0.002) * 5.0
		align_lbl.text = "HEAT SHIELD ALIGNMENT: 100% (SHADOW DEFLECTION ACTIVE)"
		align_lbl.add_theme_color_override("font_color", Color(0.2, 1.0, 0.4))
	else:
		probe_temperature_k = min(probe_temperature_k + (delta * 15.0), 1200.0)
		align_lbl.text = "THERMAL WARNING: INSUFFICIENT SHIELDING (HEATING UP!)"
		align_lbl.add_theme_color_override("font_color", Color(1.0, 0.3, 0.2))

	temp_lbl.text = "Internal Probe Temp: %.0f K (%.0f °C)" % [probe_temperature_k, probe_temperature_k - 273.15]
	heat_gauge.value = (probe_temperature_k / max_safe_temp_k) * 100.0

func _setup_solar_environment() -> void:
	var sun = ProceduralPlanetBuilder.build_sun(22.0)
	sun_pivot.add_child(sun)

	# Player's solar probe in close perihelion orbit
	var probe = Node3D.new()
	probe.name = "SolarProbe"
	probe.position = Vector3(45, 0, 0)
	probe.scale = Vector3(0.9, 0.9, 0.9)

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
			probe.add_child(p_mesh)

	probe_pivot.add_child(probe)

func _update_hud_step() -> void:
	if current_step_idx < solar_science_steps.size():
		var step = solar_science_steps[current_step_idx]
		objective_lbl.text = "SOLAR OBSERVATION (%d/%d): %s" % [current_step_idx + 1, solar_science_steps.size(), step.title]
		action_btn.text = step.title
	else:
		objective_lbl.text = "SUN OBSERVATION MISSION FULLY ACCOMPLISHED!"
		action_btn.disabled = true
		complete_btn.disabled = false
		Progression.award_badge("solar_sentinel")

func _on_action_pressed() -> void:
	if current_step_idx < solar_science_steps.size():
		AudioManager.play_sfx_discovery()
		var step = solar_science_steps[current_step_idx]
		GameManager.solar_cme_detected += 1
		GameManager.record_discovery(step.title, step.fact, 350)
		log_lbl.text = "[SOLAR DISCOVERY]: " + step.fact
		current_step_idx += 1
		_update_hud_step()

func _on_complete_mission() -> void:
	AudioManager.play_sfx_click()
	get_tree().change_scene_to_file("res://scenes/MissionResults.tscn")
