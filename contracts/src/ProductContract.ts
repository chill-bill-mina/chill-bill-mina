import {
  SmartContract,
  state,
  State,
  method,
  PublicKey,
  Field,
  // ZkProgram
} from 'o1js';

// import { ProductProofProgram } from './proofs/ProductProofProgram';

// await ProductProofProgram.compile();

// export class ProductProofProgramProof extends ZkProgram.Proof(ProductProofProgram) { }

export class ProductContract extends SmartContract {
  // state definitions
  @state(PublicKey) originalSeller = State<PublicKey>();
  @state(PublicKey) currentOwner = State<PublicKey>();
  @state(Field) productInfoRoot = State<Field>();

  // init method (without parameters)
  init(): void {
    super.init();
    this.originalSeller.set(PublicKey.empty())
    this.currentOwner.set(PublicKey.empty())
    this.productInfoRoot.set(Field(0));

  }

  // Initialize method (can only be called once)
  @method async initialize(
    originalSeller: PublicKey,
    productInfoRoot: Field // Merkle root of product information
  ): Promise<void> {
    // Check if the contract has not been initialized yet
    const storedCurrentOwner = this.currentOwner.get();
    storedCurrentOwner.assertEquals(PublicKey.empty());

    // Get the sender's public key and verify the signature
    const senderPublicKey = this.sender.getAndRequireSignatureV2();
    // Verify that the original seller initiated the transaction
    originalSeller.assertEquals(senderPublicKey);

    // Product information Merkle root save to state
    this.productInfoRoot.set(productInfoRoot);

    // Update states
    this.originalSeller.set(originalSeller);
    this.currentOwner.set(originalSeller);

    this.currentOwner.requireEquals(this.currentOwner.get());

  }

  // Sell method (change the product ownership)
  @method async sell(
    newOwner: PublicKey,
    productInfoRoot: Field,
    // proof: ProductProofProgramProof

  ): Promise<void> {
    // check that the contract has been initialized
    this.currentOwner.requireEquals(this.currentOwner.get());
    const storedCurrentOwner = this.currentOwner.get();
    storedCurrentOwner.equals(PublicKey.empty()).assertFalse();

    // Get the sender's public key and verify the signature
    const senderPublicKey = this.sender.getAndRequireSignatureV2();

    // Verify that the person performing the transaction is the current owner
    storedCurrentOwner.assertEquals(senderPublicKey);

    // proof.verify();

    // Update ownership
    this.currentOwner.set(newOwner);

    this.productInfoRoot.requireEquals(this.productInfoRoot.get());
    this.productInfoRoot.set(productInfoRoot);

  }

  // @method async verifyProductInfo(proof: ProductProofProgramProof): Promise<void> {
  //   proof.verify();
  // }

}
