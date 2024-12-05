// src/tests/users.e2e.spec.ts

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import { User, UserDocument } from '../modules/mongoose/schemas/user.schema';
import * as request from 'supertest';
import { AppModule } from '../app/app.module';
import { AllExceptionsFilter } from '../modules/api/http-exception.filter';
import { TransformInterceptor } from '../modules/api/transform.interceptor';
import { RedisService } from '../modules/redis/redis.service';

jest.setTimeout(30000);

describe('UsersController (e2e) - Input Validation', () => {
	let app: INestApplication;
	let redisService: RedisService;
	let dbConnection: Connection;
	let moduleFixture: TestingModule;

	beforeAll(async () => {
		moduleFixture = await Test.createTestingModule({
			imports: [AppModule]
		}).compile();

		app = moduleFixture.createNestApplication();

		app.getHttpAdapter().getInstance().disable('x-powered-by');

		app.useGlobalInterceptors(new TransformInterceptor());
		app.useGlobalFilters(new AllExceptionsFilter());

		app.useGlobalPipes(
			new ValidationPipe({
				whitelist: true,
				forbidNonWhitelisted: true,
				transform: true,
				transformOptions: {
					enableImplicitConversion: true
				}
			})
		);

		await app.init();

		dbConnection = moduleFixture.get<Connection>(getConnectionToken());

		redisService = app.get(RedisService);
	});

	afterAll(async () => {
		// Delete specific users created during the tests
		const userModel = moduleFixture.get<Model<UserDocument>>(
			getModelToken(User.name)
		);

		await userModel.deleteMany({
			email: {
				$in: [
					'test@example.com',
					'loginuser@example.com',
					'verifyuser@example.com',
					'getmeuser@example.com',
					'updatemeuser@example.com',
					'resetpassworduser@example.com',
					'adminuser@example.com',
					'regularuser@example.com',
					'adminuser2@example.com',
					'userToUpdate@example.com',
					'basicuser@example.com',
					'updateduser@example.com',
					'resenduser@example.com'
				]
			}
		});

		// Close the database connection
		await dbConnection.close();

		// Close the application
		await app.close();

		// Close Redis client without flushing all data
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
					expect(res.body.data.user.email).toBe('test@example.com');

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
						'password must be longer than or equal to 8 characters'
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
					expect(res.body.messages).toContain(
						'Authorization header is required'
					);
				});
		});
	});

	describe('PUT /users/me', () => {
		const url = '/users/me';
		let accessToken: string;

		beforeAll(async () => {
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
						'role must be one of the following values: super, admin, basic'
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

	describe('PUT /users/reset-password', () => {
		const url = '/users/reset-password';
		let accessToken: string;

		beforeAll(async () => {
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
	});

	describe('GET /users', () => {
		const url = '/users';
		let adminToken: string;
		let userId: string;
		let userModel: Model<UserDocument>;

		beforeAll(async () => {
			userModel = moduleFixture.get<Model<UserDocument>>(
				getModelToken(User.name)
			);

			await request(app.getHttpServer())
				.post('/users/signup')
				.send({
					email: 'adminuser@example.com',
					password: 'Password123!'
				})
				.expect(201);

			const user = await userModel
				.findOne({
					email: 'adminuser@example.com'
				})
				.exec();

			userId = user._id.toString();
			await userModel.updateOne(
				{
					_id: user._id
				},
				{
					$set: {
						role: 'admin'
					}
				}
			);

			const loginResponse = await request(app.getHttpServer())
				.post('/users/login')
				.send({
					email: 'adminuser@example.com',
					password: 'Password123!'
				})
				.expect(200);

			adminToken = loginResponse.body.data.user.token;

			await request(app.getHttpServer())
				.post('/users/signup')
				.send({
					email: 'regularuser@example.com',
					password: 'Password123!'
				})
				.expect(201);
		});

		it('should retrieve a user by ID when authenticated as admin', async () => {
			const user = await userModel
				.findOne({
					email: 'regularuser@example.com'
				})
				.exec();

			const userIdToRetrieve = user._id.toString();

			return request(app.getHttpServer())
				.get(url)
				.set('Authorization', `Bearer ${adminToken}`)
				.query({
					id: userIdToRetrieve
				})
				.expect(200)
				.expect((res) => {
					expect(res.body.data.user).toBeDefined();
					expect(res.body.data.user.email).toBe(
						'regularuser@example.com'
					);

					expect(res.body.messages).toContain(
						'User retrieved successfully.'
					);
				});
		});

		it('should fail when not authenticated', () => {
			return request(app.getHttpServer())
				.get(url)
				.expect(401)
				.expect((res) => {
					expect(res.body.messages).toContain(
						'Authorization header is required'
					);
				});
		});

		it('should fail when authenticated as a basic user', async () => {
			const loginResponse = await request(app.getHttpServer())
				.post('/users/login')
				.send({
					email: 'regularuser@example.com',
					password: 'Password123!'
				})
				.expect(200);

			const basicToken = loginResponse.body.data.user.token;

			const user = await userModel
				.findOne({
					email: 'regularuser@example.com'
				})
				.exec();

			const userIdToRetrieve = user._id.toString();

			return request(app.getHttpServer())
				.get(url)
				.set('Authorization', `Bearer ${basicToken}`)
				.query({
					id: userIdToRetrieve
				})
				.expect(403)
				.expect((res) => {
					expect(res.body.messages[0]).toContain('Access denied');
				});
		});

		it('should fail when user not found', () => {
			const nonExistentUserId = '5f8f8c44b54764421b7156c6'; // Random ObjectId

			return request(app.getHttpServer())
				.get(url)
				.set('Authorization', `Bearer ${adminToken}`)
				.query({
					id: nonExistentUserId
				})
				.expect(404)
				.expect((res) => {
					expect(res.body.messages).toContain(
						`User with id ${nonExistentUserId} not found.`
					);
				});
		});
	});

	describe('PUT /users', () => {
		const url = '/users';
		let adminToken: string;
		let userIdToUpdate: string;
		let userModel: Model<UserDocument>;

		beforeAll(async () => {
			userModel = moduleFixture.get<Model<UserDocument>>(
				getModelToken(User.name)
			);

			// Create an admin user
			await request(app.getHttpServer())
				.post('/users/signup')
				.send({
					email: 'adminuser2@example.com',
					password: 'Password123!'
				})
				.expect(201);

			const adminUser = await userModel
				.findOne({
					email: 'adminuser2@example.com'.toLowerCase()
				})
				.exec();

			await userModel.updateOne(
				{
					_id: adminUser._id
				},
				{
					$set: {
						role: 'admin'
					}
				}
			);

			const loginResponse = await request(app.getHttpServer())
				.post('/users/login')
				.send({
					email: 'adminuser2@example.com',
					password: 'Password123!'
				})
				.expect(200);

			adminToken = loginResponse.body.data.user.token;

			// Create a user to update
			await request(app.getHttpServer())
				.post('/users/signup')
				.send({
					email: 'userToUpdate@example.com',
					password: 'Password123!'
				})
				.expect(201);

			const user = await userModel
				.findOne({
					email: 'userToUpdate@example.com'.toLowerCase()
				})
				.exec();

			userIdToUpdate = user._id.toString();
		});

		it('should update a user by ID when authenticated as admin', () => {
			return request(app.getHttpServer())
				.put(url)
				.set('Authorization', `Bearer ${adminToken}`)
				.query({
					id: userIdToUpdate
				})
				.send({
					email: 'updateduser@example.com'
				})
				.expect(200)
				.expect((res) => {
					expect(res.body.data.user).toBeDefined();
					expect(res.body.data.user.email).toBe(
						'updateduser@example.com'
					);

					expect(res.body.messages).toContain(
						'User updated successfully.'
					);
				});
		});

		it('should fail when not authenticated', () => {
			return request(app.getHttpServer())
				.put(url)
				.query({
					id: userIdToUpdate
				})
				.send({
					email: 'shouldnotwork@example.com'
				})
				.expect(401)
				.expect((res) => {
					expect(res.body.messages).toContain(
						'Authorization header is required'
					);
				});
		});

		it('should fail when authenticated as basic user', async () => {
			// Create a new basic user for this test
			await request(app.getHttpServer())
				.post('/users/signup')
				.send({
					email: 'basicuser@example.com',
					password: 'Password123!'
				})
				.expect(201);

			const loginResponse = await request(app.getHttpServer())
				.post('/users/login')
				.send({
					email: 'basicuser@example.com',
					password: 'Password123!'
				})
				.expect(200);

			const basicToken = loginResponse.body.data.user.token;

			return request(app.getHttpServer())
				.put(url)
				.set('Authorization', `Bearer ${basicToken}`)
				.query({
					id: userIdToUpdate
				})
				.send({
					email: 'shouldnotwork@example.com'
				})
				.expect(403)
				.expect((res) => {
					expect(res.body.messages[0]).toContain('Access denied');
				});
		});

		it('should fail when user not found', () => {
			const nonExistentUserId = '5f8f8c44b54764421b7156c6'; // Random ObjectId

			return request(app.getHttpServer())
				.put(url)
				.set('Authorization', `Bearer ${adminToken}`)
				.query({
					id: nonExistentUserId
				})
				.send({
					email: 'shouldnotwork@example.com'
				})
				.expect(404)
				.expect((res) => {
					expect(res.body.messages).toContain(
						`User with id ${nonExistentUserId} not found.`
					);
				});
		});

		it('should fail when updating email to an invalid email', () => {
			return request(app.getHttpServer())
				.put(url)
				.set('Authorization', `Bearer ${adminToken}`)
				.query({
					id: userIdToUpdate
				})
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
				.set('Authorization', `Bearer ${adminToken}`)
				.query({
					id: userIdToUpdate
				})
				.send({
					role: 'invalid-role'
				})
				.expect(400)
				.expect((res) => {
					expect(res.body.messages[0]).toContain(
						'role must be one of the following values: super, admin, basic'
					);
				});
		});
	});
});
