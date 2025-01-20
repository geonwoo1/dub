import {
    BaseEntity,
    Column,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn
} from 'typeorm';
import {YoutubeUserGroup} from "./youtube-user-group.entity";
import {YoutubeUserChannel} from "./youtube-user-channel.entity";

@Entity({name: 'youtube_user_channel_authorities'})
export class YoutubeUserChannelAuthority extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({name: 'user_id'})
    userId: number;

    @Column({name: 'channel_inner_id'})
    channelInnerId: number;

    @DeleteDateColumn({name: 'deleted_at'})
    deletedAt: Date | null;

    @Column({name: 'created_at', type: 'timestamp'})
    createdAt: Date;

    @Column({name: 'updated_at', type: 'timestamp'})
    updatedAt: Date;

    @ManyToOne(() => YoutubeUserGroup, (youtubeUserGroup) => youtubeUserGroup.ownerChannelAuthorities)
    @JoinColumn({name: 'user_id', referencedColumnName: 'ownerUserId'})
    youtubeUserGroup: YoutubeUserGroup;

    @OneToOne(() => YoutubeUserChannel, (youtubeUserChannel) => youtubeUserChannel.id)
    @JoinColumn({name: 'channel_inner_id', referencedColumnName: 'id'})
    youtubeUserChannel: YoutubeUserChannel;
}
