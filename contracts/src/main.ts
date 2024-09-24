import {
  Field,
  Mina,
  PrivateKey,
  AccountUpdate,
  MerkleTree,
  Poseidon,
  UInt64,

} from 'o1js';
import { ProductContract, ProductInfoWitness, SaleHistoryWitness } from './ProductContract.js';
async function main() {

  const useProof = true;

  const Local = await Mina.LocalBlockchain({ proofsEnabled: useProof });
  Mina.setActiveInstance(Local);

  const deployerAccount = Local.testAccounts[0];
  const deployerKey = deployerAccount.key;

  const originalSellerAccount = deployerAccount
  const originalSellerKey = deployerKey

  const buyerAccount = Local.testAccounts[2];
  const buyerKey = buyerAccount.key;

  const zkAppPrivateKey = PrivateKey.random();
  const zkAppAddress = zkAppPrivateKey.toPublicKey();

  const zkAppInstance = new ProductContract(zkAppAddress);
  await ProductContract.compile();
  console.log('Deploying the ProductContract...');
  const deployTxn = await Mina.transaction(deployerAccount, async () => {
    AccountUpdate.fundNewAccount(deployerAccount);
    await zkAppInstance.deploy();

  });

  // to enable proof's
  if (useProof) {
    await deployTxn.prove();
  }

  await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();

  console.log('ProductContract deployed at address:', zkAppAddress.toBase58());



  // Leaves representing product information (as an example)
  const productInfoLeaves = [
    Field(12345), // product id
    Field(67890), // serial number
    Field(11111), // Production date
    Field(22222), // other infos
  ];

  // Creating a Merkle tree with product information
  const productInfoTree = new MerkleTree(4);
  for (let i = 0; i < productInfoLeaves.length; i++) {
    productInfoTree.setLeaf(BigInt(i), productInfoLeaves[i]);
  }

  // Calculating Merkle root with product information
  const productInfoRoot = productInfoTree.getRoot();

  console.log('Initializing the ProductContract with init()...');
  const initTxn = await Mina.transaction(deployerAccount, async () => {
    await zkAppInstance.initialize(deployerAccount, productInfoRoot);
  });
  console.log("CREATED TXN")
  if (useProof) {
    await initTxn.prove();
  }
  console.log("PROVED")
  await initTxn.sign([deployerKey, zkAppPrivateKey]).send();
  console.log("SİGNED!!")
  console.log('Contract initialized with init().');

  const originalOwner = zkAppInstance.currentOwner.get();
  console.log('Originial owner after initialize :', originalOwner.toBase58());


  // The process of selling the product to a new buyer
  console.log('Selling the product to a new owner...');

  // Sales data (as an example)
  const saleData = {
    date: Field(20231010), // sale date
    price: Field(1000),    // sale price
  };

  // Calculating hash of sales data
  const saleDataFields = [saleData.date, saleData.price];
  const saleDataHash = Poseidon.hash(saleDataFields);

  // Creating a sales history Merkle tree
  const saleHistoryTree = new MerkleTree(20); // Depth 20

  // Since it is the first sale, the old leaf value is 0 by default
  const oldLeafValue = Field(0);

  // Determine the leaf index (for example, 0)
  const leafIndex = UInt64.from(0n);

  // Adding the new leaf value to the tree
  saleHistoryTree.setLeaf(leafIndex.toBigInt(), saleDataHash);

  // Creating Merkle proof
  const merkleProof = saleHistoryTree.getWitness(leafIndex.toBigInt());

  // Creating the SaleHistoryWitness object
  const saleHistoryWitness = new SaleHistoryWitness(merkleProof);

  const originalOwnerv2 = zkAppInstance.currentOwner.get();
  console.log('Originial owner before selling :', originalOwnerv2.toBase58());
  // Sell process
  const sellTxn = await Mina.transaction(originalSellerAccount, async () => {
    await zkAppInstance.sell(
      buyerAccount,
      saleDataHash,
      saleHistoryWitness,
      oldLeafValue
    );
  });

  // to enable proof's
  if (useProof) {
    await sellTxn.prove();
  }

  await sellTxn.sign([originalSellerKey]).send();

  console.log('Product sold to new owner.');

  const updatedOwner = zkAppInstance.currentOwner.get();
  console.log('Updated owner:', updatedOwner.toBase58());



  // Verify product information (as an example)
  console.log('Verifying product information...');

  // The leaf value you want to validate (for example, product ID)
  const leafValueToVerify = productInfoLeaves[0]; // Field(12345)

  // Creating a Merkle proof for the relevant leaf
  const productLeafIndex = UInt64.from(0n); // First leaf
  const productMerkleProof = productInfoTree.getWitness(productLeafIndex.toBigInt());

  // creating ProductInfoWitness object
  const productInfoWitness = new ProductInfoWitness(productMerkleProof);

  // verifyProductInfo process
  const verifyTxn = await Mina.transaction(buyerAccount, async () => {
    await zkAppInstance.verifyProductInfo(leafValueToVerify, productInfoWitness);
  });

  // to enable proof's
  if (useProof) {
    await verifyTxn.prove();
  }

  await verifyTxn.sign([buyerKey]).send();

  console.log('Product information verified successfully.');

}

main()
  .then(() => {
    console.log('Test completed.');
  })
  .catch((error) => {
    console.error('An error occured: ', error);
  });
