import { Schema } from 'mongoose';

/**
	* 用户屏蔽用户数据
	*/
class BlockListSchemaFactory {
	schema = {
			blockId: { type: Number, required: true, unique: true },
			type: { type: String, required: true, index: true },
			value: { type: String, required: true, index: true },
			reason: { type: String, required: false },
			operatorUid: { type: Number, required: true },
			operatorUUID: { type: String, required: true },
			createDateTime: { type: Number, required: true, index: true }, // 添加索引以提高排序性能
			editDateTime: { type: Number, required: true },
	};
	collectionName = 'blocklist'; // 集合名
	schemaInstance = new Schema(this.schema);
}
// 导出 Schema 实例
export const BlockListSchema = new BlockListSchemaFactory();
