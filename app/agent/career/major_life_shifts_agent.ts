import llm from "../lib/llm.ts";
import major_life_shifts_prompt from "../../prompt/career/major_life_shifts.ts";

const result = await llm.invoke(major_life_shifts_prompt);

// Extract only the text content from the response
const textContent = Array.isArray(result.content)
  ? result.content.find((item: any) => item.type === 'text')?.text || ''
  : result.content;


export default textContent;
