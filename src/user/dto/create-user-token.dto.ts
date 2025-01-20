import {IsDate, IsInt, IsNotEmpty, IsOptional, IsString} from "class-validator";

export class CreateUserTokenDto {
    @IsNotEmpty()
    @IsInt()
    userId: number;

    @IsNotEmpty()
    @IsString()
    type: string;

    @IsOptional()
    @IsString()
    tokenId: string;

    @IsNotEmpty()
    @IsString()
    accessToken: string;

    @IsNotEmpty()e
    @IsString()
    refreshToken: string;

    @IsString()
    expiresIn: string;

    @IsDate()
    expiredAt: Date;
}
