// src/auth/auth.controller.spec.ts

import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateTokenDto } from './dto/create-token.dto';
import { GetTokenByEmailDto } from './dto/get-token-by-email.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './roles.enum';

describe('AuthController', () => {
	let authController: AuthController;
	let authService: AuthService;

	beforeEach(async () => {
		const moduleRef: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [
				{
					provide: AuthService,
					useValue: {
						findUserByEmail: jest.fn(),
						generateToken: jest.fn(),
						updateUserRole: jest.fn(),
						createUser: jest.fn(),
						getTokenByEmail: jest.fn(),
						updateUser: jest.fn(),
						findUserByToken: jest.fn()
					}
				}
			]
		}).compile();

		authController = moduleRef.get<AuthController>(AuthController);
		authService = moduleRef.get<AuthService>(AuthService);
	});

	describe('generateToken', () => {
		it('should create a new user and return a token', async () => {
			const dto: CreateTokenDto = { email: 'test@example.com', role: UserRole.USER };
			(authService.findUserByEmail as jest.Mock).mockResolvedValue(null);
			(authService.generateToken as jest.Mock).mockReturnValue('12345678901234567890123456789012');
			(authService.createUser as jest.Mock).mockResolvedValue(undefined);

			const result = await authController.generateToken(dto);
			expect(result).toEqual({ token: '12345678901234567890123456789012' });
			expect(authService.createUser).toHaveBeenCalledWith('12345678901234567890123456789012', 'test@example.com', UserRole.USER);
		});

		it('should return existing token if user exists and role is the same', async () => {
			const dto: CreateTokenDto = { email: 'test@example.com', role: UserRole.USER };
			const existingUser = { email: 'test@example.com', token: 'existingtoken12345678901234567890', role: UserRole.USER };
			(authService.findUserByEmail as jest.Mock).mockResolvedValue(existingUser);

			const result = await authController.generateToken(dto);
			expect(result).toEqual({ token: 'existingtoken12345678901234567890' });
			expect(authService.updateUserRole).not.toHaveBeenCalled();
		});

		it('should update role if user exists and role is different', async () => {
			const dto: CreateTokenDto = { email: 'test@example.com', role: UserRole.ADMIN };
			const existingUser = { email: 'test@example.com', token: 'existingtoken12345678901234567890', role: UserRole.USER };
			(authService.findUserByEmail as jest.Mock).mockResolvedValue(existingUser);
			(authService.updateUserRole as jest.Mock).mockResolvedValue(undefined);

			const result = await authController.generateToken(dto);
			expect(result).toEqual({ token: 'existingtoken12345678901234567890' });
			expect(authService.updateUserRole).toHaveBeenCalledWith('test@example.com', UserRole.ADMIN);
		});
	});

	describe('updateUser', () => {
		it('should update user email and role', async () => {
			const currentEmail = 'old@example.com';
			const updates: UpdateUserDto = { email: 'new@example.com', role: UserRole.ADMIN };
			const updatedUser = { email: 'new@example.com', role: UserRole.ADMIN, token: 'token123' };
			(authService.updateUser as jest.Mock).mockResolvedValue(updatedUser);

			const result = await authController.updateUser(currentEmail, updates);
			expect(result).toEqual({ message: 'User updated successfully.', user: updatedUser });
			expect(authService.updateUser).toHaveBeenCalledWith('old@example.com', updates);
		});

		it('should throw NotFoundException if user does not exist', async () => {
			const currentEmail = 'nonexistent@example.com';
			const updates: UpdateUserDto = { email: 'new@example.com', role: UserRole.ADMIN };
			(authService.updateUser as jest.Mock).mockRejectedValue(new NotFoundException());

			await expect(authController.updateUser(currentEmail, updates)).rejects.toThrow(NotFoundException);
		});
	});

	describe('getTokenByEmail', () => {
		it('should return token for existing user', async () => {
			const params: GetTokenByEmailDto = { email: 'test@example.com' };
			(authService.getTokenByEmail as jest.Mock).mockResolvedValue('token123456789012345678901234567890');

			const result = await authController.getTokenByEmail(params);
			expect(result).toEqual({ token: 'token123456789012345678901234567890' });
			expect(authService.getTokenByEmail).toHaveBeenCalledWith('test@example.com');
		});

		it('should throw NotFoundException if user does not exist', async () => {
			const params: GetTokenByEmailDto = { email: 'nonexistent@example.com' };
			(authService.getTokenByEmail as jest.Mock).mockRejectedValue(new NotFoundException());

			await expect(authController.getTokenByEmail(params)).rejects.toThrow(NotFoundException);
		});
	});
});
