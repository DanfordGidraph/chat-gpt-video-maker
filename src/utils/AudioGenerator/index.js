// var audioconcat = require('audioconcat')
const { finished } = require('stream/promises');
const fs = require("fs")
const path = require("path")
const httpRequest = require("../RESTUtils/index.js")
const closest_match = require("closest-match");
const { joinAudioClips, mergeAudio } = require("../Helpers/index.js")

const voiceActors = ["alloy", "echo", "fable", "nova", "shimmer"]
const audioDir = path.join(__dirname, "../../data/audio/");

const generateAudioClip = async (input = "", voice = "nova", savePath = "", fileName = "") => {
    console.log("generateAudioClip::savePath", savePath)
    return httpRequest(
        "https://api.openai.com/v1/audio/speech", "POST",
        { "model": "tts-1", input, voice },
        { "Content-Type": " application/json" },
        process.env.OPENAI_API_KEY, null,
        { responseType: 'stream' },
        { logData: false, logHeaders: false })
        .then(async ({ statusCode, body }) => {
            if ([200, 201].includes(statusCode)) {
                const destination = path.resolve(savePath, `${fileName}.wav`);
                console.log("generateAudioClip::Destination", destination)
                if (!fs.existsSync(savePath)) fs.mkdirSync(savePath, { recursive: true });
                if (fs.existsSync(destination)) fs.unlinkSync(destination);
                finished(body.pipe(fs.createWriteStream(destination, { flags: 'wx' })));
                return destination;
            }
            else throw new Error(`Failed to generate play. Status Code:: ${statusCode} Resp:: ${JSON.stringify(body)}`)
        })
        .catch(err => { throw err })

}

const generatePlayAudio = async (projectTitle = "") => {
    if (!projectTitle) throw new Error("projectTitle is required")
    const playFile = require(path.join(__dirname, "../../data/json/plays/", `${projectTitle}.json`))

    if (!playFile) throw new Error("Play file not found")

    const projectAudioDir = path.join(audioDir, projectTitle);
    const clipsDir = path.join(projectAudioDir, 'clips');

    if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

    for (const [index, scene] of playFile.play.scenes.entries()) {
        if (!scene) throw new Error("Scene not found")
        const audioText = [{
            character: 'narrator', voice: 'onyx', text: scene.description.text
        },
        ...scene.dialogue.map(speech => ({ character: speech.character, voice: closest_match.closestMatch(speech.character, voiceActors), text: speech.line }))
        ];

        const audioClips = [];
        for (const [indx, text] of audioText.entries()) {
            const audioClip = await generateAudioClip(text.text, text.voice, clipsDir, `scene_${index}_clip_${indx}`);
            audioClips.push(audioClip);
            audioClips.push(path.resolve(__dirname, "../../data/audio/silence.wav"))
        }
    }
    if (fs.existsSync(path.join(audioDir, 'final.wav'))) fs.unlinkSync(path.join(audioDir, 'final.wav'))
    if (fs.existsSync(path.join(audioDir, 'combined_clips.wav'))) fs.unlinkSync(path.join(audioDir, 'combined_clips.wav'))
    const audioClips = fs.readdirSync(clipsDir).reduce((acc, audio) => (fs.lstatSync(path.join(clipsDir, audio)).isDirectory()) ? acc : ([...acc, path.join(clipsDir, audio)]), []);
    return await mergeAudio(await joinAudioClips(audioClips, projectAudioDir, `combined_clips`), path.join(audioDir, "ominous.wav"), path.join(projectAudioDir, `play_audio.wav`))

}

module.exports = { generatePlayAudio }