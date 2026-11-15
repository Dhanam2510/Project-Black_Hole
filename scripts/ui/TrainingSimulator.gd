extends Control

@onready var equip_btn: Button = $UI/Grid/EquipCard/TrainBtn
@onready var lunar_env_btn: Button = $UI/Grid/LunarCard/TrainBtn
@onready var science_btn: Button = $UI/Grid/ScienceCard/TrainBtn
@onready var prep_btn: Button = $UI/Grid/PrepCard/TrainBtn

@onready var status_lbl: Label = $UI/StatusPanel/StatusLbl
@onready var proceed_btn: Button = $UI/ProceedBtn

func _ready() -> void:
	equip_btn.pressed.connect(func(): _complete_training("equipment", equip_btn, "Spacesuit life-support oxygen check verified!"))
	lunar_env_btn.pressed.connect(func(): _complete_training("lunar_env", lunar_env_btn, "1/6th gravity movement simulator mastered!"))
	science_btn.pressed.connect(func(): _complete_training("science", science_btn, "Lunar regolith rock sampling techniques practiced!"))
	prep_btn.pressed.connect(func(): _complete_training("mission_prep", prep_btn, "Emergency abort & ascent procedures certified!"))

	proceed_btn.pressed.connect(_on_proceed_pressed)
	_update_proceed_status()

func _complete_training(key: String, btn: Button, msg: String) -> void:
	AudioManager.play_sfx_discovery()
	GameManager.astronaut_training_completed[key] = true
	btn.text = "COMPLETED [PASS]"
	btn.disabled = true
	status_lbl.text = "[TRAINING LOG]: " + msg
	_update_proceed_status()

func _update_proceed_status() -> void:
	var all_done = true
	for val in GameManager.astronaut_training_completed.values():
		if not val:
			all_done = false
			break

	if all_done:
		proceed_btn.disabled = false
		status_lbl.text = "ASTRONAUT CERTIFICATION COMPLETE! Ready for Rocket Selection."
		status_lbl.add_theme_color_override("font_color", Color(0.2, 1.0, 0.4))
	else:
		proceed_btn.disabled = true

func _on_proceed_pressed() -> void:
	AudioManager.play_sfx_click()
	get_tree().change_scene_to_file("res://scenes/RocketSelector.tscn")
