import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity({name: 'languages'})
export class Language {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    code: string;

    @Column()
    fullname: string;

    @Column()
    iso: string;

    @Column({name: 'user_capacity_iso'})
    userCapacityIso: string;

    @Column({name: 'iso_detection'})
    isoDetection: string;

    @Column({type: 'tinyint', default: 0})
    hidden: number;

    @Column({name: 'created_at', type: 'timestamp'})
    createdAt: Date;

    @Column({name: 'updated_at', type: 'timestamp'})
    updatedAt: Date;
}
