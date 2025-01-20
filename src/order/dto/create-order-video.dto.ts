import {IsDateString, IsInt, IsNotEmpty, IsOptional, IsString} from "class-validator";

export class CreateOrderVideoDto {
    @IsOptional()
    @IsString()
    youtubeVideoId: string;

    @IsOptional()
    @IsString()
    youtubeLink: string;

    @IsOptional()
    @IsString()
    s3Key: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    thumbnailS3Key: string;

    @IsOptional()
    @IsString()
    duration: string;
}
