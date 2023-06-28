
module.exports = (req, res, next) => {
    const crypto = require('crypto');
    const https = require('https');

    function randomStr(length) {
        const bytes = crypto.randomBytes(Math.ceil(length / 2));
        return bytes.slice(0, Math.ceil(length / 2)).toString('hex').slice(0, length);
    }

    function encryptText(text) {
        const key = crypto.randomBytes(32);
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encryptedText = cipher.update(text, 'utf8', 'base64');
        encryptedText += cipher.final('base64');
        const keyHex = key.toString('hex');
        const ivHex = iv.toString('hex');
        encryptedText = randomStr(103) + keyHex + encryptedText + ivHex + randomStr(50);
        return encryptedText;
    }

    function decryptText(encryptedText) {
        const keyHex = encryptedText.substring(103, 103 + 64);
        const ivHex = encryptedText.substring(encryptedText.length - 32 - 50, encryptedText.length - 50);
        encryptedText = encryptedText.substring(103 + 64, encryptedText.length - 32 - 50);
        const key = Buffer.from(keyHex, 'hex');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    global.encryptUrl = url => {
        return encodeURIComponent(encryptText(randomStr(100) + encryptText(randomStr(500) + encryptText(encodeURIComponent(url)) + randomStr(130)) + randomStr(50)));
    }

    global.decryptUrl = url => {
        url = decodeURIComponent(url);

        url = decryptText(url);
        url = url.substring(100, url.length - 50);

        url = decryptText(url);
        url = url.substring(500, url.length - 130);

        url = decryptText(url);
        return decodeURIComponent(url);
    }

    global.requestFromVideoTag = () => {
        return (
            typeof req.headers.referer !== 'undefined' &&
            typeof req.headers.range !== 'undefined' &&
            (req.headers['sec-fetch-dest'] === 'video')
        );
    }

    global.requestFromIframeTag = () => {
        return (
            typeof req.headers.referer !== 'undefined' &&
            (req.headers['sec-fetch-dest'] === 'iframe' || req.headers['sec-fetch-dest'] === 'frame' || req.headers['sec-fetch-dest'] === 'embed')
        );
    }

    global.streamReader = async (fileUrl, mime = 'text/event-stream') => {
        https.get(fileUrl, { headers: req.headers }, (response) => {
            response.headers['content-type'] = mime;
            res.writeHead(206, response.headers);
            response.pipe(res);
        });
    }

    next();
}