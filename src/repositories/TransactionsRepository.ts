import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const findTransactions = this.find();
    const initialBallance = {
      income: 0,
      outcome: 0,
      total: 0,
    };

    const balance = (await findTransactions).reduce((acc, transaction) => {
      switch (transaction.type) {
        case 'income':
          return {
            ...acc,
            income: transaction.value + acc.income,
            total: transaction.value + acc.income - acc.outcome,
          };
        case 'outcome':
          return {
            ...acc,
            outcome: transaction.value + acc.outcome,
            total: acc.income - transaction.value - acc.outcome,
          };
        default:
          return acc;
      }
    }, initialBallance);
    return balance;
  }
}

export default TransactionsRepository;
