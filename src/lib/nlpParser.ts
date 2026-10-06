import { Area, ParsedVoiceTask, TaskPriority, TaskStatus } from './types';
import { getIsoToday } from './utils';

export function parseVoiceTranscript(
  transcript: string,
  areas: Area[],
  defaultAreaId: string = 'medai'
): ParsedVoiceTask {
  const text = transcript.trim();
  const lower = text.toLowerCase();

  // 1. Priority Detection
  let priority: TaskPriority = 'Normalny';
  if (/piln[yae]|pilny priorytet|urgently/i.test(lower)) {
    priority = 'Pilny';
  } else if (
    /wysok[ia]|wysoki priorytet|high priority|ważn[yae]/i.test(lower)
  ) {
    priority = 'Wysoki';
  }

  // 2. Area Detection
  let targetAreaId = defaultAreaId;
  // Look for direct mentions of area names
  for (const a of areas) {
    const areaNameLower = a.name.toLowerCase();
    if (
      lower.includes(`do ${areaNameLower}`) ||
      lower.includes(`w ${areaNameLower}`) ||
      lower.includes(`obszar ${areaNameLower}`) ||
      lower.includes(areaNameLower)
    ) {
      targetAreaId = a.id;
      break;
    }
  }

  // 3. Date Parsing
  let dateStr = getIsoToday();
  const todayObj = new Date();

  if (/\b(jutro)\b/i.test(lower)) {
    const tomorrow = new Date(todayObj);
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateStr = tomorrow.toISOString().slice(0, 10);
  } else if (/\b(pojutrze)\b/i.test(lower)) {
    const dayAfter = new Date(todayObj);
    dayAfter.setDate(dayAfter.getDate() + 2);
    dateStr = dayAfter.toISOString().slice(0, 10);
  } else if (/\b(dzisiaj|dziś)\b/i.test(lower)) {
    dateStr = getIsoToday();
  } else {
    // Days of week in Polish
    const daysMap: Record<string, number> = {
      niedziel: 0,
      poniedzia: 1,
      wtorek: 2,
      wtork: 2,
      środ: 3,
      czwartek: 4,
      czwartk: 4,
      piątek: 5,
      piątk: 5,
      sobot: 6,
    };
    for (const [dayKey, dayNum] of Object.entries(daysMap)) {
      if (lower.includes(dayKey)) {
        const currentDay = todayObj.getDay();
        let diff = dayNum - currentDay;
        if (diff <= 0) diff += 7;
        const targetDate = new Date(todayObj);
        targetDate.setDate(targetDate.getDate() + diff);
        dateStr = targetDate.toISOString().slice(0, 10);
        break;
      }
    }
  }

  // 4. Time Parsing (e.g. "o 9:00", "o 14:30", "godzina 10", "9:00")
  let timeStr = '';
  const timeMatch = lower.match(
    /\b(?:o|godzin[aie]|g\.)\s*(\d{1,2})(?::(\d{2}))?\b|\b(\d{1,2}):(\d{2})\b/
  );

  if (timeMatch) {
    let hours = 0;
    let minutes = '00';
    if (timeMatch[1] !== undefined) {
      hours = parseInt(timeMatch[1], 10);
      if (timeMatch[2]) minutes = timeMatch[2];
    } else if (timeMatch[3] !== undefined) {
      hours = parseInt(timeMatch[3], 10);
      if (timeMatch[4]) minutes = timeMatch[4];
    }

    if (hours >= 0 && hours < 24) {
      timeStr = `${String(hours).padStart(2, '0')}:${minutes}`;
    }
  }

  // 5. Title Cleanup
  let cleanTitle = text;

  // Remove common prefix patterns e.g., "Dodaj do MedAI:", "Dodaj zadanie:"
  cleanTitle = cleanTitle.replace(
    /^(?:dodaj(?:\s+zadanie)?(?:\s+do|\s+w)?(?:\s+[a-z0-9ąćęłńóśźż]+)?:?)\s*/i,
    ''
  );

  // Remove area references if present in text
  for (const a of areas) {
    const reg = new RegExp(`\\b(?:do|w|obszar)?\\s*${a.name}\\b:?`, 'gi');
    cleanTitle = cleanTitle.replace(reg, '');
  }

  // Remove date phrases
  cleanTitle = cleanTitle.replace(
    /\b(na\s+)?(jutro|pojutrze|dzisiaj|dziś|w\s+poniedziałek|we\s+wtorek|w\s+środę|w\s+czwartek|w\s+piątek|w\s+sobotę|w\s+niedzielę)\b/gi,
    ''
  );

  // Remove time phrases
  cleanTitle = cleanTitle.replace(
    /\b(?:o|godzin[aie]|g\.)\s*\d{1,2}(?::\d{2})?\b|\b\d{1,2}:\d{2}\b/gi,
    ''
  );

  // Remove priority phrases
  cleanTitle = cleanTitle.replace(
    /\b(?:wysoki|pilny|normalny)?\s*priorytet\b|\b(piln[yae]|wysok[ia])\b/gi,
    ''
  );

  // Clean trailing punctuation and spaces
  cleanTitle = cleanTitle
    .replace(/^[:,\-\s]+|[:,\-\s]+$/g, '')
    .trim();

  // Capitalize first letter of title
  if (cleanTitle.length > 0) {
    cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
  } else {
    cleanTitle = text; // fallback to raw text if cleanup stripped everything
  }

  const defaultStatus: TaskStatus = 'added';

  return {
    rawTranscript: text,
    title: cleanTitle,
    area: targetAreaId,
    status: defaultStatus,
    date: dateStr,
    time: timeStr,
    priority,
  };
}
