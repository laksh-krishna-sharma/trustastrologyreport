import llm from "../lib/llm.ts";
import birth_imprint_prompt from "../../prompt/career/birth_imprint.ts";

const result = await llm.invoke(birth_imprint_prompt);

// Extract only the text content from the response
const textContent = Array.isArray(result.content)
  ? result.content.find((item: any) => item.type === 'text')?.text || ''
  : result.content;


export default textContent;
