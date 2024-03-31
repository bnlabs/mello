<template>
    <div class="messaging-text-area">
      <textarea v-model="message" placeholder="Type your message here..." rows="3" class="text-area"></textarea>
      <button @click="send" class="send-button">Send</button>
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
            message.value = ''; // Clear the message after sending
        }
    };
</script>
  
  <style scoped>
  .messaging-text-area {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
  
  .text-area {
    width: 100%;
    margin-bottom: 10px;
    padding: 8px;
    box-sizing: border-box;
    border-radius: 4px;
    border: 1px solid #ccc;
    resize: none; /* Disable resizing */
    background-color: rgb(163, 161, 161);
  }
  
  .send-button {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    background-color: #007bff;
    color: white;
    cursor: pointer;
  }
  
  .send-button:hover {
    background-color: #0056b3;
  }
  </style>
  