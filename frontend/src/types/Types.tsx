export type Transaction = {
    transactionId: number;
    userId: string;
    amount: number;
    date: string;
    categoryLabel: string;
    description: string;
};

export type User = {
    userId: string;
    firstname: string;
    lastname: string;
    mail: string;
    password: string;
    phoneNumber: string;
};

export type Category = {
    categoryId: number;
    userId: string;
    categoryLabel: string;
};

export type CategoriesSumup = {
    categoryLabel: string;
    totalAmount: number;
};