const fs = require('fs')
const path = require('path')
const { uniq } = require('lodash')
const { finished } = require('stream/promises');

const httpRequest = require("../RESTUtils/index.js")
const { bulkResizeImages, getAllMatchingNodes } = require('../Helpers/index.js')
const imagesDir = path.resolve(__dirname, "../../data/images/");


const processProjectImages = async (projectTitle = "") => {
    if (!projectTitle) throw new Error("Please Provide A valid Project Title")
    console.log("\nprocessProjectImages:: Processing Generated Images")
    return await Promise.resolve(bulkResizeImages(path.join(imagesDir, projectTitle), Number(process.env.VIDEO_RES_WIDTH), Number(process.env.VIDEO_RES_HEIGHT) - 200))
}

const downloadProjectImages = async (projectTitle = "", links = []) => {
    if (!projectTitle) throw new Error("Please Provide A valid Project Title")
    if (!links.length) throw new Error("Please Provide A valid Array of image links")

    for (const [index, link] of links.entries()) {
        console.log("\ndownloadProjectImages:: Downloading ImageLink => ", link)
        await httpRequest(link, "GET", {}, {}, null, null, { responseType: 'stream' }, { logData: false, logHeaders: true })
            .then(async ({ statusCode, body }) => {
                if ([200, 201].includes(statusCode)) {

                    const destDir = path.join(imagesDir, projectTitle);
                    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true })
                    const destination = path.resolve(destDir, `image_${index}.png`);
                    if (fs.existsSync(destination)) fs.unlinkSync(destination);
                    console.log("downloadProjectImages::Destination", destination)

                    finished(body.pipe(fs.createWriteStream(destination, { flags: 'wx' })));
                }
                else throw new Error(`Failed to download image. Status Code: ${statusCode}`)
            })
            .catch(err => { throw err })
    }
    return await processProjectImages(projectTitle)

}

const generateProjectImages = async (projectTitle = "") => {
    if (!projectTitle) throw new Error("Please Provide A valid Project Title")
    const playFile = require(path.join(__dirname, "../../data/json/plays/", `${projectTitle}.json`))
    if (!playFile) throw new Error("Play file not found")

    let imagePrompts = uniq(getAllMatchingNodes(playFile.play.scenes, "image_prompt"))
    console.log("\ngenerateProjectImages::imagePrompts => ", imagePrompts)
    let imageLinks = []
    if (imagePrompts.length > 0) {
        for (const imagePrompt of imagePrompts) {
            console.log("\ngenerateProjectImages:: Generating ImageLink for Prompt: ", imagePrompt)
            const { body, statusCode } = await httpRequest(
                "https://api.openai.com/v1/images/generations", "POST",
                { "model": process.env.IMAGE_MODEL || "dall-e-3", "prompt": imagePrompt, "n": 1, "size": process.env.MODEL_IMAGE_RES || "1024x1024" },
                { "Content-Type": "application/json" }, process.env.OPENAI_API_KEY, null,
                {}, { logData: true, logHeaders: false })
            if ([200, 201].includes(statusCode)) imageLinks.push(body.data[0].url)
            else console.log(`\ngenerateProjectImages::Failed to generate Image Link for Prompt: ${imagePrompt}`)
        }
        return downloadProjectImages(projectTitle, imageLinks)
    }

}



module.exports = {
    processProjectImages,
    downloadProjectImages,
    generateProjectImages
}