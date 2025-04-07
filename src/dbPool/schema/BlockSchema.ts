import { Schema } from 'mongoose';

/**
 * 用户屏蔽用户数据
 */
class BlockSchemaFactory {
  /** MongoDB Schema */
  schema = {
    /** 用户的 UUID - 非空 */
    UUID: { type: String, required: true, index: true },
		/** 被屏蔽的用户 */
    blockUuid: { type: [String], default: [] },
		/** 被隐藏的用户 */
		muteUuid: { type: [String], default: [] },
		/** 被屏蔽的关键词 */
		blockKeyword: { type: [String], default: [] },
		/** 被屏蔽的标签 */
		tagId: { type: [Number], default: [] },
		/** 正则表达式 */
		blockRegex: { type: [String], default: [] },
		/** 正则表达式标志 */
		// flag: { type: [String], default: [] },
		/** 系统专用字段-最后编辑时间 - 非空 */
		editDateTime: { type: Number, required: true },
  }
  /** MongoDB 集合名 */
 	collectionName = 'blocking'
  /** Mongoose Schema 实例 */
  schemaInstance = new Schema(this.schema)
}
export const BlockingSchema = new BlockSchemaFactory()
