import llm from "../lib/llm.ts";
import key_career_houses_prompt from "../../prompt/career/key_career_houses.ts";

const result = await llm.invoke(key_career_houses_prompt);

// Extract only the text content from the response
const textContent = Array.isArray(result.content)
  ? result.content.find((item: any) => item.type === 'text')?.text || ''
  : result.content;


export default textContent;
