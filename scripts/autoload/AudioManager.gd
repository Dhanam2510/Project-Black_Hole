extends Node

# Audio players
var music_player: AudioStreamPlayer
var sfx_player: AudioStreamPlayer
var thruster_player: AudioStreamPlayer

# Procedural Sound Generators
var thruster_generator: AudioStreamGeneratorPlayback
var sample_rate: float = 22050.0

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	_setup_audio_players()

func _setup_audio_players() -> void:
	music_player = AudioStreamPlayer.new()
	music_player.bus = "Master"
	music_player.volume_db = -10.0
	add_child(music_player)

	sfx_player = AudioStreamPlayer.new()
	sfx_player.bus = "Master"
	sfx_player.volume_db = -4.0
	add_child(sfx_player)

	# Procedural Thruster Sound Stream
	thruster_player = AudioStreamPlayer.new()
	var generator = AudioStreamGenerator.new()
	generator.mix_rate = sample_rate
	generator.buffer_length = 0.1
	thruster_player.stream = generator
	thruster_player.volume_db = -6.0
	add_child(thruster_player)
	thruster_player.play()
	thruster_generator = thruster_player.get_stream_playback()

func _process(_delta: float) -> void:
	_fill_thruster_buffer()

var _thruster_intensity: float = 0.0
var _noise_seed: float = 0.0

func set_thruster_power(power_normalized: float) -> void:
	_thruster_intensity = clamp(power_normalized, 0.0, 1.0)
	thruster_player.volume_db = linear_to_db(max(_thruster_intensity * 0.8, 0.0001))

func _fill_thruster_buffer() -> void:
	if not thruster_generator or _thruster_intensity <= 0.01:
		return
	var frames_available = thruster_generator.get_frames_available()
	while frames_available > 0:
		_noise_seed += 0.1
		var white_noise = randf_range(-1.0, 1.0)
		var rumble = sin(_noise_seed * 40.0) * 0.4 + white_noise * 0.6
		var sample = Vector2(rumble, rumble) * _thruster_intensity
		thruster_generator.push_frame(sample)
		frames_available -= 1

# Synthesized SFX using AudioStreamWAV buffers
func play_sfx_click() -> void:
	_play_synthetic_beep(880.0, 0.05, 0.3)

func play_sfx_snap() -> void:
	_play_synthetic_beep(520.0, 0.12, 0.5)

func play_sfx_remove() -> void:
	_play_synthetic_beep(330.0, 0.08, 0.4)

func play_sfx_stage_separate() -> void:
	_play_synthetic_explosion(0.4, 0.7)

func play_sfx_discovery() -> void:
	_play_synthetic_chime()

func play_sfx_alarm() -> void:
	_play_synthetic_beep(440.0, 0.25, 0.6)

func _play_synthetic_beep(freq: float, duration: float, vol: float) -> void:
	var wav = AudioStreamWAV.new()
	wav.format = AudioStreamWAV.FORMAT_8_BITS
	wav.mix_rate = int(sample_rate)
	var samples_count = int(sample_rate * duration)
	var bytes = PackedByteArray()
	bytes.resize(samples_count)
	for i in range(samples_count):
		var t = float(i) / sample_rate
		var envelope = 1.0 - (float(i) / float(samples_count)) # Decay
		var val = sin(t * freq * TAU) * envelope * vol
		var byte_val = int(clamp((val + 1.0) * 0.5 * 255.0, 0, 255))
		bytes.set(i, byte_val)
	wav.data = bytes
	var player = AudioStreamPlayer.new()
	player.stream = wav
	player.bus = "Master"
	add_child(player)
	player.play()
	player.finished.connect(player.queue_free)

func _play_synthetic_explosion(duration: float, vol: float) -> void:
	var wav = AudioStreamWAV.new()
	wav.format = AudioStreamWAV.FORMAT_8_BITS
	wav.mix_rate = int(sample_rate)
	var samples_count = int(sample_rate * duration)
	var bytes = PackedByteArray()
	bytes.resize(samples_count)
	for i in range(samples_count):
		var envelope = pow(1.0 - (float(i) / float(samples_count)), 2.0)
		var noise = randf_range(-1.0, 1.0) * envelope * vol
		var byte_val = int(clamp((noise + 1.0) * 0.5 * 255.0, 0, 255))
		bytes.set(i, byte_val)
	wav.data = bytes
	var player = AudioStreamPlayer.new()
	player.stream = wav
	player.bus = "Master"
	add_child(player)
	player.play()
	player.finished.connect(player.queue_free)

func _play_synthetic_chime() -> void:
	# 3-tone ascending arpeggio: C5 (523Hz), E5 (659Hz), G5 (784Hz)
	var wav = AudioStreamWAV.new()
	wav.format = AudioStreamWAV.FORMAT_8_BITS
	wav.mix_rate = int(sample_rate)
	var duration = 0.45
	var samples_count = int(sample_rate * duration)
	var bytes = PackedByteArray()
	bytes.resize(samples_count)
	var freqs = [523.25, 659.25, 783.99]
	for i in range(samples_count):
		var t = float(i) / sample_rate
		var note_idx = int(clamp(floor(t / 0.15), 0, 2))
		var f = freqs[note_idx]
		var sub_t = fmod(t, 0.15)
		var env = 1.0 - (sub_t / 0.15)
		var val = sin(t * f * TAU) * env * 0.5
		var byte_val = int(clamp((val + 1.0) * 0.5 * 255.0, 0, 255))
		bytes.set(i, byte_val)
	wav.data = bytes
	var player = AudioStreamPlayer.new()
	player.stream = wav
	player.bus = "Master"
	add_child(player)
	player.play()
	player.finished.connect(player.queue_free)
