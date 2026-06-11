const { Jimp } = require('jimp');
const fs = require('fs');

async function processImage() {
    try {
        const imgPath = 'c:/Users/Acer/OneDrive/Desktop/MiniProject/frontend/src/assets/aec_logo.png';
        const image = await Jimp.read(imgPath);

        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            var red = this.bitmap.data[idx + 0];
            var green = this.bitmap.data[idx + 1];
            var blue = this.bitmap.data[idx + 2];

            if (red > 240 && green > 240 && blue > 240) {
                this.bitmap.data[idx + 3] = 0; // Set alpha to 0
            }
        });

        const outPath = 'c:/Users/Acer/OneDrive/Desktop/MiniProject/frontend/src/assets/aec_logo_transparent.png';
        await image.write(outPath);
        console.log("Image processed successfully");
    } catch (err) {
        console.error(err);
    }
}

processImage();
