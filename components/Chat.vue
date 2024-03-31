<template>
    <div class="chat-container max-w-full overflow-y-auto bg-black p-2.5 border-solid border-2 border-slate-500 flex flex-col">
      <ul class="list-none p-0 flex-1 overflow-y-auto">
        <li v-for="chat in chats" :key="chat.time" class="chat-message mb-3.5">
          <div class="message-header flex justify-between mb-1.5">
            <span class="username font-bold text-gray-400"> {{ chat.username }} </span>
            <span class="time text-sm  text-[0.8rem] text-[#777]">{{ chat.time }}</span>
          </div>
          <p class="text m-0 text-white">{{ chat.text }}</p>
        </li>
      </ul>
  
      <div class="mt-auto">
        <MessageEntry/>
      </div>
    </div>
  </template>
  

<script setup lang="ts">
    interface Chat {
        username: string;
        text: string;
        time: string;
        room?: string;
    }
  
    // Using defineProps to define the component's props
    const props = defineProps<{
        chats: Chat[];
    }>();

</script>
  