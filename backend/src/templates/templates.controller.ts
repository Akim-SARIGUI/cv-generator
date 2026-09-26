import { Controller, Get, Query } from '@nestjs/common';
import { CV_TEMPLATES, listTemplateFamilies } from '../common/cv-templates';

@Controller('templates')
export class TemplatesController {
  @Get()
  list(
    @Query('layout') layout?: string,
    @Query('q') q?: string,
  ) {
    const query = (q || '').trim().toLowerCase();
    let items = CV_TEMPLATES;
    if (layout) {
      items = items.filter((t) => t.layout === layout || t.family === layout);
    }
    if (query) {
      items = items.filter(
        (t) =>
          t.id.includes(query) ||
          t.nameFr.toLowerCase().includes(query) ||
          t.nameEn.toLowerCase().includes(query) ||
          t.descFr.toLowerCase().includes(query) ||
          t.descEn.toLowerCase().includes(query),
      );
    }
    return {
      total: CV_TEMPLATES.length,
      families: listTemplateFamilies(),
      items: items.map((t) => ({
        id: t.id,
        layout: t.layout,
        family: t.family || t.layout,
        accent: t.accent,
        showsPhoto: t.showsPhoto,
        name: t.nameFr,
        nameEn: t.nameEn,
        description: t.descFr,
        descriptionEn: t.descEn,
      })),
    };
  }
}
