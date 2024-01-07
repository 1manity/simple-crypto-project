function gcd(a, b) {
    while (b !== BigInt(0)) {
        let t = b;
        b = a % b;
        a = t;
    }
    return a;
}

function extendedGCD(a, b) {
    if (a === BigInt(0)) {
        return [b, BigInt(0), BigInt(1)];
    } else {
        let [g, y, x] = extendedGCD(b % a, a);
        return [g, x - (b / a) * y, y];
    }
}

function modInverse(e, phi) {
    let [g, x] = extendedGCD(e, phi);
    if (g !== BigInt(1)) {
        throw new Error('Inverse does not exist');
    } else {
        return (x % phi + phi) % phi; // 确保结果为正
    }
}

function isPrime(num) {
    for (let i = BigInt(2); i <= num / i; i++) {
        if (num % i === BigInt(0)) return false;
    }
    return num > BigInt(1);
}

function isProbablePrime(n, k = 5) { // 默认做5次测试
    if (n === BigInt(2) || n === BigInt(3)) return true;
    if (n % BigInt(2) === BigInt(0)) return false;

    let s = BigInt(0);
    let d = n - BigInt(1);
    while (d % BigInt(2) === BigInt(0)) {
        d /= BigInt(2);
        s += BigInt(1);
    }

    WitnessLoop: do {
        const a = BigInt(2) + BigInt(Math.floor(Math.random() * Number(n - 3n))) + BigInt(1);
        let x = modularExponentiation(a, d, n);
        if (x === BigInt(1) || x === n - BigInt(1)) continue;

        for (let i = BigInt(1); i < s; i++) {
            x = (x * x) % n;
            if (x === BigInt(1)) return false;
            if (x === n - BigInt(1)) continue WitnessLoop;
        }

        return false;
    } while (--k > 0)

    return true;
}

function generateLargePrime(length) {
    let foundPrime = false;
    let primeCandidate;

    while (!foundPrime) {
        let randomNumber = '';
        for (let i = 0; i < length; i++) {
            randomNumber += Math.floor(Math.random() * 10).toString();
        }
        primeCandidate = BigInt(randomNumber) | BigInt(1);

        if (isProbablePrime(primeCandidate)) foundPrime = true;
    }

    return primeCandidate;
}


function rsaEncrypt(m, e, n) {
    return modularExponentiation(BigInt(m), BigInt(e), BigInt(n));
}

function modularExponentiation(base, exponent, modulus) {
    if (modulus === BigInt(1)) return BigInt(0);
    var result = BigInt(1);
    base = base % modulus;
    while (exponent > BigInt(0)) {
        if (exponent % BigInt(2) === BigInt(1)) {
            result = (result * base) % modulus;
        }
        exponent = exponent / BigInt(2);
        base = (base * base) % modulus;
    }
    return result;
}

function rsaDecrypt(c, d, n) {
    return modularExponentiation(BigInt(c), BigInt(d), BigInt(n));
}

function stringToBigInt(str) {
    let result = '';
    for (let i = 0; i < str.length; i++) {

        let code = str.charCodeAt(i).toString();

        while (code.length < 6) {
            code = '0' + code;
        }
        result += code;
    }
    return BigInt(result);
}

function bigIntToString(bigInt) {

    let str = bigInt.toString(); // 将BigInt转换为字符串
    while (str.length % 6 !== 0) {
        str = '0' + str;
    }
    let result = '';
    for (let i = 0; i < str.length; i += 6) {
        // 每三个数字为一组，转换回字符
        let code = str.substring(i, i + 6);
        result += String.fromCharCode(parseInt(code, 10));
    }
    return result;
}


let p = generateLargePrime(155);
let q = generateLargePrime(155);
while (q === p) {
    q = generatePrimeCandidate(3);
}
console.log('success')
let n = p * q;
let phi = (p - BigInt(1)) * (q - BigInt(1));

// 选择 e
let e = generateLargePrime(155);
while (gcd(phi, e) !== BigInt(1)) {
    e++;
}

let d = modInverse(e, phi);

// 测试加密和解密
let message = '我喜欢上《网络空间安全理论与技术（乙）》课，我愿意接受这1次challenge！'
let encryptMessage = BigInt(stringToBigInt(message)); // 明文
let encrypted = rsaEncrypt(encryptMessage, e, n);
let decrypted = rsaDecrypt(encrypted, d, n);
let deMessage = bigIntToString(decrypted)
console.log(`p: ${p}, q: ${q}, n: ${n}, e: ${e}, d: ${d}`);
console.log(`明文: ${message}`);
console.log(`加密后: ${encrypted}`);
console.log(`解密后: ${deMessage}`);

function encrypt(message) {
    return rsaEncrypt(BigInt(stringToBigInt(message)), e, n);
}

function decrypt(encrypted, d, n) {
    return bigIntToString(rsaDecrypt(encrypted, d, n));
}
