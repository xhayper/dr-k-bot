import { type TextInputComponentData } from 'discord.js';
import { type QuestionType } from '../config';

export class ConfigUtility {
  /**
   * Converts a QuestionType to a TextInputComponentData,
   * this method will return TextInputTextInputComponentData with a blank customId
   */
  static toTextInput(question: QuestionType): TextInputComponentData {
    return {
      type: 4,
      customId: '',
      style: question.style,
      label: question.question,
      placeholder: question.placeholder,
      minLength: question.min,
      maxLength: question.max,
      required: question.required
    };
  }
}
