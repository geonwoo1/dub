import {Column, DeleteDateColumn, Entity, PrimaryColumn} from 'typeorm';

@Entity({name: 'order_configs'})
export class OrderConfig {
    @PrimaryColumn()
    type: string;

    @PrimaryColumn()
    code: string;

    @Column()
    value: string;

    @Column({name: 'localization_key'})
    localizationKey: string;

    @Column()
    priority: number;

    @Column({type: 'tinyint', default: 0})
    hidden: number;

    @DeleteDateColumn({name: 'deleted_at'})
    deletedAt: Date | null;

    @Column({name: 'created_at', type: 'timestamp'})
    createdAt: Date;

    @Column({name: 'updated_at', type: 'timestamp'})
    updatedAt: Date;
}
