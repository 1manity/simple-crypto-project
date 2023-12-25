async function encryptWithPublicKey(publicKeyPem, message) {
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

function pemToArrayBuffer(pem) {
    const b64Lines = pem.split('\n').slice(1, -2).join('');
    const binaryString = window.atob(b64Lines);
    const length = binaryString.length;
    const arrayBuffer = new ArrayBuffer(length);
    const array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < length; i++) {
        array[i] = binaryString.charCodeAt(i);
    }
    return arrayBuffer;
}

let socket = new WebSocket("ws://localhost:8765");

let publicKey;

socket.onopen = function (e) {
    console.log("连接服务器成功，等待服务器发送公钥...");
};

socket.onmessage = async function (event) {
    console.log(`[message] 数据接收自服务器: ${event.data}`);

    publicKey = event.data;
    // let message = "我喜欢上《网络空间安全理论与技术（乙）》课，我愿意接受这1次challenge！";
    // let encryptedMessage = await encryptWithPublicKey(publicKey, message);
    // console.log(encryptedMessage)
    // // 发送加密后的消息到服务器
    // socket.send(encryptedMessage);
};

socket.onclose = function (event) {
    if (event.wasClean) {
        console.log(`[close] 连接关闭，代码: ${event.code} 原因: ${event.reason}`);
    } else {
        console.log('[close] 连接意外断开');
    }
};

socket.onerror = function (error) {
    console.log(`[error] ${error.message}`);
};