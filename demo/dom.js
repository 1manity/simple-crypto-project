var secretButton = document.querySelector('.encrypt')
var secretButton2 = document.querySelector('.decrypt')

secretButton.addEventListener('click', async function () {
    console.log(document.querySelector('.input').value)
    let message = document.querySelector('.input').value;
    let encryptedMessage = encrypt(message)
    document.querySelector('.output').value = encryptedMessage
})
secretButton2.addEventListener('click', async function () {
    console.log(document.querySelector('.output').value)
    let message = document.querySelector('.output').value;

    let decryptedMessage = decrypt(BigInt(message))
    document.querySelector('.input').value = decryptedMessage
})
