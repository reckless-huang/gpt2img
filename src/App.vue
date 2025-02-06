<template>
  <div class="container">
    <el-form class="input-form chat-panel">
      <div class="input-column">
        <div class="section-title">用户输入</div>
        <el-form-item class="input-item">
          <el-input
            type="textarea"
            v-model="userInput"
            :rows="4"
            :autosize="{ minRows: 4, maxRows: 8 }"
            placeholder="请输入用户的问题或对话内容"
            resize="none"
            class="custom-textarea"
          />
        </el-form-item>
        
        <div class="section-title">AI回答</div>
        <el-form-item class="input-item">
          <el-input
            type="textarea"
            v-model="aiResponse"
            :rows="4"
            :autosize="{ minRows: 4, maxRows: 8 }"
            placeholder="请输入AI的回答内容"
            resize="none"
            class="custom-textarea"
          />
        </el-form-item>
      </div>
      
      <el-form-item class="checkbox-item">
        <el-checkbox v-model="isMarkdown">
          AI回答使用Markdown格式
        </el-checkbox>
      </el-form-item>
      
      <el-form-item label="字体大小">
        <el-slider
          v-model="fontSize"
          :min="12"
          :max="32"
          :step="1"
        />
      </el-form-item>

      <el-form-item label="头像设置">
        <div class="avatar-settings">
          <div class="avatar-item">
            <img :src="avatarConfig.userAvatar" class="avatar-preview">
            <el-upload
              class="avatar-uploader"
              accept="image/*"
              :auto-upload="false"
              :show-file-list="false"
              @change="handleAvatarChange"
            >
              <el-button size="small" type="primary">
                更换头像
              </el-button>
            </el-upload>
          </div>
          <div class="ai-avatar-selector">
            <el-radio-group v-model="avatarConfig.aiAvatar" class="ai-avatar-group">
              <el-radio-button 
                v-for="ai in aiAvatars" 
                :key="ai.value" 
                :label="ai.value"
                @change="avatarConfig.aiColor = ai.color"
              >
                <div class="ai-option">
                  <img :src="ai.value" class="avatar-preview">
                  <span>{{ ai.label }}</span>
                </div>
              </el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </el-form-item>

      <el-button type="primary" @click="generateImages">生成图片</el-button>
    </el-form>

    <div class="preview-container">
      <div class="preview-header">
        <div class="preview-title">预览效果</div>
        <div class="size-selector">
          <el-radio-group v-model="imageConfig.sizeType" @change="changeSizeType">
            <el-radio-button 
              v-for="(config, type) in sizeConfigs" 
              :key="type" 
              :label="type"
            >
              {{ config.label }}
            </el-radio-button>
          </el-radio-group>
        </div>
      </div>
      <div class="preview-pages">
        <template
          v-for="(page, pageIndex) in pagedMessages"
          :key="pageIndex"
        >
          <div
            class="preview-content"
            :style="{
              width: `${imageConfig.maxWidth}px`,
              padding: `${imageConfig.padding}px`,
              margin: '0 auto',
              marginBottom: imageConfig.sizeType === 'mobile' ? '20px' : '0'
            }"
          >
            <div v-if="imageConfig.sizeType === 'mobile'" class="page-number">
              第 {{ pageIndex + 1 }} 页 / 共 {{ pagedMessages.length }} 页
            </div>
            <div
              v-for="(message, messageIndex) in page"
              :key="`${pageIndex}-${messageIndex}`"
              class="preview-item"
              :ref="el => { if (el) previewRefs[pageIndex * page.length + messageIndex] = el }"
            >
              <ChatBubble 
                :text="message.text" 
                :is-html="message.isHtml"
                :font-size="fontSize"
                :avatar="message.avatar"
                :is-user="message.isUser"
                :ai-color="!message.isUser ? avatarConfig.aiColor : ''"
                :class="{ 'user-message': message.isUser, 'ai-message': !message.isUser }"
              />
            </div>
          </div>
        </template>
      </div>
    </div>

    <div class="generated-images" v-if="generatedImages.length">
      <h3>生成的图片 (共 {{ generatedImages.length }} 张)：</h3>
      <div class="download-all">
        <el-button type="primary" @click="downloadAllImages">
          一键下载全部图片
        </el-button>
      </div>
      <div v-for="(img, index) in generatedImages" :key="index" class="image-item">
        <div class="image-number">第 {{ index + 1 }} 张</div>
        <img :src="img" />
        <el-button size="small" @click="downloadImage(img, index)">
          下载此图
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, nextTick, watch, onMounted } from 'vue'
import html2canvas from 'html2canvas'
import MarkdownIt from 'markdown-it'
import ChatBubble from './components/ChatBubble.vue'


const aiAvatars = [
  { 
    label: 'ChatGPT',
    value: 'https://img.yufenglab.cn/gpt2img/chat-gpt.svg',
    color: '#74AA9C'
  },
  { 
    label: 'Deepseek',
    value: 'https://img.yufenglab.cn/gpt2img/deepseek.svg',
    color: '#2F70F2'
  },
  { 
    label: '通义千问',
    value: 'https://img.yufenglab.cn/gpt2img/Tongyi-Qianwen.svg',
    color: '#1C3EE3'
  },
]

const avatarConfig = reactive({
  userAvatar: 'https://img.yufenglab.cn/gpt2img/蜡笔小新.svg',
  aiAvatar: aiAvatars[0].value,
  aiColor: aiAvatars[0].color
})

const md = new MarkdownIt({
  breaks: true,
  html: false,
  linkify: true
})

const userInput = ref('')
const aiResponse = ref('')
const fontSize = ref(16)
const isMarkdown = ref(true)

const previewRefs = reactive([])
const generatedImages = ref([])

// 图片生成配置
const imageConfig = reactive({
  maxWidth: 720,    // 图片最大宽度
  padding: 40,      // 内边距
  backgroundColor: '#f5f5f5',  // 背景色
  sizeType: 'pc'    // 尺寸类型：pc/mobile/landscape/portrait
})

// 预设尺寸配置
const sizeConfigs = {
  pc: {
    width: 720,
    padding: 40,
    label: '电脑端'
  },
  mobile: {
    width: 375,
    padding: 20,
    label: '手机端'
  },
}

// 手机端单页最大高度
const MOBILE_MAX_HEIGHT = 600 // 大约是手机屏幕的高度

// 分页后的消息列表
const pagedMessages = computed(() => {
  if (imageConfig.sizeType !== 'mobile') {
    return [messages.value]
  }

  // 分离用户消息和AI消息
  const userMessages = messages.value.filter(msg => msg.isUser)
  const aiMessages = messages.value.filter(msg => !msg.isUser)
  
  const pages = []
  
  // 用户消息每条单独一页
  userMessages.forEach(message => {
    pages.push([message])
  })
  
  // 处理AI消息
  let currentPage = []
  let currentHeight = 0
  
  aiMessages.forEach((message) => {
    // 估算消息高度
    let estimatedHeight = 0
    const text = message.isHtml ? message.text.replace(/<[^>]*>/g, '') : message.text
    
    // 基础高度（头像、边距等）
    const baseHeight = 80
    
    // 计算文本行数
    const charsPerLine = Math.floor((sizeConfigs.mobile.width - 100) / (fontSize.value * 0.6))
    const lines = Math.ceil(text.length / charsPerLine)
    const lineHeight = fontSize.value * 1.5
    
    estimatedHeight = baseHeight + (lines * lineHeight)
    
    // Markdown 内容需要额外空间
    if (message.isHtml) {
      estimatedHeight *= 1.3
    }
    
    // 如果当前页面高度加上新消息会超出限制，创建新页面
    if (currentHeight + estimatedHeight > MOBILE_MAX_HEIGHT - (sizeConfigs.mobile.padding * 2)) {
      if (currentPage.length > 0) {
        pages.push([...currentPage])
        currentPage = []
        currentHeight = 0
      }
    }
    
    currentPage.push(message)
    currentHeight += estimatedHeight
  })
  
  if (currentPage.length > 0) {
    pages.push(currentPage)
  }
  
  // 按照原始顺序合并页面
  const finalPages = []
  let userIndex = 0
  let aiIndex = userMessages.length
  
  messages.value.forEach(message => {
    if (message.isUser) {
      if (pages[userIndex]) {
        finalPages.push(pages[userIndex])
      }
      userIndex++
    } else {
      if (pages[aiIndex]) {
        finalPages.push(pages[aiIndex])
      }
      aiIndex++
    }
  })
  
  return finalPages.filter(page => page && page.length > 0)
})

// 切换尺寸类型
const changeSizeType = (type) => {
  imageConfig.sizeType = type
  if (type === 'mobile') {
    const containerWidth = document.querySelector('.preview-container')?.offsetWidth || 800
    imageConfig.maxWidth = Math.min(sizeConfigs[type].width, containerWidth - 40) // 40px 为左右内边距
  } else {
    imageConfig.maxWidth = sizeConfigs[type].width
  }
  imageConfig.padding = sizeConfigs[type].padding
}

const messages = computed(() => {
  const result = []
  
  // 处理用户输入
  if (userInput.value.trim()) {
    result.push({
      text: userInput.value,
      isUser: true,
      isHtml: false,
      avatar: avatarConfig.userAvatar
    })
  }
  
  // 处理AI回答
  let aiText = aiResponse.value
  
  if (isMarkdown.value) {
    // 电脑端不分段，直接渲染整个内容
    if (imageConfig.sizeType === 'pc') {
      result.push({
        text: parseText(aiText, false),
        isUser: false,
        isHtml: true,
        avatar: avatarConfig.aiAvatar
      })
      return result
    }
    
    // 手机端才进行分段处理
    const segments = aiText.split(/(?:(?:\r?\n){2,}|(?:\r?\n)(?=#{1,6}\s))/g)
      .filter(seg => seg.trim())
    
    segments.forEach(segment => {
      if (segment.match(/^[•\-*+]\s|^\d+\.\s/m)) {
        result.push({
          text: parseText(segment, false),
          isUser: false,
          isHtml: true,
          avatar: avatarConfig.aiAvatar
        })
      } else {
        // 基准是300字符，字体越大字符数越少，字体越小字符数越多
        const baseLength = 300
        const fontSizeFactor = 16 / fontSize.value  // 16px为基准字号
        const maxLength = Math.floor(baseLength * fontSizeFactor * 1.2)  // 增加20%的弹性
        let currentText = ''
        
        const lines = segment.split('\n')
        lines.forEach(line => {
          if ((currentText + line).length > maxLength && currentText) {
            result.push({
              text: parseText(currentText, false),
              isUser: false,
              isHtml: true,
              avatar: avatarConfig.aiAvatar
            })
            currentText = ''
          }
          currentText += (currentText ? '\n' : '') + line
        })
        
        if (currentText) {
          result.push({
            text: parseText(currentText, false),
            isUser: false,
            isHtml: true,
            avatar: avatarConfig.aiAvatar
          })
        }
      }
    })
  } else {
    // 非markdown模式，电脑端不分段
    if (imageConfig.sizeType === 'pc') {
      result.push({
        text: aiText,
        isUser: false,
        isHtml: false,
        avatar: avatarConfig.aiAvatar
      })
      return result
    }
    
    // 非markdown模式按段落分割（手机端）
    const paragraphs = aiText.split(/\n\s*\n/).filter(para => para.trim())
    paragraphs.forEach(para => {
      result.push({
        text: para,
        isUser: false,
        isHtml: false,
        avatar: avatarConfig.aiAvatar
      })
    })
  }
  
  return result
})

const parseText = (text, isUser) => {
  if (!isUser && isMarkdown.value) {
    try {
      return md.render(text)
    } catch (e) {
      console.error('Markdown parse error:', e)
      return text
    }
  }
  return text
}

const generateImages = async () => {
  generatedImages.value = []
  
  // 等待一下确保DOM更新完成
  await nextTick()
  
  // 直接获取预览内容
  const previewContents = document.querySelectorAll('.preview-content')
  
  // 为每个预览内容生成图片
  for (const content of previewContents) {
    const canvas = await html2canvas(content, {
      backgroundColor: imageConfig.backgroundColor,
      scale: 2,
      logging: true,
      useCORS: true,
      allowTaint: true,
      onclone: (doc, element) => {
        // 确保克隆的元素应用正确的字体大小
        element.querySelectorAll('.chat-bubble').forEach(bubble => {
          bubble.style.fontSize = `${fontSize.value}px`
        })
        element.querySelectorAll('.markdown-content').forEach(content => {
          content.style.fontSize = `${fontSize.value}px`
          // 确保 markdown 内容中的所有元素也使用正确的字体大小
          content.querySelectorAll('*').forEach(el => {
            el.style.fontSize = `${fontSize.value}px`
          })
        })
      }
    })
    
    console.log('Canvas size:', canvas.width, canvas.height)
    generatedImages.value.push(canvas.toDataURL('image/png'))
  }
}

const downloadImage = (dataUrl, index) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const link = document.createElement('a')
  link.download = `chat-${timestamp}-${index + 1}.png`
  link.href = dataUrl
  link.click()
}

const handleAvatarChange = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarConfig.userAvatar = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

const downloadAllImages = () => {
  // 创建一个临时的 div 来触发多个下载
  const downloadContainer = document.createElement('div')
  downloadContainer.style.display = 'none'
  document.body.appendChild(downloadContainer)
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  
  // 为每个图片创建下载链接
  generatedImages.value.forEach((dataUrl, index) => {
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `chat-${timestamp}-${index + 1}.png`
    downloadContainer.appendChild(link)
    
    // 延迟触发下载，避免浏览器限制
    setTimeout(() => {
      link.click()
    }, index * 100)
  })
  
  // 清理临时容器
  setTimeout(() => {
    document.body.removeChild(downloadContainer)
  }, generatedImages.value.length * 100 + 100)
}
</script>

<style scoped>
.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  overflow-x: hidden;
}

.chat-panel {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.input-form {
  margin-bottom: 20px;
}

.preview-container {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  overflow: hidden;
  max-height: none;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0;
}

.preview-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.size-selector {
  display: flex;
  gap: 10px;
  align-items: center;
}

.preview-pages {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0;
  overflow: visible;
}

.preview-content {
  background: #f5f5f5;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
  min-height: 100px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: auto;
  overflow: visible;
  max-width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.page-number {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 1;
}

.preview-item {
  display: block;
  margin: 8px 0;
  width: 100%;
  position: relative;
  overflow: visible;
  background: transparent;
  z-index: 1;
}

.preview-content:not(:last-child)::after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 1px;
  background: #ddd;
}

.generated-images {
  margin-top: 20px;
}

.image-item {
  margin: 20px 0;
  text-align: center;
  position: relative;
  border: 1px solid #eee;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.image-number {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.image-item img {
  max-width: 100%;
  border-radius: 4px;
}

.avatar-settings {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.avatar-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar-preview {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.ai-avatar-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.ai-avatar-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.ai-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px;
}

.avatar-uploader {
  display: inline-block;
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #333;
  font-size: 16px;
  padding-bottom: 8px;
}

:deep(.custom-textarea .el-textarea__inner) {
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  transition: all 0.3s;
  font-size: 14px;
  line-height: 1.6;
  padding: 12px;
}

:deep(.custom-textarea .el-textarea__inner:focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

:deep(.custom-textarea .el-textarea__inner::placeholder) {
  color: #909399;
}

.checkbox-item {
  margin-top: -12px;
  margin-bottom: 16px;
}

:deep(.el-checkbox__label) {
  font-size: 14px;
  color: #606266;
}

:deep(.el-button) {
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
}

.input-column {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
}

.input-item {
  margin-bottom: 0;
  width: 100%;
}

:deep(.input-item) {
  display: flex;
  flex-direction: column;
}

:deep(.input-item .el-form-item__label) {
  text-align: left;
  float: none;
  line-height: 1.5;
  padding-bottom: 8px;
  height: auto;
}

:deep(.input-item .el-form-item__content) {
  height: 100%;
  margin-left: 0 !important;
}

:deep(.input-item .el-textarea) {
  height: 100%;
}

:deep(.input-item .el-textarea__inner) {
  height: 100% !important;
  min-height: 150px;
}

:deep(.message-container) {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
  width: 100%;
  box-sizing: border-box;
}

:deep(.user-container) {
  flex-direction: row-reverse;
  padding-left: 20%;
}

:deep(.message-container:not(.user-container)) {
  padding-right: 20%;
}

:deep(.avatar) {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

:deep(.chat-bubble) {
  background: #fff;
  border-radius: 10px;
  padding: 15px;
  margin: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-grow: 1;
  word-wrap: break-word;
}

.download-all {
  text-align: center;
  margin-bottom: 20px;
}

.download-all .el-button {
  min-width: 200px;
}

@media screen and (max-width: 480px) {
  .container {
    padding: 10px;
  }

  .preview-container {
    padding: 10px;
  }

  .preview-content {
    margin: 0 auto;
  }

  .preview-pages {
    gap: 15px;
  }
}
</style> 