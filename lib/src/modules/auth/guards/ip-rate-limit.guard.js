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
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
let IpRateLimitGuard = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var IpRateLimitGuard = _classThis = class {
        constructor(configService, reflector, redisService) {
            this.configService = configService;
            this.reflector = reflector;
            this.redisService = redisService;
            this.logger = new Logger(IpRateLimitGuard.name);
            this.maxRequests =
                this.configService.get('IP_RATE_LIMIT_MAX');
            this.windowSizeInSeconds = this.configService.get('IP_RATE_LIMIT_WINDOW');
            const redisClient = this.redisService.getClient();
            this.rateLimiter = new RateLimiterRedis({
                storeClient: redisClient,
                keyPrefix: 'ip',
                points: this.maxRequests,
                duration: this.windowSizeInSeconds
            });
        }
        canActivate(context) {
            return __awaiter(this, void 0, void 0, function* () {
                const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
                const ctx = context.switchToHttp();
                const request = ctx.getRequest();
                const response = ctx.getResponse();
                const ipAddress = request.ip || request.connection.remoteAddress;
                try {
                    if (!isPublic) {
                        const rateLimiterRes = yield this.rateLimiter.consume(ipAddress);
                        response.set('X-IP-RateLimit-Limit', this.maxRequests.toString());
                        response.set('X-IP-RateLimit-Remaining', rateLimiterRes.remainingPoints.toString());
                        response.set('X-IP-RateLimit-Reset', new Date(Date.now() + rateLimiterRes.msBeforeNext).toUTCString());
                    }
                    return true;
                }
                catch (rateLimiterRes) {
                    if (rateLimiterRes instanceof RateLimiterRes) {
                        response.set('Retry-After', Math.ceil(rateLimiterRes.msBeforeNext / 1000).toString());
                    }
                    this.logger.warn(`IP ${ipAddress} has exceeded the rate limit`);
                    throw new HttpException('Too many requests from this IP, please try again later.', HttpStatus.TOO_MANY_REQUESTS);
                }
            });
        }
    };
    __setFunctionName(_classThis, "IpRateLimitGuard");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        IpRateLimitGuard = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return IpRateLimitGuard = _classThis;
})();
export { IpRateLimitGuard };
//# sourceMappingURL=ip-rate-limit.guard.js.map