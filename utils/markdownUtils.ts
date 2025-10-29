import { Plant, CodexEntry } from '../types';

export interface ParsedCareGuide {
  introduction: string;
  watering: string;
  sunlight: string;
  soil: string;
  fertilizer: string;
  pests: string;
}

const SECTION_MAP: { [key: string]: keyof ParsedCareGuide } = {
  'watering': 'watering',
  'sunlight': 'sunlight',
  'light': 'sunlight', // alias
  'soil': 'soil',
  'fertilizer': 'fertilizer',
  'fertilizing': 'fertilizer', // alias
  'pests': 'pests',
  'diseases': 'pests', // combine with pests
  'common pests': 'pests'
};

export const parseCareGuide = (markdown: string): ParsedCareGuide => {
  const result: ParsedCareGuide = {
    introduction: '',
    watering: '',
    sunlight: '',
    soil: '',
    fertilizer: '',
    pests: '',
  };

  // Split the document by markdown headings (##, ###, etc.)
  const parts = markdown.split(/(?=^#+\s)/m);
  
  // The first part is usually "# Plant Name" followed by an intro.
  const introPart = parts.shift() || '';
  const firstHeadingMatch = introPart.match(/^#\s.*(?:\r\n|\n|\r)/);
  const introText = firstHeadingMatch 
    ? introPart.substring(firstHeadingMatch[0].length).trim()
    : introPart.trim();
  
  // Process the remaining parts
  for (const part of parts) {
    const headingMatch = part.match(/^#+\s(.*?)(?:\r\n|\n|\r)/);
    if (!headingMatch) {
        // If a part has no heading, it's likely part of the intro
        result.introduction += (result.introduction ? '\n\n' : '') + part.trim();
        continue;
    };

    const heading = headingMatch[1].toLowerCase().trim();
    const content = part.substring(headingMatch[0].length).trim();

    const sectionKey = Object.keys(SECTION_MAP).find(key => heading.includes(key));
    
    if (sectionKey) {
      const targetSection = SECTION_MAP[sectionKey];
      // Append content in case of multiple matching sections (e.g., Pests and Diseases)
      result[targetSection] = (result[targetSection] ? result[targetSection] + '\n\n' : '') + content;
    } else {
      // If it's not a known care section, treat it as part of the introduction.
      result.introduction += (result.introduction ? '\n\n' : '') + `\n\n### ${headingMatch[1].trim()}\n\n` + content;
    }
  }

  // Assign the initial intro text at the beginning
  result.introduction = (introText + '\n\n' + result.introduction).trim();

  return result;
};

export const parseMarkdown = (text: string, options: { 
    breaks?: boolean; 
    plants?: Plant[]; 
    codexEntries?: CodexEntry[] 
} = {}): string => {
    // Check if the required libraries are available on the window object
    if (typeof (window as any).marked?.parse !== 'function' || typeof (window as any).DOMPurify?.sanitize !== 'function') {
      // Fallback for a safe, simple text rendering if libraries are missing
      return text.replace(/\n/g, '<br />');
    }
  
    const marked = (window as any).marked;
    const { breaks = true, plants = [], codexEntries = [] } = options;

    let processedText = text;

    processedText = processedText.replace(/\[\[(.*?)\]\]/g, (match, linkText) => {
        const trimmedName = linkText.trim();
        const linkClass = "internal-link text-brand-green-600 dark:text-brand-green-400 font-semibold underline hover:text-brand-green-700 dark:hover:text-brand-green-500";
        
        // Prioritize Codex links as this function is used in the Codex view
        const codexMatch = codexEntries.find(c => c.name.trim().toLowerCase() === trimmedName.toLowerCase());
        if (codexMatch) {
            return `<a href="#" data-codex-id="${codexMatch.id}" class="${linkClass}">${codexMatch.name}</a>`;
        }

        const plantMatch = plants.find(p => p.name.trim().toLowerCase() === trimmedName.toLowerCase());
        if (plantMatch) {
            return `<a href="#" data-plant-id="${plantMatch.id}" class="${linkClass}">${plantMatch.name}</a>`;
        }

        return `<i class="text-gray-500 dark:text-gray-400">[[${trimmedName}]]</i>`;
    });
    
    // Pass options directly to the parse method to avoid global state mutation.
    const parseOptions = {
      gfm: true,
      breaks,
      pedantic: false,
      smartLists: true,
      smartypants: false,
    };
  
    const dirtyHtml = marked.parse(processedText, parseOptions);
  
    return (window as any).DOMPurify.sanitize(dirtyHtml, {
      ADD_TAGS: ['a'],
      ADD_ATTR: ['align', 'data-plant-id', 'data-codex-id', 'class', 'href'],
    });
  };