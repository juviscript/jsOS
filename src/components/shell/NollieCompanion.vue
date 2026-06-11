<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import nollieSpriteSheet from "../../assets/nollie-sprite-sheet.png";

const props = defineProps<{
	hasVisibleDesktopWindow: boolean;
}>();

const emit = defineEmits<{
	"open-app": [id: string];
}>();

type QuickAction = {
	id: string;
	label: string;
	description: string;
	accent: "red" | "gold" | "sky" | "mint";
};

const quickActions: QuickAction[] = [
	{ id: "about", label: "Open About", description: "Start with a quick profile and stack overview.", accent: "red" },
	{ id: "projects", label: "Browse Projects", description: "Jump into build walkthroughs and live previews.", accent: "gold" },
	{ id: "resume", label: "View Resume", description: "Open the resume viewer in its own browser window.", accent: "sky" },
	{ id: "contact", label: "Contact Me", description: "Head straight to the message form.", accent: "mint" },
];

const corgiAvatarStyle = {
	backgroundImage: `url(${nollieSpriteSheet})`,
};

const visibleMessageCount = ref(0);
const messageTimers: number[] = [];
let audioContext: AudioContext | null = null;

const introMessages = computed(() => [
	{
		id: "welcome",
		eyebrow: "Nollie Bot",
		body: "Welcome to the desktop portfolio. Think of this like a guided operating system tour instead of a traditional landing page.",
	},
	{
		id: "tips",
		eyebrow: "Tips",
		body: props.hasVisibleDesktopWindow
			? "The taskbar keeps track of every open window, so you can swap focus or minimize anything you open from here."
			: "Double-click any desktop icon to open it. Keyboard users can tab to an icon and press Enter to launch it too.",
	},
	{
		id: "shortcut",
		eyebrow: "Shortcut",
		body: "If you want the fastest tour, open About first, then Projects, and use Contact when you're ready to reach out.",
	},
]);

const visibleMessages = computed(() => introMessages.value.slice(0, visibleMessageCount.value));

function playMessageSound(index: number) {
	if (typeof window === "undefined" || !("AudioContext" in window)) {
		return;
	}

	try {
		audioContext ??= new window.AudioContext();

		if (audioContext.state === "suspended") {
			void audioContext.resume();
		}

		const oscillator = audioContext.createOscillator();
		const gain = audioContext.createGain();
		const now = audioContext.currentTime;

		oscillator.type = "sine";
		oscillator.frequency.setValueAtTime(720 + index * 45, now);
		gain.gain.setValueAtTime(0.0001, now);
		gain.gain.linearRampToValueAtTime(0.018, now + 0.012);
		gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

		oscillator.connect(gain);
		gain.connect(audioContext.destination);
		oscillator.start(now);
		oscillator.stop(now + 0.1);
	} catch {
		// Ignore browsers or autoplay policies that block lightweight UI sounds.
	}
}

function queueIntroMessages() {
	visibleMessageCount.value = 0;
	messageTimers.splice(0).forEach(timer => window.clearTimeout(timer));

	introMessages.value.forEach((_, index) => {
		const timer = window.setTimeout(() => {
			visibleMessageCount.value = index + 1;
			playMessageSound(index);
		}, 260 + index * 220);

		messageTimers.push(timer);
	});
}

onMounted(() => {
	queueIntroMessages();
});

onBeforeUnmount(() => {
	messageTimers.splice(0).forEach(timer => window.clearTimeout(timer));
});
</script>

<template>
	<section class="nollie-bot" aria-label="Nollie Bot messages">
		<header class="nollie-bot__header">
			<div class="nollie-bot__title-group">
				<span class="nollie-bot__avatar nollie-bot__avatar--panel" :style="corgiAvatarStyle" aria-hidden="true"></span>
				<div>
					<p class="nollie-bot__kicker">Instant Messenger</p>
					<h2 class="nollie-bot__title">Nollie Bot</h2>
				</div>
			</div>

			<span class="nollie-bot__status">Online</span>
		</header>

		<div class="nollie-bot__conversation">
			<transition-group name="nollie-bot-message" tag="div" class="nollie-bot__message-list">
				<div v-for="message in visibleMessages" :key="message.id" class="nollie-bot__message-row">
					<span class="nollie-bot__avatar nollie-bot__avatar--message" :style="corgiAvatarStyle" aria-hidden="true"></span>
					<article class="nollie-bot__message">
						<p class="nollie-bot__message-eyebrow">{{ message.eyebrow }}</p>
						<p class="nollie-bot__message-body">{{ message.body }}</p>
					</article>
				</div>
			</transition-group>
		</div>

		<div class="nollie-bot__shortcuts">
			<p class="nollie-bot__shortcuts-label">Quick actions</p>
			<div class="nollie-bot__shortcuts-grid">
				<button
					v-for="action in quickActions"
					:key="action.id"
					class="nollie-bot__shortcut"
					:class="`nollie-bot__shortcut--${action.accent}`"
					type="button"
					@click="emit('open-app', action.id)">
					<span class="nollie-bot__shortcut-title">{{ action.label }}</span>
					<span class="nollie-bot__shortcut-description">{{ action.description }}</span>
				</button>
			</div>
		</div>
	</section>
</template>

<style scoped>
.nollie-bot {
	display: flex;
	flex-direction: column;
	gap: var(--space-3);
	height: 100%;
}

.nollie-bot__header,
.nollie-bot__title-group {
	display: flex;
	align-items: center;
}

.nollie-bot__header {
	justify-content: space-between;
	gap: var(--space-3);
}

.nollie-bot__title-group {
	gap: var(--space-3);
	min-width: 0;
}

.nollie-bot__avatar {
	display: inline-block;
	flex: 0 0 auto;
	border-radius: 50%;
	background-color: #fff5ea;
	background-repeat: no-repeat;
	background-size: 600% 100%;
	background-position: 0% 50%;
	border: var(--border-thin) solid rgba(90, 61, 43, 0.14);
	box-shadow:
		0 0.75rem 1.2rem rgba(90, 61, 43, 0.14),
		inset 0 0 0 0.12rem rgba(255, 255, 255, 0.42);
}

.nollie-bot__avatar--panel {
	width: 2.75rem;
	height: 2.75rem;
}

.nollie-bot__avatar--message {
	width: 2rem;
	height: 2rem;
	margin-top: 0.2rem;
}

.nollie-bot__kicker,
.nollie-bot__title,
.nollie-bot__message-eyebrow,
.nollie-bot__message-body,
.nollie-bot__shortcuts-label,
.nollie-bot__shortcut-title,
.nollie-bot__shortcut-description {
	margin: 0;
}

.nollie-bot__kicker,
.nollie-bot__shortcuts-label,
.nollie-bot__message-eyebrow {
	font-family: var(--font-chrome);
	font-size: var(--text-2xs);
	font-weight: 700;
	letter-spacing: 0.06em;
	text-transform: uppercase;
	color: var(--color-ink-soft);
}

.nollie-bot__title {
	margin-top: 0.15rem;
	font-family: var(--font-display);
	font-size: var(--text-lg);
	font-weight: 700;
	line-height: var(--line-tight);
	color: var(--color-ink);
}

.nollie-bot__status {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-height: 1.9rem;
	padding: 0 0.75rem;
	border-radius: var(--radius-pill);
	background: rgba(155, 214, 196, 0.26);
	border: var(--border-thin) solid rgba(90, 61, 43, 0.08);
	font-family: var(--font-chrome);
	font-size: var(--text-2xs);
	font-weight: 700;
	letter-spacing: 0.05em;
	text-transform: uppercase;
	color: var(--color-ink);
}

.nollie-bot__conversation {
	display: flex;
	flex: 1;
	flex-direction: column;
	overflow: auto;
	padding-right: 0.2rem;
	min-height: 0;
}

.nollie-bot__message-list {
	display: flex;
	flex-direction: column;
	gap: var(--space-2);
}

.nollie-bot__message-row {
	display: flex;
	align-items: flex-start;
	gap: var(--space-2);
}

.nollie-bot__message {
	max-width: calc(100% - 2.75rem);
	padding: 0.8rem 0.9rem;
	border-radius: 1.15rem 1.15rem 1.15rem 0.4rem;
	background:
		linear-gradient(180deg, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0.42)),
		rgba(191, 233, 255, 0.26);
	border: var(--border-thin) solid rgba(90, 61, 43, 0.1);
	box-shadow: 0 0.75rem 1.5rem rgba(90, 61, 43, 0.08);
}

.nollie-bot__message-body {
	margin-top: var(--space-1);
	font-size: var(--text-xs);
	line-height: var(--line-normal);
	color: var(--color-ink);
}

.nollie-bot__shortcuts {
	display: flex;
	flex-direction: column;
	gap: var(--space-2);
	flex-shrink: 0;
}

.nollie-bot__shortcuts-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: var(--space-2);
}

.nollie-bot__shortcut {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: var(--space-1);
	min-height: 4.4rem;
	padding: 0.75rem 0.85rem;
	border: var(--border-thin) solid rgba(90, 61, 43, 0.1);
	border-radius: var(--radius-lg);
	background:
		linear-gradient(180deg, rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0.42)),
		rgba(255, 249, 241, 0.94);
	color: var(--color-ink);
	cursor: pointer;
	text-align: left;
	transition:
		transform 140ms ease,
		background-color 140ms ease,
		box-shadow 140ms ease;
}

.nollie-bot__shortcut:hover {
	transform: translateY(-0.0625rem);
	box-shadow: 0 0.8rem 1.35rem rgba(90, 61, 43, 0.1);
}

.nollie-bot__shortcut:focus-visible {
	outline: none;
	box-shadow:
		0 0 0 0.18rem rgba(222, 107, 72, 0.2),
		0 1rem 1.8rem rgba(90, 61, 43, 0.16);
}

.nollie-bot__shortcut-title {
	font-size: var(--text-sm);
	font-weight: 700;
}

.nollie-bot__shortcut-description {
	font-size: var(--text-xs);
	line-height: 1.3;
	color: var(--color-ink-soft);
}

.nollie-bot__shortcut--red {
	background:
		linear-gradient(135deg, rgba(222, 107, 72, 0.22), rgba(255, 255, 255, 0.55)),
		rgba(255, 244, 240, 0.96);
}

.nollie-bot__shortcut--gold {
	background:
		linear-gradient(135deg, rgba(244, 200, 111, 0.28), rgba(255, 255, 255, 0.55)),
		rgba(255, 250, 237, 0.96);
}

.nollie-bot__shortcut--sky {
	background:
		linear-gradient(135deg, rgba(191, 233, 255, 0.36), rgba(255, 255, 255, 0.56)),
		rgba(244, 251, 255, 0.96);
}

.nollie-bot__shortcut--mint {
	background:
		linear-gradient(135deg, rgba(155, 214, 196, 0.3), rgba(255, 255, 255, 0.56)),
		rgba(244, 252, 249, 0.96);
}

.nollie-bot-message-enter-active,
.nollie-bot-message-leave-active {
	transition:
		opacity 180ms ease,
		transform 200ms ease;
}

.nollie-bot-message-enter-from,
.nollie-bot-message-leave-to {
	opacity: 0;
	transform: translateY(0.45rem);
}

@media (max-width: 56rem) {
	.nollie-bot__shortcuts-grid {
		grid-template-columns: minmax(0, 1fr);
	}

	.nollie-bot__message {
		max-width: calc(100% - 2.5rem);
	}
}
</style>
