<template>
    <div class="h-full flex items-center p-4 border-solid border-2 border-slate-500">
        <div class="flex flex-row gap-5">
            <div class="flex flex-row gap-2">
                <h2 class="text-slate-600 font-bold">Room: </h2>
                <span class="text-white"> {{ roomName }}</span>
            </div>

            <div class="flex flex-row gap-2">
                <h2 class="text-slate-600 font-bold">Username: </h2>
                <span class="text-white"> {{ username }}</span>
            </div>

            <div class="flex flex-row gap-2">
                <h2 class="text-slate-600 font-bold">Users: </h2>
                <ul class="text-white">
                    <li v-for="user in users" :key="user.id">{{ user.username }}</li>
                </ul>
            </div>

        </div>
    </div>
</template>
  

<script>

export default {
  props: {
    roomName: String,
    users: Array, 
    username: String
  }
}
</script>

<style scoped>
ul {
  list-style-type: disc; /* Standard bullet points */
  padding-left: 20px; /* Ensure there's space for bullet points */
}
</style>

