const { secp256k1 } = require('ethereum-cryptography/secp256k1');
const { toHex } = require('ethereum-cryptography/utils');
const fs = require('fs');

const generateAddress = (limit) => {
    let address = {}
    for (let index = 0; index < limit; index++) {
        let pk = {}
        const privateKey = secp256k1.utils.randomPrivateKey();
        const publicKey = secp256k1.getPublicKey(privateKey);
        const walletAddress = '0x'+toHex(publicKey.slice(1).slice(-20));
        pk['0x'+toHex(privateKey)] = Math.floor(Math.random() * 100);
        address[walletAddress] = pk;
    }
    return { address };
}

async function storeAddressInFile() {
    const { address } = generateAddress(3);
    fs.writeFileSync('../address.json', JSON.stringify(address), 'utf-8')
}

storeAddressInFile();