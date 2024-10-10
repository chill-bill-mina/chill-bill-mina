import {
    Field,
    Mina,
    PrivateKey,
    AccountUpdate,
    MerkleTree,
    Poseidon,
    PublicKey,

} from 'o1js';
import { verify } from 'o1js';
import {
    ProductContract,
} from './ProductContract.js';
import {
    ProductProofProgram,
    ProductProofPublicInput,
    ProductProofPrivateInput,
} from './proofs/ProductProofProgram.js';
import { ProductData } from './structs/ProductData.js';

let proofsEnabled = true;

const convertStringToField = (str: string) => {
    const hexString = Buffer.from(str, 'utf-8').toString('hex');

    const BigIntId = BigInt('0x' + hexString);

    return Field(BigIntId);
}

const convertFieldToString = (field: Field) => {
    let hexString = BigInt(field.toString()).toString(16);

    return Buffer.from(hexString, 'hex').toString('utf-8');
}

describe('ProductContract', () => {
    let deployerAccount: any,
        deployerKey: PrivateKey,
        originalSellerAccount: PublicKey,
        originalSellerKey: PrivateKey,
        buyerAccount: any,
        buyerKey: PrivateKey,
        zkAppPrivateKey: PrivateKey,
        zkAppAddress: PublicKey,
        productInfoRoot: Field,
        productInfoTree: MerkleTree,
        zkAppInstance: ProductContract,
        productData: ProductData;

    beforeAll(async () => {
        const Local = await Mina.LocalBlockchain({ proofsEnabled });
        Mina.setActiveInstance(Local);

        deployerAccount = Local.testAccounts[0];
        deployerKey = deployerAccount.key;

        originalSellerAccount = deployerAccount
        originalSellerKey = deployerKey

        buyerAccount = Local.testAccounts[2];
        buyerKey = buyerAccount.key;

        zkAppPrivateKey = PrivateKey.random();
        zkAppAddress = zkAppPrivateKey.toPublicKey();
        zkAppInstance = new ProductContract(zkAppAddress);

        await ProductContract.compile();

        console.log('Deploying the ProductContract...');
        const deployTxn = await Mina.transaction(deployerAccount, async () => {
            AccountUpdate.fundNewAccount(deployerAccount);
            await zkAppInstance.deploy();

        });

        // to enable proof's
        if (proofsEnabled) {
            await deployTxn.prove();
        }

        await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();

        console.log('ProductContract deployed at address:', zkAppAddress.toBase58());
    });

    it('should initialize the contract', async () => {

        productData = {
            productID: Field(12345),
            saleDate: Field(20230909),
            ownerName: convertStringToField("Dealers Name"), // değişir mi
            ownerAddress: convertStringToField("Brooklyn City, NY"),
            price: Field(1000),
            email: convertStringToField("dealer@example.com"),
            phoneNumber: convertStringToField("+4545"), // değişir
            productDescription: convertStringToField('This is a product description'),
            vatAmount: Field(20),
            discountAmount: Field(10),
            quantity: Field(1),
            invoiceNumber: Field(56789),
        };
        // Hash each field individually and add the hashes to an array
        const fieldValues = Object.values(productData);
        const fieldHashes = fieldValues.map((value) => Poseidon.hash([value]));

        // Create Merkle tree
        productInfoTree = new MerkleTree(5);

        for (let i = 0; i < fieldHashes.length; i++) {
            productInfoTree.setLeaf(BigInt(i), fieldHashes[i]);
        }
        productInfoTree.setLeaf(BigInt(fieldHashes.length), Poseidon.hash([productData.productID, productData.saleDate]));

        // Get the root of the Merkle tree
        productInfoRoot = productInfoTree.getRoot();


        console.log('Initializing the ProductContract with init()...');
        const initTxn = await Mina.transaction(deployerAccount, async () => {
            await zkAppInstance.initialize(deployerAccount, productInfoRoot);
        });
        console.log("CREATED TXN")
        if (proofsEnabled) {
            await initTxn.prove();
        }
        console.log("PROVED")
        await initTxn.sign([deployerKey, zkAppPrivateKey]).send();
        console.log("SİGNED!!")
        console.log('Contract initialized with init().');

        const originalOwner = zkAppInstance.currentOwner.get();
        console.log('Originial owner after initialize :', originalOwner.toBase58());
        console.log("owner name : ", convertFieldToString(productData.ownerName))
        console.log("Deployer Account : ", deployerAccount.toBase58())
        expect(originalOwner.toBase58()).toEqual(deployerAccount.toBase58());
    });


    it('should sell the product to a new owner', async () => {

        const originalOwner = zkAppInstance.currentOwner.get();
        console.log('Originial owner before selling :', originalOwner.toBase58());

        productData = {
            productID: Field(12345),
            saleDate: Field(20231010),
            ownerName: convertStringToField("Alice"), // değişir mi
            ownerAddress: convertStringToField("Long Island City, NY"),
            price: Field(1000),
            email: convertStringToField("alice@example.com"),
            phoneNumber: convertStringToField("+45675"), // değişir
            productDescription: convertStringToField('This is a product description'),
            vatAmount: Field(20),
            discountAmount: Field(10),
            quantity: Field(1),
            invoiceNumber: Field(56789),
        };

        const fieldValues = Object.values(productData);
        const fieldHashes = fieldValues.map((value) => Poseidon.hash([value]));

        productInfoTree = new MerkleTree(5);

        for (let i = 0; i < fieldHashes.length; i++) {
            productInfoTree.setLeaf(BigInt(i), fieldHashes[i]);
        }
        productInfoTree.setLeaf(BigInt(fieldHashes.length), Poseidon.hash([productData.productID, productData.saleDate]));

        productInfoRoot = productInfoTree.getRoot();

        const sellTxn = await Mina.transaction(originalSellerAccount, async () => {
            await zkAppInstance.sell(
                buyerAccount,
                productInfoRoot

            );
        });

        if (proofsEnabled) {
            await sellTxn.prove();
        }

        await sellTxn.sign([originalSellerKey]).send();

        console.log('Product sold to new owner.');

        const updatedOwner = zkAppInstance.currentOwner.get();
        console.log('Previous owner name:', updatedOwner.toBase58());

        expect(updatedOwner.toBase58()).toEqual(buyerAccount.toBase58());

    });



    it('should verify product information using Merkle proof with ZkProgram', async () => {

        const { verificationKey } = await ProductProofProgram.compile();

        productData = {
            productID: Field(12345),
            saleDate: Field(20231010),
            ownerName: convertStringToField("Alice"),
            ownerAddress: convertStringToField("Long Island City, NY"),
            price: Field(1000),
            email: convertStringToField("alice@example.com"),
            phoneNumber: convertStringToField("+45675"),
            productDescription: convertStringToField('This is a product description'),
            vatAmount: Field(20),
            discountAmount: Field(10),
            quantity: Field(1),
            invoiceNumber: Field(56789),
        };

        const publicInput = new ProductProofPublicInput({
            productID: productData.productID,
            saleDate: productData.saleDate,
            zkAppAddress: zkAppAddress,
        });
        const privateInput = new ProductProofPrivateInput({
            ownerName: productData.ownerName,
            ownerAddress: productData.ownerAddress,
            price: productData.price,
            email: productData.email,
            phoneNumber: productData.phoneNumber,
            productDescription: productData.productDescription,
            vatAmount: productData.vatAmount,
            discountAmount: productData.discountAmount,
            quantity: productData.quantity,
            invoiceNumber: productData.invoiceNumber,
        })

        // Create proof
        const proof = await ProductProofProgram.verifyProductInfo(
            publicInput,
            privateInput,
        );

        console.log('Proof:', proof);


        const publicOutputFromProof = proof.publicOutput;
        console.log('Public Output:', publicOutputFromProof.owner.toString());


        // **Verify Proof**
        const isValid = await verify(proof, verificationKey);
        expect(isValid).toBe(true);
        if (isValid) {
            console.log('Proof is valid, product info verified.');
        } else {
            console.log('Proof is not valid, product info cannot be verified.');
        }


    });


});