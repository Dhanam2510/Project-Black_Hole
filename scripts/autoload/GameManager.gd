extends Node

enum MissionType {
	EARTH_OBSERVATION,
	MOON_ASTRONAUT,
	MOON_ROVER,
	MARS_ROVER,
	SUN_OBSERVATION
}

# Current Active Mission State
var current_mission: MissionType = MissionType.EARTH_OBSERVATION
var current_budget: int = 2500000 # Total agency grant for mission
var initial_mission_budget: int = 2500000

# Satellite / Rover Assembly Data (Car For Sale Style)
var installed_parts: Dictionary = {} # socket_name -> SpacecraftPart
var available_parts_catalog: Array[SpacecraftPart] = []

# Selected Vehicles and Personnel
var selected_rocket: RocketData = null
var available_rockets_catalog: Array[RocketData] = []

var selected_astronaut: AstronautData = null
var available_astronauts_catalog: Array[AstronautData] = []
var astronaut_training_completed: Dictionary = {
	"equipment": false,
	"lunar_env": false,
	"science": false,
	"mission_prep": false
}

# Active In-Flight Flight Telemetry
var telemetry_altitude_km: float = 0.0
var telemetry_speed_kms: float = 0.0
var flight_accuracy_percent: float = 100.0
var launch_success: bool = false

# Research & Scientific Discoveries Recorded in Mission
var scientific_discoveries: Array[Dictionary] = []
var scientific_points_collected: int = 0
var photos_taken_count: int = 0
var samples_analyzed_count: int = 0
var dust_storms_monitored: int = 0
var solar_cme_detected: int = 0

signal budget_changed(new_budget: int)
signal parts_updated()
signal telemetry_updated(altitude: float, speed: float)
signal science_recorded(discovery_title: String, points: int)

func _ready() -> void:
	_init_catalogs()

func start_new_mission(mission: MissionType) -> void:
	current_mission = mission
	installed_parts.clear()
	selected_rocket = null
	selected_astronaut = null
	launch_success = false
	telemetry_altitude_km = 0.0
	telemetry_speed_kms = 0.0
	flight_accuracy_percent = 100.0
	scientific_discoveries.clear()
	scientific_points_collected = 0
	photos_taken_count = 0
	samples_analyzed_count = 0
	dust_storms_monitored = 0
	solar_cme_detected = 0
	
	for key in astronaut_training_completed.keys():
		astronaut_training_completed[key] = false
		
	match mission:
		MissionType.EARTH_OBSERVATION:
			initial_mission_budget = 3000000
		MissionType.MOON_ASTRONAUT:
			initial_mission_budget = 6000000
		MissionType.MOON_ROVER:
			initial_mission_budget = 4000000
		MissionType.MARS_ROVER:
			initial_mission_budget = 5500000
		MissionType.SUN_OBSERVATION:
			initial_mission_budget = 5000000
			
	current_budget = initial_mission_budget
	budget_changed.emit(current_budget)

func install_part(socket_name: String, part: SpacecraftPart) -> bool:
	if current_budget < part.cost:
		return false
	if installed_parts.has(socket_name):
		# Refund previous part
		var old_part: SpacecraftPart = installed_parts[socket_name]
		current_budget += old_part.cost
	installed_parts[socket_name] = part
	current_budget -= part.cost
	budget_changed.emit(current_budget)
	parts_updated.emit()
	return true

func remove_part(socket_name: String) -> void:
	if installed_parts.has(socket_name):
		var old_part: SpacecraftPart = installed_parts[socket_name]
		current_budget += old_part.cost
		installed_parts.erase(socket_name)
		budget_changed.emit(current_budget)
		parts_updated.emit()

func get_total_spacecraft_mass() -> float:
	var total: float = 0.0
	for part in installed_parts.values():
		total += part.mass_kg
	return total

func get_total_power_generation() -> float:
	var total: float = 0.0
	for part in installed_parts.values():
		total += part.power_gen_w
	return total

func get_total_power_consumption() -> float:
	var total: float = 0.0
	for part in installed_parts.values():
		total += part.power_draw_w
	return total

func get_net_power() -> float:
	return get_total_power_generation() - get_total_power_consumption()

func get_average_thermal_rating() -> float:
	if installed_parts.is_empty():
		return 300.0
	var min_k: float = 9999.0
	for part in installed_parts.values():
		if part.thermal_rating_k < min_k:
			min_k = part.thermal_rating_k
	return min_k

func record_discovery(title: String, description: String, points: int) -> void:
	scientific_discoveries.append({
		"title": title,
		"description": description,
		"points": points
	})
	scientific_points_collected += points
	science_recorded.emit(title, points)

func _init_catalogs() -> void:
	_init_parts_catalog()
	_init_rockets_catalog()
	_init_astronauts_catalog()

func _init_parts_catalog() -> void:
	available_parts_catalog.clear()
	
	# CHASSIS
	var ch1 = SpacecraftPart.new()
	ch1.id = "chassis_cube_std"; ch1.name = "CubeSat Standard Frame"; ch1.category = SpacecraftPart.Category.CHASSIS
	ch1.cost = 80000; ch1.mass_kg = 120.0; ch1.power_draw_w = 15.0; ch1.thermal_rating_k = 380.0; ch1.tier = 1
	ch1.description = "Compact aluminum alloy bus frame with standard 6-face mounting brackets."
	ch1.educational_fact = "CubeSats use standardized unit sizes (1U = 10x10x10 cm) to drastically reduce launch costs."
	available_parts_catalog.append(ch1)

	var ch2 = SpacecraftPart.new()
	ch2.id = "chassis_hex_adv"; ch2.name = "Hexagonal Deep Space Bus"; ch2.category = SpacecraftPart.Category.CHASSIS
	ch2.cost = 250000; ch2.mass_kg = 280.0; ch2.power_draw_w = 30.0; ch2.thermal_rating_k = 650.0; ch2.tier = 2
	ch2.description = "Reinforced carbon-fiber composite body with integrated radiation shielding and internal avionics bay."
	ch2.educational_fact = "Hexagonal geometry distributes mechanical stress evenly during severe rocket launch vibrations."
	available_parts_catalog.append(ch2)

	# SOLAR PANELS
	var sp1 = SpacecraftPart.new()
	sp1.id = "solar_silicon_fixed"; sp1.name = "Silicon Fixed Solar Array"; sp1.category = SpacecraftPart.Category.SOLAR_PANELS
	sp1.cost = 120000; sp1.mass_kg = 45.0; sp1.power_draw_w = 0.0; sp1.power_gen_w = 220.0; sp1.thermal_rating_k = 420.0; sp1.tier = 1
	sp1.description = "Fixed dual-wing crystalline silicon photovoltaic array."
	sp1.educational_fact = "Photovoltaic cells convert sunlight into electricity via the photoelectric effect, discovered by Albert Einstein."
	available_parts_catalog.append(sp1)

	var sp2 = SpacecraftPart.new()
	sp2.id = "solar_gaas_tracking"; sp2.name = "Gallium-Arsenide Sun-Tracking Array"; sp2.category = SpacecraftPart.Category.SOLAR_PANELS
	sp2.cost = 320000; sp2.mass_kg = 75.0; sp2.power_draw_w = 10.0; sp2.power_gen_w = 550.0; sp2.thermal_rating_k = 750.0; sp2.tier = 2
	sp2.description = "High-efficiency multi-junction GaAs solar wings equipped with continuous motorized solar tracking."
	sp2.educational_fact = "Sun-tracking arrays rotate continuously in orbit to maintain a perpendicular 90° angle to incident sunlight."
	available_parts_catalog.append(sp2)

	# ANTENNAS
	var ant1 = SpacecraftPart.new()
	ant1.id = "antenna_omni_sband"; ant1.name = "Omnidirectional S-Band Whip"; ant1.category = SpacecraftPart.Category.ANTENNA
	ant1.cost = 60000; ant1.mass_kg = 15.0; ant1.power_draw_w = 25.0; ant1.data_rate_mbps = 5.0; ant1.thermal_rating_k = 400.0; ant1.tier = 1
	ant1.description = "Reliable omnidirectional radio antenna requiring no accurate pointing toward Earth."
	ant1.educational_fact = "Radio waves travel across space at the exact speed of light: approximately 300,000 kilometers per second."
	available_parts_catalog.append(ant1)

	var ant2 = SpacecraftPart.new()
	ant2.id = "antenna_parabolic_ka"; ant2.name = "High-Gain Ka-Band Parabolic Dish"; ant2.category = SpacecraftPart.Category.ANTENNA
	ant2.cost = 180000; ant2.mass_kg = 40.0; ant2.power_draw_w = 60.0; ant2.data_rate_mbps = 120.0; ant2.thermal_rating_k = 600.0; ant2.tier = 2
	ant2.description = "Steerable parabolic reflector for ultra-high-definition scientific telemetry and live image transmission."
	ant2.educational_fact = "Parabolic dishes focus weak radio signals onto a central receiver feedhorn, similar to how eye lenses focus light."
	available_parts_catalog.append(ant2)

	# CAMERAS & SCIENTIFIC INSTRUMENTS
	var cam1 = SpacecraftPart.new()
	cam1.id = "cam_multispectral_earth"; cam1.name = "Multispectral Climate Imager"; cam1.category = SpacecraftPart.Category.CAMERAS
	cam1.cost = 220000; cam1.mass_kg = 35.0; cam1.power_draw_w = 50.0; cam1.scientific_value = 150; cam1.thermal_rating_k = 380.0; cam1.tier = 1
	cam1.description = "Visible and Near-Infrared optical sensor calibrated for ocean chlorophyll, forestry, and weather cloud tracking."
	cam1.educational_fact = "Plants reflect near-infrared light strongly. Satellites use this to measure the health of global rainforests and crops."
	available_parts_catalog.append(cam1)

	var cam2 = SpacecraftPart.new()
	cam2.id = "cam_solar_coronagraph"; cam2.name = "Extreme-UV Solar Coronagraph"; cam2.category = SpacecraftPart.Category.CAMERAS
	cam2.cost = 450000; cam2.mass_kg = 65.0; cam2.power_draw_w = 85.0; cam2.scientific_value = 300; cam2.thermal_rating_k = 1800.0; cam2.tier = 3
	cam2.description = "Telescope with an occulting disk that blocks the blinding Sun disk to photograph solar prominences and flares."
	cam2.educational_fact = "A coronagraph simulates a total solar eclipse in space, enabling scientists to observe the million-degree corona."
	available_parts_catalog.append(cam2)

	var inst1 = SpacecraftPart.new()
	inst1.id = "inst_radar_altimeter"; inst1.name = "Synthetic Aperture Radar (SAR)"; inst1.category = SpacecraftPart.Category.INSTRUMENTS
	inst1.cost = 310000; inst1.mass_kg = 55.0; inst1.power_draw_w = 110.0; inst1.scientific_value = 220; inst1.thermal_rating_k = 420.0; inst1.tier = 2
	inst1.description = "Microwave radar capable of penetrating thick cloud cover and hurricane storms to map planetary topography."
	inst1.educational_fact = "Radar bounces microwave pulses off the ground and measures return echo time down to single nanoseconds."
	available_parts_catalog.append(inst1)

	var inst2 = SpacecraftPart.new()
	inst2.id = "inst_uv_radiation_meter"; inst2.name = "Cosmic Radiation Flux Detector"; inst2.category = SpacecraftPart.Category.INSTRUMENTS
	inst2.cost = 280000; inst2.mass_kg = 30.0; inst2.power_draw_w = 40.0; inst2.scientific_value = 260; inst2.thermal_rating_k = 1600.0; inst2.tier = 2
	inst2.description = "Silicon diode particle detector counting energetic solar protons, cosmic rays, and UV radiation surges."
	inst2.educational_fact = "Solar storms can disrupt satellites, power grids on Earth, and present deadly radiation hazards to astronauts."
	available_parts_catalog.append(inst2)

	# BATTERIES & POWER STORAGE
	var bat1 = SpacecraftPart.new()
	bat1.id = "battery_li_ion_std"; bat1.name = "Lithium-Ion Space Battery (15 kWh)"; bat1.category = SpacecraftPart.Category.BATTERIES
	bat1.cost = 90000; bat1.mass_kg = 50.0; bat1.power_draw_w = 0.0; bat1.power_gen_w = 0.0; bat1.thermal_rating_k = 340.0; bat1.tier = 1
	bat1.description = "Hermetically sealed battery bank supplying power during orbital night eclipse periods."
	bat1.educational_fact = "In low Earth orbit, satellites spend roughly 35 minutes of every 90-minute orbit inside Earth's cold shadow."
	available_parts_catalog.append(bat1)

	var bat2 = SpacecraftPart.new()
	bat2.id = "battery_rtg_nuclear"; bat2.name = "Radioisotope Thermoelectric Generator (RTG)"; bat2.category = SpacecraftPart.Category.BATTERIES
	bat2.cost = 550000; bat2.mass_kg = 90.0; bat2.power_draw_w = 0.0; bat2.power_gen_w = 350.0; bat2.thermal_rating_k = 900.0; bat2.tier = 3
	bat2.description = "Nuclear power supply converting heat from plutonium-238 natural radioactive decay directly into electricity."
	bat2.educational_fact = "RTGs power deep space rovers like Curiosity and Perseverance, allowing operation through dark Martian winters."
	available_parts_catalog.append(bat2)

	# THERMAL PROTECTION
	var th1 = SpacecraftPart.new()
	th1.id = "thermal_mli_gold_blanket"; th1.name = "Multi-Layer Insulation (MLI) Gold Blanket"; th1.category = SpacecraftPart.Category.THERMAL_SHIELD
	th1.cost = 70000; th1.mass_kg = 20.0; th1.power_draw_w = 0.0; th1.thermal_rating_k = 550.0; th1.tier = 1
	th1.description = "Reflective aluminized Mylar sheets that reject radiant solar heat while insulating sensitive internal instruments."
	th1.educational_fact = "There is no air in space to conduct heat. All heat transfer occurs strictly via electromagnetic radiation."
	available_parts_catalog.append(th1)

	var th2 = SpacecraftPart.new()
	th2.id = "thermal_carbon_reinforced"; th2.name = "Reinforced Carbon-Carbon Solar Heat Shield"; th2.category = SpacecraftPart.Category.THERMAL_SHIELD
	th2.cost = 480000; th2.mass_kg = 110.0; th2.power_draw_w = 0.0; th2.thermal_rating_k = 2400.0; th2.tier = 3
	th2.description = "Advanced 11.5 cm thick carbon-composite foam shield designed to withstand blistering 1,400°C temperatures near the Sun."
	th2.educational_fact = "Modeled after NASA's Parker Solar Probe shield, which stays white-hot on the front while instruments behind it stay at 30°C."
	available_parts_catalog.append(th2)

func _init_rockets_catalog() -> void:
	available_rockets_catalog.clear()

	var r1 = RocketData.new()
	r1.id = "rocket_vega_light"
	r1.name = "Aeros-1 Light Launcher"
	r1.cost = 650000
	r1.max_payload_kg = 500.0
	r1.thrust_kn = 2200.0
	r1.stages_count = 2
	r1.fairing_diameter_m = 2.2
	r1.reliability_percent = 96.0
	r1.rocket_color = Color(0.85, 0.85, 0.9)
	r1.description = "Affordable two-stage small satellite rocket optimized for low Earth orbit payloads."
	r1.educational_fact = "Small launchers use solid rocket fuel for stage 1 because it can be stored ready to launch for months."
	available_rockets_catalog.append(r1)

	var r2 = RocketData.new()
	r2.id = "rocket_falcon_medium"
	r2.name = "Pegasus-9 Workhorse"
	r2.cost = 1400000
	r2.max_payload_kg = 1800.0
	r2.thrust_kn = 7600.0
	r2.stages_count = 2
	r2.fairing_diameter_m = 3.8
	r2.reliability_percent = 99.2
	r2.rocket_color = Color(0.95, 0.95, 1.0)
	r2.description = "Medium-lift cryogenic rocket capable of high Earth orbit, Lunar transfer, and interplanetary probes."
	r2.educational_fact = "Cryogenic engines burn liquid oxygen and liquid hydrogen at -250°C, producing clean water vapor exhaust."
	available_rockets_catalog.append(r2)

	var r3 = RocketData.new()
	r3.id = "rocket_saturn_heavy"
	r3.name = "Titan-V Heavy Lifter"
	r3.cost = 2800000
	r3.max_payload_kg = 5500.0
	r3.thrust_kn = 19500.0
	r3.stages_count = 3
	r3.fairing_diameter_m = 5.5
	r3.reliability_percent = 98.8
	r3.rocket_color = Color(1.0, 0.65, 0.1) # Orange external tank aesthetic
	r3.description = "Super-heavy triple-stage launch vehicle built for manned lunar landers and massive Mars rovers."
	r3.educational_fact = "To escape Earth's gravity entirely and reach Mars, a rocket must accelerate past escape velocity: 11.2 km/s (40,320 km/h)."
	available_rockets_catalog.append(r3)

func _init_astronauts_catalog() -> void:
	available_astronauts_catalog.clear()

	var a1 = AstronautData.new()
	a1.id = "astro_elena"
	a1.name = "Dr. Elena Vance"
	a1.callsign = "Nova"
	a1.role = "Chief Planetary Geologist"
	a1.health = 92; a1.scientific_knowledge = 98; a1.technical_skills = 82; a1.physical_fitness = 85; a1.space_experience = 75
	a1.hiring_cost = 250000
	a1.avatar_color = Color(0.3, 0.7, 0.9)
	a1.bio = "Ph.D. in Lunar Mineralogy with 420 hours of simulated lunar habitat research."
	a1.educational_tip = "Elena's high scientific knowledge yields 25% bonus research points when analyzing lunar basalt samples."
	available_astronauts_catalog.append(a1)

	var a2 = AstronautData.new()
	a2.id = "astro_marcus"
	a2.name = "Commander Marcus Cole"
	a2.callsign = "Vanguard"
	a2.role = "Flight Systems & EVA Specialist"
	a2.health = 96; a2.scientific_knowledge = 78; a2.technical_skills = 95; a2.physical_fitness = 94; a2.space_experience = 90
	a2.hiring_cost = 320000
	a2.avatar_color = Color(0.9, 0.4, 0.2)
	a2.bio = "Former test pilot and veteran astronaut with two space station expeditions and 6 spacewalks."
	a2.educational_tip = "Marcus provides superior flight stability during rocket manual staging and lunar descent burns."
	available_astronauts_catalog.append(a2)

	var a3 = AstronautData.new()
	a3.id = "astro_ananya"
	a3.name = "Eng. Ananya Sharma"
	a3.callsign = "Apex"
	a3.role = "Robotics & Life Support Engineer"
	a3.health = 89; a3.scientific_knowledge = 88; a3.technical_skills = 92; a3.physical_fitness = 84; a3.space_experience = 65
	a3.hiring_cost = 210000
	a3.avatar_color = Color(0.4, 0.85, 0.4)
	a3.bio = "Space systems engineer specializing in autonomous surface drilling rigs and oxygen extraction equipment."
	a3.educational_tip = "Ananya reduces power drain of deployed scientific stations by 30% through electrical optimization."
	available_astronauts_catalog.append(a3)
