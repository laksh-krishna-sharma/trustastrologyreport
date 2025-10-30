import llm from "../lib/llm.ts";
import planetary_cycles_prompt from "../../prompt/career/planetary_cycles.ts";

const result = await llm.invoke(planetary_cycles_prompt);

// Extract only the text content from the response
const textContent = Array.isArray(result.content)
  ? result.content.find((item: any) => item.type === 'text')?.text || ''
  : result.content;


export default textContent;
