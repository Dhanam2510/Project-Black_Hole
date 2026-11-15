class_name AstronautData
extends Resource

@export var id: String = ""
@export var name: String = ""
@export var callsign: String = ""
@export var role: String = "Payload Specialist"
@export_multiline var bio: String = ""
@export_multiline var educational_tip: String = ""

# Attribute scores from 1 to 100
@export var health: int = 90
@export var scientific_knowledge: int = 85
@export var technical_skills: int = 80
@export var physical_fitness: int = 88
@export var space_experience: int = 70

@export var hiring_cost: int = 150000
@export var trained: bool = false
@export var avatar_color: Color = Color(0.2, 0.6, 0.9)
