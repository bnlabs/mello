<script setup lang="ts">
import { io, type Socket } from 'socket.io-client';
import { ref, nextTick, onMounted, onBeforeUnmount, provide } from 'vue';
import { useRoute, useRouter } from 'vue-router'; // Import useRouter

interface Chat {
  username: string;
  text: string;
  time: string;
  room?: string;
}

type User = {
  id: string;
  username: string;
  room: string;
};

const message = ref('');
const chats = ref<Chat[]>([{ username: 'Alice', text: 'Hello, how are you?', time: '10:00 AM', room: 'VueRoom' }, { username: 'Bob', text: 'I\'m good, thanks!', time: '10:02 AM', room: 'VueRoom' }]);
const users = ref<User[]>([]);
const socket = ref<Socket>();
const currentRoom = ref('');

const route = useRoute();
const router = useRouter(); // Use useRouter to get the router instance

const sendMessage = async (message : String) => {
    console.log()
    socket.value?.emit('chatMessage', message);
};

provide('sendMessage', sendMessage);

const { username, room } = route.query as Partial<Chat>;
onMounted(() => {
  if (!username || !room) {
    router.push('/'); // Corrected to use router.push
  }

  socket.value = io({
    path: '/api/socket.io',
  });

  // Join ChatRoom
  socket.value.emit('joinRoom', { username, room });

  socket.value.on('message', (response: Chat) => {
    chats.value.push(response);
  });

  socket.value.on('roomUsers', (response: { room: string; users: User[] }) => {
    currentRoom.value = response.room;
    users.value = response.users;
  });
});

onBeforeUnmount(() => {
  console.log('Disconnect Block');
  socket.value?.disconnect();
});
</script>


<template>
    <div class="bg-black h-screen">
        <div class="h-[10%]">
            <RoomInfo :roomName="currentRoom" :users="users" :username="username"/>
        </div>

        <div class="flex flex-row gap-0 h-[90%]">
            <video controls class="w-5/6 border-solid border-2 border-slate-500">
            </video>
            
            <Chat :chats class="w-1/6">
            </Chat>
        </div>
    </div>
</template>
