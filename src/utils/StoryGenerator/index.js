const get = require("lodash")
const httpRequest = require("../RESTUtils/index.js")

const generatePlay = async (wordCount = process.env.PLAY_WORDCOUNT, genre = process.env.GENRE, prompt = "") => {
    const endpoint = "https://api.openai.com/v1/chat/completions"
    const headers = { "Content-Type": "application/json", }
    const body = {
        "model": "gpt-4o",
        "response_format": {
            "type": "json_object"
        },
        "messages": [
            {
                "role": "system",
                "content": `you are a highly talented play writer that also understands prompting AI models like Dall-E to generate images relevant to the current scene of the play. `
            },
            {
                "role": "system",
                "content": `Respond in json formated like this: { "play": { "title": "[PLAY_TITLE]", "author": "GPT Ghost Writer", "scenes": [{ "scene_title": "[SCENE_TITLE]", "description": { "text": "[DESCRIPTION]", "image_prompt": "[DALLE_PROMPT]" }, "dialogue": [{ "character": "[CHARACTER_NAME]", "line": "[SPEECH]", "image_prompt": "[DALLE_PROMPT]" }] }] } }`
            },
            {
                "role": "user",
                "content": prompt || `write me a short ${genre} play less than ${wordCount} words.` + 'Your prompts for Dall-E during dialog should start by re/describing the character and background style to best produce visually similar images throughout the play to further enhance the story. Every dialogue prompt must also match well with the prompt provided for the scene. Make the prompts as detailed as possible.'
            }
        ]
    }
    return httpRequest(endpoint, "POST", body, headers, process.env.OPENAI_API_KEY, null, {}, { logData: false, logHeaders: false })
        .then(({ statusCode, body }) => {
            console.log("")
            if ([200, 201].includes(statusCode)) return JSON.parse(body["choices"][0]["message"]["content"])
            else throw new Error(`Failed to generate play. Status Code: ${statusCode}`)
        })
        .catch(err => { throw err })

}

const generateStory = async (wordCount = process.env.PLAY_WORDCOUNT, genre = process.env.GENRE, prompt = "") => {
    const endpoint = "https://api.openai.com/v1/chat/completions"
    const headers = { "Content-Type": "application/json", }
    const body = {
        "model": "gpt-4o",
        "response_format": {
            "type": "json_object"
        },
        "messages": [
            {
                "role": "system",
                "content":
                    "you are a short story writer that also understands prompting AI models like dall-e to generate images relevant to the current section of the story. respond in json"
            },
            {
                "role": "user",
                "content": prompt || `write me a short ${genre} story less than ${wordCount} words. Based on that story, provide detailed prompts that will be passed to dalle-3 to best produce high quality illustrations of what is happening in the scene taking into account the dialog of the story`
            }
        ]
    }

    return httpRequest(endpoint, "POST", body, headers, process.env.OPENAI_API_KEY, null, {}, { logData: true, logHeaders: false })
        .then(({ statusCode, body }) => {
            if ([200, 201].includes(statusCode)) return JSON.parse(get(body, "choices.0.message.content", "{}"))
            else throw new Error(`Failed to generate play. Status Code: ${statusCode}`)
        })
        .catch(err => { throw err })
}

module.exports = {
    generatePlay,
    generateStory
}