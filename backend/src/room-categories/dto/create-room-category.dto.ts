import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateRoomCategoryDto {
    @IsString()
    @IsNotEmpty()
    name : string ;

    @IsString()
    @IsOptional()
    description?: string ;

    @IsNumber()
    @Min(0)
    pricePerNight: number ;

    @IsNumber()
    @Min(1)
    capacity : number ;

}