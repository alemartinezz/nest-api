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
import { Exclude, Expose, Transform } from 'class-transformer';
let UserResponseDto = (() => {
    var _a;
    let _instanceExtraInitializers = [];
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _email_decorators;
    let _email_initializers = [];
    let _email_extraInitializers = [];
    let _emailVerified_decorators;
    let _emailVerified_initializers = [];
    let _emailVerified_extraInitializers = [];
    let _role_decorators;
    let _role_initializers = [];
    let _role_extraInitializers = [];
    let _token_decorators;
    let _token_initializers = [];
    let _token_extraInitializers = [];
    let _tokenExpiration_decorators;
    let _tokenExpiration_initializers = [];
    let _tokenExpiration_extraInitializers = [];
    let _tokenTotalUsage_decorators;
    let _tokenTotalUsage_initializers = [];
    let _tokenTotalUsage_extraInitializers = [];
    let _password_decorators;
    let _password_initializers = [];
    let _password_extraInitializers = [];
    let ___v_decorators;
    let ___v_initializers = [];
    let ___v_extraInitializers = [];
    let _get_userId_decorators;
    return _a = class UserResponseDto {
            get userId() {
                return this.id;
            }
            constructor() {
                this.id = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _id_initializers, void 0));
                this.email = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _email_initializers, void 0));
                this.emailVerified = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _emailVerified_initializers, void 0));
                this.role = (__runInitializers(this, _emailVerified_extraInitializers), __runInitializers(this, _role_initializers, void 0));
                this.token = (__runInitializers(this, _role_extraInitializers), __runInitializers(this, _token_initializers, void 0));
                this.tokenExpiration = (__runInitializers(this, _token_extraInitializers), __runInitializers(this, _tokenExpiration_initializers, void 0));
                this.tokenTotalUsage = (__runInitializers(this, _tokenExpiration_extraInitializers), __runInitializers(this, _tokenTotalUsage_initializers, void 0));
                this.password = (__runInitializers(this, _tokenTotalUsage_extraInitializers), __runInitializers(this, _password_initializers, void 0));
                this.__v = (__runInitializers(this, _password_extraInitializers), __runInitializers(this, ___v_initializers, void 0));
                __runInitializers(this, ___v_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [Expose()];
            _email_decorators = [Expose()];
            _emailVerified_decorators = [Expose()];
            _role_decorators = [Expose()];
            _token_decorators = [Expose()];
            _tokenExpiration_decorators = [Exclude()];
            _tokenTotalUsage_decorators = [Exclude()];
            _password_decorators = [Exclude()];
            ___v_decorators = [Exclude()];
            _get_userId_decorators = [Transform(({ obj }) => obj._id.toString())];
            __esDecorate(_a, null, _get_userId_decorators, { kind: "getter", name: "userId", static: false, private: false, access: { has: obj => "userId" in obj, get: obj => obj.userId }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: obj => "email" in obj, get: obj => obj.email, set: (obj, value) => { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
            __esDecorate(null, null, _emailVerified_decorators, { kind: "field", name: "emailVerified", static: false, private: false, access: { has: obj => "emailVerified" in obj, get: obj => obj.emailVerified, set: (obj, value) => { obj.emailVerified = value; } }, metadata: _metadata }, _emailVerified_initializers, _emailVerified_extraInitializers);
            __esDecorate(null, null, _role_decorators, { kind: "field", name: "role", static: false, private: false, access: { has: obj => "role" in obj, get: obj => obj.role, set: (obj, value) => { obj.role = value; } }, metadata: _metadata }, _role_initializers, _role_extraInitializers);
            __esDecorate(null, null, _token_decorators, { kind: "field", name: "token", static: false, private: false, access: { has: obj => "token" in obj, get: obj => obj.token, set: (obj, value) => { obj.token = value; } }, metadata: _metadata }, _token_initializers, _token_extraInitializers);
            __esDecorate(null, null, _tokenExpiration_decorators, { kind: "field", name: "tokenExpiration", static: false, private: false, access: { has: obj => "tokenExpiration" in obj, get: obj => obj.tokenExpiration, set: (obj, value) => { obj.tokenExpiration = value; } }, metadata: _metadata }, _tokenExpiration_initializers, _tokenExpiration_extraInitializers);
            __esDecorate(null, null, _tokenTotalUsage_decorators, { kind: "field", name: "tokenTotalUsage", static: false, private: false, access: { has: obj => "tokenTotalUsage" in obj, get: obj => obj.tokenTotalUsage, set: (obj, value) => { obj.tokenTotalUsage = value; } }, metadata: _metadata }, _tokenTotalUsage_initializers, _tokenTotalUsage_extraInitializers);
            __esDecorate(null, null, _password_decorators, { kind: "field", name: "password", static: false, private: false, access: { has: obj => "password" in obj, get: obj => obj.password, set: (obj, value) => { obj.password = value; } }, metadata: _metadata }, _password_initializers, _password_extraInitializers);
            __esDecorate(null, null, ___v_decorators, { kind: "field", name: "__v", static: false, private: false, access: { has: obj => "__v" in obj, get: obj => obj.__v, set: (obj, value) => { obj.__v = value; } }, metadata: _metadata }, ___v_initializers, ___v_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
export { UserResponseDto };
//# sourceMappingURL=user-response.dto.js.map