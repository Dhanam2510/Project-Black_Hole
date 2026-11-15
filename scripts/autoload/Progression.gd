extends Node

const SAVE_PATH: String = "user://cosmic_horizons_save.json"

var unlocked_missions: Array[int] = [0] # 0 = Earth Observation unlocked by default
var earned_badges: Dictionary = {}
var mission_high_scores: Dictionary = {}
var total_player_score: int = 0

# Educational Badges Catalog
const BADGES = {
	"satellite_builder": {
		"title": "Satellite Architect",
		"desc": "Built a perfectly balanced scientific satellite within budget limits.",
		"icon_color": Color(0.2, 0.7, 1.0)
	},
	"orbital_insertion": {
		"title": "Orbital Pioneer",
		"desc": "Executed flawless rocket staging and achieved circular orbit.",
		"icon_color": Color(0.4, 1.0, 0.4)
	},
	"earth_guardian": {
		"title": "Guardian of Earth",
		"desc": "Tracked global climate patterns, storm systems, and asteroids from orbit.",
		"icon_color": Color(0.3, 0.8, 0.9)
	},
	"lunar_walker": {
		"title": "One Giant Leap",
		"desc": "Completed astronaut lunar EVA and extracted pristine regolith core samples.",
		"icon_color": Color(0.9, 0.9, 0.9)
	},
	"lunar_trailblazer": {
		"title": "Lunar Trailblazer",
		"desc": "Navigated a robotic rover across hazardous crater ridges on the Moon.",
		"icon_color": Color(0.8, 0.85, 0.6)
	},
	"martian_geologist": {
		"title": "Red Planet Pioneer",
		"desc": "Drilled Martian bedrock and confirmed subsurface water-ice signatures.",
		"icon_color": Color(1.0, 0.4, 0.2)
	},
	"dust_survivor": {
		"title": "Martian Storm Chaser",
		"desc": "Successfully preserved rover battery systems through a blinding dust storm.",
		"icon_color": Color(0.95, 0.6, 0.1)
	},
	"solar_sentinel": {
		"title": "Touch the Sun",
		"desc": "Maintained heat shield alignment within 5 million km of the Sun's corona.",
		"icon_color": Color(1.0, 0.9, 0.2)
	},
	"budget_master": {
		"title": "Fiscal Genius",
		"desc": "Completed a deep space mission with more than 20% budget remaining.",
		"icon_color": Color(0.7, 0.3, 1.0)
	}
}

signal badge_unlocked(badge_id: String, badge_info: Dictionary)
signal mission_unlocked(mission_index: int)

func _ready() -> void:
	load_progress()

func unlock_mission(mission_index: int) -> void:
	if not unlocked_missions.has(mission_index):
		unlocked_missions.append(mission_index)
		mission_unlocked.emit(mission_index)
		save_progress()

func is_mission_unlocked(mission_index: int) -> bool:
	return unlocked_missions.has(mission_index)

func award_badge(badge_id: String) -> void:
	if not earned_badges.has(badge_id) and BADGES.has(badge_id):
		earned_badges[badge_id] = {
			"timestamp": Time.get_datetime_string_from_system()
		}
		badge_unlocked.emit(badge_id, BADGES[badge_id])
		save_progress()

func calculate_mission_score(mission_type: int, success: bool, science_pts: int, budget_left: int, budget_total: int, flight_accuracy: float) -> Dictionary:
	var success_score = 4000 if success else 1000
	var science_score = science_pts * 10
	var budget_ratio = clamp(float(budget_left) / float(max(budget_total, 1)), 0.0, 1.0)
	var budget_score = int(budget_ratio * 2500)
	var accuracy_score = int((flight_accuracy / 100.0) * 1500)
	
	var final_total = success_score + science_score + budget_score + accuracy_score
	
	if budget_ratio >= 0.20 and success:
		award_badge("budget_master")
	if flight_accuracy >= 90.0 and success:
		award_badge("orbital_insertion")
		
	var key = str(mission_type)
	if not mission_high_scores.has(key) or final_total > mission_high_scores[key]:
		mission_high_scores[key] = final_total
		
	total_player_score += final_total
	save_progress()
	
	return {
		"total": final_total,
		"success_score": success_score,
		"science_score": science_score,
		"budget_score": budget_score,
		"accuracy_score": accuracy_score,
		"budget_ratio_percent": int(budget_ratio * 100.0)
	}

func save_progress() -> void:
	var data = {
		"unlocked_missions": unlocked_missions,
		"earned_badges": earned_badges,
		"mission_high_scores": mission_high_scores,
		"total_player_score": total_player_score
	}
	var file = FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if file:
		file.store_string(JSON.stringify(data, "\t"))
		file.close()

func load_progress() -> void:
	if not FileAccess.file_exists(SAVE_PATH):
		return
	var file = FileAccess.open(SAVE_PATH, FileAccess.READ)
	if file:
		var content = file.get_as_text()
		file.close()
		var json = JSON.new()
		if json.parse(content) == OK:
			var data = json.data
			if data is Dictionary:
				unlocked_missions.clear()
				for m in data.get("unlocked_missions", [0]):
					unlocked_missions.append(int(m))
				earned_badges = data.get("earned_badges", {})
				mission_high_scores = data.get("mission_high_scores", {})
				total_player_score = data.get("total_player_score", 0)
