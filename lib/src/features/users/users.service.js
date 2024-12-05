var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { plainToClass } from 'class-transformer';
import * as crypto from 'crypto';
import { UserRole } from "../../modules/auth/dtos/roles.guards.dto";
import { UserResponseDto } from './dtos/user-response.dto';
let MyUsersService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var MyUsersService = _classThis = class {
        constructor(userModel, myNotificationsService, rateLimitConfigService) {
            this.userModel = userModel;
            this.myNotificationsService = myNotificationsService;
            this.rateLimitConfigService = rateLimitConfigService;
            this.logger = new Logger(MyUsersService.name);
        }
        signUp(email, password) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.debug(`Attempting to create user with email: ${email}`);
                email = email.toLowerCase();
                const existingUser = yield this.userModel.findOne({ email }).exec();
                if (existingUser) {
                    this.logger.warn(`Email ${email} is already in use.`);
                    throw new BadRequestException(`Email ${email} is already in use.`);
                }
                let hashedPassword;
                try {
                    hashedPassword = yield argon2.hash(password, {
                        type: argon2.argon2id,
                        memoryCost: Math.pow(2, 16),
                        timeCost: 3,
                        parallelism: 1
                    });
                }
                catch (error) {
                    this.logger.error('Error hashing password', error);
                    throw new BadRequestException('Failed to hash password.');
                }
                const emailVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
                const emailVerificationCodeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
                const rateLimitConfig = this.rateLimitConfigService.getRateLimit(UserRole.BASIC);
                const { tokenCurrentLimit, tokenExpirationDays } = rateLimitConfig;
                const tokenExpiration = new Date(Date.now() + tokenExpirationDays * 24 * 60 * 60 * 1000);
                const user = new this.userModel({
                    email,
                    emailVerified: false,
                    emailVerificationCode,
                    emailVerificationCodeExpires,
                    password: hashedPassword,
                    role: UserRole.BASIC,
                    token: crypto.randomBytes(16).toString('hex'),
                    tokenTotalUsage: 0,
                    tokenCurrentUsage: 0,
                    tokenCurrentLimit,
                    tokenExpiration
                });
                try {
                    yield user.save();
                    yield this.myNotificationsService.sendVerificationEmail(email, emailVerificationCode);
                    this.logger.log(`User created successfully with email: ${email}`);
                }
                catch (error) {
                    this.logger.error(`Error creating user with email: ${email}`, error);
                    throw new BadRequestException('Failed to create user due to a database error.');
                }
                const userDto = plainToClass(UserResponseDto, user, {
                    excludeExtraneousValues: true
                });
                return userDto;
            });
        }
        login(email, password) {
            return __awaiter(this, void 0, void 0, function* () {
                email = email.toLowerCase();
                const user = yield this.userModel
                    .findOne({ email })
                    .select('+password')
                    .lean()
                    .exec();
                if (!user) {
                    throw new NotFoundException(`User with email: ${email} not found.`);
                }
                let isPasswordValid;
                try {
                    isPasswordValid = yield argon2.verify(user.password, password);
                }
                catch (error) {
                    this.logger.error('Error verifying password', error);
                    throw new UnauthorizedException('Invalid password.');
                }
                if (!isPasswordValid) {
                    throw new UnauthorizedException('Invalid password.');
                }
                const userDto = plainToClass(UserResponseDto, user, {
                    excludeExtraneousValues: true
                });
                return { user: userDto };
            });
        }
        getUser(params) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!params.id && !params.email && !params.token) {
                    throw new BadRequestException('At least one of id, email, or token must be provided.');
                }
                let user = null;
                if (params.id) {
                    user = yield this.userModel.findById(params.id);
                }
                else if (params.email) {
                    user = yield this.userModel.findOne({ email: params.email });
                }
                else if (params.token) {
                    user = yield this.userModel.findOne({ token: params.token });
                }
                if (!user) {
                    if (params.id) {
                        throw new NotFoundException(`User with id ${params.id} not found.`);
                    }
                    else if (params.email) {
                        throw new NotFoundException(`User with email ${params.email} not found.`);
                    }
                    else if (params.token) {
                        throw new NotFoundException(`User with token ${params.token} not found.`);
                    }
                    else {
                        throw new NotFoundException(`User not found with provided parameters.`);
                    }
                }
                if (!user.role) {
                    user.role = UserRole.BASIC;
                    yield user.save();
                    this.logger.log(`Assigned default role to user ${user.email}`);
                }
                return user;
            });
        }
        resetPassword(authenticatedUser, changePasswordDto) {
            return __awaiter(this, void 0, void 0, function* () {
                const { currentPassword, newPassword } = changePasswordDto;
                let isPasswordValid;
                try {
                    isPasswordValid = yield argon2.verify(authenticatedUser.password, currentPassword);
                }
                catch (error) {
                    this.logger.error('Error verifying current password', error);
                    throw new UnauthorizedException('Invalid current password.');
                }
                if (!isPasswordValid) {
                    throw new UnauthorizedException('Invalid current password.');
                }
                let hashedNewPassword;
                try {
                    hashedNewPassword = yield argon2.hash(newPassword, {
                        type: argon2.argon2id,
                        memoryCost: Math.pow(2, 16),
                        timeCost: 3,
                        parallelism: 1
                    });
                }
                catch (error) {
                    this.logger.error('Error hashing new password', error);
                    throw new BadRequestException('Failed to hash new password.');
                }
                authenticatedUser.password = hashedNewPassword;
                try {
                    yield authenticatedUser.save();
                    this.logger.log(`Password updated successfully for user ${authenticatedUser.email}`);
                }
                catch (error) {
                    this.logger.error('Error saving new password', error);
                    throw new BadRequestException('Failed to update password due to a database error.');
                }
                return;
            });
        }
        regenerateToken(authenticatedUser) {
            return __awaiter(this, void 0, void 0, function* () {
                const token = crypto.randomBytes(16).toString('hex');
                const rateLimitConfig = this.rateLimitConfigService.getRateLimit(authenticatedUser.role);
                const { tokenCurrentLimit, tokenExpirationDays } = rateLimitConfig;
                const tokenExpiration = new Date(Date.now() + tokenExpirationDays * 24 * 60 * 60 * 1000);
                try {
                    yield this.userModel.findByIdAndUpdate(authenticatedUser._id, {
                        $set: {
                            token,
                            tokenCurrentUsage: 0,
                            tokenCurrentLimit,
                            tokenExpiration
                        }
                    });
                }
                catch (error) {
                    this.logger.error(`Error regenerating token for user ${authenticatedUser.email}`, error);
                    throw new BadRequestException('Failed to regenerate token due to a database error.');
                }
                return token;
            });
        }
        verifyEmail(email, code) {
            return __awaiter(this, void 0, void 0, function* () {
                email = email.toLowerCase();
                const user = yield this.userModel.findOne({ email });
                if (!user) {
                    throw new NotFoundException(`User with email ${email} not found.`);
                }
                if (user.emailVerified) {
                    throw new BadRequestException('Email is already verified.');
                }
                if (!user.emailVerificationCode ||
                    !user.emailVerificationCodeExpires ||
                    user.emailVerificationCode !== code) {
                    throw new BadRequestException('Invalid verification code.');
                }
                if (user.emailVerificationCodeExpires < new Date()) {
                    throw new BadRequestException('Verification code has expired.');
                }
                user.emailVerified = true;
                user.emailVerificationCode = undefined;
                user.emailVerificationCodeExpires = undefined;
                yield user.save();
            });
        }
        resendVerificationCode(email) {
            return __awaiter(this, void 0, void 0, function* () {
                email = email.toLowerCase();
                const user = yield this.userModel.findOne({ email });
                if (!user) {
                    throw new NotFoundException(`User with email ${email} not found.`);
                }
                if (user.emailVerified) {
                    throw new BadRequestException('Email is already verified.');
                }
                const emailVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
                const emailVerificationCodeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
                user.emailVerificationCode = emailVerificationCode;
                user.emailVerificationCodeExpires = emailVerificationCodeExpires;
                yield user.save();
                yield this.myNotificationsService.sendVerificationEmail(email, emailVerificationCode);
            });
        }
        getUserById(userId) {
            return __awaiter(this, void 0, void 0, function* () {
                const user = yield this.userModel.findById(userId);
                if (!user) {
                    throw new NotFoundException(`User with id ${userId} not found.`);
                }
                const userDto = plainToClass(UserResponseDto, user, {
                    excludeExtraneousValues: true
                });
                return userDto;
            });
        }
        updateUser(authenticatedUser, updates) {
            return __awaiter(this, void 0, void 0, function* () {
                let changesDetected = false;
                const user = yield this.userModel.findById(authenticatedUser.id);
                if (!user) {
                    throw new NotFoundException(`User not found.`);
                }
                const fieldsToUpdate = {};
                for (const [key, value] of Object.entries(updates)) {
                    if (!(key in user)) {
                        continue;
                    }
                    if (key === 'email') {
                        const normalizedEmail = value.toLowerCase();
                        if (user.email.toLowerCase() !== normalizedEmail) {
                            const existingUser = yield this.userModel
                                .findOne({ email: normalizedEmail })
                                .exec();
                            if (existingUser &&
                                existingUser._id.toString() !== user._id.toString()) {
                                throw new BadRequestException(`Email ${value} is already in use.`);
                            }
                            fieldsToUpdate[key] = normalizedEmail;
                            changesDetected = true;
                        }
                    }
                    else {
                        if (user[key] !== value) {
                            fieldsToUpdate[key] = value;
                            changesDetected = true;
                        }
                    }
                }
                if (Object.keys(fieldsToUpdate).length === 0) {
                    const userDto = plainToClass(UserResponseDto, user, {
                        excludeExtraneousValues: true
                    });
                    return { user: userDto, changesDetected };
                }
                try {
                    const updatedUser = yield this.userModel.findByIdAndUpdate(user._id, { $set: fieldsToUpdate }, { new: true });
                    const userDto = plainToClass(UserResponseDto, updatedUser, {
                        excludeExtraneousValues: true
                    });
                    return { user: userDto, changesDetected };
                }
                catch (error) {
                    this.logger.error(`Error updating user with id ${user._id}.`, error);
                    throw new BadRequestException('Failed to update user.');
                }
            });
        }
        updateUserById(params, updates) {
            return __awaiter(this, void 0, void 0, function* () {
                const user = yield this.getUser({ id: params.id });
                if (user.role === UserRole.SUPER) {
                    throw new BadRequestException('Cannot update a user with super role.');
                }
                const fieldsToUpdate = {};
                for (const [key, value] of Object.entries(updates)) {
                    if (!(key in user)) {
                        continue;
                    }
                    if (key === 'email') {
                        const normalizedEmail = value.toLowerCase();
                        if (user.email.toLowerCase() !== normalizedEmail) {
                            const existingUser = yield this.userModel
                                .findOne({ email: normalizedEmail })
                                .exec();
                            if (existingUser &&
                                existingUser._id.toString() !== user._id.toString()) {
                                throw new BadRequestException(`Email ${value} is already in use.`);
                            }
                            fieldsToUpdate[key] = normalizedEmail;
                        }
                    }
                    else {
                        if (user[key] !== value) {
                            fieldsToUpdate[key] = value;
                        }
                    }
                }
                if (Object.keys(fieldsToUpdate).length === 0) {
                    const userDto = plainToClass(UserResponseDto, user, {
                        excludeExtraneousValues: true
                    });
                    return { user: userDto, changesDetected: false };
                }
                try {
                    const updatedUser = yield this.userModel.findByIdAndUpdate(user._id, { $set: fieldsToUpdate }, { new: true });
                    const userDto = plainToClass(UserResponseDto, updatedUser, {
                        excludeExtraneousValues: true
                    });
                    return { user: userDto, changesDetected: true };
                }
                catch (error) {
                    this.logger.error(`Error updating user with id ${user._id}.`, error);
                    throw new BadRequestException('Failed to update user.');
                }
            });
        }
    };
    __setFunctionName(_classThis, "MyUsersService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MyUsersService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MyUsersService = _classThis;
})();
export { MyUsersService };
//# sourceMappingURL=users.service.js.map