import { type TextInputComponentData, TextInputStyle } from 'discord.js';
import { type QuestionType } from '../config';

export class ConfigUtility {
  /**
   * Converts a QuestionType to a TextInputComponentData,
   * this method will return TextInputTextInputComponentData with a blank customId
   */
  public static toTextInput(question: QuestionType): TextInputComponentData {
    return {
      type: 4,
      customId: '',
      style: question.style === 'paragraph' ? TextInputStyle.Paragraph : TextInputStyle.Short,
      label: question.label,
      placeholder: question.placeholder,
      minLength: question.min,
      maxLength: question.max,
      required: question.required
    };
  }

  /**
   * Converts a QuestionType to a TextInputComponentData,
   * this method will return TextInputTextInputComponentData with a blank customId
   */
  public toTextInput(question: QuestionType): TextInputComponentData {
    return ConfigUtility.toTextInput(question);
  }
}
