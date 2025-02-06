import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import MarkdownIt from 'markdown-it'

// 预加载CDN图片
const preloadImages = [
  'https://img.yufenglab.cn/gpt2img/chat-gpt.svg',
  'https://img.yufenglab.cn/gpt2img/deepseek.svg',
  'https://img.yufenglab.cn/gpt2img/Tongyi-Qianwen.svg',
  'https://img.yufenglab.cn/gpt2img/蜡笔小新.svg'
]

preloadImages.forEach(src => {
  const img = new Image()
  img.src = src
})

const app = createApp(App)
app.use(ElementPlus)
app.mount('#app')