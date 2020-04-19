import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';
import uploadConfig from '../config/upload';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

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

  const transaction = await transactionService.execute({
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

  const transaction = await deleteTransaction.execute(id);
  return response.status(204).json(transaction);
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const uploadService = new ImportTransactionsService();
    const transactions = await uploadService.execute(request.file.path);
    return response.json(transactions);
  },
);

export default transactionsRouter;
