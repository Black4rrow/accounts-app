export type Transaction = {
    transactionId: string;
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