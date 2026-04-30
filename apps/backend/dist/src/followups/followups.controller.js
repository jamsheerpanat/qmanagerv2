"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowUpsController = void 0;
const common_1 = require("@nestjs/common");
const followups_service_1 = require("./followups.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../common/guards/permissions.guard");
const permissions_decorator_1 = require("../common/decorators/permissions.decorator");
let FollowUpsController = class FollowUpsController {
    followUpsService;
    constructor(followUpsService) {
        this.followUpsService = followUpsService;
    }
    create(leadId, body, req) {
        return this.followUpsService.create(leadId, body, req.user.id);
    }
    complete(id, req) {
        return this.followUpsService.complete(id, req.user.id);
    }
};
exports.FollowUpsController = FollowUpsController;
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('leads.update'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('leadId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], FollowUpsController.prototype, "create", null);
__decorate([
    (0, permissions_decorator_1.RequirePermissions)('leads.update'),
    (0, common_1.Patch)(':id/complete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FollowUpsController.prototype, "complete", null);
exports.FollowUpsController = FollowUpsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('leads/:leadId/followups'),
    __metadata("design:paramtypes", [followups_service_1.FollowUpsService])
], FollowUpsController);
//# sourceMappingURL=followups.controller.js.map