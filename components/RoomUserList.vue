<script setup lang="ts">
import type { User } from "~/server/types"

defineProps<{
	users: User[]
}>()
</script>

<template>
	<div class="flex items-center gap-3">
		<div class="rounded bg-[#82d2e8] p-2 font-bold text-slate-600">
			<h2>Users:</h2>
		</div>
		<ul class="flex gap-2">
			<li v-for="user in users" class="rounded bg-[#82d2e8] p-2">
				<span class="text-black">
					{{ user.username }}
				</span>
			</li>
		</ul>
	</div>
</template>
