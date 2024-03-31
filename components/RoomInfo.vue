<template>
    <div class="h-full flex items-center pl-4 border-solid border-x-2 border-b-2 border-slate-500">
        <div class="flex flex-row gap-5 h-full border-solid items-center">
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
                <ul class="text-white pl-[20px] list-disc">
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
