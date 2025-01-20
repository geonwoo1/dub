import {Inject, Injectable} from '@nestjs/common';
import {google} from "googleapis";
import {OAuth2Client} from "google-auth-library";
import {Repository, SelectQueryBuilder} from "typeorm";
import {YoutubeUserChannel} from "./entities/youtube-user-channel.entity";
import {CreateYoutubeUserChannelDto} from "./dto/create-youtube-user-channel.dto";
import {YoutubeFilter} from "./interface/youtube-filter.interface";
import {YoutubeUserGroup} from "./entities/youtube-user-group.entity";
import {YoutubeUserChannelAuthority} from "./entities/youtube-user-channel-authority.entity";
import {CreateYoutubeUserGroupDto} from "./dto/create-youtube-user-group.dto";
import {CreateYoutubeUserChannelAuthorityDto} from "./dto/create-youtube-user-channel-authority.dto";
import {YoutubeChannelLog} from "./entities/youtube-channel-log.entity";
import {CreateYoutubeChannelLogDto} from "./dto/create-youtube-channel-log.dto";

@Injectable()
export class YoutubeService {
    constructor(
        @Inject('YOUTUBE_USER_CHANNEL_REPOSITORY') private youtubeUserChannelRepository: Repository<YoutubeUserChannel>,
        @Inject('YOUTUBE_USER_GROUP_REPOSITORY') private youtubeUserGroupRepository: Repository<YoutubeUserGroup>,
        @Inject('YOUTUBE_USER_CHANNEL_AUTHORITY_REPOSITORY') private youtubeUserChannelAuthorityRepository: Repository<YoutubeUserChannelAuthority>,
        @Inject('YOUTUBE_CHANNEL_LOG_REPOSITORY') private youtubeChannelLogRepository: Repository<YoutubeChannelLog>,
    ) {}

    getYoutubeObj({client}: {client: OAuth2Client}): any {
        return google.youtube({ version: 'v3', auth: client});
    }

    /**
     * @description youtube channel id 얻기
     * @author jason.jang
     * @date 2024/07/14
    **/
    async getChannelInfo({client}: {client: OAuth2Client}) {
        const youtube = this.getYoutubeObj({client})
        const response = await youtube.channels.list({
            part: ['id', 'snippet'],
            mine: true,
        });
        try{
            const result = {
                channelId: response.data.items[0].id,
                channelName: response.data.items[0].snippet.title,
                channelProfilePicture: response.data.items[0].snippet.thumbnails.default.url,
            }
            //
            return result;
        }catch(e)
        {
            return {
                channelId: null,
                channelName: null,
                channelProfilePicture: null,
            };
        }
    }

    /**
     * @description youtube user channel id upsert
     * @author jason.jang
     * @date 2024/07/14
     **/
    async saveYoutubeUserChannel(createYoutubeUserChannelDto: CreateYoutubeUserChannelDto): Promise<YoutubeUserChannel> {
        const findChannel = await this.youtubeUserChannelRepository.findOneBy({ownerUserId: createYoutubeUserChannelDto.ownerUserId
            , channelId: createYoutubeUserChannelDto.channelId})

        await this.saveYoutubeChannelLog(createYoutubeUserChannelDto);
        //
        if(findChannel){
            findChannel.channelName = createYoutubeUserChannelDto.channelName.normalize('NFC');
            findChannel.channelProfileUrl = createYoutubeUserChannelDto.channelProfileUrl;
            return await this.youtubeUserChannelRepository.save(findChannel);
        }else
        {
            createYoutubeUserChannelDto.channelName = createYoutubeUserChannelDto.channelName.normalize('NFC');
            return await this.youtubeUserChannelRepository.save(createYoutubeUserChannelDto);
        }
    }

    /**
     * @description youtube channel log save
     * @author jason.jang
     * @date 2024/07/17
     **/
    async saveYoutubeChannelLog(createYoutubeUserChannelDto: CreateYoutubeUserChannelDto): Promise<void> {
        const findChannelLog = await this.youtubeChannelLogRepository.findOneBy({
            userId: createYoutubeUserChannelDto.ownerUserId,
            channelId: createYoutubeUserChannelDto.channelId,
        })

        if(findChannelLog){
            if(findChannelLog.channelName !== createYoutubeUserChannelDto.channelName)
            {
                findChannelLog.channelName = createYoutubeUserChannelDto.channelName;
                findChannelLog.channelProfileUrl = createYoutubeUserChannelDto.channelProfileUrl;
                await this.youtubeChannelLogRepository.save(findChannelLog, {reload: false});
            }
        }else{
            const createYoutubeChannelLogDto: CreateYoutubeChannelLogDto = new CreateYoutubeChannelLogDto();
            createYoutubeChannelLogDto.userId = createYoutubeUserChannelDto.ownerUserId;
            createYoutubeChannelLogDto.channelId = createYoutubeUserChannelDto.channelId;
            createYoutubeChannelLogDto.channelName = createYoutubeUserChannelDto.channelName;
            createYoutubeChannelLogDto.channelProfileUrl = createYoutubeUserChannelDto.channelProfileUrl;
            await this.youtubeChannelLogRepository.save(createYoutubeChannelLogDto, {reload: false});
        }
    }

    /**
     * @description youtube user group save
     * @author jason.jang
     * @date 2024/07/17
     **/
    async saveYoutubeUserGroup(createYoutubeUserGroupDto: CreateYoutubeUserGroupDto): Promise<void> {
        const findYoutubeUserGroup = await this.youtubeUserGroupRepository.findOneBy({ownerUserId: createYoutubeUserGroupDto.ownerUserId
            , subUserId: createYoutubeUserGroupDto.subUserId})
        if(!findYoutubeUserGroup){
            await this.youtubeUserGroupRepository.save(createYoutubeUserGroupDto, {reload: false});
        }
    }

    /**
     * @description youtube user channel authority save
     * @author jason.jang
     * @date 2024/07/17
    **/
    async saveYoutubeUserChannelAuthority(createYoutubeUserChannelAuthorityDto: CreateYoutubeUserChannelAuthorityDto): Promise<void> {
        const findYoutubeUserChannelAuthority =
            await this.youtubeUserChannelAuthorityRepository.findOneBy({userId: createYoutubeUserChannelAuthorityDto.userId
            , channelInnerId: createYoutubeUserChannelAuthorityDto.channelInnerId})
        if(!findYoutubeUserChannelAuthority){
            await this.youtubeUserChannelAuthorityRepository.save(createYoutubeUserChannelAuthorityDto, {reload: false});
        }
    }

    /**
     * @description Youtube 채널 리스트
     * @author jason.jang
     * @date 2024/07/16
    **/
    async getYoutubeChannels(filter: YoutubeFilter): Promise<YoutubeChannelLog[]> {
        const youtubeChannels: SelectQueryBuilder<YoutubeChannelLog> = await this.youtubeChannelLogRepository
            .createQueryBuilder('ycl')
            .select([
                'ycl.channelName as channelName',
            ]).groupBy('ycl.channelName')

        //주문자 필터 검색 Delimiter -> ','
        if(filter.channelName){
            youtubeChannels.andWhere('ycl.channelName like :channelName', {channelName: `%${filter.channelName}%`});
        }
        //
        return youtubeChannels.getRawMany();
    }

    /**
     * @description user가 접근 가능한 youtube 채널 리스트
     * @author jason.jang
     * @date 2024/07/17
     **/
    async getAllowedUserYoutubeChannels(userId: number): Promise<YoutubeUserGroup[] | null> {
        return await this.youtubeUserGroupRepository.createQueryBuilder('yug')
            .leftJoinAndSelect('yug.ownerChannelAuthorities', 'oca')
            .leftJoinAndSelect('yug.ownerUser', 'ou')
            .leftJoinAndSelect('oca.youtubeUserChannel', 'yuc')
            .select([
                'yug.ownerUserId',
                'ou.email',
                'yug.privilege',
                'oca.channelInnerId',
                'yuc.channelId',
                'yuc.channelName',
                'yuc.channelProfileUrl',
            ])
            .where('yug.subUserId = :subUserId', {subUserId: userId})
            .getMany();
    }

    /**
     * @description channel id를 기반으로 user id가 존재하는지 확인
     * @author jason.jang
     * @date 2024/07/25
    **/
    async isExistChannelIdAuthorityForUser(userId: number, channelId: string): Promise<boolean> {
        const findUserChannel = await this.youtubeUserChannelRepository.findOneBy({channelId: channelId});
        let isExistChannel = false;
        if(findUserChannel){
            const findUserChannelAuthority = await this.youtubeUserChannelAuthorityRepository.findOneBy({channelInnerId: findUserChannel.id, userId: userId});
            if(findUserChannelAuthority)
                isExistChannel = true;
        }
        return isExistChannel;
    }
}
