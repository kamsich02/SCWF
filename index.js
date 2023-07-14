const { ethers } = require("ethers");
const BN = require('bn.js');
const dotenv = require('dotenv');
dotenv.config();


const privKey = process.env.PK; // Your private key
const fromAddress = process.env.FA; // Your wallet address
const toAddress = process.env.TA; // The recipient's wallet address

const provider = new ethers.JsonRpcProvider(process.env.RPC);
let wallet = new ethers.Wallet(privKey, provider);

async function sendTransaction() {
  let balance = await provider.getBalance(fromAddress);

  while (true) {
    try {
        if (balance.toString() === '0') {
        console.log(
          "Insufficient balance in your account, waiting for balance..."
        );
        await new Promise((resolve) => setTimeout(resolve, 5000));
        balance = await provider.getBalance(fromAddress);
        continue;
      }

      const dummytransaction = {
        to: toAddress,
        value: balance, // The amount to send
      };
      
      const gasLimit = await provider.estimateGas(dummytransaction);
      const GasPrice = (await provider.getFeeData()).gasPrice;
      const transactionCost = gasLimit * GasPrice;
      const amountToSend = balance - (transactionCost);
      if (amountToSend >= balance) {
        console.log("enough to send")
        const transactionCount = await provider.getTransactionCount(fromAddress);

        let transaction = {
          nonce: transactionCount,
          to: toAddress,
          value: amountToSend, // The amount to send
        };
  
        // Send the transaction
        let tx = await wallet.sendTransaction(transaction);
  
        console.log(`Transaction hash: ${tx.hash}`);
      } else {
        console.log("not enough to send")
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
      balance = await provider.getBalance(fromAddress);
    } catch (error) {
      console.error("An error occurred:", error);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

sendTransaction();
