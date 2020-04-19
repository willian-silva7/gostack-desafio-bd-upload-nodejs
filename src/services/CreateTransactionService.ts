import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';
import CreateCategoryService from './CreateCategoryService';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    category,
    type,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryService = new CreateCategoryService();

    const checkedCategory = await categoryService.execute({
      title: category,
    });

    const balance = await transactionRepository.getBalance();

    if (type === 'outcome' && value > balance.total) {
      throw new AppError('Insuficient Balance');
    }

    const transaction = await transactionRepository.create({
      title,
      value,
      type,
      category: {
        id: checkedCategory.id,
        title: checkedCategory.title,
      },
    });
    console.log(transaction);
    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
