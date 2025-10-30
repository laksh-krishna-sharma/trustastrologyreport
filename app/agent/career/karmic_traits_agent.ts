import llm from "../lib/llm.ts";
import karmic_traits_prompt from "../../prompt/career/karmic_traits.ts";

const result = await llm.invoke(karmic_traits_prompt);

// Extract only the text content from the response
const textContent = Array.isArray(result.content)
  ? result.content.find((item: any) => item.type === 'text')?.text || ''
  : result.content;


export default textContent;
