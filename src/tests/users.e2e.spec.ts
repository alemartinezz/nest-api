// src/tests/users.e2e.spec.ts

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import * as request from 'supertest';
import { AppModule } from '../app/app.module';
import { AllExceptionsFilter } from '../modules/api/http-exception.filter';
import { TransformInterceptor } from '../modules/api/transform.interceptor';
import { RedisService } from '../modules/redis/redis.service';

describe('UsersController (e2e) - Input Validation', () => {
	let app: INestApplication;
	let redisService: RedisService;
	let dbConnection: Connection;

	beforeAll(async () => {
		// Create a testing module with the AppModule
		const moduleFixture = await Test.createTestingModule({
			imports: [AppModule]
		}).compile();

		app = moduleFixture.createNestApplication();

		// Disable 'X-Powered-By' header
		app.getHttpAdapter().getInstance().disable('x-powered-by');

		// Enable global interceptors and filters
		app.useGlobalInterceptors(new TransformInterceptor());
		app.useGlobalFilters(new AllExceptionsFilter());

		// Enable global ValidationPipe with transformation
		app.useGlobalPipes(
			new ValidationPipe({
				whitelist: true, // Strip properties that don't have decorators
				forbidNonWhitelisted: true, // Throw errors on non-whitelisted properties
				transform: true, // Automatically transform payloads to DTO instances
				transformOptions: {
					enableImplicitConversion: true // Allow implicit type conversion
				}
			})
		);

		await app.init();

		// Get the database connection
		dbConnection = moduleFixture.get<Connection>(getConnectionToken());

		// Get Redis service
		redisService = app.get(RedisService);
	});

	afterAll(async () => {
		// Clean up the database
		await dbConnection.dropDatabase();
		await dbConnection.close();

		await app.close();

		// Clean up Redis
		await redisService.getClient().flushAll();
		await redisService.getClient().quit();
	});

	describe('POST /users/signup', () => {
		const url = '/users/signup';

		it('should successfully sign up with valid email and password', () => {
			return request(app.getHttpServer())
				.post(url)
				.send({
					email: 'test@example.com',
					password: 'Password123!'
				})
				.expect(201)
				.expect((res) => {
					expect(res.body.data.user).toBeDefined();
					expect(res.body.data.user.email).toBe(
						'test@example.com'
					);
					expect(res.body.messages).toContain(
						'User created successfully'
					);
				});
		});

		it('should fail when email is missing', () => {
			return request(app.getHttpServer())
				.post(url)
				.send({
					password: 'Password123!'
				})
				.expect(400)
				.expect((res) => {
					expect(res.body.messages).toContain(
						'email should not be empty'
					);
				});
		});

		it('should fail when password is too short', () => {
			return request(app.getHttpServer())
				.post(url)
				.send({
					email: 'test2@example.com',
					password: 'Pass1!'
				})
				.expect(400)
				.expect((res) => {
					expect(res.body.messages).toContain(
						'Password too weak: must contain at least 1 uppercase letter, 1 lowercase letter, 1 number or special character, and be at least 8 characters long.'
					);
				});
		});

		it('should fail when password is missing', () => {
			return request(app.getHttpServer())
				.post(url)
				.send({
					email: 'test3@example.com'
				})
				.expect(400)
				.expect((res) => {
					expect(res.body.messages).toContain(
						'password should not be empty'
					);
				});
		});

		it('should fail when email is invalid', () => {
			return request(app.getHttpServer())
				.post(url)
				.send({
					email: 'invalid-email',
					password: 'Password123!'
				})
				.expect(400)
				.expect((res) => {
					expect(res.body.messages).toContain(
						'email must be an email'
					);
				});
		});

		it('should fail when extra fields are provided', () => {
			return request(app.getHttpServer())
				.post(url)
				.send({
					email: 'test4@example.com',
					password: 'Password123!',
					extraField: 'should not be here'
				})
				.expect(400)
				.expect((res) => {
					expect(res.body.messages).toContain(
						'property extraField should not exist'
					);
				});
		});
	});

	describe('POST /users/login', () => {
		const url = '/users/login';

		beforeAll(async () => {
			// Create a user for login
			await request(app.getHttpServer())
				.post('/users/signup')
				.send({
					email: 'loginuser@example.com',
					password: 'Password123!'
				})
				.expect(201);
		});

		it('should successfully login with valid credentials', () => {
			return request(app.getHttpServer())
				.post(url)
				.send({
					email: 'loginuser@example.com',
					password: 'Password123!'
				})
				.expect(200)
				.expect((res) => {
					expect(res.body.data.user).toBeDefined();
					expect(res.body.data.user.email).toBe(
						'loginuser@example.com'
					);
					expect(res.body.messages).toContain('Login successful');
				});
		});

		it('should fail when email is missing', () => {
			return request(app.getHttpServer())
				.post(url)
				.send({
					password: 'Password123!'
				})
				.expect(400)
				.expect((res) => {
					expect(res.body.messages).toContain(
						'email should not be empty'
					);
				});
		});

		it('should fail when password is missing', () => {
			return request(app.getHttpServer())
				.post(url)
				.send({
					email: 'loginuser@example.com'
				})
				.expect(400)
				.expect((res) => {
					expect(res.body.messages).toContain(
						'password should not be empty'
					);
				});
		});

		it('should fail when email is invalid', () => {
			return request(app.getHttpServer())
				.post(url)
				.send({
					email: 'invalid-email',
					password: 'Password123!'
				})
				.expect(400)
				.expect((res) => {
					expect(res.body.messages).toContain(
						'email must be an email'
					);
				});
		});

		it('should fail when extra fields are provided', () => {
			return request(app.getHttpServer())
				.post(url)
				.send({
					email: 'loginuser@example.com',
					password: 'Password123!',
					extraField: 'should not be here'
				})
				.expect(400)
				.expect((res) => {
					expect(res.body.messages).toContain(
						'property extraField should not exist'
					);
				});
		});
	});

	describe('POST /users/verify-email', () => {
		const url = '/users/verify-email';

		beforeAll(async () => {
			// Create a user for email verification
			await request(app.getHttpServer())
				.post('/users/signup')
				.send({
					email: 'verifyuser@example.com',
					password: 'Password123!'
				})
				.expect(201);
		});

		it('should fail when email is missing', () => {
			return request(app.getHttpServer())
				.post(url)
				.send({
					code: '123456'
				})
				.expect(400)
				.expect((res) => {
					expect(res.body.messages).toContain(
						'email should not be empty'
					);
				});
		});

		it('should fail when code is missing', () => {
			return request(app.getHttpServer())
				.post(url)
				.send({
					email: 'verifyuser@example.com'
				})
				.expect(400)
				.expect((res) => {
					expect(res.body.messages).toContain(
						'code should not be empty'
					);
				});
		});

		it('should fail when email is invalid', () => {
			return request(app.getHttpServer())
				.post(url)
				.send({
					email: 'invalid-email',
					code: '123456'
				})
				.expect(400)
				.expect((res) => {
					expect(res.body.messages).toContain(
						'email must be an email'
					);
				});
		});

		it('should fail when extra fields are provided', () => {
			return request(app.getHttpServer())
				.post(url)
				.send({
					email: 'verifyuser@example.com',
					code: '123456',
					extraField: 'should not be here'
				})
				.expect(400)
				.expect((res) => {
					expect(res.body.messages).toContain(
						'property extraField should not exist'
					);
				});
		});
	});

	describe('PUT /users/reset-password', () => {
		const url = '/users/reset-password';
		let accessToken: string;

		beforeAll(async () => {
			// Create a user and login to get access token
			await request(app.getHttpServer())
				.post('/users/signup')
				.send({
					email: 'resetpassworduser@example.com',
					password: 'Password123!'
				})
				.expect(201);

			const loginResponse = await request(app.getHttpServer())
				.post('/users/login')
				.send({
					email: 'resetpassworduser@example.com',
					password: 'Password123!'
				})
				.expect(200);

			accessToken = loginResponse.body.data.user.token;
		});

		it('should fail when currentPassword is missing', () => {
			return request(app.getHttpServer())
				.put(url)
				.set('Authorization', `Bearer ${accessToken}`)
				.send({
					newPassword: 'NewPassword123!'
				})
				.expect(400)
				.expect((res) => {
					expect(res.body.messages).toContain(
						'currentPassword should not be empty'
					);
				});
		});

		it('should fail when newPassword is missing', () => {
			return request(app.getHttpServer())
				.put(url)
				.set('Authorization', `Bearer ${accessToken}`)
				.send({
					currentPassword: 'Password123!'
				})
				.expect(400)
				.expect((res) => {
					expect(res.body.messages).toContain(
						'newPassword should not be empty'
					);
				});
		});

		it('should fail when newPassword is too weak', () => {
			return request(app.getHttpServer())
				.put(url)
				.set('Authorization', `Bearer ${accessToken}`)
				.send({
					currentPassword: 'Password123!',
					newPassword: 'weak'
				})
				.expect(400)
				.expect((res) => {
					expect(res.body.messages[0]).toContain(
						'New password too weak'
					);
				});
		});

		it('should fail when extra fields are provided', () => {
			return request(app.getHttpServer())
				.put(url)
				.set('Authorization', `Bearer ${accessToken}`)
				.send({
					currentPassword: 'Password123!',
					newPassword: 'NewPassword123!',
					extraField: 'should not be here'
				})
				.expect(400)
				.expect((res) => {
					expect(res.body.messages).toContain(
						'property extraField should not exist'
					);
				});
		});
	});

	describe('POST /users/resend-verification-code', () => {
		const url = '/users/resend-verification-code';

		it('should fail when email is missing', () => {
			return request(app.getHttpServer())
				.post(url)
				.send({})
				.expect(400)
				.expect((res) => {
					expect(res.body.messages).toContain(
						'email should not be empty'
					);
				});
		});

		it('should fail when email is invalid', () => {
			return request(app.getHttpServer())
				.post(url)
				.send({
					email: 'invalid-email'
				})
				.expect(400)
				.expect((res) => {
					expect(res.body.messages).toContain(
						'email must be an email'
					);
				});
		});

		it('should fail when extra fields are provided', () => {
			return request(app.getHttpServer())
				.post(url)
				.send({
					email: 'resenduser@example.com',
					extraField: 'should not be here'
				})
				.expect(400)
				.expect((res) => {
					expect(res.body.messages).toContain(
						'property extraField should not exist'
					);
				});
		});
	});

	describe('GET /users/me', () => {
		const url = '/users/me';
		let accessToken: string;

		beforeAll(async () => {
			// Create a user and login to get access token
			await request(app.getHttpServer())
				.post('/users/signup')
				.send({
					email: 'getmeuser@example.com',
					password: 'Password123!'
				})
				.expect(201);

			const loginResponse = await request(app.getHttpServer())
				.post('/users/login')
				.send({
					email: 'getmeuser@example.com',
					password: 'Password123!'
				})
				.expect(200);

			accessToken = loginResponse.body.data.user.token;
		});

		it('should get profile when authenticated', () => {
			return request(app.getHttpServer())
				.get(url)
				.set('Authorization', `Bearer ${accessToken}`)
				.expect(200)
				.expect((res) => {
					expect(res.body.data.user).toBeDefined();
					expect(res.body.messages).toContain(
						'Profile retrieved successfully.'
					);
				});
		});

		it('should fail when not authenticated', () => {
			return request(app.getHttpServer())
				.get(url)
				.expect(401)
				.expect((res) => {
					expect(res.body.messages).toContain('Invalid token');
				});
		});
	});

	describe('PUT /users/me', () => {
		const url = '/users/me';
		let accessToken: string;

		beforeAll(async () => {
			// Create a user and login to get access token
			await request(app.getHttpServer())
				.post('/users/signup')
				.send({
					email: 'updatemeuser@example.com',
					password: 'Password123!'
				})
				.expect(201);

			const loginResponse = await request(app.getHttpServer())
				.post('/users/login')
				.send({
					email: 'updatemeuser@example.com',
					password: 'Password123!'
				})
				.expect(200);

			accessToken = loginResponse.body.data.user.token;
		});

		it('should fail when updating email to an invalid email', () => {
			return request(app.getHttpServer())
				.put(url)
				.set('Authorization', `Bearer ${accessToken}`)
				.send({
					email: 'invalid-email'
				})
				.expect(400)
				.expect((res) => {
					expect(res.body.messages).toContain(
						'email must be an email'
					);
				});
		});

		it('should fail when updating role to an invalid role', () => {
			return request(app.getHttpServer())
				.put(url)
				.set('Authorization', `Bearer ${accessToken}`)
				.send({
					role: 'invalid-role'
				})
				.expect(400)
				.expect((res) => {
					expect(res.body.messages[0]).toContain(
						'role must be a valid enum value'
					);
				});
		});

		it('should fail when extra fields are provided', () => {
			return request(app.getHttpServer())
				.put(url)
				.set('Authorization', `Bearer ${accessToken}`)
				.send({
					email: 'newemail@example.com',
					extraField: 'should not be here'
				})
				.expect(400)
				.expect((res) => {
					expect(res.body.messages).toContain(
						'property extraField should not exist'
					);
				});
		});
	});
});
