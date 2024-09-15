import {
  Field,
  Mina,
  PrivateKey,
  AccountUpdate,
  MerkleTree,
  Poseidon,
  UInt64,
  Bool,
  PublicKey
} from 'o1js';
import { ProductContract, ProductInfoWitness, SaleHistoryWitness } from './ProductContract.js';

async function main() {

  const useProof = false;

  const Local = await Mina.LocalBlockchain({ proofsEnabled: useProof });
  Mina.setActiveInstance(Local);

  const deployerAccount = Local.testAccounts[0];
  const deployerKey = deployerAccount.key;

  const originalSellerAccount = Local.testAccounts[1];
  const originalSellerKey = originalSellerAccount.key;

  const buyerAccount = Local.testAccounts[2];
  const buyerKey = buyerAccount.key;

  const zkAppPrivateKey = PrivateKey.random();
  const zkAppAddress = zkAppPrivateKey.toPublicKey();

  const zkAppInstance = new ProductContract(zkAppAddress);

  console.log('Deploying the ProductContract...');
  const deployTxn = await Mina.transaction(deployerAccount, async () => {
    AccountUpdate.fundNewAccount(deployerAccount);
    await zkAppInstance.deploy();

  });

  // Proof'ları etkinleştirmek için
  if (useProof) {
    await deployTxn.prove();
  }

  await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();

  console.log('ProductContract deployed at address:', zkAppAddress.toBase58());


  console.log('Initializing the ProductContract with init()...');
  const initTxn = await Mina.transaction(deployerAccount, async () => {
    await zkAppInstance.init();
  });
  console.log("CREATED TXN")
  if (useProof) {
    await initTxn.prove();
  }
  console.log("PROVED")
  await initTxn.sign([deployerKey, zkAppPrivateKey]).send();
  console.log("SİGNED!!")
  console.log('Contract initialized with init().');



  // Kontratın durumunu kontrol etme
  const isInitializedBefore = zkAppInstance.isInitialized.get();
  console.log('Contract is initialized before calling initialize:', isInitializedBefore.toBoolean());







  // Ürün bilgilerini temsil eden yapraklar (örnek olarak)
  const productInfoLeaves = [
    Field(12345), // Ürün ID'si
    Field(67890), // Seri numarası
    Field(11111), // Üretim tarihi
    Field(22222), // Diğer bilgi
  ];

  // Ürün bilgileri Merkle ağacını oluşturma
  const productInfoTree = new MerkleTree(4);
  for (let i = 0; i < productInfoLeaves.length; i++) {
    productInfoTree.setLeaf(BigInt(i), productInfoLeaves[i]);
  }

  // Ürün bilgileri Merkle root'unu hesaplama
  const productInfoRoot = productInfoTree.getRoot();

  // Ürünü yeni bir alıcıya satma işlemi
  console.log('Selling the product to a new owner...');

  // Satış verisi (örnek olarak)
  const saleData = {
    date: Field(20231010), // Satış tarihi
    price: Field(1000),    // Satış fiyatı
  };

  // Satış verisinin hash'ini hesaplama
  const saleDataFields = [saleData.date, saleData.price];
  const saleDataHash = Poseidon.hash(saleDataFields);

  // Satış geçmişi Merkle ağacını oluşturma
  const saleHistoryTree = new MerkleTree(20); // Derinlik 20

  // İlk satış olduğundan, eski yaprak değeri varsayılan olarak 0
  const oldLeafValue = Field(0);

  // Yaprak indeksini belirleme (örneğin, 0)
  const leafIndex = UInt64.from(0n);

  // Yeni yaprak değerini ağaca ekleme
  saleHistoryTree.setLeaf(leafIndex.toBigInt(), saleDataHash);

  // Merkle proof oluşturma
  const merkleProof = saleHistoryTree.getWitness(leafIndex.toBigInt());

  // SaleHistoryWitness nesnesini oluşturma
  const saleHistoryWitness = new SaleHistoryWitness(merkleProof);

  // Sell işlemi
  const sellTxn = await Mina.transaction(originalSellerAccount, async () => {
    await zkAppInstance.sell(
      buyerAccount,
      saleDataHash,
      saleHistoryWitness,
      oldLeafValue
    );
  });

  // Proof'ları etkinleştirmek için
  if (useProof) {
    await sellTxn.prove();
  }

  await sellTxn.sign([originalSellerKey]).send();

  console.log('Product sold to new owner.');

  // Kontratın durumunu güncelleme
  const updatedOwner = zkAppInstance.currentOwner.get();
  console.log('Updated owner:', updatedOwner.toBase58());

  // Ürün bilgisini doğrulama (örnek olarak)
  console.log('Verifying product information...');

  // Doğrulamak istediğiniz yaprak değeri (örneğin, ürün ID'si)
  const leafValueToVerify = productInfoLeaves[0]; // Field(12345)

  // İlgili yaprak için Merkle proof oluşturma
  const productLeafIndex = UInt64.from(0n); // İlk yaprak
  const productMerkleProof = productInfoTree.getWitness(productLeafIndex.toBigInt());

  // ProductInfoWitness nesnesini oluşturma
  const productInfoWitness = new ProductInfoWitness(productMerkleProof);

  // verifyProductInfo işlemi
  const verifyTxn = await Mina.transaction(buyerAccount, async () => {
    await zkAppInstance.verifyProductInfo(leafValueToVerify, productInfoWitness);
  });

  // Proof'ları etkinleştirmek için
  if (useProof) {
    await verifyTxn.prove();
  }

  await verifyTxn.sign([buyerKey]).send();

  console.log('Product information verified successfully.');
}

main()
  .then(() => {
    console.log('Test tamamlandı.');
  })
  .catch((error) => {
    console.error('Bir hata oluştu:', error);
  });
