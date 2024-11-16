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
}

export async function parseTaskDetails(input: string): Promise<TaskDetails> {
  try {
    const today = new Date();
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 150,
      messages: [{
        role: "user",
        content: `Parse the following todo task: "${input}"
        Extract these details:
        1. Due date (if mentioned explicitly or implicitly, like "tomorrow", "next week", "11/17", etc.)
           - For relative dates like "tomorrow" or "next week", provide the actual date relative to today
           - For explicit dates like "11/17", assume it's in the future (add a year if needed)
           - Return dates in ISO format with time set to noon UTC to avoid timezone issues
        2. Priority level (if mentioned explicitly like "p1" or implied by words like "urgent", "asap", "important")
        3. Duration estimate (how long this task might take to complete, e.g., "15m", "1h", "2h", "4h", "3d", "6 months", etc.)
           - Be realistic and consider the complexity of the task
           - Use common duration formats: 10 min, 2 hr, 1 day, 6 months, 1 yr, etc. 
           - Ranges are acceptable (e.g., "1-2d" is acceptable)
        4. Clean title (original text with date/priority markers removed)

        Today's date is: ${format(today, 'yyyy-MM-dd')}

        Respond in this exact JSON format:
        {
          "dueDate": "YYYY-MM-DDT12:00:00.000Z" or null,
          "priority": "P1" or "P2" or "P3" or "P4" or null,
          "duration": "duration string",
          "cleanTitle": "cleaned text"
        }

        Examples of duration estimates:
        - "quick shower" -> "15m"
        - "write blog post" -> "2h"
        - "clean apartment" -> "1.5h"
        - "grocery shopping" -> "45m"
        - "write a book" -> "1-2 years"`
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
      duration: parsed.duration || '15m', // Ensure we always have a duration
    };
  } catch (error) {
    console.error('Error parsing task details:', error);
    return {
      title: input,
      duration: '15m'
    };
  }
} 