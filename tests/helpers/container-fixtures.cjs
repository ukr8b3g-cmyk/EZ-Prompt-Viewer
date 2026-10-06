const zlib = require("node:zlib");
const u32=(v,le=false)=>{const b=Buffer.alloc(4);le?b.writeUInt32LE(v):b.writeUInt32BE(v);return b};
const u16=(v,le=false)=>{const b=Buffer.alloc(2);le?b.writeUInt16LE(v):b.writeUInt16BE(v);return b};
const crc32=b=>{let r=0xffffffff;for(const v of b){r^=v;for(let i=0;i<8;i++)r=(r>>>1)^((r&1)?0xedb88320:0)}return (r^0xffffffff)>>>0};
const pngChunk=(name,payload)=>{const data=Buffer.concat([Buffer.from(name),payload]);return Buffer.concat([u32(payload.length),data,u32(crc32(data))])};
const png=(key,payload)=>Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),pngChunk('IHDR',Buffer.from('00000001000000010806000000','hex')),...(key===null?[]:[pngChunk('tEXt',Buffer.concat([Buffer.from(key+'\0'),payload]))]),pngChunk('IDAT',zlib.deflateSync(Buffer.from([0,0,0,0,255]))),pngChunk('IEND',Buffer.alloc(0))]);
const jpeg=(marker,payload)=>Buffer.concat([Buffer.from([255,216,255,marker]),u16(payload.length+2),payload,Buffer.from([255,217])]);
const webp=(name,payload)=>{const chunks=Buffer.concat([Buffer.from(name),u32(payload.length,true),payload,payload.length%2?Buffer.alloc(1):Buffer.alloc(0)]);return Buffer.concat([Buffer.from('RIFF'),u32(4+chunks.length,true),Buffer.from('WEBP'),chunks])};
const box=(name,payload)=>Buffer.concat([u32(8+payload.length),Buffer.from(name),payload]);
const avif=payload=>Buffer.concat([box('ftyp',Buffer.from('avif\0\0\0\0avif')),box('mime',payload)]);
const enc=(s,e)=>{const b=Buffer.from(s,e==='utf16be'?'utf16le':e);return e==='utf16be'?b.swap16():b};
const graph=text=>({'1':{class_type:'CLIPTextEncode',inputs:{text}},'2':{class_type:'KSampler',inputs:{positive:['1',0],steps:20}}});
const exif=(text,encoding,little=true,bom=false)=>{const body=enc(text,encoding);const prefix=Buffer.from(encoding.startsWith('utf16')?'UNICODE\0':'ASCII\0\0\0');const comment=Buffer.concat([prefix,bom?Buffer.from(encoding==='utf16be'?[254,255]:[255,254]):Buffer.alloc(0),body]);const head=Buffer.concat([Buffer.from(little?'II':'MM'),u16(42,little),u32(8,little)]);const ifd0=Buffer.concat([u16(1,little),u16(0x8769,little),u16(4,little),u32(1,little),u32(26,little),u32(0,little)]);const ifd1=Buffer.concat([u16(1,little),u16(0x9286,little),u16(7,little),u32(comment.length,little),u32(44,little),u32(0,little)]);return Buffer.concat([Buffer.from('Exif\0\0'),head,ifd0,ifd1,comment])};

module.exports = {png,jpeg,webp,avif,enc,exif,graph};
