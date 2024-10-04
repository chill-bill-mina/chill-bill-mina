import { Field, Struct } from 'o1js';

export class ProductData extends Struct({
    productID: Field,
    saleDate: Field,
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
