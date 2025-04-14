import { Schema } from 'mongoose';

/**
	* 用户屏蔽用户数据
	*/
class BlockListSchemaFactory {
	schema = {
		/** 黑名单类型 - 非空 */
		type: { type: String, required: true },
		/** 黑名单内容 - 非空 */
		value: { type: String, required: true },
		/** 被屏蔽用户 UID（如有） */
		Uid: { type: Number },
		/** 创建者 UID - 非空 */
		operatorUid: { type: Number, required: true },
		/** 创建者 UUID - 非空 */
		operatorUUID: { type: String, required: true },
		/** 系统专用字段-创建时间 - 非空 */
		createDateTime: { type: Number, required: true, index: true },
	}
	/** MongoDB 集合名 */
	collectionName = 'blocklist'
	/** Mongoose Schema 实例 */
	schemaInstance = new Schema(this.schema)
}
export const BlockListSchema = new BlockListSchemaFactory();
