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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from "../../auth/dtos/roles.guards.dto";
let User = (() => {
    let _classDecorators = [Schema({ timestamps: true })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = Document;
    let _email_decorators;
    let _email_initializers = [];
    let _email_extraInitializers = [];
    let _emailVerified_decorators;
    let _emailVerified_initializers = [];
    let _emailVerified_extraInitializers = [];
    let _emailVerificationCode_decorators;
    let _emailVerificationCode_initializers = [];
    let _emailVerificationCode_extraInitializers = [];
    let _emailVerificationCodeExpires_decorators;
    let _emailVerificationCodeExpires_initializers = [];
    let _emailVerificationCodeExpires_extraInitializers = [];
    let _password_decorators;
    let _password_initializers = [];
    let _password_extraInitializers = [];
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
    let _tokenCurrentUsage_decorators;
    let _tokenCurrentUsage_initializers = [];
    let _tokenCurrentUsage_extraInitializers = [];
    let _tokenCurrentLimit_decorators;
    let _tokenCurrentLimit_initializers = [];
    let _tokenCurrentLimit_extraInitializers = [];
    let _tokenCurrentLeft_decorators;
    let _tokenCurrentLeft_initializers = [];
    let _tokenCurrentLeft_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    let _updatedAt_decorators;
    let _updatedAt_initializers = [];
    let _updatedAt_extraInitializers = [];
    var User = _classThis = class extends _classSuper {
        constructor() {
            super(...arguments);
            this.email = __runInitializers(this, _email_initializers, void 0);
            this.emailVerified = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _emailVerified_initializers, void 0));
            this.emailVerificationCode = (__runInitializers(this, _emailVerified_extraInitializers), __runInitializers(this, _emailVerificationCode_initializers, void 0));
            this.emailVerificationCodeExpires = (__runInitializers(this, _emailVerificationCode_extraInitializers), __runInitializers(this, _emailVerificationCodeExpires_initializers, void 0));
            this.password = (__runInitializers(this, _emailVerificationCodeExpires_extraInitializers), __runInitializers(this, _password_initializers, void 0));
            this.role = (__runInitializers(this, _password_extraInitializers), __runInitializers(this, _role_initializers, void 0));
            this.token = (__runInitializers(this, _role_extraInitializers), __runInitializers(this, _token_initializers, void 0));
            this.tokenExpiration = (__runInitializers(this, _token_extraInitializers), __runInitializers(this, _tokenExpiration_initializers, void 0));
            this.tokenTotalUsage = (__runInitializers(this, _tokenExpiration_extraInitializers), __runInitializers(this, _tokenTotalUsage_initializers, void 0));
            this.tokenCurrentUsage = (__runInitializers(this, _tokenTotalUsage_extraInitializers), __runInitializers(this, _tokenCurrentUsage_initializers, void 0));
            this.tokenCurrentLimit = (__runInitializers(this, _tokenCurrentUsage_extraInitializers), __runInitializers(this, _tokenCurrentLimit_initializers, void 0));
            this.tokenCurrentLeft = (__runInitializers(this, _tokenCurrentLimit_extraInitializers), __runInitializers(this, _tokenCurrentLeft_initializers, void 0));
            this.createdAt = (__runInitializers(this, _tokenCurrentLeft_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
            __runInitializers(this, _updatedAt_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "User");
    (() => {
        var _a;
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _email_decorators = [Prop({ required: true, unique: true, nullable: false })];
        _emailVerified_decorators = [Prop({ required: true, default: false, nullable: false })];
        _emailVerificationCode_decorators = [Prop({ nullable: true })];
        _emailVerificationCodeExpires_decorators = [Prop({ nullable: true })];
        _password_decorators = [Prop({ required: true, nullable: false })];
        _role_decorators = [Prop({ enum: UserRole, default: UserRole.BASIC, nullable: false })];
        _token_decorators = [Prop({ unique: true, nullable: true })];
        _tokenExpiration_decorators = [Prop({ type: Date, nullable: true })];
        _tokenTotalUsage_decorators = [Prop({ type: Number, default: 0 })];
        _tokenCurrentUsage_decorators = [Prop({ type: Number, nullable: true })];
        _tokenCurrentLimit_decorators = [Prop({ type: Number, nullable: true })];
        _tokenCurrentLeft_decorators = [Prop({ type: Number, nullable: true })];
        _createdAt_decorators = [Prop({ required: false })];
        _updatedAt_decorators = [Prop({ required: false })];
        __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: obj => "email" in obj, get: obj => obj.email, set: (obj, value) => { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
        __esDecorate(null, null, _emailVerified_decorators, { kind: "field", name: "emailVerified", static: false, private: false, access: { has: obj => "emailVerified" in obj, get: obj => obj.emailVerified, set: (obj, value) => { obj.emailVerified = value; } }, metadata: _metadata }, _emailVerified_initializers, _emailVerified_extraInitializers);
        __esDecorate(null, null, _emailVerificationCode_decorators, { kind: "field", name: "emailVerificationCode", static: false, private: false, access: { has: obj => "emailVerificationCode" in obj, get: obj => obj.emailVerificationCode, set: (obj, value) => { obj.emailVerificationCode = value; } }, metadata: _metadata }, _emailVerificationCode_initializers, _emailVerificationCode_extraInitializers);
        __esDecorate(null, null, _emailVerificationCodeExpires_decorators, { kind: "field", name: "emailVerificationCodeExpires", static: false, private: false, access: { has: obj => "emailVerificationCodeExpires" in obj, get: obj => obj.emailVerificationCodeExpires, set: (obj, value) => { obj.emailVerificationCodeExpires = value; } }, metadata: _metadata }, _emailVerificationCodeExpires_initializers, _emailVerificationCodeExpires_extraInitializers);
        __esDecorate(null, null, _password_decorators, { kind: "field", name: "password", static: false, private: false, access: { has: obj => "password" in obj, get: obj => obj.password, set: (obj, value) => { obj.password = value; } }, metadata: _metadata }, _password_initializers, _password_extraInitializers);
        __esDecorate(null, null, _role_decorators, { kind: "field", name: "role", static: false, private: false, access: { has: obj => "role" in obj, get: obj => obj.role, set: (obj, value) => { obj.role = value; } }, metadata: _metadata }, _role_initializers, _role_extraInitializers);
        __esDecorate(null, null, _token_decorators, { kind: "field", name: "token", static: false, private: false, access: { has: obj => "token" in obj, get: obj => obj.token, set: (obj, value) => { obj.token = value; } }, metadata: _metadata }, _token_initializers, _token_extraInitializers);
        __esDecorate(null, null, _tokenExpiration_decorators, { kind: "field", name: "tokenExpiration", static: false, private: false, access: { has: obj => "tokenExpiration" in obj, get: obj => obj.tokenExpiration, set: (obj, value) => { obj.tokenExpiration = value; } }, metadata: _metadata }, _tokenExpiration_initializers, _tokenExpiration_extraInitializers);
        __esDecorate(null, null, _tokenTotalUsage_decorators, { kind: "field", name: "tokenTotalUsage", static: false, private: false, access: { has: obj => "tokenTotalUsage" in obj, get: obj => obj.tokenTotalUsage, set: (obj, value) => { obj.tokenTotalUsage = value; } }, metadata: _metadata }, _tokenTotalUsage_initializers, _tokenTotalUsage_extraInitializers);
        __esDecorate(null, null, _tokenCurrentUsage_decorators, { kind: "field", name: "tokenCurrentUsage", static: false, private: false, access: { has: obj => "tokenCurrentUsage" in obj, get: obj => obj.tokenCurrentUsage, set: (obj, value) => { obj.tokenCurrentUsage = value; } }, metadata: _metadata }, _tokenCurrentUsage_initializers, _tokenCurrentUsage_extraInitializers);
        __esDecorate(null, null, _tokenCurrentLimit_decorators, { kind: "field", name: "tokenCurrentLimit", static: false, private: false, access: { has: obj => "tokenCurrentLimit" in obj, get: obj => obj.tokenCurrentLimit, set: (obj, value) => { obj.tokenCurrentLimit = value; } }, metadata: _metadata }, _tokenCurrentLimit_initializers, _tokenCurrentLimit_extraInitializers);
        __esDecorate(null, null, _tokenCurrentLeft_decorators, { kind: "field", name: "tokenCurrentLeft", static: false, private: false, access: { has: obj => "tokenCurrentLeft" in obj, get: obj => obj.tokenCurrentLeft, set: (obj, value) => { obj.tokenCurrentLeft = value; } }, metadata: _metadata }, _tokenCurrentLeft_initializers, _tokenCurrentLeft_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: obj => "updatedAt" in obj, get: obj => obj.updatedAt, set: (obj, value) => { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        User = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return User = _classThis;
})();
export { User };
export const UserSchema = SchemaFactory.createForClass(User);
//# sourceMappingURL=user.schema.js.map