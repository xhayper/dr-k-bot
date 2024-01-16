import { TextInputComponentData } from 'discord.js';
import { QuestionType } from '../config';

export class ConfigUtility {
  /*
   * Converts a QuestionType to a TextInputComponentData
   * This method will return with a blank customId
   */
  static toTextInput(question: QuestionType): TextInputComponentData {
    return {
      type: 4,
      customId: '',
      style: question.style === 'paragraph' ? 2 : 1,
      label: question.question,
      placeholder: question.placeholder,
      minLength: question.min,
      maxLength: question.max,
      required: question.required
    };
  }
}
