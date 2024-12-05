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
import { Injectable, Logger } from '@nestjs/common';
import * as argon2 from 'argon2';
import { UserRole } from '../dtos/roles.guards.dto';
let SuperUserService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var SuperUserService = _classThis = class {
        constructor(configService, userModel) {
            this.configService = configService;
            this.userModel = userModel;
            this.logger = new Logger(SuperUserService.name);
            this.superToken = this.configService.get('SUPER_TOKEN');
            this.superEmail = this.configService.get('SUPER_EMAIL');
            this.superPassword =
                this.configService.get('SUPER_PASSWORD');
        }
        onModuleInit() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.ensureSuperUser();
            });
        }
        ensureSuperUser() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const existingUser = yield this.userModel
                        .findOne({ email: this.superEmail })
                        .exec();
                    const hashedPassword = yield argon2.hash(this.superPassword, {
                        type: argon2.argon2id,
                        memoryCost: Math.pow(2, 16),
                        timeCost: 3,
                        parallelism: 1
                    });
                    if (existingUser) {
                        this.logger.log(`Super user with email ${this.superEmail} already exists.`);
                        let updated = false;
                        if (existingUser.token !== this.superToken) {
                            existingUser.token = this.superToken;
                            updated = true;
                        }
                        if (existingUser.role !== UserRole.SUPER) {
                            existingUser.role = UserRole.SUPER;
                            updated = true;
                        }
                        const isPasswordValid = yield argon2.verify(existingUser.password, this.superPassword);
                        if (!isPasswordValid) {
                            existingUser.password = hashedPassword;
                            updated = true;
                        }
                        if (updated) {
                            yield existingUser.save();
                            this.logger.log(`Super user updated.`);
                        }
                    }
                    else {
                        const superUser = new this.userModel({
                            email: this.superEmail,
                            emailVerified: true,
                            password: hashedPassword,
                            role: UserRole.SUPER,
                            token: this.superToken,
                            tokenTotalUsage: 0
                        });
                        yield superUser.save();
                        this.logger.log(`Super user created with email ${this.superEmail}`);
                    }
                }
                catch (error) {
                    this.logger.error('Error ensuring super user existence', error);
                }
            });
        }
    };
    __setFunctionName(_classThis, "SuperUserService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SuperUserService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SuperUserService = _classThis;
})();
export { SuperUserService };
//# sourceMappingURL=super-user.service.js.map