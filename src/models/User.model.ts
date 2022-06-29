import { Table, Column, Model, HasMany, DataType, AllowNull, Unique, PrimaryKey, HasOne } from 'sequelize-typescript'
import { AccessRequest } from './AccessRequest.model'
import { Warn } from "./Warn.model"

@Table
export class User extends Model {
    @Column(DataType.STRING)
    @PrimaryKey
    @Unique(true)
    // @ts-expect-error
    id!: string

    @HasMany(() => Warn)
    @AllowNull(true)
    warning?: Warn[]

    @HasOne(() => AccessRequest)
    @AllowNull(true)
    accessRequest?: AccessRequest
    // One user may only have one AccessRequest, Yell at them if they ask for more
}