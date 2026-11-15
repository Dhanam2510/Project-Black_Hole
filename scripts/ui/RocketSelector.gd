extends Control

@onready var rocket_preview_root: Node3D = $Preview3D/RocketTurntable
@onready var rockets_list: VBoxContainer = $UI/Drawer/Scroll/VBox
@onready var specs_title: Label = $UI/SpecsPanel/VBox/TitleLbl
@onready var specs_details: Label = $UI/SpecsPanel/VBox/DetailsLbl
@onready var compatibility_lbl: Label = $UI/SpecsPanel/VBox/CompatibilityLbl
@onready var educational_lbl: Label = $UI/EducationalTipPanel/TipLbl
@onready var launch_btn: Button = $UI/LaunchBtn
@onready var back_btn: Button = $UI/BackBtn

var current_preview_node: Node3D = null

func _ready() -> void:
	launch_btn.pressed.connect(_on_launch_pressed)
	back_btn.pressed.connect(_on_back_pressed)
	_populate_rockets_list()
	if not GameManager.available_rockets_catalog.is_empty():
		_select_rocket(GameManager.available_rockets_catalog[0])

func _process(delta: float) -> void:
	if rocket_preview_root:
		rocket_preview_root.rotate_y(0.4 * delta)

func _populate_rockets_list() -> void:
	for child in rockets_list.get_children():
		child.queue_free()

	for rocket in GameManager.available_rockets_catalog:
		var btn = Button.new()
		btn.text = "%s ($%s)" % [rocket.name, _format_currency(rocket.cost)]
		btn.pressed.connect(func(): _select_rocket(rocket))
		rockets_list.add_child(btn)

func _select_rocket(rocket: RocketData) -> void:
	AudioManager.play_sfx_click()
	GameManager.selected_rocket = rocket

	# Update 3D Preview
	if is_instance_valid(current_preview_node):
		current_preview_node.queue_free()

	var built = ProceduralMeshBuilder.build_full_rocket(rocket)
	current_preview_node = built.root
	current_preview_node.scale = Vector3(0.35, 0.35, 0.35)
	current_preview_node.position.y = -3.0
	rocket_preview_root.add_child(current_preview_node)

	# Update Specs
	specs_title.text = rocket.name
	var spacecraft_mass = GameManager.get_total_spacecraft_mass()
	specs_details.text = """Cost: $%s
Max Payload Capacity: %.0f kg
Spacecraft Payload Mass: %.1f kg
Lift Thrust: %.0f kN
Stages: %d
Reliability: %.1f%%
Fairing Diameter: %.1f m""" % [
		_format_currency(rocket.cost),
		rocket.max_payload_kg,
		spacecraft_mass,
		rocket.thrust_kn,
		rocket.stages_count,
		rocket.reliability_percent,
		rocket.fairing_diameter_m
	]

	educational_lbl.text = "[ROCKET AERODYNAMICS]: " + rocket.educational_fact

	# Compatibility & Budget Check
	var can_afford = (GameManager.current_budget >= rocket.cost)
	var mass_ok = (spacecraft_mass <= rocket.max_payload_kg)

	if not mass_ok:
		compatibility_lbl.text = "ERROR: Satellite is TOO HEAVY for this rocket! Choose a larger rocket or remove heavy parts."
		compatibility_lbl.add_theme_color_override("font_color", Color(1.0, 0.2, 0.2))
		launch_btn.disabled = true
	elif not can_afford:
		compatibility_lbl.text = "ERROR: Insufficient Budget for this rocket launch vehicle!"
		compatibility_lbl.add_theme_color_override("font_color", Color(1.0, 0.2, 0.2))
		launch_btn.disabled = true
	else:
		compatibility_lbl.text = "COMPATIBLE: Payload mass within envelope. Fuel margin nominal."
		compatibility_lbl.add_theme_color_override("font_color", Color(0.2, 1.0, 0.4))
		launch_btn.disabled = false

func _on_launch_pressed() -> void:
	AudioManager.play_sfx_click()
	# Deduct rocket cost from budget
	if GameManager.selected_rocket:
		GameManager.current_budget -= GameManager.selected_rocket.cost
		GameManager.budget_changed.emit(GameManager.current_budget)
	get_tree().change_scene_to_file("res://scenes/LaunchSimulation.tscn")

func _on_back_pressed() -> void:
	AudioManager.play_sfx_click()
	get_tree().change_scene_to_file("res://scenes/SatelliteBuilder.tscn")

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
