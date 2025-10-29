import llm from "../lib/llm.ts";
import birth_imprint_prompt from "../../prompt/career/birth_imprint.ts";

const birth_imprint_result = await llm.invoke(birth_imprint_prompt);

// Extract only the text content from the response
const textContent = Array.isArray(birth_imprint_result.content)
  ? birth_imprint_result.content.find((item: any) => item.type === 'text')?.text || ''
  : birth_imprint_result.content;


export default textContent;
