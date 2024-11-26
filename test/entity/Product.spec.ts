import { getRepository, createConnection, Connection } from 'typeorm';
import { Product } from '../../src/entity/Product';
import { User } from '../../src/entity/User';

describe('Product Entity', () => {
  let connection: Connection;
  let productRepository: ReturnType<typeof getRepository>;
  let userRepository: ReturnType<typeof getRepository>;

  beforeAll(async () => {
    connection = await createConnection({
      type: 'sqlite',
      database: ':memory:',
      entities: [Product, User],
      synchronize: true,
      logging: false,
    });

    productRepository = getRepository(Product);
    userRepository = getRepository(User);
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should be able to create a product', async () => {
    const product = new Product();
    product.name = 'Test Product';

    const savedProduct = await productRepository.save(product);
    expect(savedProduct).toHaveProperty('id');
    expect(savedProduct.name).toBe('Test Product');
  });

  it('should enforce unique constraint on product name', async () => {
    const product1 = new Product();
    product1.name = 'Unique Product';
    await productRepository.save(product1);

    const product2 = new Product();
    product2.name = 'Unique Product';

    try {
      await productRepository.save(product2);
    } catch (error: any) {
      expect(error.code).toBe('SQLITE_CONSTRAINT');
    }
  });

  it('should establish many-to-many relationship with users', async () => {
    // Create users
    const user1 = new User();
    user1.name = 'user1';
    user1.email = 'user1@email.com';
    user1.mobile = '09111111111';
    user1.postcode = '1234';
    await userRepository.save(user1);

    const user2 = new User();
    user2.name = 'user2';
    user2.email = 'user2@email.com';
    user2.mobile = '09222222222';
    user2.postcode = '5678';
    await userRepository.save(user2);

    // Create product
    const product = new Product();
    product.name = 'Product with Users';
    product.interestedUsers = [user1, user2];
    const savedProduct = await productRepository.save(product);

    // Check if the product has the users assigned
    const loadedProduct = await productRepository.findOne({
      where: { id: savedProduct.id },
      relations: ['interestedUsers'], // Load the relationship
    });

    expect(loadedProduct).toBeDefined();
    expect(loadedProduct?.interestedUsers).toHaveLength(2);
    expect(loadedProduct?.interestedUsers[0].name).toBe('user1');
    expect(loadedProduct?.interestedUsers[1].name).toBe('user2');
  });
});
