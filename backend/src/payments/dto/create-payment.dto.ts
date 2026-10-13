import { IsEnum, IsInt, IsNumber, IsPositive } from 'class-validator';
import { PaymentMode } from '../enums/payment-mode.enum.js';

export class CreatePaymentDto {
  @IsInt()
  reservationId: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  montant: number;

  @IsEnum(PaymentMode)
  modePaiement: PaymentMode;
}
