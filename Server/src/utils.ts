export const cleanOpenAIResponse = (text: string) => {
  return text
    .replace(/```json\s*/, '')
    .replace(/```$/, '')
    .replace(/\\ן/g, '\\n')
    .trim();
};
