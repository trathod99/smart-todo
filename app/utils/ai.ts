import Anthropic from '@anthropic-ai/sdk';
import { Priority } from '../components/types';
import { addDays, format, parse, isValid, isFuture, startOfToday, setHours } from 'date-fns';

const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true
});

interface TaskDetails {
  title: string;
  dueDate?: Date;
  priority?: Priority;
  duration: string;
  categories: string[];
}

export async function parseTaskDetails(input: string, existingCategories: string[] = []): Promise<TaskDetails> {
  try {
    const today = new Date();
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 150,
      messages: [{
        role: "user",
        content: `Parse the following todo task: "${input}"
        
        Extract these details:
        1. Due date (if mentioned explicitly or implicitly)
        2. Priority level (if mentioned explicitly or implied)
        3. Duration estimate (how long this task might take)
            - Be realistic and consider the complexity of the task
            - Use common duration formats: 10 min, 2 hr, 1 day, 6 months, 1 yr, etc. 
            - Ranges are acceptable (e.g., "1-2d" is acceptable)
            - if there is no reasonable duration estimate, return nothing
        4. Categories (1-3 categories that best describe this task)
           - Here are the existing categories: ${existingCategories.join(', ')}
           - If the task fits an existing category, use that instead of creating a new one
           - If no existing categories fit, suggest 1-3 new categories
           - Categories should be single words or short phrases (e.g., "Fitness", "Home Maintenance")
        5. Clean title (original text with date/priority markers removed)

        Today's date is: ${format(today, 'yyyy-MM-dd')}

        Respond in this exact JSON format:
        {
          "dueDate": "YYYY-MM-DDT12:00:00.000Z" or null,
          "priority": "P1" or "P2" or "P3" or "P4" or null,
          "duration": "duration string",
          "categories": ["category1", "category2"],
          "cleanTitle": "cleaned text"
        }`
      }]
    });

    const parsed = JSON.parse(message.content[0].text);
    
    let dueDate: Date | undefined;
    if (parsed.dueDate) {
      // Parse the ISO string and ensure it's set to noon UTC
      dueDate = new Date(parsed.dueDate);
      
      // If parsing as ISO fails, try date-fns parse
      if (!isValid(dueDate)) {
        try {
          dueDate = parse(parsed.dueDate, 'yyyy-MM-dd', new Date());
          // Set to noon UTC to avoid timezone issues
          dueDate = setHours(dueDate, 12);
        } catch (e) {
          console.error('Failed to parse date:', e);
        }
      }

      // Ensure the date is in the future
      const today = startOfToday();
      if (dueDate && !isFuture(dueDate)) {
        // If the date is not in the future, add a year
        dueDate = addDays(dueDate, 365);
      }
    }

    return {
      title: parsed.cleanTitle,
      dueDate: dueDate,
      priority: parsed.priority as Priority | undefined,
      duration: parsed.duration || '',
      categories: parsed.categories || [],
    };
  } catch (error) {
    console.error('Error parsing task details:', error);
    return {
      title: input,
      duration: '',
      categories: [],
    };
  }
} 