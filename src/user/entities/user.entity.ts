import {BaseEntity, Column, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {OrderGroup} from "../../order/entities/order-group.entity";

@Entity({name: 'users'})
export class User extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;
    
    browserTimezone: string | string[];

    @Column({name: 'user_name'})
    username: string;

    @Column({unique: true})
    email: string;

    @Column()
    password: string;

    @Column({name: 'login_type'})
    loginType: string;

    @Column({name: 'content_language'})
    contentLanguage: string;
    
    @Column()
    timezone: string;

    @Column({type: 'tinyint', default: 1})
    activated: number;

    @Column({name: 'email_verified_at', type: 'timestamp'})
    emailVerifiedAt: Date;

    @Column({name: 'last_logined_at', type: 'timestamp'})
    lastLoginedAt: Date;

    @Column({name: 'access_token'})
    accessToken: string;

    @Column({name: 'refresh_token'})
    refreshToken: string;

    @Column()
    role: number;

    @Column({type: 'tinyint', default: 0})
    hidden: number;

    @DeleteDateColumn({name: 'deleted_at'})
    deletedAt: Date | null;

    @Column({name: 'created_at', type: 'timestamp'})
    createdAt: Date;

    @Column({name: 'updated_at', type: 'timestamp'})
    updatedAt: Date;

    @OneToMany(() => OrderGroup, (orderGroup) => orderGroup.user)
    orderGroups: OrderGroup[];
}
