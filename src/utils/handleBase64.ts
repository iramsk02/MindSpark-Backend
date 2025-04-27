// import fs from 'fs/promises';
// import path from 'path';
// import { exec } from 'child_process';
// import cloudinary from './cloudinary';

// const saveBase64ToFile = async (base64Data: string, filePath: string) => {
//   const base64String = base64Data.split(';base64,').pop();
//   await fs.writeFile(filePath, base64String!, { encoding: 'base64' });
// };

// export const handleBase64VideoWithSubtitles = async (
//   base64Video: string,
//   language: string = 'hi',
//   videoId?: string
// ): Promise<string | undefined> => {
//   const videoName = `temp_${Date.now()}.mp4`;
//   const videoPath = path.join(__dirname, '../../temp', videoName);
//   const srtPath = path.join(__dirname, '../../temp', `sub_${Date.now()}.vtt`);

//   try {
//     // 1. Save video
//     await saveBase64ToFile(base64Video, videoPath);

//     // 2. Generate subtitles using Python
//     await new Promise<void>((resolve, reject) => {
//       const command = `python3 ./src/controllers/generatesubs.py "${videoPath}" "${language}" "${srtPath}" --output_format vtt`;
//       exec(command, (err, stdout, stderr) => {
//         if (err) {
//           console.error("Python script error:", stderr);
//           return reject(err);
//         }
//         resolve();
//       });
//     });

//     // 3. Read subtitle content
//     const subtitleContent = await fs.readFile(srtPath, 'utf-8');

//     // 4. Upload to Cloudinary as raw file
//     // const uploadedsubtitles = await cloudinary.uploader.upload(srtPath, {
//     //   resource_type: "raw",
//     //   folder: "course-subtitles",
//     // });

//     // 4. Save subtitles to MongoDB



//     // 5. Cleanup
//     await fs.unlink(videoPath);
//     await fs.unlink(srtPath);

//     return subtitleContent// You can also return saved.content or saved
//   } catch (error) {
//     console.error('Subtitle generation error:', error);
//     return undefined;
//   }
// // };
import fs from 'fs/promises';
import path from 'path';
import cloudinary from './cloudinary';
import { exec } from 'child_process';

const saveBase64ToFile = async (base64Data: string, filePath: string) => {
  const base64String = base64Data.split(';base64,').pop();
  await fs.writeFile(filePath, base64String!, { encoding: 'base64' });
};

export const handleBase64VideoWithDubbing = async (
  base64Video: string,
  language: string = 'hi',
  videoId?: string
): Promise<string | undefined> => {
  const tempId = Date.now();
  const videoName = `temp_${tempId}.mp4`;
  const videoPath = path.join(__dirname, '../../temp', videoName);
  const srtPath = path.join(__dirname, '../../temp', `sub_${tempId}.vtt`);
  const audioPath = path.join(__dirname, '../../temp', `dub_${tempId}.mp3`);
  const finalVideoPath = path.join(__dirname, '../../temp', `final_${tempId}.mp4`);

  try {
    // 1. Save video to file
    await saveBase64ToFile(base64Video, videoPath);

    // 2. Generate subtitles + TTS dubbed audio (Python)
    await new Promise<void>((resolve, reject) => {
      const command = `python3 ./src/controllers/generate_dubbed_audio.py "${videoPath}" "${language}" "${srtPath}" "${audioPath}"`;
      exec(command, (err, stdout, stderr) => {
        if (err) {
          console.error("Python script error:", stderr);
          return reject(err);
        }
        console.log(stdout);
        resolve();
      });
    });

    // 3. Replace original audio with dubbed audio using FFmpeg
    await new Promise<void>((resolve, reject) => {
      const command = `ffmpeg -y -i "${videoPath}" -i "${audioPath}" -c:v copy -map 0:v:0 -map 1:a:0 -shortest "${finalVideoPath}"`;
      exec(command, (err, stdout, stderr) => {
        if (err) {
          console.error("FFmpeg error while merging audio:", stderr);
          return reject(err);
        }
        console.log("Merged dubbed audio into video");
        resolve();
      });
    });

    // 4. Upload final video to Cloudinary (optional)
    const uploadedVideo = await cloudinary.uploader.upload(finalVideoPath, {
      resource_type: 'video',
      folder: 'dubbed-videos',
    });

    // 5. Cleanup temp files
    await fs.unlink(videoPath);
    await fs.unlink(audioPath);
    await fs.unlink(finalVideoPath);
    await fs.unlink(srtPath);

    return uploadedVideo.secure_url;
  } catch (error) {
    console.error('🎥 Dubbing video error:', error);
    return undefined;
  }
};
