import {BeforeInsert, Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity({name: 'videos'})
export class Video {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({name: 'youtube_video_id'})
    youtubeVideoId: string;

    @Column({name: 'youtube_link'})
    youtubeLink: string;

    @Column({name: 's3_key'})
    s3Key: string;

    @Column()
    name: string;

    @Column({name: 'thumbnail_s3_key'})
    thumbnailS3Key: string;

    @Column()
    duration: string;

    @Column({type: 'tinyint', default: 0})
    hidden: number;

    @DeleteDateColumn({name: 'deleted_at'})
    deletedAt: Date | null;

    @Column({name: 'created_at', type: 'timestamp'})
    createdAt: Date;

    @Column({name: 'updated_at', type: 'timestamp'})
    updatedAt: Date;
}
