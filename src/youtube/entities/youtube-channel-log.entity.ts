import {BaseEntity, Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {OrderGroup} from "../../order/entities/order-group.entity";

@Entity({name: 'youtube_channel_logs'})
export class YoutubeChannelLog extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({name: 'user_id'})
    userId: number;

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
