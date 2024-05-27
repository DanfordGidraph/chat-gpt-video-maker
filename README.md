# 🎥 AI Generative Tool for Video Creation 🤖

This project is an AI (LLM) based generative tool for creating TikTok, Shorts, Reels, and YouTube videos automatically using OpenAI tools like GPT-4 and Dall-E 3.

## 🚀 Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### 📋 Prerequisites

- Update the `.env` file with your OpenAI API key as well as the other required environment variables.
- Install the required dependencies by running `yarn/bun/npm install` in the project root directory.

```bash
# Installing the required dependencies With Yarn
corepack enable && yarn set version berry && yarn install
```

### 🏃‍♂️ Running the project

- Run the project by running `yarn start` or `yarn dev` in the project root directory.
  NOTE: `yarn dev` will run the project in development mode with hot reloading enabled, while `yarn start` will run the project in production mode. Therefore be careful when using `yarn dev` as it may lead to high financial costs since the AI models are called on every run.

```bash
yarn start
# or
yarn dev
```

- You can update the `src/app/index.js` file to change the prompt and other parameters for the AI models as needed. But I only recommend doing this if you are familiar with the OpenAI API and the AI models used in this project. The project is capable of auto generating even the prompt itself so it should easily be able to create random videos without any manual intervention/provided prompts.

## 🚢 Deployment

This project is not yet ready for deployment as it is still in development. But you can deploy it to a serverless platform like Vercel, Netlify, or AWS Lambda once it is ready for deployment. This will expose the functionality as Express API endpoints that can be called from any client application.

I will be developing a client application that will consume the API endpoints exposed by this project to create videos on the fly. The client application will be a web application that will allow users to create videos by simply providing a title and a description of the video they want to create. The client application will then call the API endpoints exposed by this project to generate the video and return it to the user. This can be monetized by charging users for each video they create or by showing an end screen with a call to action to buy the full video.

## 🛠️ Built With

- [OpenAI GPT-4](https://openai.com/research/gpt-4) - The AI model used
- [Dall-E 3](https://openai.com/research/dall-e-3) - The AI model used for image generation
- [Ffmpeg](https://ffmpeg.org) - The video editing library used
- [Node.js](https://nodejs.org) - The JavaScript runtime used
- [Express](https://expressjs.com) - The web framework used
- [FFCreatorLite](https://tnfe.github.io/FFCreatorLite) - The image to video library used

## 🤝 Contributing

Please read [CONTRIBUTING.md](https://https://github.com/DanfordGidraph/chat-gpt-video-maker/contributing.md) for details on our code of conduct, and the process for submitting pull requests to us.

## 👤 Authors

- **Your Name** - _Initial work_ - [YourGithubUsername](https://github.com/danfordgidraph)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## ☕ Support

If you find this project helpful, you can support the author by buying a coffee:

[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee--yellow.svg?style=social&logo=buy-me-a-coffee)](https://www.buymeacoffee.com/gidraphdanford)