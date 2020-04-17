import { Router } from 'express';
import { getRepository } from 'typeorm';
import CreateCategoryService from '../services/CreateCategoryService';
import Category from '../models/Category';

const categoriesRouter = Router();

categoriesRouter.get('/', async (request, response) => {
  const categoryRepository = getRepository(Category);
  const categories = await categoryRepository.find();
  return response.json(categories);
});

categoriesRouter.post('/', async (request, response) => {
  const { title } = request.body;

  const createCategoryService = new CreateCategoryService();

  const category = await createCategoryService.execute({
    title,
  });

  return response.json(category);
});

export default categoriesRouter;
