extends Node3D

@onready var earth_pivot: Node3D = $EarthPivot
@onready var satellite_pivot: Node3D = $SatellitePivot
@onready var camera: Camera3D = $Camera3D

# HUD
@onready var objective_lbl: Label = $HUD/ObjectivePanel/ObjectiveLbl
@onready var points_lbl: Label = $HUD/StatsPanel/PointsLbl
@onready var battery_lbl: Label = $HUD/StatsPanel/BatteryLbl
@onready var target_reticle: ColorRect = $HUD/Reticle
@onready var action_btn: Button = $HUD/ActionBtn
@onready var complete_btn: Button = $HUD/CompleteBtn
@onready var discovery_log: Label = $HUD/LogPanel/LogLbl

enum EarthActivity {
	IMAGE_CAPTURE,
	CLIMATE_MONITORING,
	WEATHER_OBSERVATION,
	ASTEROID_TRACKING,
	DATA_TRANSMISSION
}

var current_activity: EarthActivity = EarthActivity.IMAGE_CAPTURE
var points: int = 0
var battery_percent: float = 100.0

func _ready() -> void:
	_setup_3d_orbit()
	action_btn.pressed.connect(_on_perform_action)
	complete_btn.pressed.connect(_on_complete_mission)
	complete_btn.disabled = true
	_update_activity_prompt()

func _process(delta: float) -> void:
	if earth_pivot:
		earth_pivot.rotate_y(0.05 * delta)
	if satellite_pivot:
		satellite_pivot.rotate_y(0.15 * delta)

func _setup_3d_orbit() -> void:
	# Add 3D Earth
	var earth = ProceduralPlanetBuilder.build_earth(15.0)
	earth_pivot.add_child(earth)

	# Add player's custom satellite to the orbit track
	var sat = Node3D.new()
	sat.name = "InOrbitSatellite"
	sat.position = Vector3(25, 0, 0)
	sat.scale = Vector3(0.8, 0.8, 0.8)

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
			sat.add_child(p_mesh)

	satellite_pivot.add_child(sat)

func _update_activity_prompt() -> void:
	match current_activity:
		EarthActivity.IMAGE_CAPTURE:
			objective_lbl.text = "ACTIVITY 1/5: High-Resolution Optical Photography\nTargeting Amazon Rainforest & Ocean Algae Blooms."
			action_btn.text = "Capture Earth Photograph [SPACE]"
		EarthActivity.CLIMATE_MONITORING:
			objective_lbl.text = "ACTIVITY 2/5: Global Climate & Ice Shelf Monitoring\nMeasuring Arctic polar ice caps thickness and melting rates."
			action_btn.text = "Scan Polar Ice Thickness"
		EarthActivity.WEATHER_OBSERVATION:
			objective_lbl.text = "ACTIVITY 3/5: Severe Weather & Hurricane Tracking\nObserving atmospheric moisture circulation and cyclone wind speeds."
			action_btn.text = "Record Hurricane Telemetry"
		EarthActivity.ASTEROID_TRACKING:
			objective_lbl.text = "ACTIVITY 4/5: Planetary Defense - Near-Earth Asteroid Detection\nScanning orbital debris and radar echo signatures."
			action_btn.text = "Ping Radar for Near-Earth Asteroids"
		EarthActivity.DATA_TRANSMISSION:
			objective_lbl.text = "ACTIVITY 5/5: Downlink Telemetry to Ground Station\nTransmitting compiled multispectral science packages."
			action_btn.text = "Transmit High-Gain Ka-Band Science Data"

func _on_perform_action() -> void:
	AudioManager.play_sfx_discovery()

	match current_activity:
		EarthActivity.IMAGE_CAPTURE:
			points += 200
			GameManager.photos_taken_count += 1
			GameManager.record_discovery("Amazon Canopy Health Map", "Multispectral chlorophyll reflection confirmed stable carbon sink.", 200)
			discovery_log.text = "[DISCOVERY]: High-res image acquired: 2,400 km² rainforest mapped in visible & near-IR!"
			current_activity = EarthActivity.CLIMATE_MONITORING

		EarthActivity.CLIMATE_MONITORING:
			points += 250
			GameManager.record_discovery("Polar Ice Sheet Elevation Data", "Radar altimetry mapped sea ice retreat boundary with sub-meter precision.", 250)
			discovery_log.text = "[DISCOVERY]: Polar ice altimetry complete: Albedo feedback loop analyzed."
			current_activity = EarthActivity.WEATHER_OBSERVATION

		EarthActivity.WEATHER_OBSERVATION:
			points += 220
			GameManager.record_discovery("Category-4 Cyclone Barometric Core", "Barometric low pressure detected at 935 hPa; path trajectory warned coastal stations.", 220)
			discovery_log.text = "[DISCOVERY]: Cyclone eye mapped! Early warning alert broadcasted."
			current_activity = EarthActivity.ASTEROID_TRACKING

		EarthActivity.ASTEROID_TRACKING:
			points += 300
			GameManager.record_discovery("Near-Earth Asteroid 2026-XQ Tracking", "Calculated perihelion orbit at 1.4 AU. Zero collision risk to Earth.", 300)
			discovery_log.text = "[DISCOVERY]: Asteroid trajectory calculated and confirmed non-hazardous!"
			current_activity = EarthActivity.DATA_TRANSMISSION

		EarthActivity.DATA_TRANSMISSION:
			points += 350
			GameManager.record_discovery("Global Earth Science Package Downlink", "100% of telemetry successfully received by ground stations.", 350)
			discovery_log.text = "[SUCCESS]: All science downlinked! Earth Observation Mission Objectives Fully Accomplished!"
			action_btn.disabled = true
			complete_btn.disabled = false
			Progression.award_badge("earth_guardian")

	points_lbl.text = "Scientific Yield: %d Points" % points
	_update_activity_prompt()

func _on_complete_mission() -> void:
	AudioManager.play_sfx_click()
	Progression.unlock_mission(1) # Unlock Moon Mission!
	get_tree().change_scene_to_file("res://scenes/MissionResults.tscn")
