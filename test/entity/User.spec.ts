import { createConnection, getRepository, Connection } from 'typeorm';
import { User } from '../../src/entity/User';
import { Product } from '../../src/entity/Product';

describe('User Entity', () => {
  let connection: Connection;
  let userRepository: ReturnType<typeof getRepository>;
  let productRepository: ReturnType<typeof getRepository>;

  beforeAll(async () => {
    connection = await createConnection({
      type: 'sqlite',
      database: ':memory:',
      entities: [User, Product],
      synchronize: true,
      logging: false,
    });

    userRepository = getRepository(User);
    productRepository = getRepository(Product);
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should be able to create a user', async () => {
    const user = new User();
    user.name = 'John Doe';
    user.email = 'john@example.com';
    user.mobile = '1234567890';
    user.postcode = 'AB1 2CD';

    const savedUser = await userRepository.save(user);

    expect(savedUser).toHaveProperty('id'); // Ensure an ID was generated
    expect(savedUser.name).toBe('John Doe');
    expect(savedUser.email).toBe('john@example.com');
    expect(savedUser.mobile).toBe('1234567890');
    expect(savedUser.postcode).toBe('AB1 2CD');
  });

  it('should correctly associate users with products via many-to-many', async () => {
    // Create products
    const product1 = new Product();
    product1.name = 'Product A';
    const product2 = new Product();
    product2.name = 'Product B';

    const savedProduct1 = await productRepository.save(product1);
    const savedProduct2 = await productRepository.save(product2);

    // Create a user and associate with products
    const user = new User();
    user.name = 'Jane Doe';
    user.email = 'jane@example.com';
    user.mobile = '0987654321';
    user.postcode = 'XY9 8ZT';
    user.interests = [savedProduct1, savedProduct2];

    const savedUser = await userRepository.save(user);

    // Reload the user and check if the products are associated
    const loadedUser = await userRepository.findOne({
      where: { id: savedUser.id },
      relations: ['interests'], // Load the interests relation
    });

    expect(loadedUser).toBeDefined();
    expect(loadedUser?.interests).toHaveLength(2); // The user should have 2 products
    expect(loadedUser?.interests[0].name).toBe('Product A');
    expect(loadedUser?.interests[1].name).toBe('Product B');
  });

  it('should return the correct user with their products using the relationship', async () => {
    // Create a new product
    const product = new Product();
    product.name = 'Product C';
    const savedProduct = await productRepository.save(product);

    // Create a new user and link to the product
    const user = new User();
    user.name = 'Alice Smith';
    user.email = 'alice@example.com';
    user.mobile = '1122334455';
    user.postcode = 'LM4 5OP';
    user.interests = [savedProduct];

    const savedUser = await userRepository.save(user);

    // Fetch user and verify product association
    const fetchedUser = await userRepository.findOne({
      where: { id: savedUser.id },
      relations: ['interests'],
    });

    expect(fetchedUser).toBeDefined();
    expect(fetchedUser?.interests).toHaveLength(1);
    expect(fetchedUser?.interests[0].name).toBe('Product C');
  });

  it('should handle the case where a user has no products in the interests', async () => {
    // Create a user with no products in their interests
    const user = new User();
    user.name = 'Bob Jones';
    user.email = 'bob@example.com';
    user.mobile = '5566778899';
    user.postcode = 'PQ3 4RS';
    user.interests = []; // No interests

    const savedUser = await userRepository.save(user);

    const loadedUser = await userRepository.findOne({
      where: { id: savedUser.id },
      relations: ['interests'],
    });

    expect(loadedUser).toBeDefined();
    expect(loadedUser?.interests).toHaveLength(0); // User should have no interests
  });
});
