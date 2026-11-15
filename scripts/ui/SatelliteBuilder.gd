extends Control

@onready var turntable_root: Node3D = $Cleanroom3D/TurntableRoot
@onready var camera: Camera3D = $Cleanroom3D/Camera3D

# UI References
@onready var budget_lbl: Label = $UI/TopBar/BudgetLbl
@onready var mass_lbl: Label = $UI/StatsPanel/VBox/MassLbl
@onready var power_lbl: Label = $UI/StatsPanel/VBox/PowerLbl
@onready var thermal_lbl: Label = $UI/StatsPanel/VBox/ThermalLbl
@onready var diagnostic_lbl: Label = $UI/StatsPanel/VBox/DiagnosticLbl
@onready var educational_box: Panel = $UI/EducationalTipPanel
@onready var educational_lbl: Label = $UI/EducationalTipPanel/TipLbl

@onready var category_tabs: TabBar = $UI/CustomizationDrawer/VBox/CategoryTabs
@onready var parts_container: VBoxContainer = $UI/CustomizationDrawer/VBox/Scroll/PartsContainer
@onready var proceed_btn: Button = $UI/ProceedBtn
@onready var back_btn: Button = $UI/BackBtn

# Sockets for 3D attachment
var socket_nodes: Dictionary = {}
var active_3d_parts: Dictionary = {}

# 3D Orbit Camera Drag Control
var is_dragging: bool = false
var last_mouse_pos: Vector2 = Vector2.ZERO
var cam_distance: float = 4.5

func _ready() -> void:
	_setup_cleanroom_sockets()
	_connect_ui_signals()
	_update_category_parts(0)
	_refresh_stats()
	_show_mission_start_guidance()

func _input(event: InputEvent) -> void:
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_LEFT:
			is_dragging = event.pressed
			last_mouse_pos = event.position
		elif event.button_index == MOUSE_BUTTON_WHEEL_UP:
			cam_distance = clamp(cam_distance - 0.3, 2.0, 8.0)
			_update_camera_pos()
		elif event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			cam_distance = clamp(cam_distance + 0.3, 2.0, 8.0)
			_update_camera_pos()
	elif event is InputEventMouseMotion and is_dragging:
		var delta = event.position - last_mouse_pos
		last_mouse_pos = event.position
		turntable_root.rotate_y(delta.x * 0.01)
		turntable_root.rotate_object_local(Vector3.RIGHT, delta.y * 0.005)

func _update_camera_pos() -> void:
	camera.position = Vector3(0, 0.8, cam_distance)
	camera.look_at(Vector3(0, 0, 0))

func _connect_ui_signals() -> void:
	category_tabs.tab_changed.connect(_update_category_parts)
	proceed_btn.pressed.connect(_on_proceed_pressed)
	back_btn.pressed.connect(func(): get_tree().change_scene_to_file("res://scenes/MissionSelect.tscn"))
	GameManager.budget_changed.connect(func(_new_budget): _refresh_stats())
	GameManager.parts_updated.connect(_rebuild_3d_spacecraft)

func _setup_cleanroom_sockets() -> void:
	# Define structural attach points around the 3D turntable
	var sockets_def = {
		"chassis": Vector3(0, 0, 0),
		"solar_left": Vector3(-0.6, 0, 0),
		"solar_right": Vector3(0.6, 0, 0),
		"antenna": Vector3(0, 0.8, 0),
		"camera": Vector3(0, -0.6, 0),
		"instrument": Vector3(0, 0.2, 0.6),
		"battery": Vector3(0, -0.1, -0.5),
		"thermal": Vector3(0, 0, 0.65)
	}
	for s_name in sockets_def.keys():
		var marker = Marker3D.new()
		marker.name = "Socket_" + s_name
		marker.position = sockets_def[s_name]
		turntable_root.add_child(marker)
		socket_nodes[s_name] = marker

	# Automatically pre-install standard frame if empty
	if not GameManager.installed_parts.has("chassis"):
		GameManager.install_part("chassis", GameManager.available_parts_catalog[0])

func _update_category_parts(tab_index: int) -> void:
	for child in parts_container.get_children():
		child.queue_free()

	var category_filter = tab_index # Enum corresponds directly to tab index
	for part in GameManager.available_parts_catalog:
		if part.category == category_filter:
			_create_part_card(part)

func _create_part_card(part: SpacecraftPart) -> void:
	var card = PanelContainer.new()
	var vbox = VBoxContainer.new()
	card.add_child(vbox)

	var title = Label.new()
	title.text = part.name + " (Tier %d)" % part.tier
	title.add_theme_color_override("font_color", Color(1.0, 0.85, 0.2))
	vbox.add_child(title)

	var stats_lbl = Label.new()
	var net_w = part.get_net_power()
	var power_str = "+%d W" % part.power_gen_w if part.power_gen_w > 0 else "-%d W" % part.power_draw_w
	stats_lbl.text = "Cost: $%s | Mass: %.1f kg | Power: %s | Max Heat: %.0f K" % [
		_format_currency(part.cost), part.mass_kg, power_str, part.thermal_rating_k
	]
	stats_lbl.add_theme_font_size_override("font_size", 12)
	vbox.add_child(stats_lbl)

	var desc = Label.new()
	desc.text = part.description
	desc.autowrap_mode = TextServer.AUTOWRAP_WORD
	desc.add_theme_color_override("font_color", Color(0.8, 0.8, 0.85))
	desc.add_theme_font_size_override("font_size", 11)
	vbox.add_child(desc)

	# Action Buttons (Install / Remove)
	var hbox = HBoxContainer.new()
	var install_btn = Button.new()
	
	# Determine target socket based on part category
	var target_socket = _get_socket_for_category(part.category)
	var is_installed = GameManager.installed_parts.get(target_socket) == part

	if is_installed:
		install_btn.text = "Installed [ACTIVE]"
		install_btn.disabled = true
	else:
		install_btn.text = "Install ($%s)" % _format_currency(part.cost)
		install_btn.disabled = (GameManager.current_budget < part.cost)

	install_btn.pressed.connect(func():
		AudioManager.play_sfx_snap()
		GameManager.install_part(target_socket, part)
		educational_lbl.text = "[SCIENCE INSIGHT]: " + part.educational_fact
		_update_category_parts(category_tabs.current_tab)
	)
	hbox.add_child(install_btn)

	if is_installed and target_socket != "chassis":
		var remove_btn = Button.new()
		remove_btn.text = "Remove / Sell Back"
		remove_btn.pressed.connect(func():
			AudioManager.play_sfx_remove()
			GameManager.remove_part(target_socket)
			_update_category_parts(category_tabs.current_tab)
		)
		hbox.add_child(remove_btn)

	vbox.add_child(hbox)
	parts_container.add_child(card)

func _get_socket_for_category(cat: SpacecraftPart.Category) -> String:
	match cat:
		SpacecraftPart.Category.CHASSIS: return "chassis"
		SpacecraftPart.Category.SOLAR_PANELS: return "solar_left"
		SpacecraftPart.Category.ANTENNA: return "antenna"
		SpacecraftPart.Category.CAMERAS: return "camera"
		SpacecraftPart.Category.INSTRUMENTS: return "instrument"
		SpacecraftPart.Category.BATTERIES: return "battery"
		SpacecraftPart.Category.THERMAL_SHIELD: return "thermal"
		_: return "chassis"

func _rebuild_3d_spacecraft() -> void:
	# Clear previous 3D visual instances
	for s_key in active_3d_parts.keys():
		if is_instance_valid(active_3d_parts[s_key]):
			active_3d_parts[s_key].queue_free()
	active_3d_parts.clear()

	# Re-instantiate 3D meshes based on installed parts
	for s_name in GameManager.installed_parts.keys():
		var part: SpacecraftPart = GameManager.installed_parts[s_name]
		var mesh_3d: Node3D = null

		match part.category:
			SpacecraftPart.Category.CHASSIS:
				mesh_3d = ProceduralMeshBuilder.build_satellite_chassis(part.id)
			SpacecraftPart.Category.SOLAR_PANELS:
				mesh_3d = ProceduralMeshBuilder.build_solar_panel(part.id)
			SpacecraftPart.Category.ANTENNA:
				mesh_3d = ProceduralMeshBuilder.build_antenna(part.id)
			SpacecraftPart.Category.CAMERAS:
				mesh_3d = ProceduralMeshBuilder.build_camera(part.id)
			SpacecraftPart.Category.INSTRUMENTS:
				mesh_3d = ProceduralMeshBuilder.build_instrument(part.id)
			SpacecraftPart.Category.BATTERIES:
				mesh_3d = ProceduralMeshBuilder.build_battery(part.id)
			SpacecraftPart.Category.THERMAL_SHIELD:
				mesh_3d = ProceduralMeshBuilder.build_thermal_shield(part.id)

		if mesh_3d and socket_nodes.has(s_name):
			socket_nodes[s_name].add_child(mesh_3d)
			active_3d_parts[s_name] = mesh_3d

			# If solar left is installed, auto-mirror right solar wing
			if s_name == "solar_left" and socket_nodes.has("solar_right"):
				var mirror_wing = ProceduralMeshBuilder.build_solar_panel(part.id)
				mirror_wing.rotation.y = deg_to_rad(180)
				socket_nodes["solar_right"].add_child(mirror_wing)
				active_3d_parts["solar_right"] = mirror_wing

	_refresh_stats()

func _refresh_stats() -> void:
	budget_lbl.text = "Remaining Budget: $%s" % _format_currency(GameManager.current_budget)
	
	var total_mass = GameManager.get_total_spacecraft_mass()
	var power_gen = GameManager.get_total_power_generation()
	var power_draw = GameManager.get_total_power_consumption()
	var net_power = GameManager.get_net_power()
	var thermal_k = GameManager.get_average_thermal_rating()

	mass_lbl.text = "Total Mass: %.1f kg" % total_mass
	power_lbl.text = "Power: +%.0fW / -%.0fW (Net: %+.0fW)" % [power_gen, power_draw, net_power]
	thermal_lbl.text = "Thermal Tolerance: %.0f K" % thermal_k

	# Diagnostic Check for Middle-Schoolers
	var errors = []
	if not GameManager.installed_parts.has("chassis"):
		errors.append("Missing Spacecraft Chassis!")
	if not GameManager.installed_parts.has("solar_left") and not GameManager.installed_parts.has("battery"):
		errors.append("No Power Source! Install Solar Panels or Battery.")
	elif net_power < 0:
		errors.append("Negative Net Power! Add Solar Arrays or optimize instruments.")
	if not GameManager.installed_parts.has("antenna"):
		errors.append("No Communication Antenna! Cannot transmit scientific data.")

	if GameManager.current_mission == GameManager.MissionType.SUN_OBSERVATION and thermal_k < 1500.0:
		errors.append("CRITICAL: Extreme Solar Heat! You MUST install a Reinforced Heat Shield (Tier 3).")

	if errors.is_empty():
		diagnostic_lbl.text = "SYSTEM STATUS: ALL NOMINAL! READY FOR LAUNCH."
		diagnostic_lbl.add_theme_color_override("font_color", Color(0.2, 1.0, 0.4))
		proceed_btn.disabled = false
	else:
		diagnostic_lbl.text = "PRE-FLIGHT WARNING: " + errors[0]
		diagnostic_lbl.add_theme_color_override("font_color", Color(1.0, 0.3, 0.2))
		proceed_btn.disabled = true

func _show_mission_start_guidance() -> void:
	match GameManager.current_mission:
		GameManager.MissionType.EARTH_OBSERVATION:
			educational_lbl.text = "[MISSION OBJECTIVE]: Build an Earth observation satellite with an Optical Camera, Solar Panels, and an S-Band Antenna."
		GameManager.MissionType.SUN_OBSERVATION:
			educational_lbl.text = "[MISSION OBJECTIVE]: Solar Parker-Style Probe. You must install high-temperature heat shielding and UV coronagraph."
		_:
			educational_lbl.text = "[MISSION OBJECTIVE]: Assemble a balanced spacecraft within your budget."

func _on_proceed_pressed() -> void:
	AudioManager.play_sfx_click()
	Progression.award_badge("satellite_builder")
	get_tree().change_scene_to_file("res://scenes/RocketSelector.tscn")

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
