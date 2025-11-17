import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { RutValidator } from '../validators/rut.validator';

@ValidatorConstraint({ async: false })
export class IsValidRutConstraint implements ValidatorConstraintInterface {
  validate(rut: string) {
    return RutValidator.validate(rut);
  }

  defaultMessage() {
    return 'El RUT ingresado no es válido';
  }
}

export function IsValidRut(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidRutConstraint,
    });
  };
}
