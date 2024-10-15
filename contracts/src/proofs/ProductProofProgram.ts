import {
    Field,
    Poseidon,
    Struct,
    ZkProgram,
    PublicKey,
    MerkleWitness as BaseMerkleWitness,
} from 'o1js';

import { ProductContract } from '../ProductContract';
await ProductContract.compile();

const MERKLE_TREE_HEIGHT = 5; // Adjust based on your needs
class MerkleWitness extends BaseMerkleWitness(MERKLE_TREE_HEIGHT) { }

export class ProductProofPublicInput extends Struct({
    productID: Field,
    saleDate: Field,
    zkAppAddress: PublicKey
}) { }

export class ProductProofPublicOutput extends Struct({
    productInfoRoot: Field,
    owner: PublicKey,
    dealer: PublicKey,
    productID: Field,
    saleDate: Field,
}) { }

export class ProductProofPrivateInput extends Struct({
    merkleWitness: MerkleWitness,
}) { }

export const ProductProofProgram = ZkProgram({
    name: 'ProductProofProgram',
    publicInput: ProductProofPublicInput,
    publicOutput: ProductProofPublicOutput,
    methods: {
        verifyProductInfo: {
            privateInputs: [ProductProofPrivateInput],

            async method(
                publicInput: ProductProofPublicInput,
                privateInput: ProductProofPrivateInput,
            ): Promise<ProductProofPublicOutput> {

                const calculatedProductInfoRoot = privateInput.merkleWitness.calculateRoot(Poseidon.hash([publicInput.productID, publicInput.saleDate]));

                const zkAppInstance = new ProductContract(publicInput.zkAppAddress);

                //Fetch the productInfoRoot and currentOwner from the zkAppInstance
                const onChainProductInfoRoot = zkAppInstance.productInfoRoot.get();
                const owner = zkAppInstance.currentOwner.get();
                const dealer = zkAppInstance.originalSeller.get();

                onChainProductInfoRoot.assertEquals(calculatedProductInfoRoot);

                return new ProductProofPublicOutput({ productInfoRoot: onChainProductInfoRoot, owner: owner, dealer: dealer, productID: publicInput.productID, saleDate: publicInput.saleDate });

            },
        },
    },
});