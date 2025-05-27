import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserRole } from '@./api-interfaces';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: UserRole.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService = {
    findAll: jest.fn().mockResolvedValue([mockUser]),
    findOne: jest.fn().mockResolvedValue(mockUser),
    create: jest.fn().mockResolvedValue(mockUser),
    update: jest.fn().mockResolvedValue(mockUser),
    delete: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([mockUser]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const result = await controller.findOne('1');
      expect(result).toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        email: 'new@example.com',
        name: 'New User',
        password: 'password123',
      };
      
      const result = await controller.create(createUserDto);
      expect(result).toEqual(mockUser);
      expect(service.create).toHaveBeenCalledWith(
        createUserDto.email,
        createUserDto.name,
        createUserDto.password,
        undefined
      );
    });

    it('should throw ConflictException when user already exists', async () => {
      const createUserDto = {
        email: 'existing@example.com',
        name: 'Existing User',
        password: 'password123',
      };
      
      jest.spyOn(service, 'create').mockRejectedValueOnce(new ConflictException());
      
      await expect(controller.create(createUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto = {
        name: 'Updated Name',
      };
      
      const result = await controller.update('1', updateUserDto);
      expect(result).toEqual(mockUser);
      expect(service.update).toHaveBeenCalledWith('1', updateUserDto);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const updateUserDto = {
        name: 'Updated Name',
      };
      
      jest.spyOn(service, 'update').mockRejectedValueOnce(new NotFoundException());
      
      await expect(controller.update('999', updateUserDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      await expect(controller.delete('1')).resolves.not.toThrow();
      expect(service.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      jest.spyOn(service, 'delete').mockRejectedValueOnce(new NotFoundException());
      
      await expect(controller.delete('999')).rejects.toThrow(NotFoundException);
    });
  });
});