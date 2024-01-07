let socket = new WebSocket("ws://localhost:8765");

let sharedKey, publicKey, privateKey;

socket.onopen = async function (e) {

    let publicKeyPem = await generateKeyPair();
    console.log("连接服务器成功，发送公钥...", publicKeyPem);
    socket.send(JSON.stringify({type: '00', data: publicKeyPem, sign: MD5(publicKeyPem, 'salt1manityobbly')})); // 发送公钥到服务器
};

socket.onmessage = async function (event) {
    console.log(`[message] 数据接收自服务器: ${event.data}`);

    const encryptedData = JSON.parse(event.data);
    let decryptedKeyParts = [];

    for (const part of ['part1', 'part2', 'part3', 'part4', 'part5', 'part6', 'part7', 'part8', 'part9', 'part10']) {
        const decryptedPart = await decryptWithPrivateKey(encryptedData[part]);
        decryptedKeyParts.push(decryptedPart);
    }

    sharedKey = decryptedKeyParts.join('\n')
    if (MD5(sharedKey, 'salt1manityobbly') !== encryptedData['sign']) {
        console.log('签名验证错误')
        return
    }
    // sharedKey = event.data
    console.log(sharedKey)

};

// let message = "我喜欢上《网络空间安全理论与技术（乙）》课，我愿意接受这1次challenge！";
// let encryptedMessage = await encryptWithPublicKey(publicKey, message);
// console.log(encryptedMessage)
// // 发送加密后的消息到服务器
// socket.send(encryptedMessage);
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