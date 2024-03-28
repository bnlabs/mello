<template>
    <div class="flex h-screen items-center justify-center bg-green-500">
        <div class="flex flex-col w-[650px] h-[500px] items-center justify-center shadow-2xl rounded-2xl bg-black">
    
            <div class="flex flex-col gap-2 text-white">
                <label for="username">Username</label>
                <InputText id="username" v-model="value" aria-describedby="username-help" />
                <label for="username">LobbyId</label>
                <InputText id="username" v-model="value" aria-describedby="username-help" />
            </div>
        </div>
    </div>
</template>

<script>
    import InputText from 'primevue/inputtext';
</script>