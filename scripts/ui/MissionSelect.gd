extends Control

@onready var earth_btn: Button = $UI/Grid/EarthCard/SelectBtn
@onready var moon_btn: Button = $UI/Grid/MoonCard/SelectBtn
@onready var mars_btn: Button = $UI/Grid/MarsCard/SelectBtn
@onready var sun_btn: Button = $UI/Grid/SunCard/SelectBtn
@onready var back_btn: Button = $UI/BackBtn

@onready var moon_mode_popup: Panel = $UI/MoonModePopup
@onready var moon_mode_astro_btn: Button = $UI/MoonModePopup/VBox/AstronautModeBtn
@onready var moon_mode_rover_btn: Button = $UI/MoonModePopup/VBox/RoverModeBtn
@onready var moon_mode_cancel_btn: Button = $UI/MoonModePopup/VBox/CancelBtn

func _ready() -> void:
	earth_btn.pressed.connect(_on_earth_selected)
	moon_btn.pressed.connect(_on_moon_selected)
	mars_btn.pressed.connect(_on_mars_selected)
	sun_btn.pressed.connect(_on_sun_selected)
	back_btn.pressed.connect(_on_back_pressed)

	moon_mode_astro_btn.pressed.connect(_on_moon_astronaut_selected)
	moon_mode_rover_btn.pressed.connect(_on_moon_rover_selected)
	moon_mode_cancel_btn.pressed.connect(func(): moon_mode_popup.hide())

	_update_mission_unlock_visuals()

func _update_mission_unlock_visuals() -> void:
	moon_btn.disabled = not Progression.is_mission_unlocked(1)
	mars_btn.disabled = not Progression.is_mission_unlocked(2)
	sun_btn.disabled = not Progression.is_mission_unlocked(3)

	if moon_btn.disabled:
		moon_btn.text = "LOCKED (Complete Earth First)"
	if mars_btn.disabled:
		mars_btn.text = "LOCKED (Complete Moon First)"
	if sun_btn.disabled:
		sun_btn.text = "LOCKED (Complete Mars First)"

func _on_earth_selected() -> void:
	AudioManager.play_sfx_click()
	GameManager.start_new_mission(GameManager.MissionType.EARTH_OBSERVATION)
	get_tree().change_scene_to_file("res://scenes/SatelliteBuilder.tscn")

func _on_moon_selected() -> void:
	AudioManager.play_sfx_click()
	moon_mode_popup.show()

func _on_moon_astronaut_selected() -> void:
	AudioManager.play_sfx_click()
	moon_mode_popup.hide()
	GameManager.start_new_mission(GameManager.MissionType.MOON_ASTRONAUT)
	get_tree().change_scene_to_file("res://scenes/AstronautSelector.tscn")

func _on_moon_rover_selected() -> void:
	AudioManager.play_sfx_click()
	moon_mode_popup.hide()
	GameManager.start_new_mission(GameManager.MissionType.MOON_ROVER)
	get_tree().change_scene_to_file("res://scenes/SatelliteBuilder.tscn")

func _on_mars_selected() -> void:
	AudioManager.play_sfx_click()
	GameManager.start_new_mission(GameManager.MissionType.MARS_ROVER)
	get_tree().change_scene_to_file("res://scenes/SatelliteBuilder.tscn")

func _on_sun_selected() -> void:
	AudioManager.play_sfx_click()
	GameManager.start_new_mission(GameManager.MissionType.SUN_OBSERVATION)
	get_tree().change_scene_to_file("res://scenes/SatelliteBuilder.tscn")

func _on_back_pressed() -> void:
	AudioManager.play_sfx_click()
	get_tree().change_scene_to_file("res://scenes/MainMenu.tscn")
