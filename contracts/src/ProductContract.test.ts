import {
    Field,
    Mina,
    PrivateKey,
    AccountUpdate,
    MerkleTree,
    Poseidon,
    UInt64,
    PublicKey,
} from 'o1js';
import {
    ProductContract,
    ProductInfoWitness,
    SaleHistoryWitness,
} from './ProductContract.js';
import {
    ProductProofProgram,
    ProductProofPublicInput,
    ProductInfoWitness2,
} from './proofs/ProductProofProgram.js';

let proofsEnabled = true;


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
        productInfoLeaves: Field[],
        zkAppInstance: ProductContract;
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

        // Leaves representing product information (as an example)
        productInfoLeaves = [
            Field(12345), // product id
            Field(67890), // serial number
            Field(11111), // Production date
            Field(22222), // other infos
        ];

        // Creating a Merkle tree with product information
        productInfoTree = new MerkleTree(4);
        for (let i = 0; i < productInfoLeaves.length; i++) {
            productInfoTree.setLeaf(BigInt(i), productInfoLeaves[i]);
        }

        // Calculating Merkle root with product information
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
        console.log("Deployer Account : ", deployerAccount.toBase58())
        expect(originalOwner.toBase58()).toEqual(deployerAccount.toBase58());
    });


    it('should sell the product to a new owner', async () => {

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

        const originalOwner = zkAppInstance.currentOwner.get();
        console.log('Originial owner before selling :', originalOwner.toBase58());
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
        if (proofsEnabled) {
            await sellTxn.prove();
        }

        await sellTxn.sign([originalSellerKey]).send();

        console.log('Product sold to new owner.');

        const updatedOwner = zkAppInstance.currentOwner.get();
        console.log('Updated owner:', updatedOwner.toBase58());

        expect(updatedOwner.toBase58()).toEqual(buyerAccount.toBase58());

    });


    it('should verify product information using Merkle proof', async () => {

        // The leaf value you want to validate (for example, product ID)
        const leafValueToVerify = productInfoLeaves[0]; // Field(12345)

        // Creating a Merkle proof for the relevant leaf
        const productLeafIndex = UInt64.from(0n); // First leaf
        const productMerkleProof = productInfoTree.getWitness(productLeafIndex.toBigInt());

        // creating ProductInfoWitness object
        const productInfoWitness = new ProductInfoWitness(productMerkleProof);

        await zkAppInstance.productInfoRoot.fetch(); // Update the state

        const productInfoRootOnChain = zkAppInstance.productInfoRoot.get();

        if (productInfoRootOnChain) {
            const productInfoRoot = new Field(productInfoRootOnChain.value);

            // Calculate the root using the Merkle proof and leaf value
            const calculatedRoot = productInfoWitness.calculateRoot(leafValueToVerify);
            const isValid = calculatedRoot.equals(productInfoRoot).toBoolean();

            expect(isValid).toBe(true);

            if (isValid) {
                console.log('Product information verified successfully with merkleproof.');
            } else {
                console.log('Product information could not be verified with merkleproof.');
            }
        } else {
            console.log('productInfoRoot value not found on the blockchain.');
        }


    });


    it('should verify product information using Merkle proof with ZkProgram', async () => {

        const { verificationKey } = await ProductProofProgram.compile();

        // product info
        const productID = Field(12345);
        const productionDate = Field(11111);


        const productInfoLeaves = [
            Poseidon.hash([Field(12345), Field(11111)]),
        ];

        const merkleTree = new MerkleTree(4);
        for (let i = 0; i < productInfoLeaves.length; i++) {
            merkleTree.setLeaf(BigInt(i), productInfoLeaves[i]);
        }

        // Find the index of the leaf want to prove
        const leafIndex = BigInt(0); // for example first leaf

        // create merkle proof
        const merkleProof = merkleTree.getWitness(leafIndex);
        const merkleWitness = new ProductInfoWitness2(merkleProof);

        // create public input
        const productInfoRoot = merkleTree.getRoot();
        const publicInput = new ProductProofPublicInput({
            productInfoRoot,
        });

        const proof = await ProductProofProgram.verifyProductInfo(
            publicInput,
            productID,
            productionDate,
            merkleWitness)
            
        // **Verify Proof**
        const isValid = await ProductProofProgram.verify(proof);
        expect(isValid).toBe(true);
        if (isValid) {
            console.log('Proof is valid, product info verified.');
        } else {
            console.log('Proof is not valid, product info cannot be verified.');
        }


    });


});