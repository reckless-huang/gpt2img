# Chat2Image

[English](./README_EN.md) | [中文](./README.md)

## 简介
Chat2Image 是一个将聊天对话转换为图片的工具。它可以将用户输入和 AI 回复的对话内容生成美观的图片，支持 Markdown 格式，并提供多种自定义选项。


![Chat2Image](https://img.yufenglab.cn:443/blog/chat-2025-02-18T02-48-37-865Z-1.png)

## 特性
- 支持用户输入和 AI 回复的对话转图片
- 支持 Markdown 格式渲染
- 可自定义用户头像
- 提供多个 AI 头像选项（ChatGPT、Deepseek、通义千问）
- 支持电脑端和手机端两种布局
- 自动分页功能（手机端）
- 支持字体大小调整
- 一键下载所有生成的图片

## 使用方法
1. 在"用户输入"框中输入对话内容
2. 在"AI回答"框中输入 AI 的回复
3. 根据需要调整以下选项：
   - 选择是否启用 Markdown 格式
   - 调整字体大小
   - 更换用户头像
   - 选择 AI 头像
4. 选择布局模式（电脑端/手机端）
5. 点击"生成图片"按钮
6. 在生成的图片列表中下载需要的图片

## 本地开发
1. 安装依赖
npm install
2. 启动开发服务器
npm run dev
3. 构建生产版本
npm run build
4. 构建docker镜像
docker build -t chat2image -f build/Dockerfile .
5. 运行docker镜像
docker run -d -p 18080:18080 chat2image

## 在线预览
访问 [chat2img.yufenglab.cn](https://chat2img.yufenglab.cn) 体验在线版本

## 贡献
欢迎提交 Issue 和 Pull Request！

## 许可
MIT License