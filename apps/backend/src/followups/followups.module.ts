import { Module } from '@nestjs/common';
import { FollowUpsService } from './followups.service';
import { FollowUpsController } from './followups.controller';

@Module({
  controllers: [FollowUpsController],
  providers: [FollowUpsService],
})
export class FollowUpsModule {}
