import csvParse from 'csv-parse';
import fs from 'fs';
import { getCustomRepository, getRepository, In } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionRepository from '../repositories/TransactionsRepository';

interface TransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const transactions: TransactionDTO[] = [];
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoriesRepository = getRepository(Category);
    const csvFile = fs.createReadStream(filePath);
    const parsers = csvParse({
      from_line: 2,
    });

    const categories: string[] = [];
    const parseCSV = csvFile.pipe(parsers);
    parseCSV.on('data', datarow => {
      const [title, type, value, category] = datarow.map((cell: string) =>
        cell.trim(),
      );
      if (title || type || value) return;
      categories.push(category);
      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const existenCategories = await categoriesRepository.find({
      where: {
        title: In([categories]),
      },
    });

    const existenCategoriesTitles = existenCategories.map(
      (category: Category) => category.title,
    );

    const addCategoryTitles = categories
      .filter(category => !existenCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepository.create(
      addCategoryTitles.map(title => ({
        title,
      })),
    );

    await categoriesRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existenCategories];

    const createdTransactions = transactionRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionRepository.save(createdTransactions);
    await fs.promises.unlink(filePath);
    return createdTransactions;
  }
}

export default ImportTransactionsService;
