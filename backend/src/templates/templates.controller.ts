import { Controller, Get } from '@nestjs/common';
import { CV_TEMPLATES } from '../common/cv-templates';

@Controller('templates')
export class TemplatesController {
  @Get()
  list() {
    return CV_TEMPLATES.map((t) => ({
      id: t.id,
      layout: t.layout,
      accent: t.accent,
      showsPhoto: t.showsPhoto,
      name: t.nameFr,
      nameEn: t.nameEn,
      description: t.descFr,
      descriptionEn: t.descEn,
    }));
  }
}
