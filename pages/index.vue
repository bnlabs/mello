<template>
    <div class="flex h-screen items-center justify-center bg-green-600">
      <div class="flex flex-col w-[650px] h-[500px] gap-4 items-center justify-center shadow-2xl rounded-2xl bg-black">
        <div class="flex flex-col gap-2 text-white w-3/6">
            <label for="username">Username</label>
            <InputText class="w-full" id="username" v-model="username" @focus="setUsernameTouched" @input="setUsernameTouched" aria-describedby="username-help" />
            <!-- Validation message for username -->
            <p v-if="showUsernameValidation" class="text-red-500 text-sm">Username must be between 1 and 30 characters.</p>
          
            <label for="room">Room</label>
            <InputText class="w-full" id="room" v-model="room" @focus="setRoomTouched" @input="setRoomTouched" aria-describedby="room-help" />
            <!-- Validation message for room -->
            <p v-if="showRoomValidation" class="text-red-500 text-sm">Room name must be between 1 and 30 characters.</p>
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
            username: '',
            room: '',
            touched: {
                username: false,
                room: false,
            },
            attemptedToJoin: false // Flag for tracking form submission attempt
        };
    },
    computed: {
        isUsernameValid() {
            return this.username.trim().length > 0 && this.username.trim().length <= 30;
        },
        isRoomValid() {
            return this.room.trim().length > 0 && this.room.trim().length <= 30;
        },
        showUsernameValidation() {
            return (this.touched.username || this.attemptedToJoin) && !this.isUsernameValid;
        },
        showRoomValidation() {
            return (this.touched.room || this.attemptedToJoin) && !this.isRoomValid;
        }
    },
    methods: {
        joinRoom() {
            this.attemptedToJoin = true; // Set the flag to true to indicate an attempt to submit
            if (!this.isUsernameValid || !this.isRoomValid) {
                alert('Both username and room name must be between 1 and 30 characters.');
                return;
            }
            this.$router.push({ path: '/room', query: { username: this.username.trim(), room: this.room.trim() } });
        },
        setUsernameTouched() {
            this.touched.username = true;
        },
        setRoomTouched() {
            this.touched.room = true;
        }
    }
}
</script>

  