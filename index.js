const { ethers } = require("ethers");
const BN = require("bn.js");
const dotenv = require("dotenv");
dotenv.config();

const privKey = process.env.PK; // Your private key
const fromAddress = process.env.FA; // Your wallet address
const toAddress = process.env.TA; // The recipient's wallet address
const dummyToAddress = process.env.DTA; // Dummy transaction recipient's address

const provider = new ethers.JsonRpcProvider(process.env.RPC);
let wallet = new ethers.Wallet(privKey, provider);

async function sendMainTransaction() {
  let balance = await provider.getBalance(fromAddress);

      if (balance.toString() === "0") {
        console.log(
          "Insufficient balance in your account, waiting for balance..."
        );
        return false;
      }

      const dummytransaction = {
        to: toAddress,
        value: balance, // The amount to send
      };

      const gasLimit = await provider.estimateGas(dummytransaction);
      const GasPrice = (await provider.getFeeData()).maxFeePerGas;
      const Gasx = (await provider.getFeeData()).gasPrice;
      const transactionCost = gasLimit * GasPrice;
      const transactionx = gasLimit * Gasx;
      const amountToSend = balance - transactionCost;
      const amountx = balance - transactionx;

      let transactionCount = await provider.getTransactionCount(fromAddress);
      let tx;

      if (amountToSend > 0) {
        console.log("enough to send with normal Gas");
        transactionCount = await provider.getTransactionCount(fromAddress);
        let transaction = {
          nonce: transactionCount,
          to: toAddress,
          value: amountToSend, // The amount to send
          gasPrice: GasPrice,
        };
        // Send the transaction
        tx = await wallet.sendTransaction(transaction);
        console.log(`Transaction hash: ${tx.hash}`);
        return tx;
      } else if (amountx > 0) {
          console.log("enough to send with low Gas");
          transactionCount = await provider.getTransactionCount(fromAddress);
          let transaction = {
            nonce: transactionCount,
            to: toAddress,
            value: amountx, // The amount to send
            gasPrice: Gasx,
          };
          // Send the transaction
          tx = await wallet.sendTransaction(transaction);
          console.log(`Transaction hash: ${tx.hash}`);
          return tx;
        } else {
          console.log("not enough to send with low or high Gas");
          return false;
        }
}

async function sendDummyTransactions(txn) {
  if (txn) {
    let txcount = await provider.getTransactionCount(fromAddress);
    while (true) {
      txcount += 1;
      let dummyTx = {
        nonce: txcount,
        to: dummyToAddress,
        value: "0",
      };
      try {
        let dummyTransaction = await wallet.sendTransaction(dummyTx);
        console.log(`Dummy transaction hash: ${dummyTransaction.hash}`);
        let receipt = await provider.getTransactionReceipt(txn.hash);
        if (receipt.status > 0) {
          console.log(`Main transaction was confirmed in block ${receipt.blockNumber}`);
          break;
        }
      } catch (error) {
        console.error("An error occurred while sending dummy transactions:", error);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }
}

async function run() {
  while (true) {
    let tx = await sendMainTransaction();
    await sendDummyTransactions(tx);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

run();
