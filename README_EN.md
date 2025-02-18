# Chat2Image

[English](./README_EN.md) | [中文](./README.md)

## Introduction
Chat2Image is a tool that converts chat conversations into images. It can generate visually appealing images from user inputs and AI responses, supports Markdown formatting, and offers various customization options.

![Chat2Image](https://oss.yufenglab.cn:443/blog/chat-2025-02-18T02-48-37-865Z-1.png)

## Features
- Convert user-AI conversations to images
- Markdown format support
- Customizable user avatar
- Multiple AI avatar options (ChatGPT, Deepseek, Tongyi Qianwen)
- PC and mobile layout support
- Automatic pagination (mobile layout)
- Adjustable font size
- Batch download of generated images

## How to Use
1. Enter conversation content in the "User Input" box
2. Enter AI's response in the "AI Response" box
3. Adjust options as needed:
   - Toggle Markdown format
   - Adjust font size
   - Change user avatar
   - Select AI avatar
4. Choose layout mode (PC/Mobile)
5. Click "Generate Images" button
6. Download images from the generated list

## Local Development
1. Install dependencies
npm install
2. Start development server
npm run dev
3. Build for production
npm run build
4. Build docker image
docker build -t chat2image -f build/Dockerfile .
5. Run docker container
docker run -d -p 18080:18080 chat2image

## Online Demo
Visit [gpt2img.yufenglab.cn](https://gpt2img.yufenglab.cn/) to try the online version

## Contributing
Issues and Pull Requests are welcome!

## License
MIT License
