import llm from "../lib/llm.ts";
import guiding_planets_prompt from "../../prompt/career/guiding_planets.ts";

const result = await llm.invoke(guiding_planets_prompt);

// Extract only the text content from the response
const textContent = Array.isArray(result.content)
  ? result.content.find((item: any) => item.type === 'text')?.text || ''
  : result.content;


export default textContent;
