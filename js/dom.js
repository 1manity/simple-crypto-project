var secretButton = document.querySelector('.secret-button')
var progressBar = document.querySelector('.progressBar')


secretButton.addEventListener('click', async function () {
    console.log(document.querySelector('.secret-input').value)
    let message = document.querySelector('.secret-input').value;
    let encryptedMessage = await encryptWithPublicKey(sharedKey, message);

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
    progressBar.style.width = `0%`;
    const readNextChunk = async () => {
        const fileReader = new FileReader();
        const nextChunk = file.slice(offset, offset + chunkSize);
        fileReader.onload = async (e) => {
            const fileContent = e.target.result;
            try {
                const encryptedContent = await encryptWithPublicKey(sharedKey, fileContent);
                socket.send(JSON.stringify({type: '03', chunk: encryptedContent}));
                offset += chunkSize;
                if (offset < file.size) {
                    await readNextChunk();
                } else {
                    console.log("所有块已发送");
                }
                const progressPercent = offset > file.size ? 100 : (offset / file.size) * 100;
                progressBar.style.width = `${progressPercent}%`;
                console.log(progressPercent)
            } catch (error) {
                console.error("加密过程中出现错误:", error);
            }
            console.log(fileContent)

        };
        fileReader.readAsArrayBuffer(nextChunk);
    };

    readNextChunk();
});

document.getElementById('fileInput').addEventListener('change', function (e) {
    document.querySelector('.file-label').innerHTML = e.target.files[0].name
    progressBar.style.width = `0%`;
    // 更新标签以显示文件名或执行其他操作
});
