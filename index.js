const url = require('url');
const querystring = require('querystring');
const crypto = require('crypto')

function parseTotpUrl(totpUrl) {
  const parsedUrl = url.parse(totpUrl);
  const queryParams = querystring.parse(parsedUrl.query);

  const secret = queryParams.secret;
  return secret;
}

const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Decode(input) {
  let buffer = '';
  for (let i = 0; i < input.length; i++) {
    const val = base32Chars.indexOf(input.charAt(i).toUpperCase());
    if (val === -1) throw new Error('Invalid character found');
    buffer += val.toString(2).padStart(5, '0');
  }

  let bytes = [];
  for (let i = 0; i + 8 <= buffer.length; i += 8) {
    bytes.push(parseInt(buffer.substr(i, 8), 2));
  }
  
  return Buffer.from(bytes);
}

function generateTOTP(secret) {
  const decodedSecret = base32Decode(secret);
  const epoch = Math.floor(Date.now() / 1000);
  const timeStep = Math.floor(epoch / 30);

  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeUInt32BE(timeStep, 4);

  const hmac = crypto.createHmac('sha1', decodedSecret).update(timeBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1000000;

  return code.toString().padStart(6, '0');
}

//Replace this with your TOTP URL
const totpUrl = "otpauth://totp/Test%20Token?secret=2FASTEST&issuer=2FAS";
const secret = parseTotpUrl(totpUrl);
const totpCode = generateTOTP(secret);

console.log("TOTP Code:", totpCode);