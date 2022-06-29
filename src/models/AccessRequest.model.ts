import { Table, Column, Model, DataType, Unique, PrimaryKey, BelongsTo, AllowNull } from 'sequelize-typescript'
import { User } from "./User.model"
type test = [string, string][]

const b : test = [["A", "B"]];

@Table
export class AccessRequest extends Model {
    @Column(DataType.STRING)
    @PrimaryKey
    @Unique(true)
    // @ts-expect-error
    id!: string // This won't be visible to the user, Only us

    @Column
    @BelongsTo(() => User, 'id')
    user!: User

    @Column(DataType.JSON)
    data!: [string, string][]
    // This is an array of Question and Answer, where index 0 is question, and index 1 is answer
    // We do this to make sure if the question got updated, it will still be the same question for the ticket

    @Column(DataType.STRING)
    messageId!: string
    // Message ID for the message sent in Access Request Log channel, we used this to update the message
    // For example, if user leave, then change the message to be closed

}