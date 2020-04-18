import path from 'path';
import parse from 'csv-parse';
import fs from 'fs';
import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';
import CreateTransactionService from './CreateTransactionService';

interface TransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute(csvFileName: string): Promise<Transaction[]> {
    const importFile = path.join(uploadConfig.directory, csvFileName);
    const transactions: TransactionDTO[] = [];
    const transactionsCreated: Transaction[] = [];
    const transactionService = new CreateTransactionService();
    const csvFile = fs
      .createReadStream(importFile)
      .pipe(parse({ columns: true }));

    csvFile.on('data', datarow => {
      transactions.push(datarow);
    });
    await new Promise(resolve => {
      csvFile.on('end', resolve);
    });

    transactions.forEach(async transaction => {
      const transactionAdd = await transactionService.execute({
        title: transaction.title,
        value: transaction.value,
        type: transaction.type,
        category: transaction.category,
      });
      transactionsCreated.push(transactionAdd);
    });
    return transactionsCreated;
  }
}

export default ImportTransactionsService;
