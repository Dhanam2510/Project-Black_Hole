class_name SpacecraftPart
extends Resource

enum Category {
	CHASSIS,
	SOLAR_PANELS,
	ANTENNA,
	CAMERAS,
	INSTRUMENTS,
	BATTERIES,
	THERMAL_SHIELD,
	PROPULSION
}

@export var id: String = ""
@export var name: String = ""
@export_multiline var description: String = ""
@export_multiline var educational_fact: String = ""
@export var category: Category = Category.CHASSIS
@export var cost: int = 10000
@export var mass_kg: float = 50.0
@export var power_draw_w: float = 20.0     # Power consumed in Watts
@export var power_gen_w: float = 0.0      # Power generated in Watts (e.g. solar)
@export var thermal_rating_k: float = 400.0 # Heat tolerance in Kelvin
@export var data_rate_mbps: float = 10.0  # Bandwidth
@export var scientific_value: int = 50     # Research points
@export var tier: int = 1                  # 1=Basic, 2=Advanced, 3=Deep Space Grade
@export var socket_type: String = "general" # Socket match key

func get_net_power() -> float:
	return power_gen_w - power_draw_w
