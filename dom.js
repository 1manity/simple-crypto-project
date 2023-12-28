var secretButton = document.querySelector('.secret-button')
secretButton.addEventListener('click', async function () {
    console.log(document.querySelector('.secret-input').value)
    let message = document.querySelector('.secret-input').value;
    let encryptedMessage = await encryptWithPublicKey(publicKey, message);

    console.log(encryptedMessage)
    // 创建JSON对象
    let dataToSend = JSON.stringify({type: '01', encryptedMessage});

    // 发送加密后的消息到服务器
    socket.send(dataToSend);
})
document.getElementById('uploadButton').addEventListener('click', () => {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert("请先选择一个文件");
        return;
    }

    socket.send(JSON.stringify({type: '02', name: file.name}));

    const chunkSize = 190;
    let offset = 0;

    const readNextChunk = async () => {
        const fileReader = new FileReader();
        const nextChunk = file.slice(offset, offset + chunkSize);
        fileReader.onload = async (e) => {
            const fileContent = e.target.result;
            try {
                const encryptedContent = await encryptWithPublicKey(publicKey, fileContent);
                socket.send(JSON.stringify({type: '03', chunk: encryptedContent}));
                offset += chunkSize;
                if (offset < file.size) {
                    await readNextChunk();
                } else {
                    console.log("所有块已发送");
                }
            } catch (error) {
                console.error("加密过程中出现错误:", error);
            }
            console.log(fileContent)

        };
        fileReader.readAsArrayBuffer(nextChunk);
    };

    readNextChunk();
});