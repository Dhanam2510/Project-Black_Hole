extends Control

@onready var astro_preview_root: Node3D = $Preview3D/AstronautTurntable
@onready var astronaut_list: VBoxContainer = $UI/Drawer/Scroll/VBox
@onready var name_lbl: Label = $UI/StatsPanel/VBox/NameLbl
@onready var role_lbl: Label = $UI/StatsPanel/VBox/RoleLbl
@onready var stats_lbl: Label = $UI/StatsPanel/VBox/StatsLbl
@onready var bio_lbl: Label = $UI/StatsPanel/VBox/BioLbl
@onready var tip_lbl: Label = $UI/EducationalTipPanel/TipLbl
@onready var hire_btn: Button = $UI/HireBtn
@onready var back_btn: Button = $UI/BackBtn

func _ready() -> void:
	hire_btn.pressed.connect(_on_hire_pressed)
	back_btn.pressed.connect(func(): get_tree().change_scene_to_file("res://scenes/MissionSelect.tscn"))
	_setup_3d_preview()
	_populate_astronaut_list()
	if not GameManager.available_astronauts_catalog.is_empty():
		_select_astronaut(GameManager.available_astronauts_catalog[0])

func _process(delta: float) -> void:
	if astro_preview_root:
		astro_preview_root.rotate_y(0.3 * delta)

func _setup_3d_preview() -> void:
	var astro_mesh = ProceduralMeshBuilder.build_astronaut()
	astro_mesh.position.y = -1.0
	astro_preview_root.add_child(astro_mesh)

func _populate_astronaut_list() -> void:
	for child in astronaut_list.get_children():
		child.queue_free()

	for astro in GameManager.available_astronauts_catalog:
		var btn = Button.new()
		btn.text = "%s - %s ($%s)" % [astro.name, astro.role, _format_currency(astro.hiring_cost)]
		btn.pressed.connect(func(): _select_astronaut(astro))
		astronaut_list.add_child(btn)

func _select_astronaut(astro: AstronautData) -> void:
	AudioManager.play_sfx_click()
	GameManager.selected_astronaut = astro

	name_lbl.text = "%s (\"%s\")" % [astro.name, astro.callsign]
	role_lbl.text = "Specialty: " + astro.role

	stats_lbl.text = """Health: %d/100
Scientific Knowledge: %d/100
Technical Skills: %d/100
Physical Fitness: %d/100
Space Experience: %d/100
Hiring Cost: $%s""" % [
		astro.health, astro.scientific_knowledge, astro.technical_skills,
		astro.physical_fitness, astro.space_experience, _format_currency(astro.hiring_cost)
	]

	bio_lbl.text = astro.bio
	tip_lbl.text = "[ASTRONAUT PROFILE]: " + astro.educational_tip

	hire_btn.disabled = (GameManager.current_budget < astro.hiring_cost)
	hire_btn.text = "Select & Begin Astronaut Training ($%s)" % _format_currency(astro.hiring_cost)

func _on_hire_pressed() -> void:
	AudioManager.play_sfx_click()
	if GameManager.selected_astronaut:
		GameManager.current_budget -= GameManager.selected_astronaut.hiring_cost
		GameManager.budget_changed.emit(GameManager.current_budget)
	get_tree().change_scene_to_file("res://scenes/AstronautTraining.tscn")

func _format_currency(amount: int) -> String:
	var s = str(amount)
	var result = ""
	var count = 0
	for i in range(s.length() - 1, -1, -1):
		result = s[i] + result
		count += 1
		if count % 3 == 0 and i > 0:
			result = "," + result
	return result
