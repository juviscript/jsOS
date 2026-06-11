<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { projects } from "../../data/Projects";

const props = defineProps<{
	projectId: string;
}>();

const emit = defineEmits<{
	"open-url": [projectId: string, url: string, title: string];
}>();

const selectedProject = computed(() => projects.find(project => project.id === props.projectId));
const activeScreenshotIndex = ref(0);
const projectScreenshots = computed(() => selectedProject.value?.screenshots?.length ? selectedProject.value.screenshots : (selectedProject.value?.gif ? [selectedProject.value.gif] : []));
const activePreviewImage = computed(() => projectScreenshots.value[activeScreenshotIndex.value] ?? null);

function selectScreenshot(index: number) {
	if (index < 0 || index >= projectScreenshots.value.length) {
		return;
	}

	activeScreenshotIndex.value = index;
}

watch(() => props.projectId, () => {
	activeScreenshotIndex.value = 0;
}, { immediate: true });
</script>

<template>
	<div v-if="selectedProject" class="project-container">
		<div class="project-top-container">
			<img v-if="activePreviewImage" :src="activePreviewImage" :alt="`${selectedProject.name} preview ${activeScreenshotIndex + 1}`" class="project-preview-image" />
			<div v-else class="project-preview-image-placeholder">Preview not available</div>

			<div v-if="projectScreenshots.length > 1" class="project-preview-selector" aria-label="Project screenshots" role="tablist">
				<button
					v-for="(screenshot, index) in projectScreenshots"
					:key="`${selectedProject.id}-shot-${index}`"
					class="project-preview-selector__button"
					:class="{ 'project-preview-selector__button--active': index === activeScreenshotIndex }"
					type="button"
					:aria-label="`View screenshot ${index + 1}`"
					:aria-selected="index === activeScreenshotIndex"
					role="tab"
					@click="selectScreenshot(index)">
					<img :src="screenshot" :alt="`${selectedProject.name} thumbnail ${index + 1}`" class="project-preview-selector__thumb" />
				</button>
			</div>
		</div>
		<div class="project-bottom-container">
			<div>
				<h1 class="project-title">{{ selectedProject.name }}</h1>
				<div class="technologies-badges-container">
					<span v-for="technology in selectedProject.technologies" :key="technology" class="technology-badge">{{ technology }}</span>
				</div>
			</div>

			<div class="project-description">
				<p>{{ selectedProject.description }}</p>
			</div>

			<div class="project-quick-links">
				<a v-if="selectedProject.url" :href="selectedProject.url" target="_blank" rel="noopener" class="project-link" @click.prevent="emit('open-url', selectedProject.id, selectedProject.url, selectedProject.name)"> Preview Project </a>
				<a v-if="selectedProject.repositoryUrl" :href="selectedProject.repositoryUrl" target="_blank" rel="noopener" class="project-link">View Repository</a>
			</div>
		</div>
	</div>
	<div v-else class="project-empty-state">
		<p>Project not found.</p>
	</div>
</template>

<style scoped>
.project-container {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	min-height: 0;
	gap: 1rem;
	padding: 1rem;
	box-sizing: border-box;
	overflow: auto;
}

.project-top-container {
	display: flex;
	flex-direction: row;
	align-items: flex-start;
	gap: 0.85rem;
	margin: auto;
	width: 100%;
	flex-grow: 1;
	min-height: 0;
}

.project-bottom-container {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	padding: 1rem;
	border-radius: var(--radius-lg);
	background-color: var(--color-surface-strong);
}

.project-preview-image {
	max-width: 100%;
	max-height: 100%;
	width: 100%;
	object-fit: contain;
	border-radius: var(--radius-md);
	background: rgba(255, 255, 255, 0.5);
	border: var(--border-thin) solid rgba(90, 61, 43, 0.08);
}

.project-preview-image-placeholder {
	width: 100%;
	height: 100%;
	min-height: 240px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.project-preview-selector {
	display: flex;
	flex: 0 0 auto;
	flex-direction: column;
	gap: 0.65rem;
	max-height: min(100%, 28rem);
	overflow: auto;
	padding-right: 0.15rem;
}

.project-preview-selector__button {
	width: 5.25rem;
	height: 3.7rem;
	padding: 0.2rem;
	border: var(--border-thin) solid rgba(90, 61, 43, 0.14);
	border-radius: var(--radius-md);
	background: rgba(255, 255, 255, 0.58);
	cursor: pointer;
	transition:
		transform 140ms ease,
		border-color 140ms ease,
		box-shadow 140ms ease;
}

.project-preview-selector__button:hover,
.project-preview-selector__button--active {
	transform: translateY(-0.0625rem);
	border-color: rgba(222, 107, 72, 0.3);
	box-shadow: 0 0.5rem 1rem rgba(90, 61, 43, 0.1);
}

.project-preview-selector__button:focus-visible {
	outline: none;
	box-shadow:
		0 0 0 0.16rem rgba(222, 107, 72, 0.18),
		0 0.5rem 1rem rgba(90, 61, 43, 0.1);
}

.project-preview-selector__thumb {
	width: 100%;
	height: 100%;
	object-fit: cover;
	border-radius: calc(var(--radius-md) - 0.15rem);
}

.project-title {
	margin: 0;
}

.technologies-badges-container {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
    margin-top: .25rem;
}

.technology-badge {
	padding: 0.25rem 0.5rem;
	background-color: var(--color-accent-red);
	font-size: 0.75rem;
    font-weight: bold;
	border-radius: var(--radius-pill);
	color: white;
}

.project-description {
	line-height: 1.5;
}

.project-quick-links {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
}

.project-link {
	color: var(--color);
	font-weight: bold;
	text-decoration: none;
	padding: 0.5rem 0.75rem;
	background-color: var(--color-accent-sky);
	border-radius: var(--radius-sm);
}

.project-link:hover {
	text-decoration: underline;
}

.project-empty-state {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
}

@media (max-width: 48rem) {
	.project-container {
		padding: 0.85rem;
	}

	.project-bottom-container {
		padding: 0.85rem;
	}

	.project-top-container {
		flex-direction: column;
	}

	.project-preview-selector {
		flex-direction: row;
		max-height: none;
		overflow: visible;
		padding-right: 0;
		justify-content: flex-start;
		flex-wrap: wrap;
	}

	.project-quick-links {
		flex-direction: column;
	}

	.project-link {
		text-align: center;
	}
}
</style>
