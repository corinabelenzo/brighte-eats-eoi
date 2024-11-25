import { User } from '../entity/User'
import { Product } from '../entity/Product'
import { AppDataSource } from '../data-source'

const productRepository = AppDataSource.getRepository(Product)

export type RegistrationDetails = {
  id: number,
  name: string,
  email: string,
  mobile: string,
  postcode: string
}

const getProducts = async (productNames: [string]) : Promise<Product[]> => {
  const products: Product[] = []
  await Promise.all(productNames.map(async (productName) => {
    const product = await productRepository.findOneByOrFail({ name: productName });
    products.push(product);
  }))
  return products
}

export const register = async (name: string, email: string, mobile: string, postcode: string, interests: [string]): Promise<RegistrationDetails> => {
  const products = await getProducts(interests);

  const user = new User()
  user.name = name
  user.email = email
  user.mobile = mobile
  user.postcode = postcode
  user.interests = products

  await AppDataSource.transaction(async (transactionalEntityManager) => {
    await transactionalEntityManager.save(user)
  })

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    postcode: user.postcode
  }
}
