import {
  SmartContract,
  state,
  State,
  method,
  PublicKey,
  MerkleTree,
  MerkleWitness,
  Field,
  Bool,
} from 'o1js';

// The depths of the Merkle trees
const PRODUCT_INFO_TREE_DEPTH = 4; // Depth for product information tree
const SALE_HISTORY_TREE_DEPTH = 20; // Depth for sales history tree

// Merkle Witness classes
export class ProductInfoWitness extends MerkleWitness(PRODUCT_INFO_TREE_DEPTH) { }
export class SaleHistoryWitness extends MerkleWitness(SALE_HISTORY_TREE_DEPTH) { }

export class ProductContract extends SmartContract {
  // state definitions
  @state(PublicKey) originalSeller = State<PublicKey>();
  @state(PublicKey) currentOwner = State<PublicKey>();
  @state(Field) saleHistoryRoot = State<Field>();
  @state(Field) productInfoRoot = State<Field>();
  @state(Bool) isInitialized = State<Bool>();

  // init method (without parameters)
  init(): void {
    super.init();
    this.originalSeller.set(PublicKey.empty())
    this.currentOwner.set(PublicKey.empty())
    this.isInitialized.set(new Bool(false));
    this.saleHistoryRoot.set(Field(0));
    this.productInfoRoot.set(Field(0));

  }

  // Initialize method (can only be called once)
  @method async initialize(
    originalSeller: PublicKey,
    productInfoRoot: Field // Merkle root of product information
  ): Promise<void> {
    // Check if the contract has not been initialized yet
    const initialized = this.isInitialized.get();
    this.isInitialized.requireEquals(initialized);
    initialized.assertEquals(Bool(false));

    // Get the sender's public key and verify the signature
    const senderPublicKey = this.sender.getAndRequireSignatureV2();

    // Verify that the original seller initiated the transaction
    originalSeller.assertEquals(senderPublicKey);

    // Product information Merkle root save to state
    this.productInfoRoot.set(productInfoRoot);

    // Update states
    this.originalSeller.requireEquals(this.originalSeller.get());
    this.originalSeller.set(originalSeller);
    this.currentOwner.set(originalSeller);

    this.currentOwner.requireEquals(this.currentOwner.get());

    // Start sales history (empty tree)
    const emptyHistoryRoot = (new MerkleTree(SALE_HISTORY_TREE_DEPTH)).getRoot();
    this.saleHistoryRoot.set(emptyHistoryRoot);

    // Mark the contract initialized
    this.isInitialized.set(Bool(true));
  }

  // Sell method (change the product ownership)
  @method async sell(
    newOwner: PublicKey,
    saleDataHash: Field,
    saleHistoryWitness: SaleHistoryWitness,
    oldLeafValue: Field
  ): Promise<void> {
    // check that the contract has been initialized
    const initialized = this.isInitialized.get();
    this.isInitialized.requireEquals(initialized);
    initialized.assertEquals(Bool(true));

    this.currentOwner.requireEquals(this.currentOwner.get());
    const storedCurrentOwner = this.currentOwner.get();

    // Get the sender's public key and verify the signature
    const senderPublicKey = this.sender.getAndRequireSignatureV2();

    // Verify that the person performing the transaction is the current owner
    storedCurrentOwner.assertEquals(senderPublicKey);

    // Update ownership
    this.currentOwner.set(newOwner);

    // Get old root of sales history
    this.saleHistoryRoot.requireEquals(this.saleHistoryRoot.get()) //v2
    const oldSaleHistoryRoot = this.saleHistoryRoot.get();
    // Calculate old root
    const oldCalculatedRoot = saleHistoryWitness.calculateRoot(oldLeafValue);

    // Verify that the old root matches the root in the contract
    oldSaleHistoryRoot.assertEquals(oldCalculatedRoot);

    // Calculate new root
    const newSaleHistoryRoot = saleHistoryWitness.calculateRoot(saleDataHash);

    // Update new root
    this.saleHistoryRoot.set(newSaleHistoryRoot);
  }


  // A method to verify product information
  @method async verifyProductInfo(
    leafValue: Field,
    productInfoWitness: ProductInfoWitness
  ): Promise<void> {
    // check that the contract has been initialized
    const initialized = this.isInitialized.get();
    this.isInitialized.requireEquals(initialized);

    initialized.assertEquals(Bool(true));

    // Get product information root
    const productInfoRoot = this.productInfoRoot.get();
    this.productInfoRoot.requireEquals(this.productInfoRoot.get()) //v2

    // Verify that the leaf belongs to the tree with Merkle proof
    const calculatedRoot = productInfoWitness.calculateRoot(leafValue);
    calculatedRoot.assertEquals(productInfoRoot);
  }

}
