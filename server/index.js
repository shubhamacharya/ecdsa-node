const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const fs = require('fs');
const { secp256k1 } = require('@noble/curves/secp256k1');
const { keccak256 } = require('ethereum-cryptography/keccak');
const { toHex,utf8ToBytes } = require('ethereum-cryptography/utils');

app.use(cors());
app.use(express.json());

app.get("/balance/:address", (req, res) => {
  const balances = JSON.parse(fs.readFileSync('../address.json', { encoding: 'utf-8' }));
  const { address } = req.params;
  const addressJSON = balances[address]
  const balance = addressJSON[Object.keys(addressJSON)] || 0;
  res.send({ balance });
});

app.post("/send", async (req, res) => {
  let balances;
  try {
    balances = JSON.parse(fs.readFileSync('../address.json', { encoding: 'utf-8' }));
  } catch (error) {
    res.send(error)
  }
  const { recovery, hexSig, recipient, amount } = req.body;
  let sig = secp256k1.Signature.fromCompact(hexSig);
  const msg = {
    recipient: recipient,
    amount: parseInt(amount)
  }

  sig.recovery = recovery;
  const hash = keccak256(utf8ToBytes(JSON.stringify(msg)));
  let publicKey = sig.recoverPublicKey(hash).toRawBytes();
  let sender = '0x' + toHex(publicKey.slice(1).slice(-20));

  let senderPK = balances[sender]
  let recipientPK = balances[recipient]

  if (senderPK[Object.keys(senderPK)] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    senderPK[Object.keys(senderPK)] -= amount;
    recipientPK[Object.keys(recipientPK)] += amount;
    fs.writeFileSync('../address.json', JSON.stringify(balances), err => {
      if (err) {
        res.send(err.message)
      }
    });
    res.send({ balance: senderPK[Object.keys(senderPK)] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
