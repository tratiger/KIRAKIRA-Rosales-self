import { Schema } from 'mongoose';

/**
 * 用户封禁用户数据
 */
class BlockUserSchemaFactory {
  /** MongoDB Schema */
  schema = {
    /** 用户的 UUID - 非空 */
    UUID: { type: String, required: true, index: true },
		/** 被封禁的用户 */
    blockUuid: { type: [String], default: [] },
		/** 系统专用字段-最后编辑时间 - 非空 */
		hideUuid: { type: [String], default: [] },
		/** 系统专用字段-最后编辑时间 - 非空 */
		blockKeyword: { type: [String], default: [] },
		/** 系统专用字段-最后编辑时间 - 非空 */
		blockTag: { type: [Number], default: [] },
		/** 系统专用字段-最后编辑时间 - 非空 */
		blockRegex: { type: [String], default: [] },
		/** 正则表达式标志 */
		// flag: { type: [String], default: [] },
		/** 系统专用字段-最后编辑时间 - 非空 */
		editDateTime: { type: Number, required: true },
		/** 系统专用字段-创建时间 - 非空 */
		createDateTime: { type: Number, required: true },
  }
  /** MongoDB 集合名 */
 	collectionName = 'blocking'
  /** Mongoose Schema 实例 */
  schemaInstance = new Schema(this.schema)
}
export const BlockingSchema = new BlockUserSchemaFactory()
