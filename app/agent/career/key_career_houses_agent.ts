import llm from "../lib/llm.ts";
import key_career_houses_prompt from "../../prompt/career/key_career_houses.ts";

const birth_imprint_result = await llm.invoke(key_career_houses_prompt);

// Extract only the text content from the response
const textContent = Array.isArray(birth_imprint_result.content)
  ? birth_imprint_result.content.find((item: any) => item.type === 'text')?.text || ''
  : birth_imprint_result.content;


export default textContent;
