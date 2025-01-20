import {Inject, Injectable, Logger} from '@nestjs/common';
import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {User} from "./entities/user.entity";
import {UserToken} from "./entities/user-token.entity";
import {FindOneOptions, Repository, SaveOptions} from "typeorm";
import * as bcrypt from 'bcrypt'
import {CreateUserTokenDto} from "./dto/create-user-token.dto";
import {AUTH} from "../const/auth.const";
import {YoutubeUserGroup} from "../youtube/entities/youtube-user-group.entity";
import {YoutubeService} from "../youtube/youtube.service";


@Injectable()
export class UserService {

    constructor(
        @Inject('USER_REPOSITORY') private userRepository: Repository<User>,
        @Inject('USER_TOKEN_REPOSITORY') private userTokenRepository: Repository<UserToken>,
        private youtubeService: YoutubeService,
    ) {}
    private readonly logger = new Logger(UserService.name);

    /**
     * @description 신규 유저 생성
     * @author jason.jang
     * @date 2024/06/26
     **/
    async save(createUserDto: CreateUserDto, saveOptions: SaveOptions = {reload: false}) {
        if(createUserDto.password)
            await this.transformPassword(createUserDto)
        //
        return this.userRepository.save(createUserDto, saveOptions);
    }

    /**
     * @description 비밀번호 암호화
     * @author jason.jang
     * @date 2024/06/26
     **/
    async transformPassword(createUserDto: CreateUserDto): Promise<void> {
        createUserDto.password = await bcrypt.hash(
            createUserDto.password, 10,
        );
        return Promise.resolve();
    }

    /**
     * @description 단일 찾기
     * @author jason.jang
     * @date 2024/06/27
    **/
    async findByFields(options: FindOneOptions<User>): Promise<User | undefined> {
        return await this.userRepository.findOne(options);
    }

    /**
     * @description 복수 찾기
     * @author jason.jang
     * @date 2024/06/27
     **/
    async findsByFields(options: FindOneOptions<User>): Promise<User[] | undefined> {
        return await this.userRepository.find(options);
    }

    /**
     * @description user 마지막 로그인 시간 저장
     * @author jason.jang
     * @date 2024/06/28
    **/
    async updateLastLoginedAt(userFind: User): Promise<User> {
        userFind.lastLoginedAt = new Date();
        return await this.userRepository.save(userFind);
    }

    /**
     * @description user jwt 토큰 저장
     * @author jason.jang
     * @date 2024/07/02
    **/
    async saveAuthJwtTokens(createUserTokenDto: CreateUserTokenDto) {
        await this.deleteUserTokens({userId: createUserTokenDto.userId, type: AUTH.TOKEN_TYPE.LOGIN});
        await this.userTokenRepository.save(createUserTokenDto, {reload: false});
        //
        const updateUserDTO: UpdateUserDto = new UpdateUserDto();
        updateUserDTO.accessToken = createUserTokenDto.accessToken;
        updateUserDTO.refreshToken = createUserTokenDto.refreshToken;
        await this.userRepository.update({id: createUserTokenDto.userId}, updateUserDTO);
    }

    /**
     * @description youtube token 저장
     * @author jason.jang
     * @date 2024/07/12
     **/
    async saveYoutubeTokens(createUserTokenDto: CreateUserTokenDto) {
        await this.deleteUserTokens({userId: createUserTokenDto.userId
            , type: AUTH.TOKEN_TYPE.YOUTUBE
            , token_id: createUserTokenDto.tokenId});
        await this.userTokenRepository.save(createUserTokenDto, {reload: false});
    }

    /**
     * @description user의 로그인 토큰 삭제처리
     * @author jason.jang
     * @date 2024/07/02
    **/
    async deleteUserTokens({userId, type, token_id}: {userId: number, type: string, token_id?: string}): Promise<void>{
        const updateUserToken = this.userTokenRepository.createQueryBuilder()
            .update(UserToken)
            .set({deletedAt: new Date()})
            .where("user_id = :userId", {userId: userId})
            .andWhere("type = :type", {type: type});
        if(token_id)
            updateUserToken.andWhere("token_id = :token_id", {token_id: token_id});
        //
        await updateUserToken.execute();
    }

    /**
     * @description user 테이블 jwt token refresh
     * @author jason.jang
     * @date 2024/07/03
    **/
    async refreshUserJwtToken(user: User) {
        await this.userRepository.update({id: user.id}
            , {accessToken: user.accessToken, refreshToken: user.refreshToken});
    }

    /**
     * @description 유저 정보의 refresh token 과 비교 검증
     * @author jason.jang
     * @date 2024/07/03
    **/
    async getUserIfRefreshTokenMatches(refreshToken: string, userId: number): Promise<User | null> {
        const user: User = await this.findByFields({where:{id: userId}});

        // user에 currentRefreshToken이 없다면 null을 반환 (즉, 토큰 값이 null일 경우)
        if (!user.refreshToken) {
            return null;
        }

        // 만약 true라면 user 객체를 반환
        if (user.refreshToken === refreshToken) {
            return user;
        }
    }

    /**
     * @description user가 접근 가능한 youtube 채널 리스트
     * @author jason.jang
     * @date 2024/07/17
     **/
    async getAllowedUserYoutubeChannels(userId: number): Promise<YoutubeUserGroup[] | null> {
        return await this.youtubeService.getAllowedUserYoutubeChannels(userId);
    }
}
