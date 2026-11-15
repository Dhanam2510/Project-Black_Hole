extends Control

@onready var mission_title: Label = $UI/Panel/VBox/TitleLbl
@onready var score_total_lbl: Label = $UI/Panel/VBox/TotalScoreLbl
@onready var breakdown_lbl: Label = $UI/Panel/VBox/BreakdownLbl
@onready var discoveries_list: VBoxContainer = $UI/Panel/VBox/Scroll/DiscoveriesVBox
@onready var continue_btn: Button = $UI/Panel/VBox/HBoxButtons/ContinueBtn
@onready var retry_btn: Button = $UI/Panel/VBox/HBoxButtons/RetryBtn

func _ready() -> void:
	continue_btn.pressed.connect(_on_continue_pressed)
	retry_btn.pressed.connect(_on_retry_pressed)
	_display_results()
	AudioManager.play_sfx_discovery()

func _display_results() -> void:
	var m_name = ""
	match GameManager.current_mission:
		GameManager.MissionType.EARTH_OBSERVATION: m_name = "Earth Observation & Climate Mission"
		GameManager.MissionType.MOON_ASTRONAUT: m_name = "Moon Surface Exploration (Astronaut EVA)"
		GameManager.MissionType.MOON_ROVER: m_name = "Moon Surface Exploration (Robotic Rover)"
		GameManager.MissionType.MARS_ROVER: m_name = "Mars Jezero Crater Robotic Science Mission"
		GameManager.MissionType.SUN_OBSERVATION: m_name = "Sun Extreme Solar Corona Observation Mission"

	mission_title.text = "MISSION ACCOMPLISHED: " + m_name

	var score_data = Progression.calculate_mission_score(
		GameManager.current_mission,
		GameManager.launch_success,
		GameManager.scientific_points_collected,
		GameManager.current_budget,
		GameManager.initial_mission_budget,
		GameManager.flight_accuracy_percent
	)

	score_total_lbl.text = "TOTAL MISSION SCORE: %d POINTS" % score_data.total
	breakdown_lbl.text = """[SCORING BREAKDOWN]
• Mission Success Base Award: +%d pts
• Scientific Data Yield (%d pts): +%d pts
• Budget Efficiency (Saved %d%% of Funds): +%d pts
• Rocket Ascent & Staging Accuracy (%.1f%%): +%d pts
• Remaining Budget Available: $%s""" % [
		score_data.success_score,
		GameManager.scientific_points_collected,
		score_data.science_score,
		score_data.budget_ratio_percent,
		score_data.budget_score,
		GameManager.flight_accuracy_percent,
		score_data.accuracy_score,
		_format_currency(GameManager.current_budget)
	]

	# Populate Discoveries
	for child in discoveries_list.get_children():
		child.queue_free()

	for disc in GameManager.scientific_discoveries:
		var card = PanelContainer.new()
		var vbox = VBoxContainer.new()
		card.add_child(vbox)

		var t_lbl = Label.new()
		t_lbl.text = "★ " + disc.title + " (+%d pts)" % disc.points
		t_lbl.add_theme_color_override("font_color", Color(0.3, 0.9, 1.0))
		vbox.add_child(t_lbl)

		var d_lbl = Label.new()
		d_lbl.text = disc.description
		d_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD
		d_lbl.add_theme_font_size_override("font_size", 11)
		vbox.add_child(d_lbl)

		discoveries_list.add_child(card)

func _on_continue_pressed() -> void:
	AudioManager.play_sfx_click()
	get_tree().change_scene_to_file("res://scenes/MissionSelect.tscn")

func _on_retry_pressed() -> void:
	AudioManager.play_sfx_click()
	GameManager.start_new_mission(GameManager.current_mission)
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
