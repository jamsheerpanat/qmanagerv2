import { Module } from '@nestjs/common';
import {
  TermsCategoriesService,
  TermsTemplatesService,
  TermsGroupsService,
} from './terms.services';
import {
  TermsCategoriesController,
  TermsTemplatesController,
  TermsGroupsController,
} from './terms.controllers';

@Module({
  controllers: [TermsCategoriesController, TermsTemplatesController, TermsGroupsController],
  providers: [TermsCategoriesService, TermsTemplatesService, TermsGroupsService],
})
export class TermsModule {}
