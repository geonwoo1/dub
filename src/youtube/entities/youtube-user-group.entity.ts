import {
    BaseEntity,
    Column,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn
} from 'typeorm';
import {YoutubeUserChannelAuthority} from "./youtube-user-channel-authority.entity";
import {User} from "../../user/entities/user.entity";

@Entity({name: 'youtube_user_groups'})
export class YoutubeUserGroup extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({name: 'owner_user_id'})
    ownerUserId: number;

    @Column({name: 'sub_user_id'})
    subUserId: number;

    @Column()
    privilege: string;

    @DeleteDateColumn({name: 'deleted_at'})
    deletedAt: Date | null;

    @Column({name: 'created_at', type: 'timestamp'})
    createdAt: Date;

    @Column({name: 'updated_at', type: 'timestamp'})
    updatedAt: Date;

    @OneToMany(() => YoutubeUserChannelAuthority, (youtubeUserChannelAuthority) => youtubeUserChannelAuthority.youtubeUserGroup)
    ownerChannelAuthorities: YoutubeUserChannelAuthority[];

    @OneToOne(() => User, (user) => user.id)
    @JoinColumn({name: 'owner_user_id', referencedColumnName: 'id'})
    ownerUser: User;
}
