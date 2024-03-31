
<template>
    <div class="flex h-screen items-center justify-center bg-green-600">
      <div class="flex flex-col w-[650px] h-[500px] gap-4 items-center justify-center shadow-2xl rounded-2xl bg-black">
        <div class="flex flex-col gap-2 text-white">
          <label for="username">Username</label>
          <InputText id="username" v-model="username" aria-describedby="username-help" />
          <label for="room">Room</label>
          <InputText id="room" v-model="room" aria-describedby="room-help" />
        </div>
  
        <input type="submit" value="Join Room" @click="joinRoom" class="bg-green-600 text-white rounded-md h-12 w-32">
      </div>
    </div>
</template>
  

<script>
    import InputText from 'primevue/inputtext';

    export default {
        components: {
            InputText
        },
        data() {
            return {
                username: '', // This will bind to the username input
                room: '' // This will bind to the room input
            };
        },
        methods: {
            joinRoom() {
                // Navigate to /room with query parameters
                this.$router.push({ path: '/room', query: { username: this.username, room: this.room } });
            }
        }
    }
</script>
  