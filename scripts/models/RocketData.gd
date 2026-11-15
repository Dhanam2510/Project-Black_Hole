class_name RocketData
extends Resource

@export var id: String = ""
@export var name: String = ""
@export_multiline var description: String = ""
@export_multiline var educational_fact: String = ""
@export var cost: int = 500000
@export var max_payload_kg: float = 1500.0
@export var thrust_kn: float = 7500.0
@export var burn_time_stage1_s: float = 12.0
@export var burn_time_stage2_s: float = 15.0
@export var stages_count: int = 2
@export var fairing_diameter_m: float = 3.5
@export var reliability_percent: float = 98.0
@export var rocket_color: Color = Color(0.9, 0.9, 0.95)
