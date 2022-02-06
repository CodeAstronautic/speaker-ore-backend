import { Repository, EntityRepository } from 'typeorm'
import { InternalServerErrorException } from '@nestjs/common'
import { Category } from '../entity/category.entity'
import { CreateCategoryDto, UpdateCategoryDto } from '../dto/category.dto'


type Accumulator = {
    currentCategoryPromise: Promise<Category>,
    selectedCategories: Category[]
}

@EntityRepository(Category)
export class CategoryRepository extends Repository<Category> {
    getCategories = async (): Promise<Category[]> => {
        try {
            return await this.find({})
        } catch (err) {
            throw new InternalServerErrorException(err)
        }
    }

    insertCategory = async (
        categoryDto: CreateCategoryDto
    ): Promise<Category> => {
        const { name, logo } = categoryDto

        const category = this.create()
        category.name = name.toLowerCase()
        category.logo = logo

        try {
            await category.save()
            return category;
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    updateCategory = async (
        categoryDto: UpdateCategoryDto
    ): Promise<Category> => {
        const { id, name, logo } = categoryDto

        const category = await this.findOne({ id })
        category.name = name.toLowerCase()
        category.logo = logo

        try {
            return await category.save()
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async getOne(category: string) {
        let selectedCategory = await this.findOne({ name: category });
        if (!selectedCategory) {
            selectedCategory = await this.insertCategory({
                name: category,
            })
        }
        return selectedCategory;
    }

    getAllCategories = async (categories: string[]) => {
        // @ts-ignore
        const starterPromise: Promise<Category> = Promise.resolve()

        const starterAccumulator: Promise<Accumulator> = Promise.resolve({
            currentCategoryPromise: starterPromise,
            selectedCategories: []
        })

        const reducerFunction = async (acc: Promise<Accumulator>, category: string) => {
            const { currentCategoryPromise, selectedCategories } = await acc;
            const selectedCategory = await currentCategoryPromise;

            if (selectedCategory) {
                selectedCategories.push(selectedCategory)
            }

            const result = {
                currentCategoryPromise: this.getOne(category),
                selectedCategories
            }

            return result
        }

        const sequential = await categories.reduce(reducerFunction, starterAccumulator);
        
        const { currentCategoryPromise, selectedCategories } = sequential;
        
        // appending the last promise
        selectedCategories.push(await currentCategoryPromise)
        return sequential.selectedCategories;
    }

    deleteCategory = async (categoryDto: UpdateCategoryDto) => {
        const { id } = categoryDto
        try {
            await this.delete({ id })
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }
}
