import { readUtf8 } from './io';

export const loadChapter610 = (
  headerImageDataUrl: string,
  birthImprintHtml: string,
  karmicTraitsHtml: string,
  lifeTimelineHtml: string,
  planetryCyclesHtml: string,
  majorLifeShiftsHtml: string,
  keyCareerHousesHtml: string,
  guidingPlanetsHtml: string,
  professionalKarmaFocusHtml: string,
  recommendedCareerHtml: string,
  practicalRolesUpayasHtml: string,
  alignmentGuidanceHtml: string,
  rareYogasHtml: string
): string => {
  const chapterPath = 'app/lib/career/chapter_6to10/ch.html';
  let content = readUtf8(chapterPath);
  
  content = content.replace(/\{\{header_image\}\}/g, headerImageDataUrl);
  content = content.replace(/\{\{birth_imprint_text\}\}/g, birthImprintHtml);
  content = content.replace(/\{\{karmic_traits_text\}\}/g, karmicTraitsHtml);
  content = content.replace(/\{\{life_timeline_text\}\}/g, lifeTimelineHtml);
  content = content.replace(/\{\{planetary_cycles_text\}\}/g, planetryCyclesHtml);
  content = content.replace(/\{\{major_life_shifts_text\}\}/g, majorLifeShiftsHtml);
  content = content.replace(/\{\{key_career_houses_text\}\}/g, keyCareerHousesHtml);
  content = content.replace(/\{\{guiding_planets_text\}\}/g, guidingPlanetsHtml);
  content = content.replace(/\{\{professional_karma_focus_text\}\}/g, professionalKarmaFocusHtml);
  content = content.replace(/\{\{recommended_careers_text\}\}/g, recommendedCareerHtml);
  content = content.replace(/\{\{practical_roles_upayas_text\}\}/g, practicalRolesUpayasHtml);
  content = content.replace(/\{\{alignment_guidance_text\}\}/g, alignmentGuidanceHtml);
  content = content.replace(/\{\{rare_yogas_text\}\}/g, rareYogasHtml);

  return content;
};
