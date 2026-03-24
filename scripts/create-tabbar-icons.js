const fs = require('fs');
const path = require('path');

const tabbarDir = path.join(__dirname, 'apps/mp/src/static/tabbar');

// 创建简单的 81x81 PNG 图标 (最小有效PNG)
function createSimplePNG(color) {
  // PNG 文件头
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR chunk (图像头)
  const width = 81;
  const height = 81;
  const bitDepth = 8;
  const colorType = 6; // RGBA
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(bitDepth, 8);
  ihdrData.writeUInt8(colorType, 9);
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace
  
  const ihdrChunk = createChunk('IHDR', ihdrData);
  
  // IDAT chunk (图像数据) - 创建一个简单的纯色图像
  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0); // filter byte
    for (let x = 0; x < width; x++) {
      // 检查是否在圆形区域内
      const cx = width / 2;
      const cy = height / 2;
      const r = 30;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      
      if (dist < r) {
        // 圆内 - 使用指定颜色
        rawData.push(color.r, color.g, color.b, 255);
      } else {
        // 圆外 - 透明
        rawData.push(0, 0, 0, 0);
      }
    }
  }
  
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(Buffer.from(rawData));
  const idatChunk = createChunk('IDAT', compressed);
  
  // IEND chunk
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

// CRC32 计算
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

// 确保目录存在
if (!fs.existsSync(tabbarDir)) {
  fs.mkdirSync(tabbarDir, { recursive: true });
}

// 定义图标颜色
const grayColor = { r: 134, g: 144, b: 156 }; // #86909c
const blueColor = { r: 22, g: 93, b: 255 };   // #165dff

// 创建图标
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
  fs.writeFileSync(path.join(tabbarDir, icon.name), pngData);
  console.log(`Created: ${icon.name}`);
});

console.log('All tabbar icons created successfully!');
