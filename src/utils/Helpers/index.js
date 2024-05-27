const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

const { readdirSync } = require("fs");
const Jimp = require("jimp");

const resizeImage = async (imagePath, width, height) => {
    try {
        const image = await Jimp.read(imagePath);
        return image
            .quality(90)
            .resize(width, height)
            .write(imagePath);
    } catch (error) {
        console.error(error);
    }
};

const bulkResizeImages = async (imagesDir, width, height) => {
    try {
        const images = readdirSync(imagesDir);
        images.forEach(async (image) => {
            const imagePath = path.join(imagesDir, image);
            await resizeImage(imagePath, width, height);
        });
    } catch (error) {
        console.error(error);
    }
}

const joinAudioClips = async (clips = [], outputDir = "", fileName) => new Promise((resolve, reject) => {
    console.log("joinAudioClips::clips", clips)
    console.log("joinAudioClips::fileName", fileName)
    console.log("joinAudioClips::outputDir", outputDir)
    let merger = ffmpeg()
    clips.forEach(clip => merger.input(clip))
    merger
        .on('error', (err) => reject('An error occurred: ' + err.message))
        .on('end', () => resolve(path.resolve(outputDir, `${fileName}.wav`)))
        .audioCodec('pcm_s16le').audioFrequency(16000).audioChannels(1)
        .mergeToFile(outputDir + `/${fileName}.wav`, outputDir)
})

const mergeAudio = async (audio, music, output) => {

    return new Promise((resolve, reject) => {
        let mixer = ffmpeg()
        mixer.input(audio).input(music)
            .complexFilter([
                "[0:a]volume=0.9[a0];[1:a]volume=0.1[a1];[a0][a1]amix=inputs=2:duration=longest"
            ])
            .on('error', (err) => reject('An error occurred: ' + err.message))
            .on('end', () => resolve(output))
            .audioCodec('pcm_s16le').audioFrequency(16000).audioChannels(1)
            .saveToFile(output);

    });
}

const getDurationFromFile = (File) => new Promise((resolve, reject) => ffmpeg.ffprobe(File, (err, metadata) => {
    if (err) reject(err);
    resolve(metadata.format.duration);
})
);

const getAllMatchingNodes = (obj = {}, key = "", array = []) => {
    array = array || [];
    if ('object' === typeof obj) {
        for (let k in obj) {
            if (k === key) {
                array.push(obj[k]);
            } else {
                getAllMatchingNodes(obj[k], key, array);
            }
        }
    }
    return array;
}

module.exports = {
    resizeImage,
    bulkResizeImages,
    mergeAudio,
    joinAudioClips,
    getDurationFromFile,
    getAllMatchingNodes,
}