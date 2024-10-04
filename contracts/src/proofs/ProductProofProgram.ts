import {
    Field,
    Poseidon,
    Struct,
    ZkProgram,
    MerkleTree
} from 'o1js';

export class ProductProofPublicInput extends Struct({
    productInfoRoot: Field,
    productID: Field,
    saleDate: Field,
}) { }
export class ProductProofPrivateInput extends Struct({
    ownerName: Field,
    ownerAddress: Field,
    price: Field,
    email: Field,
    phoneNumber: Field,
    productDescription: Field,
    vatAmount: Field,
    discountAmount: Field,
    quantity: Field,
    invoiceNumber: Field,
}) { }

export const ProductProofProgram = ZkProgram({
    name: 'ProductProofProgram',
    publicInput: ProductProofPublicInput,

    methods: {
        verifyProductInfo: {
            privateInputs: [ProductProofPrivateInput],

            async method(
                publicInput: ProductProofPublicInput,
                privateInput: ProductProofPrivateInput,
            ) {
                const productData = [
                    publicInput.productID,
                    publicInput.saleDate,
                    privateInput.ownerName,
                    privateInput.ownerAddress,
                    privateInput.price,
                    privateInput.email,
                    privateInput.phoneNumber,
                    privateInput.productDescription,
                    privateInput.vatAmount,
                    privateInput.discountAmount,
                    privateInput.quantity,
                    privateInput.invoiceNumber,
                ]
                // Hash each field individually and add the hashes to an array
                const fieldValues = Object.values(productData);
                const fieldHashes = fieldValues.map((value) => Poseidon.hash([value]));

                // Create Merkle tree
                const productInfoTree = new MerkleTree(5);

                for (let i = 0; i < fieldHashes.length; i++) {
                    productInfoTree.setLeaf(BigInt(i), fieldHashes[i]);
                }
                productInfoTree.setLeaf(BigInt(fieldHashes.length), Poseidon.hash([publicInput.productID, publicInput.saleDate]));

                const calculatedProductInfoRoot = productInfoTree.getRoot();
                publicInput.productInfoRoot.assertEquals(calculatedProductInfoRoot);
            },
        },
    },
});