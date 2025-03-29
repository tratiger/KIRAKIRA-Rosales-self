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
		editDateTime: { type: Number, required: true },
		/** 系统专用字段-创建时间 - 非空 */
		createDateTime: { type: Number, required: true },
  }
  /** MongoDB 集合名 */
 	collectionName = 'blocking-user'
  /** Mongoose Schema 实例 */
  schemaInstance = new Schema(this.schema)
}
export const BlockingUserSchema = new BlockUserSchemaFactory()

/**
 * 用户隐藏用户数据
 */
class HideUserSchemaFactory {
	/** MongoDB Schema */
	schema = {
		/** 用户的 UUID - 非空 */
		UUID: { type: String, required: true, index: true },
		/** 被隐藏的用户 */
		hideUuid: { type: [String], default: [] },
		/** 系统专用字段-最后编辑时间 - 非空 */
		editDateTime: { type: Number, required: true },
		/** 系统专用字段-创建时间 - 非空 */
		createDateTime: { type: Number, required: true },
	}
	/** MongoDB 集合名 */
	collectionName = 'hiding-user'
	/** Mongoose Schema 实例 */
	schemaInstance = new Schema(this.schema)
}
export const HidingUserSchema = new HideUserSchemaFactory()

/**
 * 用户封禁关键词数据
 */
class BlockKeywordSchemaFactory {
	/** MongoDB Schema */
	schema = {
		/** 用户的 UUID - 非空 */
		UUID: { type: String, required: true, index: true },
		/** 被封禁的关键词 */
		blockKeyword: { type: [String], default: [] },
		/** 系统专用字段-最后编辑时间 - 非空 */
		editDateTime: { type: Number, required: true },
		/** 系统专用字段-创建时间 - 非空 */
		createDateTime: { type: Number, required: true },
	}
	/** MongoDB 集合名 */
	collectionName = 'blocking-keyword'
	/** Mongoose Schema 实例 */
	schemaInstance = new Schema(this.schema)
}
export const BlockingKeywordSchema = new BlockKeywordSchemaFactory()

/**
 * 用户正则表达式数据
 */
class BlockRegexSchemaFactory {
	/** MongoDB Schema */
	schema = {
		/** 用户的 UUID - 非空 */
		UUID: { type: String, required: true, index: true },
		/** 被封禁的正则表达式 */
		blockRegex: { type: [String], default: [] },
		/** 系统专用字段-最后编辑时间 - 非空 */
		editDateTime: { type: Number, required: true },
		/** 系统专用字段-创建时间 - 非空 */
		createDateTime: { type: Number, required: true },
	}
	/** MongoDB 集合名 */
	collectionName = 'blocking-regex'
	/** Mongoose Schema 实例 */
	schemaInstance = new Schema(this.schema)
}
export const BlockingRegexSchema = new BlockRegexSchemaFactory()

