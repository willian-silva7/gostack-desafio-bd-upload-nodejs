import { Router } from 'express';
import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
// import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionRepository.find({
    relations: ['category'],
    select: ['id', 'title', 'value', 'type', 'category'],
  });

  transactions.forEach(transaction => {
    delete transaction.category.created_at;
    delete transaction.category.updated_at;
  });
  const getBalance = await transactionRepository.getBalance();
  return response.json({ transactions, getBalance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const transactionService = new CreateTransactionService();

  const transaction = transactionService.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransaction = new DeleteTransactionService();

  const transaction = deleteTransaction.execute(id);
  return response.status(204).json(transaction);
});

transactionsRouter.post('/import', async (request, response) => {
  // POST transactions: A rota deve receber title, value, type, e category dentro do corpo da requisição,
  // sendo o type o tipo da transação, que deve ser income para entradas (depósitos)
  // e outcome para saídas (retiradas). Ao cadastrar uma nova transação, ela deve ser armazenada
  // dentro do seu banco de dados, possuindo os campos id, title, value, type, category_id, created_at, updated_at.
});

export default transactionsRouter;
