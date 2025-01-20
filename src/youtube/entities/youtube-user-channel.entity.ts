import {BaseEntity, Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity({name: 'youtube_user_channels'})
export class YoutubeUserChannel extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({name: 'owner_user_id'})
    ownerUserId: number;

    @Column({name: 'channel_id'})
    channelId: string;

    @Column({name: 'channel_name'})
    channelName: string;

    @Column({name: 'channel_profile_url'})
    channelProfileUrl: string;

    @DeleteDateColumn({name: 'deleted_at'})
    deletedAt: Date | null;

    @Column({name: 'created_at', type: 'timestamp'})
    createdAt: Date;

    @Column({name: 'updated_at', type: 'timestamp'})
    updatedAt: Date;
}
