<template>
    <div class="messaging-text-area flex flex-col items-end">
      <textarea v-model="message" placeholder="Type your message here..." rows="3" class="text-area w-full mb-[10px] p-[8px] box-border rounded-[4px] border-[1px] border-solid border-[#ccc] bg-[#A3A1A1]"></textarea>
      <button @click="send" class="send-button border-0 rounded-[4px] bg-[#007bff] text-[#FFFFFF] border-none py-1.5 px-3 hover:bg-[#0056b3]">Send</button>
    </div>
  </template>
  
<script setup lang="ts">
    import { ref, inject } from 'vue';
    
    // Define 'message' ref in setup
    const message = ref('');
    
    // Inject 'sendMessage' function from parent component
    const sendMessage = inject('sendMessage');
    
    // Create a 'send' method that uses 'message.value'
    const send = () => {
        if (sendMessage && message.value) {
            sendMessage(message.value);
            message.value = '';
        }
    };
</script>
  
  