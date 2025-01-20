import {IsNotEmpty, IsNumber, IsString} from "class-validator";

export class CreateYoutubeChannelLogDto {
    @IsNotEmpty()
    @IsNumber()
    userId: number;

    @IsNotEmpty()
    @IsString()
    channelId: string;

    @IsString()
    channelName: string;

    @IsString()
    channelProfileUrl: string;
}
