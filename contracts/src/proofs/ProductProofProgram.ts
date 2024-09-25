import {
    Field,
    Poseidon,
    MerkleWitness,
    Struct,
    ZkProgram,
} from 'o1js';


export const PRODUCT_INFO_TREE_DEPTH = 4;

// Merkle proof class
export class ProductInfoWitness2 extends MerkleWitness(PRODUCT_INFO_TREE_DEPTH) { }

// Public input structure
export class ProductProofPublicInput extends Struct({
    productInfoRoot: Field,
}) { }

export const ProductProofProgram = ZkProgram({
    name: 'ProductProofProgram',
    publicInput: ProductProofPublicInput,

    methods: {
        verifyProductInfo: {
            privateInputs: [Field, Field, ProductInfoWitness2],

            async method(
                publicInput: ProductProofPublicInput,
                productID: Field,
                productionDate: Field,
                merkleWitness: ProductInfoWitness2
            ) {
                // Calculate leaf value (hash product information)
                const leafHash = Poseidon.hash([productID, productionDate]);

                // Calculate the root using Merkle's proof
                const computedRoot = merkleWitness.calculateRoot(leafHash);

                // Compare the calculated root with productInfoRoot in public input
                computedRoot.assertEquals(publicInput.productInfoRoot);
            },
        },
    },
});