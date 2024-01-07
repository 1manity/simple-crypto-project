var secretButton = document.querySelector('.encrypt')
var secretButton2 = document.querySelector('.decrypt')

document.querySelector('.n').value = n
document.querySelector('.d').value = d
document.querySelector('.e').value = e

secretButton.addEventListener('click', async function () {
    console.log(document.querySelector('.input').value)
    let message = document.querySelector('.input').value;
    let encryptedMessage = encrypt(message)
    document.querySelector('.output').value = encryptedMessage
    document.querySelector('.n').value = n
    document.querySelector('.d').value = d
    document.querySelector('.e').value = e
})
secretButton2.addEventListener('click', async function () {

    let message = document.querySelector('.output').value;

    let decryptedMessage = decrypt(BigInt(message), document.querySelector('.d').value, document.querySelector('.n').value)
    console.log(decryptedMessage)
    document.querySelector('.input').value = decryptedMessage
})
