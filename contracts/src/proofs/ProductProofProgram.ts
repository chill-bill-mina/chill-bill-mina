import {
    Field,
    Poseidon,
    Struct,
    ZkProgram,
    MerkleTree,
    PublicKey,
} from 'o1js';

import { ProductContract } from '../ProductContract';


export class ProductProofPublicInput extends Struct({
    productID: Field,
    saleDate: Field,
    zkAppAddress: PublicKey
}) { }

export class ProductProofPublicOutput extends Struct({
    productInfoRoot: Field,
    owner: PublicKey,
    dealer: PublicKey,
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
    publicOutput: ProductProofPublicOutput,
    methods: {
        verifyProductInfo: {
            privateInputs: [ProductProofPrivateInput],

            async method(
                publicInput: ProductProofPublicInput,
                privateInput: ProductProofPrivateInput,
            ): Promise<ProductProofPublicOutput> {
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
                const zkAppInstance = new ProductContract(publicInput.zkAppAddress);

                //Fetch the productInfoRoot and currentOwner from the zkAppInstance
                const onChainProductInfoRoot = zkAppInstance.productInfoRoot.get();
                const owner = zkAppInstance.currentOwner.get();
                const dealer = zkAppInstance.originalSeller.get();

                onChainProductInfoRoot.assertEquals(calculatedProductInfoRoot);

                return new ProductProofPublicOutput({ productInfoRoot: onChainProductInfoRoot, owner: owner, dealer: dealer });

            },
        },
    },
});