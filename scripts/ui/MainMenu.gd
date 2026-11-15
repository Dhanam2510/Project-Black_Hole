extends Control

@onready var mission_select_btn: Button = $UI/VBox/MissionSelectBtn
@onready var badges_btn: Button = $UI/VBox/BadgesBtn
@onready var exit_btn: Button = $UI/VBox/ExitBtn
@onready var celestial_pivot: Node3D = $Environment/CelestialPivot
@onready var camera: Camera3D = $Environment/Camera3D
@onready var badges_popup: Panel = $UI/BadgesPopup
@onready var badges_list: VBoxContainer = $UI/BadgesPopup/Scroll/VBox

var rotation_speed: float = 0.2

func _ready() -> void:
	mission_select_btn.pressed.connect(_on_mission_select_pressed)
	badges_btn.pressed.connect(_on_badges_pressed)
	exit_btn.pressed.connect(_on_exit_pressed)
	$UI/BadgesPopup/CloseBtn.pressed.connect(func(): badges_popup.hide())
	
	_setup_3d_celestial_scene()
	AudioManager.play_sfx_click()

func _process(delta: float) -> void:
	if celestial_pivot:
		celestial_pivot.rotate_y(rotation_speed * delta)

func _setup_3d_celestial_scene() -> void:
	# Add 3D Earth, Moon, Mars, Sun to the background turntable
	var earth = ProceduralPlanetBuilder.build_earth(3.0)
	earth.position = Vector3(8, 0, 0)
	celestial_pivot.add_child(earth)

	var moon = ProceduralPlanetBuilder.build_moon(1.2)
	moon.position = Vector3(8, 2.5, 3)
	celestial_pivot.add_child(moon)

	var mars = ProceduralPlanetBuilder.build_mars(2.4)
	mars.position = Vector3(-8, 0, 0)
	celestial_pivot.add_child(mars)

	var sun = ProceduralPlanetBuilder.build_sun(4.5)
	sun.position = Vector3(0, -2, -15)
	celestial_pivot.add_child(sun)

func _on_mission_select_pressed() -> void:
	AudioManager.play_sfx_click()
	get_tree().change_scene_to_file("res://scenes/MissionSelect.tscn")

func _on_badges_pressed() -> void:
	AudioManager.play_sfx_click()
	_populate_badges_list()
	badges_popup.show()

func _populate_badges_list() -> void:
	for child in badges_list.get_children():
		child.queue_free()

	for badge_id in Progression.BADGES.keys():
		var info = Progression.BADGES[badge_id]
		var is_earned = Progression.earned_badges.has(badge_id)

		var card = PanelContainer.new()
		var hbox = HBoxContainer.new()
		card.add_child(hbox)

		var icon = ColorRect.new()
		icon.custom_minimum_size = Vector2(40, 40)
		icon.color = info.icon_color if is_earned else Color(0.25, 0.25, 0.28)
		hbox.add_child(icon)

		var vbox = VBoxContainer.new()
		var title_lbl = Label.new()
		title_lbl.text = info.title + (" [EARNED]" if is_earned else " [LOCKED]")
		title_lbl.add_theme_color_override("font_color", Color(1.0, 0.9, 0.2) if is_earned else Color(0.6, 0.6, 0.6))
		vbox.add_child(title_lbl)

		var desc_lbl = Label.new()
		desc_lbl.text = info.desc
		desc_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD
		vbox.add_child(desc_lbl)

		hbox.add_child(vbox)
		badges_list.add_child(card)

func _on_exit_pressed() -> void:
	AudioManager.play_sfx_click()
	get_tree().quit()
