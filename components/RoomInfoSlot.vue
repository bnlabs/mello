<script setup lang="ts">
defineProps<{
	title: string
}>()
</script>

<template>
	<div class="flex items-center gap-2 rounded bg-[#82d2e8] p-2">
		<h2 class="font-bold text-slate-600">{{ title }}:</h2>
		<slot></slot>
	</div>
</template>
