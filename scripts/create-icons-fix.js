const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const tabbarDir = '/Users/mcdreamy/Documents/trae_projects/gongchengcang1/apps/mp/src/static/tabbar';

function createSimplePNG(color) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  const width = 81;
  const height = 81;
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8);
  ihdrData.writeUInt8(6, 9);
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);
  
  const ihdrChunk = createChunk('IHDR', ihdrData);
  
  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0);
    for (let x = 0; x < width; x++) {
      const cx = width / 2;
      const cy = height / 2;
      const r = 30;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      
      if (dist < r) {
        rawData.push(color.r, color.g, color.b, 255);
      } else {
        rawData.push(0, 0, 0, 0);
      }
    }
  }
  
  const compressed = zlib.deflateSync(Buffer.from(rawData));
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcData);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc >>> 0, 0);
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function crc32(data) {
  let crc = 0xFFFFFFFF;
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }
  return crc ^ 0xFFFFFFFF;
}

if (!fs.existsSync(tabbarDir)) {
  fs.mkdirSync(tabbarDir, { recursive: true });
}

const grayColor = { r: 134, g: 144, b: 156 };
const blueColor = { r: 22, g: 93, b: 255 };

const icons = [
  { name: 'home.png', color: grayColor },
  { name: 'home-active.png', color: blueColor },
  { name: 'market.png', color: grayColor },
  { name: 'market-active.png', color: blueColor },
  { name: 'order.png', color: grayColor },
  { name: 'order-active.png', color: blueColor },
  { name: 'mine.png', color: grayColor },
  { name: 'mine-active.png', color: blueColor },
];

icons.forEach(icon => {
  const pngData = createSimplePNG(icon.color);
  const filePath = path.join(tabbarDir, icon.name);
  fs.writeFileSync(filePath, pngData);
  console.log(`Created: ${filePath}`);
});

console.log('Done!');
