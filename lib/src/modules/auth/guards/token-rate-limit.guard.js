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
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { UserRole } from '../dtos/roles.guards.dto';
let TokenRateLimitGuard = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var TokenRateLimitGuard = _classThis = class {
        constructor(configService, userModel, reflector, rateLimitConfigService, redisService) {
            this.configService = configService;
            this.userModel = userModel;
            this.reflector = reflector;
            this.rateLimitConfigService = rateLimitConfigService;
            this.redisService = redisService;
            this.logger = new Logger(TokenRateLimitGuard.name);
            const tokenRegexString = this.configService.get('TOKEN_REGEX');
            if (!tokenRegexString) {
                this.logger.error('TOKEN_REGEX is not defined in the configuration.');
                throw new Error('TOKEN_REGEX is required.');
            }
            this.TOKEN_REGEX = new RegExp(tokenRegexString);
            const redisClient = this.redisService.getClient();
            this.rateLimiter = new RateLimiterRedis({
                storeClient: redisClient,
                keyPrefix: 'token'
            });
        }
        canActivate(context) {
            return __awaiter(this, void 0, void 0, function* () {
                const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
                const ctx = context.switchToHttp();
                const request = ctx.getRequest();
                const response = ctx.getResponse();
                try {
                    const authHeader = this.getAuthHeader(request);
                    if (!authHeader) {
                        if (isPublic) {
                            return true;
                        }
                        this.logger.warn('Authorization header missing');
                        throw new HttpException('Authorization header is required', HttpStatus.UNAUTHORIZED);
                    }
                    const token = this.extractToken(authHeader);
                    this.validateTokenFormat(token);
                    const user = yield this.findUserByToken(token);
                    request.user = user;
                    const { role } = user;
                    const rateLimitConfig = this.rateLimitConfigService.getRateLimit(role);
                    if (role === UserRole.SUPER) {
                        yield this.handleSuperUser(user, response);
                        return true;
                    }
                    yield this.handleRegularUser(user, rateLimitConfig, response);
                    return true;
                }
                catch (error) {
                    if (error instanceof HttpException) {
                        throw error;
                    }
                    this.logger.error('Error in TokenRateLimitGuard', error);
                    throw new HttpException('Internal server error in token rate limiting', HttpStatus.INTERNAL_SERVER_ERROR);
                }
            });
        }
        getAuthHeader(request) {
            return request.headers['authorization'];
        }
        extractToken(authHeader) {
            return authHeader.replace('Bearer ', '').trim();
        }
        validateTokenFormat(token) {
            if (!this.TOKEN_REGEX.test(token)) {
                this.logger.warn(`Invalid token format: ${token}`);
                throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
            }
        }
        findUserByToken(token) {
            return __awaiter(this, void 0, void 0, function* () {
                const user = yield this.userModel.findOne({ token });
                if (!user) {
                    this.logger.warn('Invalid token');
                    throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
                }
                return user;
            });
        }
        handleSuperUser(user, response) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.incrementTokenTotalUsage(user);
                response.set('X-Token-RateLimit-Limit', 'unlimited');
                response.set('X-Token-RateLimit-Remaining', 'unlimited');
                response.set('X-Token-RateLimit-Reset', 'never');
            });
        }
        handleRegularUser(user, rateLimitConfig, response) {
            return __awaiter(this, void 0, void 0, function* () {
                const { tokenCurrentLimit } = rateLimitConfig;
                if (this.isTokenExpired(user)) {
                    this.logger.warn(`Token ${user.token} has expired for user ${user.email}`);
                    throw new HttpException('Token has expired.', HttpStatus.UNAUTHORIZED);
                }
                if (this.hasExceededUsageLimit(user, tokenCurrentLimit)) {
                    this.logger.warn(`Token ${user.token} has reached its usage limit for user ${user.email}`);
                    throw new HttpException('Token usage limit exceeded. Consider upgrading your plan. More info at: https://google.com/plans', HttpStatus.TOO_MANY_REQUESTS);
                }
                yield this.incrementTokenUsage(user);
                yield this.handleRateLimiting(user, rateLimitConfig, response);
            });
        }
        isTokenExpired(user) {
            return user.tokenExpiration
                ? user.tokenExpiration < new Date()
                : false;
        }
        hasExceededUsageLimit(user, tokenCurrentLimit) {
            return user.tokenCurrentUsage >= tokenCurrentLimit;
        }
        handleRateLimiting(user, rateLimitConfig, response) {
            return __awaiter(this, void 0, void 0, function* () {
                const { maxRequests, windowSizeInSeconds } = rateLimitConfig;
                const tokenRateLimitKey = `token-rate-limit:${user.token}`;
                try {
                    const rateLimiterRes = yield this.rateLimiter.consume(tokenRateLimitKey, 1, {
                        points: maxRequests,
                        duration: windowSizeInSeconds
                    });
                    this.setResponseHeaders(user, rateLimitConfig, rateLimiterRes, response);
                }
                catch (rateLimiterRes) {
                    if (rateLimiterRes instanceof RateLimiterRes) {
                        response.set('Retry-After', Math.ceil(rateLimiterRes.msBeforeNext / 1000).toString());
                    }
                    this.logger.warn(`Token ${user.token} with role ${user.role} has exceeded the rate limit`);
                    throw new HttpException('Too many requests, please try again later.', HttpStatus.TOO_MANY_REQUESTS);
                }
            });
        }
        setResponseHeaders(user, rateLimitConfig, rateLimiterRes, response) {
            const { tokenCurrentLimit } = rateLimitConfig;
            const tokenCurrentLeft = tokenCurrentLimit === Infinity
                ? 'unlimited'
                : Math.max(tokenCurrentLimit - user.tokenCurrentUsage, 0).toString();
            response.set('X-Token-RateLimit-Limit', tokenCurrentLimit === Infinity
                ? 'unlimited'
                : tokenCurrentLimit.toString());
            response.set('X-Token-RateLimit-Remaining', tokenCurrentLeft);
            response.set('X-Token-RateLimit-Reset', rateLimiterRes.msBeforeNext
                ? new Date(Date.now() + rateLimiterRes.msBeforeNext).toUTCString()
                : 'never');
        }
        incrementTokenUsage(user) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                user.tokenTotalUsage = ((_a = user.tokenTotalUsage) !== null && _a !== void 0 ? _a : 0) + 1;
                user.tokenCurrentUsage = ((_b = user.tokenCurrentUsage) !== null && _b !== void 0 ? _b : 0) + 1;
                try {
                    yield user.save();
                }
                catch (error) {
                    this.logger.error(`Error updating token usage for user ${user.email}`, error);
                    throw new HttpException('Internal server error while updating token usage', HttpStatus.INTERNAL_SERVER_ERROR);
                }
            });
        }
        incrementTokenTotalUsage(user) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                user.tokenTotalUsage = ((_a = user.tokenTotalUsage) !== null && _a !== void 0 ? _a : 0) + 1;
                try {
                    yield user.save();
                }
                catch (error) {
                    this.logger.error(`Error updating tokenTotalUsage for user ${user.email}`, error);
                    throw new HttpException('Internal server error while updating token usage', HttpStatus.INTERNAL_SERVER_ERROR);
                }
            });
        }
    };
    __setFunctionName(_classThis, "TokenRateLimitGuard");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TokenRateLimitGuard = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TokenRateLimitGuard = _classThis;
})();
export { TokenRateLimitGuard };
//# sourceMappingURL=token-rate-limit.guard.js.map