// /src/modules/shared.module.ts

import { Module } from '@nestjs/common';
import { RateLimitConfigService } from './auth/services/rate-limit-config.service';

@Module({
	providers: [RateLimitConfigService],
	exports: [RateLimitConfigService]
})
export class SharedModule {}
