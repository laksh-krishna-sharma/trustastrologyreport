import llm from "../lib/llm.ts";
import guiding_planets_prompt from "../../prompt/career/guiding_planets.ts";

const birth_imprint_result = await llm.invoke(guiding_planets_prompt);

// Extract only the text content from the response
const textContent = Array.isArray(birth_imprint_result.content)
  ? birth_imprint_result.content.find((item: any) => item.type === 'text')?.text || ''
  : birth_imprint_result.content;


export default textContent;
