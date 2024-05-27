const { FFCreator, FFImage, FFScene, FFText, } = require("ffcreatorlite")

const fs = require("fs")
const path = require("path")
const { getDurationFromFile, } = require("../Helpers/index.js")

const videosDir = path.resolve(__dirname, "../../data/videos/");
const imagesDir = path.resolve(__dirname, "../../data/images/");
const audioDir = path.resolve(__dirname, "../../data/audio/");

const generatePlayVideo = async (projectTitle = "") => {

    if (!projectTitle) throw new Error("projectTitle is required")
    const outputDir = path.join(videosDir, projectTitle);
    const projectImagesDir = path.join(imagesDir, projectTitle);
    const projectAudioDir = path.join(audioDir, projectTitle);
    const projectAudioClipsDir = path.join(projectAudioDir, 'clips');
    const playFile = require(path.join(__dirname, "../../data/json/plays/", `${projectTitle}.json`))
    // console.log("playFile", playFile.play.scenes[0].description)

    if (!fs.existsSync(projectImagesDir)) throw new Error("Images directory not found")
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    if (!playFile) throw new Error("Play file not found")

    const images = fs.readdirSync(projectImagesDir).map(image => ({ path: path.join(projectImagesDir, image), name: image }));
    if (images.length === 0) throw new Error("Images not found")
    // Add audio clips to array confirming first if they are a directory
    const clips = playFile.play.scenes.reduce((acc, playScene, indx) => ([...acc, { text: playScene.description.text, audio: `scene_${indx}_clip_0` }, ...playScene.dialogue.map((speech, i) => ({ text: speech.line, audio: `scene_${indx}_clip_${i + 1}` }))]), [])

    // Create FFCreator instance
    const creator = new FFCreator({ cacheDir: outputDir, outputDir, frames: images.length, width: 720, height: 1280, audio: path.resolve(projectAudioDir, 'play_audio.wav') });

    for (const [index, image] of images.entries()) {

        // Create scene
        const scene = new FFScene();
        scene.setBgColor("#090909");
        // scene.setTransition("Windows4", 1.5);
        // See if there are audio files for each scene
        let sceneAudio = path.join(projectAudioClipsDir, `${clips[index]['audio']}.wav`)
        scene.addAudio({ path: sceneAudio, loop: false, start: 0 })
        let sceneDuration = 3
        if (fs.existsSync(sceneAudio)) {
            console.log("Adding audio to scene", sceneAudio)
            sceneDuration = await getDurationFromFile(sceneAudio)
            console.log(`Scene ${index + 1} sceneDuration`, sceneDuration)
        }
        scene.setDuration(sceneDuration);

        // Create Text
        const sceneText = new FFText({ text: clips[index]['text'].replace(/'/gi, ""), x: 10, y: 30 });
        sceneText.setColor("#ffffff");
        sceneText.setBackgroundColor("#00000000");
        sceneText.addEffect("fadeInTop", 1, 1);
        sceneText.setStyle({ wordWrap: true, wordWrapWidth: 600, });
        scene.addChild(sceneText);

        // Create Image and add animation effect
        // console.log("\nAdding Image to scene", image)
        const sceneImage = new FFImage({ path: image.path, x: 0, y: 150, width: 720, height: 960 });
        sceneImage.addEffect("fadeIn", 1, 0.5);
        sceneImage.addEffect("fadeOut", 1, sceneDuration - 0.5);
        scene.addChild(sceneImage);
        // scene.setTransition('InvertedPageCurl', 1.5);

        creator.addChild(scene);
    }

    creator.start();
    creator.closeLog();

    creator.on('start', () => {
        console.log(`FFCreator start`);
    });
    creator.on('error', e => {
        console.log(`FFCreator error: ${JSON.stringify(e)}`);
    });
    creator.on('progress', e => {
        console.log(`FFCreator progress: ${e.state} ${(e.percent * 100) >> 0}%`);
    });
    creator.on('complete', e => {
        console.log(`FFCreator completed: \n USEAGE: ${e.useage} \n PATH: ${e.output} `);
    });

}

module.exports = { generatePlayVideo }