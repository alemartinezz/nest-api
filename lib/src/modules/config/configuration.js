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
import { Logger } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { IsBoolean, IsEmail, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';
let EnvConfig = (() => {
    var _a;
    let _NODE_ENV_decorators;
    let _NODE_ENV_initializers = [];
    let _NODE_ENV_extraInitializers = [];
    let _API_HOST_decorators;
    let _API_HOST_initializers = [];
    let _API_HOST_extraInitializers = [];
    let _API_PORT_decorators;
    let _API_PORT_initializers = [];
    let _API_PORT_extraInitializers = [];
    let _PROTOCOL_decorators;
    let _PROTOCOL_initializers = [];
    let _PROTOCOL_extraInitializers = [];
    let _ENCRYPTION_KEY_decorators;
    let _ENCRYPTION_KEY_initializers = [];
    let _ENCRYPTION_KEY_extraInitializers = [];
    let _IV_HEX_decorators;
    let _IV_HEX_initializers = [];
    let _IV_HEX_extraInitializers = [];
    let _TOKEN_REGEX_decorators;
    let _TOKEN_REGEX_initializers = [];
    let _TOKEN_REGEX_extraInitializers = [];
    let _IP_RATE_LIMIT_MAX_decorators;
    let _IP_RATE_LIMIT_MAX_initializers = [];
    let _IP_RATE_LIMIT_MAX_extraInitializers = [];
    let _IP_RATE_LIMIT_WINDOW_decorators;
    let _IP_RATE_LIMIT_WINDOW_initializers = [];
    let _IP_RATE_LIMIT_WINDOW_extraInitializers = [];
    let _REDIS_HOST_decorators;
    let _REDIS_HOST_initializers = [];
    let _REDIS_HOST_extraInitializers = [];
    let _REDIS_PORT_decorators;
    let _REDIS_PORT_initializers = [];
    let _REDIS_PORT_extraInitializers = [];
    let _REDIS_PASSWORD_decorators;
    let _REDIS_PASSWORD_initializers = [];
    let _REDIS_PASSWORD_extraInitializers = [];
    let _MONGO_USERNAME_decorators;
    let _MONGO_USERNAME_initializers = [];
    let _MONGO_USERNAME_extraInitializers = [];
    let _MONGO_PASSWORD_decorators;
    let _MONGO_PASSWORD_initializers = [];
    let _MONGO_PASSWORD_extraInitializers = [];
    let _MONGO_HOST_decorators;
    let _MONGO_HOST_initializers = [];
    let _MONGO_HOST_extraInitializers = [];
    let _MONGO_PORT_decorators;
    let _MONGO_PORT_initializers = [];
    let _MONGO_PORT_extraInitializers = [];
    let _MONGO_DATABASE_decorators;
    let _MONGO_DATABASE_initializers = [];
    let _MONGO_DATABASE_extraInitializers = [];
    let _MONGO_URI_decorators;
    let _MONGO_URI_initializers = [];
    let _MONGO_URI_extraInitializers = [];
    let _EMAIL_HOST_decorators;
    let _EMAIL_HOST_initializers = [];
    let _EMAIL_HOST_extraInitializers = [];
    let _EMAIL_PORT_decorators;
    let _EMAIL_PORT_initializers = [];
    let _EMAIL_PORT_extraInitializers = [];
    let _EMAIL_SECURE_decorators;
    let _EMAIL_SECURE_initializers = [];
    let _EMAIL_SECURE_extraInitializers = [];
    let _EMAIL_USER_decorators;
    let _EMAIL_USER_initializers = [];
    let _EMAIL_USER_extraInitializers = [];
    let _EMAIL_PASSWORD_decorators;
    let _EMAIL_PASSWORD_initializers = [];
    let _EMAIL_PASSWORD_extraInitializers = [];
    let _EMAIL_FROM_decorators;
    let _EMAIL_FROM_initializers = [];
    let _EMAIL_FROM_extraInitializers = [];
    let _SUPER_TOKEN_decorators;
    let _SUPER_TOKEN_initializers = [];
    let _SUPER_TOKEN_extraInitializers = [];
    let _SUPER_EMAIL_decorators;
    let _SUPER_EMAIL_initializers = [];
    let _SUPER_EMAIL_extraInitializers = [];
    let _SUPER_PASSWORD_decorators;
    let _SUPER_PASSWORD_initializers = [];
    let _SUPER_PASSWORD_extraInitializers = [];
    return _a = class EnvConfig {
            constructor() {
                this.NODE_ENV = __runInitializers(this, _NODE_ENV_initializers, void 0);
                this.API_HOST = (__runInitializers(this, _NODE_ENV_extraInitializers), __runInitializers(this, _API_HOST_initializers, void 0));
                this.API_PORT = (__runInitializers(this, _API_HOST_extraInitializers), __runInitializers(this, _API_PORT_initializers, void 0));
                this.PROTOCOL = (__runInitializers(this, _API_PORT_extraInitializers), __runInitializers(this, _PROTOCOL_initializers, void 0));
                this.ENCRYPTION_KEY = (__runInitializers(this, _PROTOCOL_extraInitializers), __runInitializers(this, _ENCRYPTION_KEY_initializers, void 0));
                this.IV_HEX = (__runInitializers(this, _ENCRYPTION_KEY_extraInitializers), __runInitializers(this, _IV_HEX_initializers, void 0));
                this.TOKEN_REGEX = (__runInitializers(this, _IV_HEX_extraInitializers), __runInitializers(this, _TOKEN_REGEX_initializers, void 0));
                this.IP_RATE_LIMIT_MAX = (__runInitializers(this, _TOKEN_REGEX_extraInitializers), __runInitializers(this, _IP_RATE_LIMIT_MAX_initializers, void 0));
                this.IP_RATE_LIMIT_WINDOW = (__runInitializers(this, _IP_RATE_LIMIT_MAX_extraInitializers), __runInitializers(this, _IP_RATE_LIMIT_WINDOW_initializers, void 0));
                this.REDIS_HOST = (__runInitializers(this, _IP_RATE_LIMIT_WINDOW_extraInitializers), __runInitializers(this, _REDIS_HOST_initializers, void 0));
                this.REDIS_PORT = (__runInitializers(this, _REDIS_HOST_extraInitializers), __runInitializers(this, _REDIS_PORT_initializers, void 0));
                this.REDIS_PASSWORD = (__runInitializers(this, _REDIS_PORT_extraInitializers), __runInitializers(this, _REDIS_PASSWORD_initializers, void 0));
                this.MONGO_USERNAME = (__runInitializers(this, _REDIS_PASSWORD_extraInitializers), __runInitializers(this, _MONGO_USERNAME_initializers, void 0));
                this.MONGO_PASSWORD = (__runInitializers(this, _MONGO_USERNAME_extraInitializers), __runInitializers(this, _MONGO_PASSWORD_initializers, void 0));
                this.MONGO_HOST = (__runInitializers(this, _MONGO_PASSWORD_extraInitializers), __runInitializers(this, _MONGO_HOST_initializers, void 0));
                this.MONGO_PORT = (__runInitializers(this, _MONGO_HOST_extraInitializers), __runInitializers(this, _MONGO_PORT_initializers, void 0));
                this.MONGO_DATABASE = (__runInitializers(this, _MONGO_PORT_extraInitializers), __runInitializers(this, _MONGO_DATABASE_initializers, void 0));
                this.MONGO_URI = (__runInitializers(this, _MONGO_DATABASE_extraInitializers), __runInitializers(this, _MONGO_URI_initializers, void 0));
                this.EMAIL_HOST = (__runInitializers(this, _MONGO_URI_extraInitializers), __runInitializers(this, _EMAIL_HOST_initializers, void 0));
                this.EMAIL_PORT = (__runInitializers(this, _EMAIL_HOST_extraInitializers), __runInitializers(this, _EMAIL_PORT_initializers, void 0));
                this.EMAIL_SECURE = (__runInitializers(this, _EMAIL_PORT_extraInitializers), __runInitializers(this, _EMAIL_SECURE_initializers, void 0));
                this.EMAIL_USER = (__runInitializers(this, _EMAIL_SECURE_extraInitializers), __runInitializers(this, _EMAIL_USER_initializers, void 0));
                this.EMAIL_PASSWORD = (__runInitializers(this, _EMAIL_USER_extraInitializers), __runInitializers(this, _EMAIL_PASSWORD_initializers, void 0));
                this.EMAIL_FROM = (__runInitializers(this, _EMAIL_PASSWORD_extraInitializers), __runInitializers(this, _EMAIL_FROM_initializers, void 0));
                this.SUPER_TOKEN = (__runInitializers(this, _EMAIL_FROM_extraInitializers), __runInitializers(this, _SUPER_TOKEN_initializers, void 0));
                this.SUPER_EMAIL = (__runInitializers(this, _SUPER_TOKEN_extraInitializers), __runInitializers(this, _SUPER_EMAIL_initializers, void 0));
                this.SUPER_PASSWORD = (__runInitializers(this, _SUPER_EMAIL_extraInitializers), __runInitializers(this, _SUPER_PASSWORD_initializers, void 0));
                __runInitializers(this, _SUPER_PASSWORD_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _NODE_ENV_decorators = [IsString({ message: 'NODE_ENV must be a string.' }), IsNotEmpty({ message: 'NODE_ENV is required.' }), IsIn(['development', 'staging', 'production', 'test'], {
                    message: 'NODE_ENV must be one of the following: development, staging, production, test.'
                })];
            _API_HOST_decorators = [IsString({ message: 'API_HOST must be a string.' }), IsNotEmpty({ message: 'API_HOST is required.' })];
            _API_PORT_decorators = [IsNumber({}, { message: 'API_PORT must be a number.' }), IsNotEmpty({ message: 'API_PORT is required.' })];
            _PROTOCOL_decorators = [IsString({ message: 'PROTOCOL must be a string.' }), IsNotEmpty({ message: 'PROTOCOL is required.' })];
            _ENCRYPTION_KEY_decorators = [IsString({ message: 'ENCRYPTION_KEY must be a string.' }), IsNotEmpty({ message: 'ENCRYPTION_KEY is required.' })];
            _IV_HEX_decorators = [IsString({ message: 'IV_HEX must be a string.' }), IsNotEmpty({ message: 'IV_HEX is required.' })];
            _TOKEN_REGEX_decorators = [IsString({ message: 'TOKEN_REGEX must be a string.' }), IsNotEmpty({ message: 'TOKEN_REGEX is required.' })];
            _IP_RATE_LIMIT_MAX_decorators = [IsNumber({}, { message: 'IP_RATE_LIMIT_MAX must be a number.' }), IsNotEmpty({ message: 'IP_RATE_LIMIT_MAX is required.' })];
            _IP_RATE_LIMIT_WINDOW_decorators = [IsNumber({}, { message: 'IP_RATE_LIMIT_WINDOW must be a number.' }), IsNotEmpty({ message: 'IP_RATE_LIMIT_WINDOW is required.' })];
            _REDIS_HOST_decorators = [IsString({ message: 'REDIS_HOST must be a string.' }), IsNotEmpty({ message: 'REDIS_HOST is required.' })];
            _REDIS_PORT_decorators = [IsNumber({}, { message: 'REDIS_PORT must be a number.' }), IsNotEmpty({ message: 'REDIS_PORT is required.' })];
            _REDIS_PASSWORD_decorators = [IsOptional(), IsString({ message: 'REDIS_PASSWORD must be a string.' })];
            _MONGO_USERNAME_decorators = [IsString({ message: 'MONGO_USERNAME must be a string.' }), IsNotEmpty({ message: 'MONGO_USERNAME is required.' })];
            _MONGO_PASSWORD_decorators = [IsString({ message: 'MONGO_PASSWORD must be a string.' }), IsNotEmpty({ message: 'MONGO_PASSWORD is required.' })];
            _MONGO_HOST_decorators = [IsString({ message: 'MONGO_HOST must be a string.' }), IsNotEmpty({ message: 'MONGO_HOST is required.' })];
            _MONGO_PORT_decorators = [IsNumber({}, { message: 'MONGO_PORT must be a number.' }), IsNotEmpty({ message: 'MONGO_PORT is required.' })];
            _MONGO_DATABASE_decorators = [IsString({ message: 'MONGO_DATABASE must be a string.' }), IsNotEmpty({ message: 'MONGO_DATABASE is required.' })];
            _MONGO_URI_decorators = [IsOptional(), IsString({ message: 'MONGO_URI must be a string if provided.' })];
            _EMAIL_HOST_decorators = [IsString({ message: 'EMAIL_HOST must be a string.' }), IsNotEmpty({ message: 'EMAIL_HOST is required.' })];
            _EMAIL_PORT_decorators = [IsNumber({}, { message: 'EMAIL_PORT must be a number.' }), IsNotEmpty({ message: 'EMAIL_PORT is required.' })];
            _EMAIL_SECURE_decorators = [IsBoolean({ message: 'EMAIL_SECURE must be a boolean.' }), IsNotEmpty({ message: 'EMAIL_SECURE is required.' })];
            _EMAIL_USER_decorators = [IsString({ message: 'EMAIL_USER must be a string.' }), IsNotEmpty({ message: 'EMAIL_USER is required.' })];
            _EMAIL_PASSWORD_decorators = [IsString({ message: 'EMAIL_PASSWORD must be a string.' }), IsNotEmpty({ message: 'EMAIL_PASSWORD is required.' })];
            _EMAIL_FROM_decorators = [IsString({ message: 'EMAIL_FROM must be a string.' }), IsNotEmpty({ message: 'EMAIL_FROM is required.' })];
            _SUPER_TOKEN_decorators = [IsString({ message: 'SUPER_TOKEN must be a string.' }), IsNotEmpty({ message: 'SUPER_TOKEN is required.' })];
            _SUPER_EMAIL_decorators = [IsEmail({}, { message: 'SUPER_EMAIL must be a valid email address.' }), IsNotEmpty({ message: 'SUPER_EMAIL is required.' })];
            _SUPER_PASSWORD_decorators = [IsString({ message: 'SUPER_PASSWORD must be a string.' }), IsNotEmpty({ message: 'SUPER_PASSWORD is required.' })];
            __esDecorate(null, null, _NODE_ENV_decorators, { kind: "field", name: "NODE_ENV", static: false, private: false, access: { has: obj => "NODE_ENV" in obj, get: obj => obj.NODE_ENV, set: (obj, value) => { obj.NODE_ENV = value; } }, metadata: _metadata }, _NODE_ENV_initializers, _NODE_ENV_extraInitializers);
            __esDecorate(null, null, _API_HOST_decorators, { kind: "field", name: "API_HOST", static: false, private: false, access: { has: obj => "API_HOST" in obj, get: obj => obj.API_HOST, set: (obj, value) => { obj.API_HOST = value; } }, metadata: _metadata }, _API_HOST_initializers, _API_HOST_extraInitializers);
            __esDecorate(null, null, _API_PORT_decorators, { kind: "field", name: "API_PORT", static: false, private: false, access: { has: obj => "API_PORT" in obj, get: obj => obj.API_PORT, set: (obj, value) => { obj.API_PORT = value; } }, metadata: _metadata }, _API_PORT_initializers, _API_PORT_extraInitializers);
            __esDecorate(null, null, _PROTOCOL_decorators, { kind: "field", name: "PROTOCOL", static: false, private: false, access: { has: obj => "PROTOCOL" in obj, get: obj => obj.PROTOCOL, set: (obj, value) => { obj.PROTOCOL = value; } }, metadata: _metadata }, _PROTOCOL_initializers, _PROTOCOL_extraInitializers);
            __esDecorate(null, null, _ENCRYPTION_KEY_decorators, { kind: "field", name: "ENCRYPTION_KEY", static: false, private: false, access: { has: obj => "ENCRYPTION_KEY" in obj, get: obj => obj.ENCRYPTION_KEY, set: (obj, value) => { obj.ENCRYPTION_KEY = value; } }, metadata: _metadata }, _ENCRYPTION_KEY_initializers, _ENCRYPTION_KEY_extraInitializers);
            __esDecorate(null, null, _IV_HEX_decorators, { kind: "field", name: "IV_HEX", static: false, private: false, access: { has: obj => "IV_HEX" in obj, get: obj => obj.IV_HEX, set: (obj, value) => { obj.IV_HEX = value; } }, metadata: _metadata }, _IV_HEX_initializers, _IV_HEX_extraInitializers);
            __esDecorate(null, null, _TOKEN_REGEX_decorators, { kind: "field", name: "TOKEN_REGEX", static: false, private: false, access: { has: obj => "TOKEN_REGEX" in obj, get: obj => obj.TOKEN_REGEX, set: (obj, value) => { obj.TOKEN_REGEX = value; } }, metadata: _metadata }, _TOKEN_REGEX_initializers, _TOKEN_REGEX_extraInitializers);
            __esDecorate(null, null, _IP_RATE_LIMIT_MAX_decorators, { kind: "field", name: "IP_RATE_LIMIT_MAX", static: false, private: false, access: { has: obj => "IP_RATE_LIMIT_MAX" in obj, get: obj => obj.IP_RATE_LIMIT_MAX, set: (obj, value) => { obj.IP_RATE_LIMIT_MAX = value; } }, metadata: _metadata }, _IP_RATE_LIMIT_MAX_initializers, _IP_RATE_LIMIT_MAX_extraInitializers);
            __esDecorate(null, null, _IP_RATE_LIMIT_WINDOW_decorators, { kind: "field", name: "IP_RATE_LIMIT_WINDOW", static: false, private: false, access: { has: obj => "IP_RATE_LIMIT_WINDOW" in obj, get: obj => obj.IP_RATE_LIMIT_WINDOW, set: (obj, value) => { obj.IP_RATE_LIMIT_WINDOW = value; } }, metadata: _metadata }, _IP_RATE_LIMIT_WINDOW_initializers, _IP_RATE_LIMIT_WINDOW_extraInitializers);
            __esDecorate(null, null, _REDIS_HOST_decorators, { kind: "field", name: "REDIS_HOST", static: false, private: false, access: { has: obj => "REDIS_HOST" in obj, get: obj => obj.REDIS_HOST, set: (obj, value) => { obj.REDIS_HOST = value; } }, metadata: _metadata }, _REDIS_HOST_initializers, _REDIS_HOST_extraInitializers);
            __esDecorate(null, null, _REDIS_PORT_decorators, { kind: "field", name: "REDIS_PORT", static: false, private: false, access: { has: obj => "REDIS_PORT" in obj, get: obj => obj.REDIS_PORT, set: (obj, value) => { obj.REDIS_PORT = value; } }, metadata: _metadata }, _REDIS_PORT_initializers, _REDIS_PORT_extraInitializers);
            __esDecorate(null, null, _REDIS_PASSWORD_decorators, { kind: "field", name: "REDIS_PASSWORD", static: false, private: false, access: { has: obj => "REDIS_PASSWORD" in obj, get: obj => obj.REDIS_PASSWORD, set: (obj, value) => { obj.REDIS_PASSWORD = value; } }, metadata: _metadata }, _REDIS_PASSWORD_initializers, _REDIS_PASSWORD_extraInitializers);
            __esDecorate(null, null, _MONGO_USERNAME_decorators, { kind: "field", name: "MONGO_USERNAME", static: false, private: false, access: { has: obj => "MONGO_USERNAME" in obj, get: obj => obj.MONGO_USERNAME, set: (obj, value) => { obj.MONGO_USERNAME = value; } }, metadata: _metadata }, _MONGO_USERNAME_initializers, _MONGO_USERNAME_extraInitializers);
            __esDecorate(null, null, _MONGO_PASSWORD_decorators, { kind: "field", name: "MONGO_PASSWORD", static: false, private: false, access: { has: obj => "MONGO_PASSWORD" in obj, get: obj => obj.MONGO_PASSWORD, set: (obj, value) => { obj.MONGO_PASSWORD = value; } }, metadata: _metadata }, _MONGO_PASSWORD_initializers, _MONGO_PASSWORD_extraInitializers);
            __esDecorate(null, null, _MONGO_HOST_decorators, { kind: "field", name: "MONGO_HOST", static: false, private: false, access: { has: obj => "MONGO_HOST" in obj, get: obj => obj.MONGO_HOST, set: (obj, value) => { obj.MONGO_HOST = value; } }, metadata: _metadata }, _MONGO_HOST_initializers, _MONGO_HOST_extraInitializers);
            __esDecorate(null, null, _MONGO_PORT_decorators, { kind: "field", name: "MONGO_PORT", static: false, private: false, access: { has: obj => "MONGO_PORT" in obj, get: obj => obj.MONGO_PORT, set: (obj, value) => { obj.MONGO_PORT = value; } }, metadata: _metadata }, _MONGO_PORT_initializers, _MONGO_PORT_extraInitializers);
            __esDecorate(null, null, _MONGO_DATABASE_decorators, { kind: "field", name: "MONGO_DATABASE", static: false, private: false, access: { has: obj => "MONGO_DATABASE" in obj, get: obj => obj.MONGO_DATABASE, set: (obj, value) => { obj.MONGO_DATABASE = value; } }, metadata: _metadata }, _MONGO_DATABASE_initializers, _MONGO_DATABASE_extraInitializers);
            __esDecorate(null, null, _MONGO_URI_decorators, { kind: "field", name: "MONGO_URI", static: false, private: false, access: { has: obj => "MONGO_URI" in obj, get: obj => obj.MONGO_URI, set: (obj, value) => { obj.MONGO_URI = value; } }, metadata: _metadata }, _MONGO_URI_initializers, _MONGO_URI_extraInitializers);
            __esDecorate(null, null, _EMAIL_HOST_decorators, { kind: "field", name: "EMAIL_HOST", static: false, private: false, access: { has: obj => "EMAIL_HOST" in obj, get: obj => obj.EMAIL_HOST, set: (obj, value) => { obj.EMAIL_HOST = value; } }, metadata: _metadata }, _EMAIL_HOST_initializers, _EMAIL_HOST_extraInitializers);
            __esDecorate(null, null, _EMAIL_PORT_decorators, { kind: "field", name: "EMAIL_PORT", static: false, private: false, access: { has: obj => "EMAIL_PORT" in obj, get: obj => obj.EMAIL_PORT, set: (obj, value) => { obj.EMAIL_PORT = value; } }, metadata: _metadata }, _EMAIL_PORT_initializers, _EMAIL_PORT_extraInitializers);
            __esDecorate(null, null, _EMAIL_SECURE_decorators, { kind: "field", name: "EMAIL_SECURE", static: false, private: false, access: { has: obj => "EMAIL_SECURE" in obj, get: obj => obj.EMAIL_SECURE, set: (obj, value) => { obj.EMAIL_SECURE = value; } }, metadata: _metadata }, _EMAIL_SECURE_initializers, _EMAIL_SECURE_extraInitializers);
            __esDecorate(null, null, _EMAIL_USER_decorators, { kind: "field", name: "EMAIL_USER", static: false, private: false, access: { has: obj => "EMAIL_USER" in obj, get: obj => obj.EMAIL_USER, set: (obj, value) => { obj.EMAIL_USER = value; } }, metadata: _metadata }, _EMAIL_USER_initializers, _EMAIL_USER_extraInitializers);
            __esDecorate(null, null, _EMAIL_PASSWORD_decorators, { kind: "field", name: "EMAIL_PASSWORD", static: false, private: false, access: { has: obj => "EMAIL_PASSWORD" in obj, get: obj => obj.EMAIL_PASSWORD, set: (obj, value) => { obj.EMAIL_PASSWORD = value; } }, metadata: _metadata }, _EMAIL_PASSWORD_initializers, _EMAIL_PASSWORD_extraInitializers);
            __esDecorate(null, null, _EMAIL_FROM_decorators, { kind: "field", name: "EMAIL_FROM", static: false, private: false, access: { has: obj => "EMAIL_FROM" in obj, get: obj => obj.EMAIL_FROM, set: (obj, value) => { obj.EMAIL_FROM = value; } }, metadata: _metadata }, _EMAIL_FROM_initializers, _EMAIL_FROM_extraInitializers);
            __esDecorate(null, null, _SUPER_TOKEN_decorators, { kind: "field", name: "SUPER_TOKEN", static: false, private: false, access: { has: obj => "SUPER_TOKEN" in obj, get: obj => obj.SUPER_TOKEN, set: (obj, value) => { obj.SUPER_TOKEN = value; } }, metadata: _metadata }, _SUPER_TOKEN_initializers, _SUPER_TOKEN_extraInitializers);
            __esDecorate(null, null, _SUPER_EMAIL_decorators, { kind: "field", name: "SUPER_EMAIL", static: false, private: false, access: { has: obj => "SUPER_EMAIL" in obj, get: obj => obj.SUPER_EMAIL, set: (obj, value) => { obj.SUPER_EMAIL = value; } }, metadata: _metadata }, _SUPER_EMAIL_initializers, _SUPER_EMAIL_extraInitializers);
            __esDecorate(null, null, _SUPER_PASSWORD_decorators, { kind: "field", name: "SUPER_PASSWORD", static: false, private: false, access: { has: obj => "SUPER_PASSWORD" in obj, get: obj => obj.SUPER_PASSWORD, set: (obj, value) => { obj.SUPER_PASSWORD = value; } }, metadata: _metadata }, _SUPER_PASSWORD_initializers, _SUPER_PASSWORD_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
export { EnvConfig };
export function validateEnv(configEnv) {
    const validatedConfig = plainToClass(EnvConfig, configEnv, {
        enableImplicitConversion: true
    });
    const errors = validateSync(validatedConfig, {
        skipMissingProperties: false
    });
    if (errors.length > 0) {
        const errorMessages = errors
            .map((error) => Object.values(error.constraints || {}).join(', '))
            .join('; ');
        const logger = new Logger(EnvConfig.name);
        logger.error(`❌ Failed to validate environment variables: ${errorMessages}`);
        throw new Error(`Environment validation failed: ${errorMessages}`);
    }
    const encodedUsername = encodeURIComponent(validatedConfig.MONGO_USERNAME);
    const encodedPassword = encodeURIComponent(validatedConfig.MONGO_PASSWORD);
    validatedConfig.MONGO_URI = `mongodb://${encodedUsername}:${encodedPassword}@${validatedConfig.MONGO_HOST}:${validatedConfig.MONGO_PORT}/${validatedConfig.MONGO_DATABASE}?authSource=admin`;
    console.log(`MongoDB URI: ${validatedConfig.MONGO_URI}`);
    const logger = new Logger(EnvConfig.name);
    logger.log('✅ Successfully loaded and validated environment variables');
    return validatedConfig;
}
//# sourceMappingURL=configuration.js.map