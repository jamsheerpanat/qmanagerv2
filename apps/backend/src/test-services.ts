import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TermsCategoriesService, TermsTemplatesService, TermsGroupsService } from './terms/terms.services';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  console.log('--- DIRECT NESTJS SERVICE TEST ---');
  
  const catService = app.get(TermsCategoriesService);
  const tempService = app.get(TermsTemplatesService);
  const grpService = app.get(TermsGroupsService);

  const categories = await catService.findAll();
  const templates = await tempService.findAll();
  const groups = await grpService.findAll();

  console.log(`Categories: ${categories.length}`);
  console.log(`Templates: ${templates.length}`);
  console.log(`Groups: ${groups.length}`);

  if (templates.length === 0) {
    console.log('CRITICAL: The services are returning 0 items, even though they exist in DB!');
  } else {
    console.log('SUCCESS: The services are correctly returning items.');
  }

  await app.close();
}

bootstrap().catch(console.error);
