require('dotenv').config()
const path = require('path')

const { generatePlayAudio } = require('../utils/AudioGenerator/index.js')
const { generatePlayVideo } = require('../utils/VideoGenerator/index.js')
const { generatePlay, generateStory } = require('../utils/StoryGenerator/index.js')
const { writeFileSync } = require('fs')
const { generateProjectImages } = require('../utils/ImageProcessor/index.js')

const playsDir = path.resolve(__dirname, '../data/json/plays/')

// const tempAsync = async () => {
//     await setTimeout(() => { console.log("working") }, 2000);
//     return "Echoes_of_the_Enchanted_Forest"
// }


// tempAsync()

const createPlayVideo = async (prompt = "") => {
    generatePlay(null, null, prompt)
        .then((playData = {}) => {
            const projectTitle = playData.play.title.trim().replace(/[^\w]/gi, '_')
            console.log("\nMain:: Play Title => ", projectTitle)
            writeFileSync(path.join(playsDir, `${projectTitle}.json`), JSON.stringify(playData, null, 4))
            return projectTitle
        })
        .then(async projectTitle => {
            await generateProjectImages(projectTitle)
            return projectTitle
        })
        .then(async projectTitle => {
            await generatePlayAudio(projectTitle)
            console.log("Audio generated successfully")
            return projectTitle
        })
        .then(async projectTitle => {
            await generatePlayVideo(projectTitle)
            console.log("Video generated successfully")
        })
        .catch(e => {
            console.log("Error generating video", e)
        })
}

const createStoryVideo = async (prompt = "") => {
    generateStory(null, null, prompt)
        .then((storyData = {}) => {
            const projectTitle = storyData.story.title.trim().replace(/[^\w]/gi, '_')
            console.log("\nMain:: Story Title => ", projectTitle)
            writeFileSync(path.join(playsDir, `${projectTitle}.json`), JSON.stringify(storyData, null, 4))
            return projectTitle
        })
        .then(async projectTitle => {
            await generateProjectImages(projectTitle)
            return projectTitle
        })
        .then(async projectTitle => {
            await generatePlayAudio(projectTitle)
            console.log("Audio generated successfully")
            return projectTitle
        })
        .then(async projectTitle => {
            await generatePlayVideo(projectTitle)
            console.log("Video generated successfully")
        })
        .catch(e => {
            console.log("Error generating video", e)
        })
}

const playPrompt = ""
const storyPrompt = ""

createPlayVideo(playPrompt)
// createStoryVideo(storyPrompt)

