import {
  SmartContract,
  state,
  State,
  method,
  Permissions,
  PublicKey,
  MerkleTree,
  MerkleWitness,
  Field,
  Bool,
} from 'o1js';

// Merkle ağaçlarının derinlikleri
const PRODUCT_INFO_TREE_DEPTH = 4; // Ürün bilgileri ağacı için derinlik 
const SALE_HISTORY_TREE_DEPTH = 20; // Satış geçmişi ağacı için derinlik 

// Merkle Witness sınıfları
export class ProductInfoWitness extends MerkleWitness(PRODUCT_INFO_TREE_DEPTH) { }
export class SaleHistoryWitness extends MerkleWitness(SALE_HISTORY_TREE_DEPTH) { }

export class ProductContract extends SmartContract {
  // State tanımlamaları
  @state(PublicKey) originalSeller = State<PublicKey>();
  @state(PublicKey) currentOwner = State<PublicKey>();
  @state(Field) saleHistoryRoot = State<Field>();
  @state(Field) productInfoRoot = State<Field>();
  @state(Bool) isInitialized = State<Bool>();

  // init metodu (parametresiz)
  init() {
    super.init();
    this.isInitialized.set(Bool(false));
    this.originalSeller.set(PublicKey.empty());
    this.currentOwner.set(PublicKey.empty());
    this.saleHistoryRoot.set(Field(0));
    this.productInfoRoot.set(Field(0));

    //  initialize metodunun sadece deployer tarafından çağrılması
    this.account.permissions.set({
      ...Permissions.default(),
      // editState: Permissions.proofOrSignature(),
    });

  }

  // Initialize metodu (sadece bir kez çağrılabilir)
  @method async initialize(
    originalSeller: PublicKey,
    productInfoRoot: Field // Ürün bilgilerinin Merkle root'u
  ): Promise<void> {
    // Kontratın henüz initialize edilmediğini kontrol et
    const initialized = this.isInitialized.get();
    this.isInitialized.requireEquals(initialized);

    initialized.assertEquals(Bool(false));

    // Gönderenin public key'ini al ve imzayı doğrula
    const senderPublicKey = this.sender.getAndRequireSignatureV2();

    // Orijinal satıcının işlemi başlattığını doğrula
    originalSeller.assertEquals(senderPublicKey);

    // Ürün bilgileri Merkle root'unu state'e kaydet
    this.productInfoRoot.set(productInfoRoot);

    // State'leri güncelle
    this.originalSeller.set(originalSeller);
    this.currentOwner.set(originalSeller);

    // Satış geçmişini başlat (boş ağaç)
    const emptyHistoryRoot = this.getEmptySaleHistoryRoot();
    this.saleHistoryRoot.set(emptyHistoryRoot);

    // Kontratın initialize edildiğini işaretle
    this.isInitialized.set(Bool(true));
  }


  // Ürün bilgileri Merkle ağacı root'unu hesaplayan yardımcı fonksiyon
  computeProductInfoRoot(leaves: Field[]): Field {
    const tree = new MerkleTree(PRODUCT_INFO_TREE_DEPTH);
    for (let i = 0; i < leaves.length; i++) {
      tree.setLeaf(BigInt(i), leaves[i]);
    }
    return tree.getRoot();
  }

  // Boş satış geçmişi Merkle ağacının root'unu döndüren yardımcı fonksiyon
  getEmptySaleHistoryRoot(): Field {
    const tree = new MerkleTree(SALE_HISTORY_TREE_DEPTH);
    return tree.getRoot();
  }

  // Sell metodu (ürünün sahipliğini değiştirir)
  @method async sell(
    newOwner: PublicKey,
    saleDataHash: Field, // Yeni satış verisinin hash'i
    saleHistoryWitness: SaleHistoryWitness,
    oldLeafValue: Field // Eski yaprak değeri
  ): Promise<void> {
    // Kontratın initialize edildiğini kontrol ediyoruz
    // Kontratın initialize edildiğini kontrol ediyoruz
    const initialized = this.isInitialized.get();
    this.isInitialized.requireEquals(initialized);

    initialized.assertEquals(Bool(true));
    // Şu anki sahipliği al
    const storedCurrentOwner = this.currentOwner.get();

    // Gönderenin public key'ini al ve imzayı doğrula
    const senderPublicKey = this.sender.getAndRequireSignatureV2();

    // İşlemi yapan kişinin mevcut sahip olduğunu doğrula
    storedCurrentOwner.assertEquals(senderPublicKey);

    // Sahipliği güncelle
    this.currentOwner.set(newOwner);

    // Satış geçmişinin eski root'unu al
    const oldSaleHistoryRoot = this.saleHistoryRoot.get();

    // Eski root'u hesapla
    const oldCalculatedRoot = saleHistoryWitness.calculateRoot(oldLeafValue);

    // Eski root'un kontrattaki root ile eşleştiğini doğrula
    oldSaleHistoryRoot.assertEquals(oldCalculatedRoot);

    // Yeni root'u hesapla
    const newSaleHistoryRoot = saleHistoryWitness.calculateRoot(saleDataHash);

    // Yeni root'u güncelle
    this.saleHistoryRoot.set(newSaleHistoryRoot);
  }


  // Ürün bilgilerini doğrulamak için bir metot
  @method async verifyProductInfo(
    leafValue: Field,
    productInfoWitness: ProductInfoWitness
  ): Promise<void> {
    // Kontratın initialize edildiğini kontrol et
    const initialized = this.isInitialized.get();
    this.isInitialized.requireEquals(initialized);

    initialized.assertEquals(Bool(true));

    // Ürün bilgileri root'unu al
    const productInfoRoot = this.productInfoRoot.get();

    // Merkle proof ile yaprağın ağaca ait olduğunu doğrula
    const calculatedRoot = productInfoWitness.calculateRoot(leafValue);
    calculatedRoot.assertEquals(productInfoRoot);
  }

}
