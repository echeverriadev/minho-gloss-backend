import { BadRequestException, Injectable, type PipeTransform } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    // isValidObjectId acepta cualquier texto de 12 caracteres; se exige el formato hexadecimal de 24.
    if (!/^[0-9a-f]{24}$/i.test(value) || !isValidObjectId(value)) {
      throw new BadRequestException('El id no es válido');
    }
    return value;
  }
}
