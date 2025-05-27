import { Test, TestingModule } from '@nestjs/testing';
import { RunsController } from './runs.controller';
import { RunsService } from './runs.service';
import { NotFoundException } from '@nestjs/common';

enum RunStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

describe('RunsController', () => {
  let controller: RunsController;
  let service: RunsService;

  const mockRun = {
    id: '1',
    name: 'Test Run',
    description: 'Test Description',
    status: RunStatus.PENDING,
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    readings: [],
  };

  const mockRunsService = {
    findAll: jest.fn().mockResolvedValue([mockRun]),
    findOne: jest.fn().mockResolvedValue(mockRun),
    create: jest.fn().mockResolvedValue(mockRun),
    update: jest.fn().mockResolvedValue(mockRun),
    delete: jest.fn().mockResolvedValue(undefined),
    startRun: jest.fn().mockResolvedValue({
      ...mockRun,
      status: RunStatus.RUNNING,
      startedAt: expect.any(Date),
    }),
    completeRun: jest.fn().mockResolvedValue({
      ...mockRun,
      status: RunStatus.COMPLETED,
      startedAt: expect.any(Date),
      completedAt: expect.any(Date),
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
        name: 'New Run',
        description: 'New Description',
        userId: 'user1',
      };
      
      const result = await controller.create(createRunDto);
      expect(result).toEqual(mockRun);
      expect(service.create).toHaveBeenCalledWith(createRunDto);
    });
  });

  describe('update', () => {
    it('should update a run', async () => {
      const updateRunDto = {
        name: 'Updated Run',
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

  describe('startRun', () => {
    it('should start a run', async () => {
      const result = await controller.startRun('1');
      expect(result).toEqual({
        ...mockRun,
        status: RunStatus.RUNNING,
        startedAt: expect.any(Date),
      });
      expect(service.startRun).toHaveBeenCalledWith('1');
    });
  });

  describe('completeRun', () => {
    it('should complete a run successfully', async () => {
      const result = await controller.completeRun('1', true);
      expect(result).toEqual({
        ...mockRun,
        status: RunStatus.COMPLETED,
        startedAt: expect.any(Date),
        completedAt: expect.any(Date),
      });
      expect(service.completeRun).toHaveBeenCalledWith('1', true);
    });

    it('should mark a run as failed', async () => {
      jest.spyOn(service, 'completeRun').mockResolvedValueOnce({
        ...mockRun,
        status: RunStatus.FAILED,
        startedAt: expect.any(Date),
        completedAt: expect.any(Date),
      });
      
      const result = await controller.completeRun('1', false);
      expect(result).toEqual({
        ...mockRun,
        status: RunStatus.FAILED,
        startedAt: expect.any(Date),
        completedAt: expect.any(Date),
      });
      expect(service.completeRun).toHaveBeenCalledWith('1', false);
    });
  });
});