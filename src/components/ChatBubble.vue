<template>
  <div class="message-container" :class="{ 'user-container': isUser }">
    <img v-if="avatar" :src="avatar" class="avatar" :class="{ 'avatar-right': isUser }">
    <div 
      class="chat-bubble" 
      :style="{ 
        fontSize: `${fontSize}px`,
        backgroundColor: !isUser && aiColor ? `${aiColor}20` : (isUser ? '#95ec69' : '#ffffff')
      }"
    >
      <div class="message" v-if="!isHtml">{{ text }}</div>
      <div class="message markdown-content" v-else v-html="text"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    required: true
  },
  fontSize: {
    type: Number,
    default: 16
  },
  isHtml: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String,
    default: ''
  },
  isUser: {
    type: Boolean,
    default: false
  },
  aiColor: {
    type: String,
    default: ''
  }
})
</script>

<style>
.message-container {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
  width: 100%;
  box-sizing: border-box;
}

.user-container {
  flex-direction: row-reverse;
  padding-left: 20%;
}

.message-container:not(.user-container) {
  padding-right: 20%;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.chat-bubble {
  background: #fff;
  border-radius: 10px;
  padding: 15px;
  margin: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-grow: 1;
  word-wrap: break-word;
}

.message {
  color: #333;
  line-height: 1.5;
}

.markdown-content :deep(p) {
  margin: 0.5em 0;
}

.markdown-content :deep(code) {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
}

.markdown-content :deep(pre) {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 1em;
  border-radius: 5px;
  overflow-x: auto;
}

.markdown-content :deep(ul), 
.markdown-content :deep(ol) {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid #ddd;
  padding-left: 1em;
  margin: 0.5em 0;
  color: #666;
}
</style> 