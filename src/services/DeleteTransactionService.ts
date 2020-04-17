import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';

class DeleteTransactionService {
  public async execute(id: string): Promise<Transaction> {
    const transactionRepository = getRepository(Transaction);

    const findTransaction = await transactionRepository.findOne({
      where: { id },
    });
    console.log(findTransaction);
    if (!findTransaction) {
      throw new AppError('Transaction not found');
    }

    await transactionRepository
      .createQueryBuilder()
      .delete()
      .from(Transaction)
      .where({ id })
      .execute();

    return findTransaction;
  }
}

export default DeleteTransactionService;
