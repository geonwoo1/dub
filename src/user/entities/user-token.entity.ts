import {BaseEntity, Column, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {YoutubeUserChannel} from "../../youtube/entities/youtube-user-channel.entity";

@Entity({name: 'user_tokens'})
export class UserToken extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({name: 'user_id'})
    userId: number;

    @Column()
    type: string;

    @Column({name: 'token_id'})
    tokenId: string;

    @Column({name: 'access_token'})
    accessToken: string;

    @Column({name: 'refresh_token'})
    refreshToken: string;

    @Column({name: 'expires_in'})
    expiresIn: string;

    @Column({name: 'expired_at'})
    expiredAt: Date | null;

    @DeleteDateColumn({name: 'deleted_at'})
    deletedAt: Date | null;

    @Column({name: 'created_at', type: 'timestamp'})
    createdAt: Date;

    @Column({name: 'updated_at', type: 'timestamp'})
    updatedAt: Date;
}
