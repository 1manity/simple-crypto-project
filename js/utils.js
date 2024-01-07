function MD5(str, slat) {
    if (!!slat) {
        // 拼接slat
        str = str.concat(slat)
    }
    // MD5加密后，转成字符串
    return md5(str).toString();
}

async function encryptWithPublicKey(publicKeyPem, message) {
    console.log(pemToArrayBuffer(publicKeyPem))
    const publicKey = await window.crypto.subtle.importKey(
        "spki",
        pemToArrayBuffer(publicKeyPem),
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        false,
        ["encrypt"]
    );
    let arrayBuffer
    if (message instanceof ArrayBuffer) {
        arrayBuffer = new Uint8Array(message);
    } else if (typeof message === "string") {
        arrayBuffer = new TextEncoder().encode(message);
    } else {
        throw new Error("Message must be a string or ArrayBuffer");
    }
    console.log(arrayBuffer)
    try {
        const encrypted = await window.crypto.subtle.encrypt(
            {name: "RSA-OAEP"},
            publicKey,
            arrayBuffer
        );
        return window.btoa(String.fromCharCode(...new Uint8Array(encrypted)));
    } catch (e) {
        console.log(e)
    }
}

// ArrayBuffer转Base64字符串
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function pemToArrayBuffer(pem) {

    const b64Lines = pem.split('\n').slice(1, -2).join('');
    console.log(b64Lines)
    const binaryString = window.atob(b64Lines);
    const length = binaryString.length;
    const arrayBuffer = new ArrayBuffer(length);
    const array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < length; i++) {
        array[i] = binaryString.charCodeAt(i);
    }
    return arrayBuffer;
}

async function generateKeyPair() {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048, // 可以是 1024、2048 或 4096
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true, // 是否可提取密钥
        ["encrypt", "decrypt"] // 使用密钥的操作
    );

    publicKey = keyPair.publicKey;
    privateKey = keyPair.privateKey;

    // 导出公钥为spki格式
    const exportedPublicKey = await window.crypto.subtle.exportKey("spki", publicKey);
    // 将ArrayBuffer转换为Base64编码字符串
    const exportedAsBase64 = arrayBufferToBase64(exportedPublicKey);
    // 将Base64字符串转换为PEM格式
    const pemExportedPublicKey = `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64}\n-----END PUBLIC KEY-----`;

    return pemExportedPublicKey;
}

async function decryptWithPrivateKey(encryptedText) {
    // 假设 privateKey 是已经加载的客户端私钥
    let decryptedData;
    try {
        const encryptedData = window.atob(encryptedText); // Base64解码
        const encryptedBuffer = new Uint8Array(encryptedData.split('').map(char => char.charCodeAt(0)));

        decryptedData = await window.crypto.subtle.decrypt(
            {
                name: "RSA-OAEP",
                hash: {name: "SHA-256"}
            },
            privateKey, // 客户端的私钥
            encryptedBuffer
        );

        return new TextDecoder().decode(decryptedData);
    } catch (e) {
        console.error('解密失败:', e);
    }
}