import { Test, TestingModule } from '@nestjs/testing';
import { RunsController } from './runs.controller';
import { RunsService } from './runs.service';
import { NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';

describe('RunsController', () => {
  let controller: RunsController;
  let service: RunsService;

  const mockRun = {
    id: '1',
    startDate: new Date(),
    endDate: null,
    estimatedA1C: 5.7,
    notes: 'Test Notes',
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    glucoseReadings: [],
  };

  const mockRunsService = {
    findAll: jest.fn().mockResolvedValue([mockRun]),
    findOne: jest.fn().mockResolvedValue(mockRun),
    create: jest.fn().mockResolvedValue(mockRun),
    update: jest.fn().mockResolvedValue(mockRun),
    delete: jest.fn().mockResolvedValue(undefined),
    completeRun: jest.fn().mockResolvedValue({
      ...mockRun,
      endDate: expect.any(Date),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RunsController],
      providers: [
        {
          provide: RunsService,
          useValue: mockRunsService,
        },
      ],
    }).compile();

    controller = module.get<RunsController>(RunsController);
    service = module.get<RunsService>(RunsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of runs', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([mockRun]);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should filter runs by userId', async () => {
      const userId = 'user1';
      await controller.findAll(userId);
      expect(service.findAll).toHaveBeenCalledWith(userId);
    });
  });

  describe('findOne', () => {
    it('should return a single run', async () => {
      const result = await controller.findOne('1');
      expect(result).toEqual(mockRun);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('create', () => {
    it('should create a new run', async () => {
      const createRunDto = {
        startDate: new Date(),
        notes: 'New Run Notes',
        userId: randomUUID(),
      };
      
      const result = await controller.create(createRunDto);
      expect(result).toEqual(mockRun);
      expect(service.create).toHaveBeenCalledWith(createRunDto);
    });
  });

  describe('update', () => {
    it('should update a run', async () => {
      const updateRunDto = {
        notes: 'Updated Notes',
      };
      
      const result = await controller.update('1', updateRunDto);
      expect(result).toEqual(mockRun);
      expect(service.update).toHaveBeenCalledWith('1', updateRunDto);
    });
  });

  describe('delete', () => {
    it('should delete a run', async () => {
      await expect(controller.delete('1')).resolves.not.toThrow();
      expect(service.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('completeRun', () => {
    it('should complete a run', async () => {
      const result = await controller.completeRun('1');
      expect(result).toEqual({
        ...mockRun,
        endDate: expect.any(Date),
      });
      expect(service.completeRun).toHaveBeenCalledWith('1');
    });
  });
});