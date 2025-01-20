import {PartialType} from '@nestjs/mapped-types';
import {CreateUserDto} from './create-user.dto';
import {IsString} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsString()
    @ApiProperty()
    accessToken: string;

    @IsString()
    @ApiProperty()
    refreshToken: string;
}
