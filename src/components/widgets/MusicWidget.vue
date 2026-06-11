<script lang="ts">
let desktopInteractionSeen = false;
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import WidgetCard from "./WidgetCard.vue";
import ThemedIcon from "../shared/ThemedIcon.vue";
import { musicTracks } from "../../data/MusicTracks";
import backPageIcon from "../../assets/window-icons/last-page-icon.svg?raw";
import forwardPageIcon from "../../assets/window-icons/next-page-icon.svg?raw";

const props = withDefaults(defineProps<{
	surface?: "desktop" | "mobile";
}>(), {
	surface: "desktop",
});

const currentTrackIndex = ref(0);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const isSeeking = ref(false);
const volumeLevel = ref(0.2);
const isQueueVisible = ref(false);
const audioElement = ref<HTMLAudioElement | null>(null);

const hasTracks = computed(() => musicTracks.length > 0);
const currentTrack = computed(() => musicTracks[currentTrackIndex.value] ?? null);
const progressPercent = computed(() => (duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0));
const currentTimeLabel = computed(() => formatTime(currentTime.value));
const durationLabel = computed(() => formatTime(duration.value));
const trackCountLabel = computed(() => `${musicTracks.length} track${musicTracks.length === 1 ? "" : "s"}`);
const appliedVolume = computed(() => Math.pow(volumeLevel.value, 3));
const playIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10-6.5z"/></svg>`;
const pauseIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="5.5" width="3.5" height="13" rx="1"/><rect x="13.5" y="5.5" width="3.5" height="13" rx="1"/></svg>`;
const queueIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="6" width="11" height="2" rx="1"/><rect x="4" y="11" width="11" height="2" rx="1"/><rect x="4" y="16" width="11" height="2" rx="1"/><circle cx="18.5" cy="7" r="1.5"/><circle cx="18.5" cy="12" r="1.5"/><circle cx="18.5" cy="17" r="1.5"/></svg>`;

function applyVolume() {
	if (audioElement.value) {
		audioElement.value.volume = appliedVolume.value;
	}
}

async function playCurrentTrack() {
	const audio = audioElement.value;

	if (!audio || !currentTrack.value) {
		return false;
	}

	try {
		applyVolume();
		await audio.play();
		isPlaying.value = true;
		return true;
	} catch {
		isPlaying.value = false;
		return false;
	}
}

function formatTime(seconds: number) {
	if (!Number.isFinite(seconds) || seconds <= 0) {
		return "0:00";
	}

	const flooredSeconds = Math.floor(seconds);
	const minutes = Math.floor(flooredSeconds / 60);
	const remainingSeconds = flooredSeconds % 60;

	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function syncTrack() {
	const audio = audioElement.value;

	if (!audio || !currentTrack.value) {
		return;
	}

	audio.src = currentTrack.value.src;
	audio.load();
	applyVolume();
	currentTime.value = 0;
	duration.value = 0;

	if (isPlaying.value) {
		void playCurrentTrack();
	}
}

function previousTrack() {
	if (!hasTracks.value) {
		return;
	}

	currentTrackIndex.value = currentTrackIndex.value === 0 ? musicTracks.length - 1 : currentTrackIndex.value - 1;
}

function nextTrack() {
	if (!hasTracks.value) {
		return;
	}

	currentTrackIndex.value = (currentTrackIndex.value + 1) % musicTracks.length;
}

function selectTrack(index: number) {
	if (index < 0 || index >= musicTracks.length) {
		return;
	}

	currentTrackIndex.value = index;
}

function toggleQueueVisibility() {
	isQueueVisible.value = !isQueueVisible.value;
}

function togglePlayback() {
	const audio = audioElement.value;

	if (!audio || !currentTrack.value) {
		return;
	}

	isPlaying.value = !isPlaying.value;

	if (isPlaying.value) {
		void playCurrentTrack();
		return;
	}

	audio.pause();
}

function handleLoadedMetadata() {
	const audio = audioElement.value;

	if (!audio) {
		return;
	}

	applyVolume();
	duration.value = Number.isFinite(audio.duration) ? audio.duration : 0;
}

function handleTimeUpdate() {
	if (isSeeking.value) {
		return;
	}

	currentTime.value = audioElement.value?.currentTime ?? 0;
}

function handleTrackEnded() {
	if (!hasTracks.value) {
		return;
	}

	nextTrack();
}

function handleSeek(event: Event) {
	const value = Number((event.target as HTMLInputElement).value);
	currentTime.value = value;
}

function commitSeek() {
	const audio = audioElement.value;

	if (!audio) {
		return;
	}

	audio.currentTime = currentTime.value;
	isSeeking.value = false;
}

function handleVolumeInput(event: Event) {
	const nextVolume = Number((event.target as HTMLInputElement).value);
	volumeLevel.value = nextVolume;
}

async function handleFirstDesktopInteraction(event: Event) {
	desktopInteractionSeen = true;

	const interactionTarget = event.target;

	if (
		interactionTarget instanceof HTMLElement &&
		interactionTarget.closest(".music-widget__button, .music-widget__progress-input, .music-widget__queue-toggle, .music-widget__queue-item, .music-widget__volume-slider")
	) {
		return;
	}

	if (props.surface !== "desktop" || !hasTracks.value || isPlaying.value) {
		return;
	}

	await playCurrentTrack();
}

watch(currentTrackIndex, () => {
	syncTrack();
});

watch(hasTracks, hasAnyTracks => {
	if (!hasAnyTracks) {
		isPlaying.value = false;
		currentTrackIndex.value = 0;
		currentTime.value = 0;
		duration.value = 0;
		isQueueVisible.value = false;
	}
});

watch(appliedVolume, nextVolume => {
	if (audioElement.value) {
		audioElement.value.volume = nextVolume;
	}
});

onMounted(() => {
	applyVolume();

	if (props.surface !== "desktop" || !hasTracks.value) {
		return;
	}

	if (desktopInteractionSeen) {
		void playCurrentTrack();
		return;
	}

	window.addEventListener("pointerdown", handleFirstDesktopInteraction, { once: true });
	window.addEventListener("keydown", handleFirstDesktopInteraction, { once: true });
});

onBeforeUnmount(() => {
	window.removeEventListener("pointerdown", handleFirstDesktopInteraction);
	window.removeEventListener("keydown", handleFirstDesktopInteraction);
	audioElement.value?.pause();
});
</script>

<template>
	<WidgetCard title="Now Playing" subtitle="Music Widget" accent="red">
		<div class="music-widget">
			<audio
				v-if="currentTrack"
				ref="audioElement"
				:key="currentTrack.id"
				:src="currentTrack.src"
				preload="metadata"
				@loadedmetadata="handleLoadedMetadata"
				@timeupdate="handleTimeUpdate"
				@ended="handleTrackEnded" />

			<div v-if="currentTrack" class="music-widget__copy">
				<div class="music-widget__copy-main">
					<p class="music-widget__title">{{ currentTrack.title }}</p>
					<p class="music-widget__artist">{{ currentTrack.artist }}</p>
				</div>
				<div class="music-widget__meta">
					<span>{{ isPlaying ? "Playing" : "Paused" }}</span>
					<span>{{ trackCountLabel }}</span>
				</div>
			</div>

			<div v-else class="music-widget__empty-state">
				<p class="music-widget__title">Drop in your music</p>
				<p class="music-widget__artist">
					Add tracks in `src/data/MusicTracks.ts` after you upload audio into `src/assets/music/`.
				</p>
			</div>

			<div v-if="hasTracks" class="music-widget__queue-shell">
				<div class="music-widget__queue-header">
					<div class="music-widget__queue-heading">
						<p class="music-widget__queue-title">Track Listing</p>
						<span class="music-widget__queue-count">{{ trackCountLabel }}</span>
					</div>
					<button
						class="music-widget__queue-toggle"
						type="button"
						:aria-label="isQueueVisible ? 'Hide queue' : 'Show queue'"
						:aria-expanded="isQueueVisible"
						@click="toggleQueueVisibility">
						<ThemedIcon class="music-widget__button-icon" :svg="queueIcon" />
					</button>
				</div>

				<div v-if="isQueueVisible" class="music-widget__queue-list" role="list" aria-label="Track listing">
					<button
						v-for="(track, index) in musicTracks"
						:key="track.id"
						class="music-widget__queue-item"
						:class="{ 'music-widget__queue-item--active': index === currentTrackIndex }"
						type="button"
						@click="selectTrack(index)">
						<span class="music-widget__queue-index">{{ String(index + 1).padStart(2, "0") }}</span>
						<span class="music-widget__queue-copy">
							<span class="music-widget__queue-track">{{ track.title }}</span>
							<span class="music-widget__queue-artist">{{ track.artist }}</span>
						</span>
						<span v-if="index === currentTrackIndex" class="music-widget__queue-status">
							{{ isPlaying ? "Live" : "Ready" }}
						</span>
					</button>
				</div>
			</div>

			<div class="music-widget__controls">
				<button class="music-widget__button" type="button" :disabled="!currentTrack" aria-label="Previous track" @click="previousTrack">
					<ThemedIcon class="music-widget__button-icon" :svg="backPageIcon" />
				</button>
				<button class="music-widget__button music-widget__button--primary" type="button" :disabled="!currentTrack" :aria-label="isPlaying ? 'Pause' : 'Play'" @click="togglePlayback">
					<ThemedIcon class="music-widget__button-icon" :svg="isPlaying ? pauseIcon : playIcon" />
				</button>
				<button class="music-widget__button" type="button" :disabled="!currentTrack" aria-label="Next track" @click="nextTrack">
					<ThemedIcon class="music-widget__button-icon" :svg="forwardPageIcon" />
				</button>
			</div>

			<div class="music-widget__progress">
				<div class="music-widget__progress-track">
					<input
						class="music-widget__progress-input"
						type="range"
						min="0"
						:max="duration || 0"
						:value="currentTime"
						:disabled="!currentTrack"
						aria-label="Playback progress"
						@input="handleSeek"
						@pointerdown="isSeeking = true"
						@pointerup="commitSeek"
						@change="commitSeek" />
					<div class="music-widget__progress-bar">
						<div class="music-widget__progress-fill" :style="{ width: `${progressPercent}%` }"></div>
					</div>
				</div>
				<div class="music-widget__timestamps">
					<span>{{ currentTrack ? currentTimeLabel : "No tracks" }}</span>
					<span>{{ currentTrack ? durationLabel : "Add audio" }}</span>
				</div>
			</div>

			<div class="music-widget__footer">
				<label class="music-widget__volume" for="music-widget-volume">
					<span class="music-widget__volume-label">Volume</span>
					<input
						id="music-widget-volume"
						class="music-widget__volume-slider"
						type="range"
						min="0"
						max="1"
						step="0.01"
						:value="volumeLevel"
						:disabled="!currentTrack"
						@input="handleVolumeInput" />
				</label>
			</div>
		</div>
	</WidgetCard>
</template>

<style scoped>
.music-widget {
	display: flex;
	flex-direction: column;
	gap: var(--space-2);
}

.music-widget__copy,
.music-widget__copy-main,
.music-widget__empty-state {
	display: flex;
	flex-direction: column;
	gap: var(--space-1);
}

.music-widget__copy {
	padding: var(--space-3);
	border-radius: var(--radius-lg);
	background:
		linear-gradient(180deg, rgba(255, 255, 255, 0.56), rgba(255, 255, 255, 0.24)),
		rgba(245, 227, 208, 0.82);
	border: var(--border-thin) solid rgba(90, 61, 43, 0.08);
}

.music-widget__title,
.music-widget__artist,
.music-widget__timestamps span,
.music-widget__meta span,
.music-widget__queue-title,
.music-widget__queue-count,
.music-widget__queue-track,
.music-widget__queue-artist,
.music-widget__queue-status,
.music-widget__queue-index {
	margin: 0;
}

.music-widget__title {
	font-size: var(--text-md);
	font-weight: 700;
	color: var(--color-ink);
}

.music-widget__artist,
.music-widget__timestamps span {
	font-size: var(--text-xs);
	color: var(--color-ink-soft);
}

.music-widget__meta,
.music-widget__queue-header,
.music-widget__timestamps,
.music-widget__footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: var(--space-2);
}

.music-widget__meta span,
.music-widget__queue-count,
.music-widget__queue-status {
	font-size: var(--text-2xs);
	color: var(--color-ink-soft);
}

.music-widget__queue-shell {
	display: flex;
	flex-direction: column;
	gap: var(--space-2);
}

.music-widget__queue-header,
.music-widget__queue-heading {
	align-items: center;
}

.music-widget__queue-heading {
	display: flex;
	gap: var(--space-2);
	flex-wrap: wrap;
}

.music-widget__queue-title {
	font-family: var(--font-chrome);
	font-size: var(--text-2xs);
	letter-spacing: 0.05em;
	text-transform: uppercase;
	color: var(--color-ink-soft);
}

.music-widget__queue-toggle {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-height: 1.9rem;
	min-width: 1.9rem;
	padding: 0.3rem;
	border: var(--border-thin) solid rgba(90, 61, 43, 0.12);
	border-radius: var(--radius-pill);
	background: rgba(255, 255, 255, 0.78);
	color: var(--color-ink);
	cursor: pointer;
}

.music-widget__queue-toggle:focus-visible,
.music-widget__queue-item:focus-visible {
	outline: none;
	box-shadow:
		0 0 0 0.16rem rgba(222, 107, 72, 0.18),
		0 0.5rem 1rem rgba(90, 61, 43, 0.1);
}

.music-widget__queue-list {
	display: flex;
	flex-direction: column;
	gap: 0.35rem;
}

.music-widget__queue-item {
	display: grid;
	grid-template-columns: auto minmax(0, 1fr) auto;
	align-items: center;
	gap: var(--space-2);
	width: 100%;
	padding: 0.55rem 0.7rem;
	border: var(--border-thin) solid rgba(90, 61, 43, 0.08);
	border-radius: var(--radius-md);
	background: rgba(255, 255, 255, 0.55);
	color: var(--color-ink);
	cursor: pointer;
	text-align: left;
}

.music-widget__queue-item--active {
	background:
		linear-gradient(135deg, rgba(222, 107, 72, 0.16), rgba(233, 158, 112, 0.12)),
		rgba(255, 255, 255, 0.74);
	border-color: rgba(222, 107, 72, 0.16);
}

.music-widget__queue-copy {
	display: flex;
	flex-direction: column;
	min-width: 0;
}

.music-widget__queue-track {
	font-size: var(--text-sm);
	font-weight: 700;
	color: var(--color-ink);
}

.music-widget__queue-artist {
	font-size: var(--text-2xs);
	color: var(--color-ink-soft);
}

.music-widget__queue-index {
	font-family: var(--font-chrome);
	font-size: var(--text-2xs);
	color: var(--color-ink-soft);
}

.music-widget__progress {
	display: flex;
	flex-direction: column;
	gap: 0.35rem;
}

.music-widget__progress-track {
	position: relative;
}

.music-widget__progress-input {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	margin: 0;
	opacity: 0;
	cursor: pointer;
}

.music-widget__progress-input:disabled {
	cursor: default;
}

.music-widget__progress-bar {
	height: 0.55rem;
	border-radius: var(--radius-pill);
	background: rgba(90, 61, 43, 0.12);
	overflow: hidden;
}

.music-widget__progress-fill {
	width: 42%;
	height: 100%;
	border-radius: inherit;
	background: linear-gradient(90deg, var(--color-accent-red), var(--color-accent-orange));
}

.music-widget__controls {
	display: flex;
	gap: var(--space-2);
}

.music-widget__button {
	flex: 1;
	min-height: 2.15rem;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 0.35rem;
	border: var(--border-thin) solid rgba(90, 61, 43, 0.12);
	border-radius: var(--radius-pill);
	background: rgba(255, 255, 255, 0.78);
	color: var(--color-ink);
	cursor: pointer;
}

.music-widget__button:disabled {
	opacity: 0.52;
	cursor: default;
}

.music-widget__button--primary {
	background: linear-gradient(135deg, var(--color-accent-red), var(--color-accent-orange));
	color: var(--color-white);
}

.music-widget__button-icon {
	width: 1rem;
	height: 1rem;
}

.music-widget__footer {
	align-items: flex-end;
}

.music-widget__volume {
	display: flex;
	flex-direction: column;
	gap: var(--space-1);
	flex: 1;
}

.music-widget__volume-label {
	font-family: var(--font-chrome);
	font-size: var(--text-2xs);
	letter-spacing: 0.05em;
	text-transform: uppercase;
	color: var(--color-ink-soft);
}

.music-widget__volume-slider {
	width: 100%;
	margin: 0;
	accent-color: var(--color-accent-red);
}

@media (max-width: 48rem) {
	.music-widget__footer {
		flex-direction: column;
		align-items: stretch;
	}

	.music-widget__queue-header {
		flex-direction: column;
		align-items: stretch;
	}
}
</style>
