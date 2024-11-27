import { register, RegistrationDetails } from '../../src/service/registration';
import { Product } from '../../src/entity/Product';
import { AppDataSource } from '../../src/data-source';

// Mocking the AppDataSource repository and transaction manager
jest.mock('../../src/data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn().mockReturnValue({
      findOneByOrFail: jest.fn(),  // Mocked findOneByOrFail method
    }),
    transaction: jest.fn().mockImplementation((callback) => callback({ save: jest.fn() })),
  },
}));

describe('register function', () => {
  const mockProduct = {
    id: 1,
    name: 'Sample Product',
    description: 'A sample product description',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register a user successfully when products are found', async () => {
    // Cast the findOneByOrFail method to a Jest mock and mock its resolved value
    const findOneByOrFailMock = AppDataSource.getRepository(Product).findOneByOrFail as jest.Mock;
    findOneByOrFailMock.mockResolvedValue(mockProduct);

    // Mock the save function inside transaction
    const saveMock = jest.fn();
    const transactionMock = AppDataSource.transaction as jest.Mock;
    transactionMock.mockImplementationOnce(async (callback) => {
      // Call the callback with a mocked entity manager that has a save function
      await callback({ save: saveMock });
    });

    const registrationDetails: RegistrationDetails = await register(
      'John Doe',
      'john.doe@example.com',
      '1234567890',
      '12345',
      ['Sample Product']
    );

    // Ensure that the getProducts function was called
    expect(findOneByOrFailMock).toHaveBeenCalledWith({ name: 'Sample Product' });

    // Ensure that the user is saved correctly
    expect(saveMock).toHaveBeenCalledWith(expect.objectContaining({
      name: 'John Doe',
      email: 'john.doe@example.com',
      mobile: '1234567890',
      postcode: '12345',
      interests: [mockProduct],
    }));

    // Ensure the registration details match the expected format
    expect(registrationDetails.name).toEqual('John Doe');
    expect(registrationDetails.email).toEqual('john.doe@example.com');
    expect(registrationDetails.mobile).toEqual('1234567890');
    expect(registrationDetails.postcode).toEqual('12345');
  });

  it('should throw an error if a product is not found', async () => {
    // Cast the findOneByOrFail method to a Jest mock and mock its rejected value
    const findOneByOrFailMock = AppDataSource.getRepository(Product).findOneByOrFail as jest.Mock;
    findOneByOrFailMock.mockRejectedValue(new Error('Product not found'));

    // Test that an error is thrown when the register function is called
    await expect(register('John Doe', 'john.doe@example.com', '1234567890', '12345', ['Non-existent Product']))
      .rejects
      .toThrowError('Product not found');
  });

  it('should handle multiple products and save user correctly', async () => {
    const mockProduct2 = { id: 2, name: 'Product B', description: 'Another product description' };

    // Cast findOneByOrFail to jest.Mock and mock multiple resolved values
    const findOneByOrFailMock = AppDataSource.getRepository(Product).findOneByOrFail as jest.Mock;
    findOneByOrFailMock
      .mockResolvedValueOnce(mockProduct)
      .mockResolvedValueOnce(mockProduct2);

    // Mock the save function inside transaction
    const saveMock = jest.fn();
    const transactionMock = AppDataSource.transaction as jest.Mock;
    transactionMock.mockImplementationOnce(async (callback) => {
      // Call the callback with a mocked entity manager that has a save function
      await callback({ save: saveMock });
    });

    const registrationDetails: RegistrationDetails = await register(
      'Jane Doe',
      'jane.doe@example.com',
      '0987654321',
      '54321',
      ['Sample Product', 'Product B']
    );

    // Ensure that both products are fetched
    expect(findOneByOrFailMock).toHaveBeenCalledWith({ name: 'Sample Product' });
    expect(findOneByOrFailMock).toHaveBeenCalledWith({ name: 'Product B' });

    // Ensure the user is saved with both products
    expect(saveMock).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      mobile: '0987654321',
      postcode: '54321',
      interests: [mockProduct, mockProduct2],
    }));

    // Ensure registration details are correct
    expect(registrationDetails.name).toEqual('Jane Doe');
    expect(registrationDetails.email).toEqual('jane.doe@example.com');
    expect(registrationDetails.mobile).toEqual('0987654321');
    expect(registrationDetails.postcode).toEqual('54321');
  });

  it('should throw an error when transaction fails', async () => {
    // Mock findOneByOrFail to return products
    const findOneByOrFailMock = AppDataSource.getRepository(Product).findOneByOrFail as jest.Mock;
    findOneByOrFailMock.mockResolvedValue(mockProduct);

    // Simulate an error in transaction
    const transactionMock = AppDataSource.transaction as jest.Mock;
    transactionMock.mockImplementationOnce(() => {
      throw new Error('Transaction failed');
    });

    await expect(register('John Doe', 'john.doe@example.com', '1234567890', '12345', ['Sample Product']))
      .rejects
      .toThrowError('Transaction failed');
  });
});
