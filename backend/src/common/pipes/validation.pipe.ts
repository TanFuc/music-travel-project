import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ERROR_CODES, getErrorMessage } from '../constants/error-codes.constant';

@Injectable()
export class CustomValidationPipe implements PipeTransform {
  async transform(value: unknown, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      throw new BadRequestException({
        code: ERROR_CODES.VAL_001,
        message: getErrorMessage(ERROR_CODES.VAL_001),
        errors: this.formatErrors(errors),
      });
    }

    return object;
  }

  private toValidate(metatype: unknown): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype as typeof String);
  }

  private formatErrors(errors: ValidationError[]): Record<string, string[]> {
    const result: Record<string, string[]> = {};

    for (const error of errors) {
      const field = error.property;
      const constraints = error.constraints;

      if (constraints) {
        result[field] = Object.values(constraints);
      }

      // Handle nested errors
      if (error.children && error.children.length > 0) {
        const nestedErrors = this.formatErrors(error.children);
        for (const [nestedField, messages] of Object.entries(nestedErrors)) {
          result[`${field}.${nestedField}`] = messages;
        }
      }
    }

    return result;
  }
}
