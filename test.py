server_public_key = '123456'
quarter_length = len(server_public_key) // 4
parts = [
    server_public_key[i:i + quarter_length] for i in range(0, len(server_public_key), quarter_length)
]
parts.append(server_public_key[3 * quarter_length:])
print(parts)
