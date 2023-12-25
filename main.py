import base64
import json

from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes

import asyncio
import websockets

# 生成密钥对
private_key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=2048,
    backend=default_backend()
)
public_key = private_key.public_key()

# 导出公钥为PEM格式
public_key_pem = public_key.public_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PublicFormat.SubjectPublicKeyInfo
)

# 导出私钥为PEM格式（用于服务器端解密，应安全存储）
private_key_pem = private_key.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.PKCS8,
    encryption_algorithm=serialization.NoEncryption()
)


async def handle_client(websocket, path):
    # 发送公钥给客户端
    decrypted_message = ''
    await websocket.send(public_key_pem.decode('utf-8'))
    print("公钥已发送至客户端。")
    output_file_name = ''
    try:
        while True:  # 持续监听
            # 接收加密的消息
            encrypted_message = await websocket.recv()
            print(encrypted_message)
            data = json.loads(encrypted_message)

            if data["type"] == "01":
                encrypted_message_base64 = data["encryptedMessage"]
                encrypted_message_bytes = base64.b64decode(encrypted_message_base64)

                print(f"收到加密消息: {encrypted_message_bytes}")
                # 解密消息
                try:
                    decrypted_message = private_key.decrypt(
                        encrypted_message_bytes,
                        padding.OAEP(
                            mgf=padding.MGF1(algorithm=hashes.SHA256()),
                            algorithm=hashes.SHA256(),
                            label=None
                        )
                    )
                    print(f"解密后的消息: {decrypted_message.decode('utf-8')}")
                except Exception as e:
                    print(f"解密失败: {e}")

            elif data["type"] == "02":
                name = data["name"]

                # 解密消息
                try:
                    output_file_name = './output/' + name

                    with open(output_file_name, 'w') as file:
                        pass

                    print("创建文件成功!")

                except Exception as e:
                    print(f"创建文件失败: {e}")

            elif data["type"] == "03":
                encrypted_message_base64 = data["chunk"]

                encrypted_message_bytes = base64.b64decode(encrypted_message_base64)

                print(f"收到加密消息: {encrypted_message_bytes}")
                # 解密消息
                try:
                    decrypted_message = private_key.decrypt(
                        encrypted_message_bytes,
                        padding.OAEP(
                            mgf=padding.MGF1(algorithm=hashes.SHA256()),
                            algorithm=hashes.SHA256(),
                            label=None
                        )
                    )
                    # 追加写入解密后的数据到文件
                    with open(output_file_name, 'ab+') as file:
                        file.write(decrypted_message)
                    print(f"导入文件成功")

                except Exception as e:
                    print(f"解密失败: {e}")

    except websockets.exceptions.ConnectionClosed as e:
        print(f"连接关闭: {e}")

    except Exception as e:
        print(f"发生错误: {e}")


# 启动WebSocket服务器
start_server = websockets.serve(handle_client, "localhost", 8765)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()