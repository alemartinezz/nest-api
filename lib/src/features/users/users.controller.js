var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
import { Controller, Get, HttpCode, HttpStatus, Post, Put } from '@nestjs/common';
import { Public } from "../../modules/auth/decorators/public.decorator";
import { UserRole } from "../../modules/auth/dtos/roles.guards.dto";
import { Roles } from '../../modules/auth/decorators/roles.decorator';
let MyUsersController = (() => {
    let _classDecorators = [Controller('users')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _signUp_decorators;
    let _login_decorators;
    let _verifyEmail_decorators;
    let _resendVerificationCode_decorators;
    let _resetPassword_decorators;
    let _getProfile_decorators;
    let _updateProfile_decorators;
    let _getUserById_decorators;
    let _updateUserById_decorators;
    var MyUsersController = _classThis = class {
        constructor(usersService) {
            this.usersService = (__runInitializers(this, _instanceExtraInitializers), usersService);
        }
        signUp(signUpDto) {
            return __awaiter(this, void 0, void 0, function* () {
                const { email, password } = signUpDto;
                const userDto = yield this.usersService.signUp(email, password);
                return { user: userDto, messages: 'User created successfully' };
            });
        }
        login(signInDto) {
            return __awaiter(this, void 0, void 0, function* () {
                const { email, password } = signInDto;
                const { user } = yield this.usersService.login(email, password);
                return { user, messages: 'Login successful' };
            });
        }
        verifyEmail(verifyEmailDto) {
            return __awaiter(this, void 0, void 0, function* () {
                const { email, code } = verifyEmailDto;
                yield this.usersService.verifyEmail(email, code);
                return { messages: 'Email verified successfully.' };
            });
        }
        resendVerificationCode(resendVerificationDto) {
            return __awaiter(this, void 0, void 0, function* () {
                const { email } = resendVerificationDto;
                yield this.usersService.resendVerificationCode(email);
                return { messages: 'Verification code resent successfully.' };
            });
        }
        resetPassword(authenticatedUser, changePasswordDto) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.usersService.resetPassword(authenticatedUser, changePasswordDto);
                return { messages: 'Password updated successfully.' };
            });
        }
        getProfile(authenticatedUser) {
            return __awaiter(this, void 0, void 0, function* () {
                const userDto = yield this.usersService.getUserById(authenticatedUser.id);
                return {
                    user: userDto,
                    messages: 'Profile retrieved successfully.'
                };
            });
        }
        updateProfile(authenticatedUser, updates) {
            return __awaiter(this, void 0, void 0, function* () {
                const { user, changesDetected } = yield this.usersService.updateUser(authenticatedUser, updates);
                if (!changesDetected) {
                    return { user, messages: 'No changes detected.' };
                }
                return { user, messages: 'Profile updated successfully.' };
            });
        }
        getUserById(params) {
            return __awaiter(this, void 0, void 0, function* () {
                const userDto = yield this.usersService.getUserById(params.id);
                return {
                    user: userDto,
                    messages: 'User retrieved successfully.'
                };
            });
        }
        updateUserById(params, updates) {
            return __awaiter(this, void 0, void 0, function* () {
                const { user, changesDetected } = yield this.usersService.updateUserById(params, updates);
                if (!changesDetected) {
                    return { user, messages: 'No changes detected.' };
                }
                return { user, messages: 'User updated successfully.' };
            });
        }
    };
    __setFunctionName(_classThis, "MyUsersController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _signUp_decorators = [Public(), Post('signup'), HttpCode(HttpStatus.CREATED)];
        _login_decorators = [Public(), Post('login'), HttpCode(HttpStatus.OK)];
        _verifyEmail_decorators = [Public(), Post('verify-email'), HttpCode(HttpStatus.OK)];
        _resendVerificationCode_decorators = [Public(), Post('resend-verification-code'), HttpCode(HttpStatus.OK)];
        _resetPassword_decorators = [Roles(UserRole.ADMIN, UserRole.BASIC), Put('reset-password'), HttpCode(HttpStatus.OK)];
        _getProfile_decorators = [Roles(UserRole.ADMIN, UserRole.BASIC), HttpCode(HttpStatus.OK), Get('me')];
        _updateProfile_decorators = [Roles(UserRole.ADMIN, UserRole.BASIC), HttpCode(HttpStatus.OK), Put('me')];
        _getUserById_decorators = [Roles(UserRole.ADMIN), HttpCode(HttpStatus.OK), Get()];
        _updateUserById_decorators = [Roles(UserRole.ADMIN), HttpCode(HttpStatus.OK), Put()];
        __esDecorate(_classThis, null, _signUp_decorators, { kind: "method", name: "signUp", static: false, private: false, access: { has: obj => "signUp" in obj, get: obj => obj.signUp }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _login_decorators, { kind: "method", name: "login", static: false, private: false, access: { has: obj => "login" in obj, get: obj => obj.login }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _verifyEmail_decorators, { kind: "method", name: "verifyEmail", static: false, private: false, access: { has: obj => "verifyEmail" in obj, get: obj => obj.verifyEmail }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _resendVerificationCode_decorators, { kind: "method", name: "resendVerificationCode", static: false, private: false, access: { has: obj => "resendVerificationCode" in obj, get: obj => obj.resendVerificationCode }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _resetPassword_decorators, { kind: "method", name: "resetPassword", static: false, private: false, access: { has: obj => "resetPassword" in obj, get: obj => obj.resetPassword }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getProfile_decorators, { kind: "method", name: "getProfile", static: false, private: false, access: { has: obj => "getProfile" in obj, get: obj => obj.getProfile }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateProfile_decorators, { kind: "method", name: "updateProfile", static: false, private: false, access: { has: obj => "updateProfile" in obj, get: obj => obj.updateProfile }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getUserById_decorators, { kind: "method", name: "getUserById", static: false, private: false, access: { has: obj => "getUserById" in obj, get: obj => obj.getUserById }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateUserById_decorators, { kind: "method", name: "updateUserById", static: false, private: false, access: { has: obj => "updateUserById" in obj, get: obj => obj.updateUserById }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MyUsersController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MyUsersController = _classThis;
})();
export { MyUsersController };
//# sourceMappingURL=users.controller.js.map