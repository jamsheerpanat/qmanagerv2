import { Module } from '@nestjs/common';
import {
  TermsCategoriesService,
  TermsTemplatesService,
} from './terms.services';
import {
  TermsCategoriesController,
  TermsTemplatesController,
} from './terms.controllers';

@Module({
  controllers: [TermsCategoriesController, TermsTemplatesController],
  providers: [TermsCategoriesService, TermsTemplatesService],
})
export class TermsModule {}
