import llm from "../lib/llm.ts";
import planetary_cycles_prompt from "../../prompt/career/planetary_cycles.ts";

const birth_imprint_result = await llm.invoke(planetary_cycles_prompt);

// Extract only the text content from the response
const textContent = Array.isArray(birth_imprint_result.content)
  ? birth_imprint_result.content.find((item: any) => item.type === 'text')?.text || ''
  : birth_imprint_result.content;


export default textContent;
