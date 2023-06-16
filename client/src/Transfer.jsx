import { useState } from "react";
import { secp256k1 } from "@noble/curves/secp256k1";
import * as keccak from "ethereum-cryptography/keccak";
import * as utils from "ethereum-cryptography/utils";
import server from "./server";
import addressJSON from "../../address.json";

function Transfer({ address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();
    
    const msg = {
      recipient: recipient,
      amount: parseInt(sendAmount),
    };

    const hash = keccak.keccak256(utils.utf8ToBytes(JSON.stringify(msg)));
    
    const signature = secp256k1.sign(
      hash,
      Object.keys(addressJSON[address])[0].slice(2),
      { recovery: true }
    );

    let hexSig = signature.toCompactHex();
      
    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        hexSig,
        recovery: signature['recovery'],
        amount: parseInt(sendAmount),
        recipient,
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
