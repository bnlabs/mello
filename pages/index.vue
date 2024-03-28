
<template>

    <div class="flex h-screen items-center justify-center bg-green-600">
        <div class="flex flex-col w-[650px] h-[500px] gap-4 items-center justify-center shadow-2xl rounded-2xl bg-black">
    
            <!-- Username and LobbyId fields -->
            <div class="flex flex-col gap-2 text-white">
                <label for="username">Username</label>
                <InputText id="username" v-model="value" aria-describedby="username-help" />
                <label for="lobbyId">LobbyId</label>
                <InputText id="lobbyId" v-model="value" aria-describedby="lobbyId-help" />
            </div>


            <input type="submit" value="Join Lobby" class="bg-green-600 text-white rounded-md h-12 w-32">
        </div>

    </div>
</template>

<script>
    import InputText from 'primevue/inputtext';
</script>