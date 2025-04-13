import { InferSchemaType } from "mongoose";
import { AddRegexRequestDto, AddRegexResponseDto, BlockKeywordRequestDto, BlockKeywordResponseDto, BlockTagRequestDto, BlockTagResponseDto, BlockUserByUidRequestDto, BlockUserByUidResponseDto, CheckIsBlockedRequestDto, CheckIsBlockedResponseDto, GetBlockListResponseDto, MuteUserByUidRequestDto, MuteUserByUidResponseDto, RemoveRegexRequestDto, RemoveRegexResponseDto, ShowUserByUidRequestDto, ShowUserByUidResponseDto, UnblockKeywordRequestDto, UnblockKeywordResponseDto, UnblockTagRequestDto, UnblockTagResponseDto, UnblockUserByUidRequestDto, UnblockUserByUidResponseDto } from "../controller/BlockControllerDto.js";
import { checkUserExistsByUuidService, checkUserTokenByUuidService, getUserUuid } from "./UserService.js";
import { QueryType, SelectType, UpdateType } from "../dbPool/DbClusterPoolTypes.js";
import { abortAndEndSession, commitAndEndSession, createAndStartSession } from "../common/MongoDBSessionTool.js";
import { updateData4MongoDB, selectDataFromMongoDB, insertData2MongoDB, findOneAndUpdateData4MongoDB } from "../dbPool/DbClusterPool.js";
import { BlockListSchema } from "../dbPool/schema/BlockSchema.js";

// DELETE ME： 一定要重写一下

// /**
//  * 屏蔽用户
//  * @param blockUserByUidRequest 屏蔽用户的请求载荷
//  * @param uuid 用户的 UUID
//  * @param token 用户的 token
//  * @returns 屏蔽用户的请求响应
//  */
// export const BlockUserByUidService = async (blockUserByUidRequest: BlockUserByUidRequestDto, uuid: string, token: string): Promise<BlockUserByUidResponseDto> => {
// 	try {
// 		if (!checkBlockUserByUidRequest(blockUserByUidRequest)) {
// 			console.error('ERROR', '屏蔽用户请求载荷不合法')
// 			return { success: false, message: '屏蔽用户请求载荷不合法' }
// 		}

// 		const { blockUid } = blockUserByUidRequest
// 		const blockedUuid = await getUserUuid(blockUid) as string

// 		const now = new Date().getTime()

// 		if (blockedUuid === uuid) {
// 			console.error('ERROR', '屏蔽用户失败，不能屏蔽自己')
// 			return { success: false, message: '屏蔽用户失败，不能屏蔽自己' }
// 		}

// 		if (!(await checkUserTokenByUuidService(uuid, token)).success) {
// 			console.error('ERROR', '屏蔽用户失败，非法用户')
// 			return { success: false, message: '屏蔽用户失败，非法用户' }
// 		}

// 		const checkBlockUuidResult = await checkUserExistsByUuidService({ uuid: blockedUuid })
// 		if (!checkBlockUuidResult.success || (checkBlockUuidResult.success && !checkBlockUuidResult.exists)) {
// 			console.error('ERROR', '屏蔽用户失败，被屏蔽用户不存在')
// 			return { success: false, message: '屏蔽用户失败，被屏蔽用户不存在' }
// 		}

// 		const { collectionName: blockingUserCollectionName, schemaInstance: blockingUserSchemaInstance } = BlockingSchema
// 		type BlockingUser = InferSchemaType<typeof blockingUserSchemaInstance>

// 		const blockingUserWhere: QueryType<BlockingUser> = {
// 			UUID: uuid,
// 		}
// 		const blockingUserSelect: SelectType<BlockingUser> = {
// 			UUID: 1,
// 			blockUuid: 1
// 		}

// 		const blockingUserResult = await selectDataFromMongoDB<BlockingUser>(blockingUserWhere, blockingUserSelect, blockingUserSchemaInstance, blockingUserCollectionName)
// 		const blockingUserData = blockingUserResult.result?.[0] ?? {
// 			UUID: [],
// 			blockUuid: [],
// 			createDateTime: now,
// 		}

// 		if (!blockingUserResult.success) {
// 			console.error('ERROR', '屏蔽用户失败，查询数据库失败')
// 			return { success: false, message: '屏蔽用户失败，查询数据库失败' }
// 		}

// 		if (blockingUserData.blockUuid.includes(blockedUuid)) {
// 			console.error('ERROR', '屏蔽用户失败，已经屏蔽过了')
// 			return { success: false, message: '屏蔽用户失败，已经屏蔽过了' }
// 		}

// 		const blockUuid = [...new Set([...blockingUserData.blockUuid, blockedUuid])]

// 		const blockingUserUpdateData: UpdateType<BlockingUser> = {
// 			blockUuid,
// 			editDateTime: now,
// 		}

// 		const blockingUserUpdateResult = await findOneAndUpdateData4MongoDB(blockingUserWhere, blockingUserUpdateData, blockingUserSchemaInstance, blockingUserCollectionName)

// 		if (!blockingUserUpdateResult.success) {
// 			console.error('ERROR', '屏蔽用户失败，更新数据库失败')
// 			return { success: false, message: '屏蔽用户失败，更新数据库失败' }
// 		}
// 			return { success: true, message: '屏蔽用户成功', result: { blockUuid: blockUuid ?? [] } }

// 	} catch (error) {
// 		console.error('ERROR', '屏蔽用户错误，未知错误', error)
// 		return { success: false, message: '屏蔽用户失败，未知错误' }
// 	}
// }

// /**
//  * 隐藏用户
//  * @param muteUserByUidRequest 隐藏用户的请求载荷
//  * @param uuid 用户的 UUID
//  * @param token 用户的 token
//  * @returns 隐藏用户的请求响应
//  */
// export const MuteUserByUidService = async (muteUserByUidRequest: MuteUserByUidRequestDto, uuid: string, token: string): Promise<MuteUserByUidResponseDto> => {
// 	try {
// 		if (!checkMuteUserByUidRequest(muteUserByUidRequest)) {
// 			console.error('ERROR', '隐藏用户请求载荷不合法')
// 			return { success: false, message: '隐藏用户请求载荷不合法' }
// 		}

// 		const { muteUid } = muteUserByUidRequest
// 		const mutedUuid = await getUserUuid(muteUid) as string
// 		const now = new Date().getTime()

// 		if (mutedUuid === uuid) {
// 			console.error('ERROR', '隐藏用户失败，不能隐藏自己')
// 			return { success: false, message: '隐藏用户失败，不能隐藏自己' }
// 		}

// 		if (!(await checkUserTokenByUuidService(uuid, token)).success) {
// 			console.error('ERROR', '隐藏用户失败，非法用户')
// 			return { success: false, message: '隐藏用户失败，非法用户' }
// 		}
// 		const checkMuteUuidResult = await checkUserExistsByUuidService({ uuid: mutedUuid })
// 		if (!checkMuteUuidResult.success || (checkMuteUuidResult.success && !checkMuteUuidResult.exists)) {
// 			console.error('ERROR', '隐藏用户失败，被隐藏用户不存在')
// 			return { success: false, message: '隐藏用户失败，被隐藏用户不存在' }
// 		}

// 		const { collectionName: hidingUserCollectionName, schemaInstance: hidingUserSchemaInstance } = BlockingSchema
// 		type HidingUser = InferSchemaType<typeof hidingUserSchemaInstance>
// 		const blockingUserWhere: QueryType<HidingUser> = {
// 			UUID: uuid,
// 		}
// 		const blockingUserSelect: SelectType<HidingUser> = {
// 			UUID: 1,
// 			muteUuid: 1
// 		}

// 		const blockingUserResult = await selectDataFromMongoDB<HidingUser>(blockingUserWhere, blockingUserSelect, hidingUserSchemaInstance, hidingUserCollectionName)
// 		const blockingUserData = blockingUserResult.result?.[0] ?? {
// 			UUID: [],
// 			muteUuid: [],
// 		}

// 		if (!blockingUserResult.success) {
// 			console.error('ERROR', '隐藏用户失败，查询数据库失败')
// 			return { success: false, message: '隐藏用户失败，查询数据库失败' }
// 		}
// 		if (blockingUserData.muteUuid.includes(mutedUuid)) {
// 			console.error('ERROR', '隐藏用户失败，已经隐藏过了')
// 			return { success: false, message: '隐藏用户失败，已经隐藏过了' }
// 		}

// 		const muteUuid = [...new Set([...blockingUserData.muteUuid, mutedUuid])]
// 		const hidingUserUpdateData: UpdateType<HidingUser> = {
// 			muteUuid,
// 			editDateTime: now,
// 		}

// 		const blockingUserUpdateResult = await findOneAndUpdateData4MongoDB(blockingUserWhere, hidingUserUpdateData, hidingUserSchemaInstance, hidingUserCollectionName)

// 		if (!blockingUserUpdateResult.success) {
// 			console.error('ERROR', '隐藏用户失败，更新数据库失败')
// 			return { success: false, message: '隐藏用户失败，更新数据库失败' }
// 		}
// 		return { success: true, message: '隐藏用户成功', result: { muteUuid: muteUuid ?? [] } }

// 	} catch (error) {
// 		console.error('ERROR', '隐藏用户错误，未知错误', error)
// 		return { success: false, message: '隐藏用户失败，未知错误' }
// 	}
// }

// /**
//  * 屏蔽关键词
//  */
// export const BlockKeywordService = async (blockKeywordRequest: BlockKeywordRequestDto, uuid: string, token: string): Promise<BlockKeywordResponseDto> => {
// 	try {
// 		if (!checkBlockKeywordRequest(blockKeywordRequest)) {
// 			console.error('ERROR', '屏蔽关键词请求载荷不合法')
// 			return { success: false, message: '屏蔽关键词请求载荷不合法' }
// 		}

// 		const { blockKeyword } = blockKeywordRequest
// 		const now = new Date().getTime()

// 		if (!(await checkUserTokenByUuidService(uuid, token)).success) {
// 			console.error('ERROR', '屏蔽关键词失败，非法用户')
// 			return { success: false, message: '屏蔽关键词失败，非法用户' }
// 		}

// 		const { collectionName: blockingKeywordCollectionName, schemaInstance: blockingKeywordSchemaInstance } = BlockingSchema
// 		type BlockingKeyword = InferSchemaType<typeof blockingKeywordSchemaInstance>
// 		const blockingKeywordWhere: QueryType<BlockingKeyword> = {
// 			UUID: uuid,
// 		}
// 		const blockingKeywordSelect: SelectType<BlockingKeyword> = {
// 			UUID: 1,
// 			blockKeyword: 1
// 		}

// 		const blockingKeywordResult = await selectDataFromMongoDB<BlockingKeyword>(blockingKeywordWhere, blockingKeywordSelect, blockingKeywordSchemaInstance, blockingKeywordCollectionName)
// 		const blockingKeywordData = blockingKeywordResult.result?.[0]

// 		if (!blockingKeywordResult.success) {
// 			console.error('ERROR', '屏蔽关键词失败，查询数据库失败')
// 			return { success: false, message: '屏蔽关键词失败，查询数据库失败' }
// 		}

// 		if (blockingKeywordData.blockKeyword.includes(blockKeyword)) {
// 			console.error('ERROR', '屏蔽关键词失败，已经屏蔽过了')
// 			return { success: false, message: '屏蔽关键词失败，已经屏蔽过了' }
// 		}

// 		const keyword = [...new Set([...blockingKeywordData.blockKeyword, blockKeyword])]

// 		const blockingUserUpdateData: UpdateType<BlockingKeyword> = {
// 			blockKeyword: keyword,
// 			editDateTime: now,
// 		}

// 		const blockingUserUpdateResult = await findOneAndUpdateData4MongoDB(blockingKeywordWhere, blockingUserUpdateData, blockingKeywordSchemaInstance, blockingKeywordCollectionName)

// 		if (!blockingUserUpdateResult.success) {
// 			console.error('ERROR', '屏蔽关键词失败，更新数据库失败')
// 			return { success: false, message: '屏蔽关键词失败，更新数据库失败' }
// 		}
// 		return { success: true, message: '屏蔽关键词成功', result: { blockKeyword: keyword ?? [] } }

// 	} catch (error) {
// 		console.error('ERROR', '屏蔽关键词错误，未知错误', error)
// 		return { success: false, message: '屏蔽关键词失败，未知错误' }
// 	}
// }

// /**
//  * 屏蔽标签
//  * @param blockTagRequest 屏蔽标签的请求载荷
//  * @param uuid 用户的 UUID
//  * @param token 用户的 token
//  * @returns 屏蔽标签的请求响应
//  */
// export const BlockTagService = async (blockTagRequest: BlockTagRequestDto, uuid: string, token: string): Promise<BlockTagResponseDto> => {
// 	try {
// 		if (!checkBlockTagRequest(blockTagRequest)) {
// 			console.error('ERROR', '屏蔽标签请求载荷不合法')
// 			return { success: false, message: '屏蔽标签请求载荷不合法' }
// 		}

// 		const { tagId } = blockTagRequest
// 		const now = new Date().getTime()

// 		if (!(await checkUserTokenByUuidService(uuid, token)).success) {
// 			console.error('ERROR', '屏蔽标签失败，非法用户')
// 			return { success: false, message: '屏蔽标签失败，非法用户' }
// 		}

// 		const { collectionName: blockingTagCollectionName, schemaInstance: blockingTagSchemaInstance } = BlockingSchema
// 		type BlockingTag = InferSchemaType<typeof blockingTagSchemaInstance>
// 		const blockingTagWhere: QueryType<BlockingTag> = {
// 			UUID: uuid,
// 		}
// 		const blockingTagSelect: SelectType<BlockingTag> = {
// 			UUID: 1,
// 			tagId: 1
// 		}

// 		const blockingTagResult = await selectDataFromMongoDB<BlockingTag>(blockingTagWhere, blockingTagSelect, blockingTagSchemaInstance, blockingTagCollectionName)
// 		const blockingTagData = blockingTagResult.result?.[0]

// 		if (!blockingTagResult.success) {
// 			console.error('ERROR', '屏蔽标签失败，查询数据库失败')
// 			return { success: false, message: '屏蔽标签失败，查询数据库失败' }
// 		}

// 		if (blockingTagData.tagId.includes(tagId)) {
// 			console.error('ERROR', '屏蔽标签失败，已经屏蔽过了')
// 			return { success: false, message: '屏蔽标签失败，已经屏蔽过了' }
// 		}

// 		const blockTag = [...new Set([...blockingTagData.tagId, tagId])]
// 		const blockingUserUpdateData: UpdateType<BlockingTag> = {
// 			UUID: uuid,
// 			tagId: blockTag,
// 			editDateTime: now,
// 		}

// 		const blockingUserUpdateResult = await findOneAndUpdateData4MongoDB(blockingTagWhere, blockingUserUpdateData, blockingTagSchemaInstance, blockingTagCollectionName)

// 		if (!blockingUserUpdateResult.success) {
// 			console.error('ERROR', '屏蔽标签失败，更新数据库失败')
// 			return { success: false, message: '屏蔽标签失败，更新数据库失败' }
// 		}
// 		return { success: true, message: '屏蔽标签成功', result: { tagId: blockTag ?? [] } }

// 	} catch (error) {
// 		console.error('ERROR', '屏蔽标签错误，未知错误', error)
// 		return { success: false, message: '屏蔽标签失败，未知错误' }
// 	}
// }

// /**
//  * 添加正则表达式
//  * @param addRegexRequest 屏蔽正则表达式的请求载荷
//  * @param uuid 用户的 UUID
//  * @param token 用户的 token
//  * @returns 屏蔽正则表达式的请求响应
//  */
// export const AddRegexService = async (addRegexRequest: AddRegexRequestDto, uuid: string, token: string): Promise<AddRegexResponseDto> => {
// 	try {
// 		if (!checkAddRegexRequest(addRegexRequest)) {
// 			console.error('ERROR', '屏蔽正则表达式请求载荷不合法')
// 			return { success: false, message: '屏蔽正则表达式请求载荷不合法' }
// 		}

// 		const { blockRegex } = addRegexRequest
// 		const now = new Date().getTime()

// 		if (!(await checkUserTokenByUuidService(uuid, token)).success) {
// 			console.error('ERROR', '屏蔽正则表达式失败，非法用户')
// 			return { success: false, message: '屏蔽正则表达式失败，非法用户' }
// 		}

// 		const { collectionName: blockingRegexCollectionName, schemaInstance: blockingRegexSchemaInstance } = BlockingSchema
// 		type BlockingRegex = InferSchemaType<typeof blockingRegexSchemaInstance>
// 		const blockingRegexWhere: QueryType<BlockingRegex> = {
// 			UUID: uuid,
// 		}
// 		const blockingRegexSelect: SelectType<BlockingRegex> = {
// 			UUID: 1,
// 			blockRegex: 1
// 		}

// 		const blockingRegexResult = await selectDataFromMongoDB<BlockingRegex>(blockingRegexWhere, blockingRegexSelect, blockingRegexSchemaInstance, blockingRegexCollectionName)
// 		const blockingRegexData = blockingRegexResult.result?.[0]

// 		if (!blockingRegexResult.success) {
// 			console.error('ERROR', '屏蔽正则表达式失败，查询数据库失败')
// 			return { success: false, message: '屏蔽正则表达式失败，查询数据库失败' }
// 		}

// 		if (blockingRegexData.blockRegex.includes(blockRegex)) {
// 			console.error('ERROR', '屏蔽正则表达式失败，已经屏蔽过了')
// 			return { success: false, message: '屏蔽正则表达式失败，已经屏蔽过了' }
// 		}

// 		const regex = [...new Set([...blockingRegexData.blockRegex, blockRegex])]

// 		const blockingUserUpdateData: UpdateType<BlockingRegex> = {
// 			blockRegex: regex,
// 			editDateTime: now,
// 		}

// 		const blockingUserUpdateResult = await findOneAndUpdateData4MongoDB(blockingRegexWhere, blockingUserUpdateData, blockingRegexSchemaInstance, blockingRegexCollectionName)

// 		if (!blockingUserUpdateResult.success) {
// 			console.error('ERROR', '屏蔽正则表达式失败，更新数据库失败')
// 			return { success: false, message: '屏蔽正则表达式失败，更新数据库失败' }
// 		}
// 		return { success: true, message: '屏蔽正则表达式成功', result: { blockRegex: regex ?? [] } }

// 	} catch (error) {
// 		console.error('ERROR', '屏蔽正则表达式错误，未知错误', error)
// 		return { success: false, message: '屏蔽正则表达式失败，未知错误' }
// 	}
// }

// /**
//  * 解封用户
//  * @param unblockUserByUidRequest 解封用户的请求载荷
//  * @param uuid 用户的 UUID
//  * @param token 用户的 token
//  * @returns 解封用户的请求响应
// */
// export const UnBlockUserByUidService = async (unblockUserByUidRequest: UnblockUserByUidRequestDto, uuid: string, token: string): Promise<UnblockUserByUidResponseDto> => {
// 	try {
// 		if (!checkBlockUserByUidRequest) {
// 			console.error('ERROR', '解封用户请求载荷不合法')
// 			return { success: false, message: '解封用户请求载荷不合法' }
// 		}

// 		const { blockUid } = unblockUserByUidRequest
// 		const unBlockedUuid = await getUserUuid(blockUid) as string

// 		if (unBlockedUuid === uuid) {
// 			console.error('ERROR', '解封用户失败，不能解封自己')
// 			return { success: false, message: '解封用户失败，不能解封自己' }
// 		}

// 		const now = new Date().getTime()
// 		if (!(await checkUserTokenByUuidService(uuid, token)).success) {
// 			console.error('ERROR', '解封用户失败，非法用户')
// 			return { success: false, message: '解封用户失败，非法用户' }
// 		}

// 		const checkUnBlockUuidResult = await checkUserExistsByUuidService({ uuid: unBlockedUuid })
// 		if (!checkUnBlockUuidResult.success || (checkUnBlockUuidResult.success && !checkUnBlockUuidResult.exists)) {
// 			console.error('ERROR', '解封用户失败，被解封用户不存在')
// 			return { success: false, message: '解封用户失败，被解封用户不存在' }
// 		}

// 		const { collectionName: blockingUserCollectionName, schemaInstance: blockingUserSchemaInstance } = BlockingSchema
// 		type BlockingUser = InferSchemaType<typeof blockingUserSchemaInstance>

// 		const blockingUserWhere: QueryType<BlockingUser> = {
// 			UUID: uuid,
// 		}
// 		const blockingUserSelect: SelectType<BlockingUser> = {
// 			UUID: 1,
// 			blockUuid: 1
// 		}

// 		const blockingUserResult = await selectDataFromMongoDB<BlockingUser>(blockingUserWhere, blockingUserSelect, blockingUserSchemaInstance, blockingUserCollectionName)
// 		const blockingUserData = blockingUserResult.result?.[0]

// 		if (!blockingUserResult.success) {
// 			console.error('ERROR', '解封用户失败，查询数据库失败')
// 			return { success: false, message: '解封用户失败，查询数据库失败' }
// 		}
// 		if (!blockingUserData.blockUuid.includes(unBlockedUuid)) {
// 			console.error('ERROR', '解封用户失败，不在黑名单')
// 			return { success: false, message: '解封用户失败，不在黑名单' }
// 		}

// 		const blockUuid = blockingUserData.blockUuid.filter((uuid) => uuid !== unBlockedUuid)
// 		const blockingUserUpdateData: UpdateType<BlockingUser> = {
// 			blockUuid,
// 			editDateTime: now,
// 		}

// 		const blockingUserUpdateResult = await findOneAndUpdateData4MongoDB(blockingUserWhere, blockingUserUpdateData, blockingUserSchemaInstance, blockingUserCollectionName)

// 		if (!blockingUserUpdateResult.success) {
// 			console.error('ERROR', '解封用户失败，更新数据库失败')
// 			return { success: false, message: '解封用户失败，更新数据库失败' }
// 		}
// 		return { success: true, message: '解封用户成功', result: { blockUuid: blockUuid ?? [] } }

// 	} catch (error) {
// 		console.error('ERROR', '解封用户错误，未知错误', error)
// 		return { success: false, message: '解封用户失败，未知错误' }
// 	}
// }

// /**
//  * 解封关键词
//  * @param unblockKeywordRequest 解封关键词的请求载荷
//  * @param uuid 用户的 UUID
//  * @param token 用户的 token
//  * @returns 解封关键词的请求响应
//  */
// export const UnBlockKeywordService = async (UnblockKeywordRequest: UnblockKeywordRequestDto, uuid: string, token: string): Promise<UnblockKeywordResponseDto> => {
// 	try {
// 		if (!UnblockKeywordRequest.blockKeyword) {
// 			console.error('ERROR', '解封关键词请求载荷不合法')
// 			return { success: false, message: '解封关键词请求载荷不合法' }
// 		}

// 		const { blockKeyword } = UnblockKeywordRequest
// 		const now = new Date().getTime()

// 		if (!(await checkUserTokenByUuidService(uuid, token)).success) {
// 			console.error('ERROR', '解封关键词失败，非法用户')
// 			return { success: false, message: '解封关键词失败，非法用户' }
// 		}

// 		const { collectionName: blockingKeywordCollectionName, schemaInstance: blockingKeywordSchemaInstance } = BlockingSchema
// 		type BlockingKeyword = InferSchemaType<typeof blockingKeywordSchemaInstance>
// 		const blockingKeywordWhere: QueryType<BlockingKeyword> = {
// 			UUID: uuid,
// 		}
// 		const blockingKeywordSelect: SelectType<BlockingKeyword> = {
// 			UUID: 1,
// 			blockKeyword: 1
// 		}

// 		const blockingKeywordResult = await selectDataFromMongoDB<BlockingKeyword>(blockingKeywordWhere, blockingKeywordSelect, blockingKeywordSchemaInstance, blockingKeywordCollectionName)
// 		const blockingKeywordData = blockingKeywordResult.result?.[0]

// 		if (!blockingKeywordResult.success) {
// 			console.error('ERROR', '解封关键词失败，查询数据库失败')
// 			return { success: false, message: '解封关键词失败，查询数据库失败' }
// 		}

// 		if (!blockingKeywordData.blockKeyword.includes(blockKeyword)) {
// 			console.error('ERROR', '解封关键词失败，不在黑名单')
// 			return { success: false, message: '解封关键词失败，不在黑名单' }
// 		}

// 		const keyword = blockingKeywordData.blockKeyword.filter((kw) => kw !== blockKeyword)
// 		const blockingUserUpdateData: UpdateType<BlockingKeyword> = {
// 			blockKeyword: keyword,
// 			editDateTime: now,
// 		}
// 		const blockingUserUpdateResult = await updateData4MongoDB(blockingKeywordWhere, blockingUserUpdateData, blockingKeywordSchemaInstance, blockingKeywordCollectionName)

// 		if (!blockingUserUpdateResult.success) {
// 			console.error('ERROR', '解封关键词失败，更新数据库失败')
// 			return { success: false, message: '解封关键词失败，更新数据库失败' }
// 		}
// 		return { success: true, message: '解封关键词成功', result: { blockKeyword: keyword ?? [] } }

// 	} catch (error) {
// 		console.error('ERROR', '解封关键词错误，未知错误', error)
// 		return { success: false, message: '解封关键词失败，未知错误' }
// 	}
// }

// /**
//  * 显示用户
//  * @param showUserByUidRequest 显示用户的请求载荷
//  * @param uuid 用户的 UUID
//  * @param token 用户的 token
//  * @returns 显示用户的请求响应
//  */
// export const ShowUserByUidService = async (showUserByUidRequest: ShowUserByUidRequestDto, uuid: string, token: string): Promise<ShowUserByUidResponseDto> => {
// 	try {
// 		if (!showUserByUidRequest) {
// 			console.error('ERROR', '显示用户请求载荷不合法')
// 			return { success: false, message: '显示用户请求载荷不合法' }
// 		}

// 		const { muteUid } = showUserByUidRequest
// 		const showUuid = await getUserUuid(muteUid) as string

// 		if (showUuid === uuid) {
// 			console.error('ERROR', '显示用户失败，不能显示自己')
// 			return { success: false, message: '显示用户失败，不能显示自己' }
// 		}

// 		const now = new Date().getTime()
// 		if (!(await checkUserTokenByUuidService(uuid, token)).success) {
// 			console.error('ERROR', '显示用户失败，非法用户')
// 			return { success: false, message: '显示用户失败，非法用户' }
// 		}

// 		const checkShowUuidResult = await checkUserExistsByUuidService({ uuid: showUuid })
// 		if (!checkShowUuidResult.success || (checkShowUuidResult.success && !checkShowUuidResult.exists)) {
// 			console.error('ERROR', '显示用户失败，被显示用户不存在')
// 			return { success: false, message: '显示用户失败，被显示用户不存在' }
// 		}

// 		const { collectionName: hidingUserCollectionName, schemaInstance: hidingUserSchemaInstance } = BlockingSchema
// 		type HidingUser = InferSchemaType<typeof hidingUserSchemaInstance>

// 		const blockingUserWhere: QueryType<HidingUser> = {
// 			UUID: uuid,
// 		}
// 		const blockingUserSelect: SelectType<HidingUser> = {
// 			UUID: 1,
// 			muteUuid: 1
// 		}

// 		const blockingUserResult = await selectDataFromMongoDB<HidingUser>(blockingUserWhere, blockingUserSelect, hidingUserSchemaInstance, hidingUserCollectionName)
// 		const blockingUserData = blockingUserResult.result?.[0]

// 		if (!blockingUserResult.success) {
// 			console.error('ERROR', '显示用户失败，查询数据库失败')
// 			return { success: false, message: '显示用户失败，查询数据库失败' }
// 		}
// 		if (!blockingUserData.muteUuid.includes(showUuid)) {
// 			console.error('ERROR', '显示用户失败，已经显示过了')
// 			return { success: false, message: '显示用户失败，已经显示过了' }
// 		}

// 		const muteUuid = blockingUserData.muteUuid.filter((uuid) => uuid !== showUuid)
// 		const blockingUserUpdateData: UpdateType<HidingUser> = {
// 			muteUuid,
// 			editDateTime: now,
// 		}

// 		const blockingUserUpdateResult = await updateData4MongoDB(blockingUserWhere, blockingUserUpdateData, hidingUserSchemaInstance, hidingUserCollectionName)

// 		if (!blockingUserUpdateResult.success) {
// 			console.error('ERROR', '显示用户失败，更新数据库失败')
// 			return { success: false, message: '显示用户失败，更新数据库失败' }
// 		}
// 		return { success: true, message: '显示用户成功', result: { muteUuid: muteUuid ?? [] } }

// 	} catch (error) {
// 		console.error('ERROR', '显示用户错误，未知错误', error)
// 		return { success: false, message: '显示用户失败，未知错误' }
// 	}
// }

// /**
//  * 解封标签
//  * @param unblockTagRequest 解封标签的请求载荷
//  * @param uuid 用户的 UUID
//  * @param token 用户的 token
//  * @returns 解封标签的请求响应
//  */
// export const UnBlockTagService = async (blockTagRequest: UnblockTagRequestDto, uuid: string, token: string): Promise<UnblockTagResponseDto> => {
// 	try {
// 		if (!blockTagRequest.tagId) {
// 			console.error('ERROR', '解封标签请求载荷不合法')
// 			return { success: false, message: '解封标签请求载荷不合法' }
// 		}

// 		const { tagId } = blockTagRequest
// 		const now = new Date().getTime()

// 		if (!(await checkUserTokenByUuidService(uuid, token)).success) {
// 			console.error('ERROR', '解封标签失败，非法用户')
// 			return { success: false, message: '解封标签失败，非法用户' }
// 		}

// 		const { collectionName: blockingTagCollectionName, schemaInstance: blockingTagSchemaInstance } = BlockingSchema
// 		type BlockingTag = InferSchemaType<typeof blockingTagSchemaInstance>
// 		const blockingTagWhere: QueryType<BlockingTag> = {
// 			UUID: uuid,
// 		}
// 		const blockingTagSelect: SelectType<BlockingTag> = {
// 			UUID: 1,
// 			tagId: 1
// 		}

// 		const blockingTagResult = await selectDataFromMongoDB<BlockingTag>(blockingTagWhere, blockingTagSelect, blockingTagSchemaInstance, blockingTagCollectionName)
// 		const blockingTagData = blockingTagResult.result?.[0]

// 		if (!blockingTagResult.success) {
// 			console.error('ERROR', '解封标签失败，查询数据库失败')
// 			return { success: false, message: '解封标签失败，查询数据库失败' }
// 		}

// 		if (!blockingTagData.tagId.includes(tagId)) {
// 			console.error('ERROR', '解封标签失败，不在黑名单')
// 			return { success: false, message: '解封标签失败，不在黑名单' }
// 		}

// 		const blockTag = blockingTagData.tagId.filter((tag) => tag !== tagId)
// 		const blockingUserUpdateData: UpdateType<BlockingTag> = {
// 			tagId: blockTag,
// 			editDateTime: now,
// 		}

// 		const blockingUserUpdateResult = await updateData4MongoDB(blockingTagWhere, blockingUserUpdateData, blockingTagSchemaInstance, blockingTagCollectionName)

// 		if (!blockingUserUpdateResult.success) {
// 			console.error('ERROR', '解封标签失败，更新数据库失败')
// 			return { success: false, message: '解封标签失败，更新数据库失败' }
// 		}

// 		return { success: true, message: '解封标签成功', result: { tagId: blockTag ?? [] } }

// 	} catch (error) {
// 		console.error('ERROR', '解封标签错误，未知错误', error)
// 		return { success: false, message: '解封标签失败，未知错误' }
// 	}
// }

// /**
//  * 删除正则表达式
//  * @param removeRegexRequest 删除正则表达式的请求载荷
//  * @param uuid 用户的 UUID
//  * @param token 用户的 token
//  * @returns 删除正则表达式的请求响应
//  */
// export const RemoveRegexService = async (removeRegexRequest: RemoveRegexRequestDto, uuid: string, token: string): Promise<RemoveRegexResponseDto> => {
// 	try {
// 		if (!removeRegexRequest.blockRegex) {
// 			console.error('ERROR', '删除正则表达式请求载荷不合法')
// 			return { success: false, message: '删除正则表达式请求载荷不合法' }
// 		}

// 		const { blockRegex } = removeRegexRequest
// 		const now = new Date().getTime()

// 		if (!(await checkUserTokenByUuidService(uuid, token)).success) {
// 			console.error('ERROR', '删除正则表达式失败，非法用户')
// 			return { success: false, message: '删除正则表达式失败，非法用户' }
// 		}

// 		const { collectionName: blockingRegexCollectionName, schemaInstance: blockingRegexSchemaInstance } = BlockingSchema
// 		type BlockingRegex = InferSchemaType<typeof blockingRegexSchemaInstance>
// 		const blockingRegexWhere: QueryType<BlockingRegex> = {
// 			UUID: uuid,
// 		}
// 		const blockingRegexSelect: SelectType<BlockingRegex> = {
// 			UUID: 1,
// 			blockRegex: 1
// 		}

// 		const blockingRegexResult = await selectDataFromMongoDB<BlockingRegex>(blockingRegexWhere, blockingRegexSelect, blockingRegexSchemaInstance, blockingRegexCollectionName)
// 		const blockingRegexData = blockingRegexResult.result?.[0]

// 		if (!blockingRegexResult.success) {
// 			console.error('ERROR', '删除正则表达式失败，查询数据库失败')
// 			return { success: false, message: '删除正则表达式失败，查询数据库失败' }
// 		}

// 		if (!blockingRegexData.blockRegex.includes(blockRegex)) {
// 			console.error('ERROR', '删除正则表达式失败，不在黑名单')
// 			return { success: false, message: '删除正则表达式失败，不在黑名单' }
// 		}

// 		const regex = blockingRegexData.blockRegex.filter((reg) => reg !== blockRegex)
// 		const blockingUserUpdateData: UpdateType<BlockingRegex> = {
// 			blockRegex: regex,
// 			editDateTime: now,
// 		}

// 		const blockingUserUpdateResult = await updateData4MongoDB(blockingRegexWhere, blockingUserUpdateData, blockingRegexSchemaInstance, blockingRegexCollectionName)

// 		if (!blockingUserUpdateResult.success) {
// 			console.error('ERROR', '删除正则表达式失败，更新数据库失败')
// 			return { success: false, message: '删除正则表达式失败，更新数据库失败' }
// 		}
// 		return { success: true, message: '删除正则表达式成功', result: { blockRegex: regex ?? [] } }

// 	} catch (error) {
// 		console.error('ERROR', '删除正则表达式错误，未知错误', error)
// 		return { success: false, message: '删除正则表达式失败，未知错误' }
// 	}
// }

// /**
//  * 检查内容是否被屏蔽
//  * @param uuid 用户的 UUID
//  * @param token 用户的 token
//  * @param content 内容
//  * @returns 是否被屏蔽
//  */
// export const checkContentBlockedService = async (CheckIsBlockedRequest: CheckIsBlockedRequestDto, uuid: string, token: string): Promise<CheckIsBlockedResponseDto> => {
// 	try {
// 		if (!CheckIsBlockedRequest) {
// 			console.error('ERROR', '检查内容是否被屏蔽失败，请求载荷不合法')
// 			return { success: false, message: '检查内容是否被屏蔽失败，请求载荷不合法', isBlocked: false }
// 		}

// 		const { collectionName: blockingCollectionName, schemaInstance: blockingSchemaInstance } = BlockingSchema
// 		type Blocking = InferSchemaType<typeof blockingSchemaInstance>
// 		const blockingWhere: QueryType<Blocking> = {
// 			UUID: uuid,
// 		}

// 		if (CheckIsBlockedRequest.type === 'content') {
// 			if (!(await checkUserTokenByUuidService(uuid, token)).success) {
// 				console.error('ERROR', '检查内容是否被屏蔽失败，非法用户')
// 				return { success: false, message: '检查内容是否被屏蔽失败，非法用户', isBlocked: false }
// 			}

// 			const blockingSelect: SelectType<Blocking> = {
// 				blockKeyword: 1,
// 				blockRegex: 1,
// 			}

// 			const blockingResult = await selectDataFromMongoDB<Blocking>(blockingWhere, blockingSelect, blockingSchemaInstance, blockingCollectionName)
// 			const blockingData = blockingResult.result?.[0]
// 			const { blockKeyword, blockRegex } = blockingData

// 			if (!blockingResult.success) {
// 				console.error('ERROR', '检查内容是否被屏蔽失败，查询数据库失败')
// 				return { success: false, message: '检查内容是否被屏蔽失败，查询数据库失败', isBlocked: false }
// 			}
// 			if (!blockKeyword?.length) {
// 				console.error('ERROR', '检查内容是否被屏蔽失败，无屏蔽词')
// 				return { success: false, message: '检查内容是否被屏蔽失败，无屏蔽词', isBlocked: false }
// 			}

// 			const buildKeywordPattern = (keywords: string[]) => {
// 				const escaped = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
// 				return new RegExp(escaped.join('|'), 'i')
// 			}
// 			const hasKeyword = buildKeywordPattern(blockKeyword).test(CheckIsBlockedRequest.content)
// 			let regexCondition = false
// 			if (blockRegex?.length > 0) {
// 				const regexes = blockRegex.map(r => new RegExp(r))
// 				const matchAnyRegex = regexes.some(r => r.test(CheckIsBlockedRequest.content))
// 				regexCondition = !matchAnyRegex // 所有正则都不匹配时触发条件
// 			}
// 			const isBlocked = hasKeyword || regexCondition

// 			if (isBlocked) {
// 				console.error('ERROR', '检查内容是否被屏蔽成功，内容被屏蔽')
// 				return { success: true, message: '检查内容是否被屏蔽成功，内容被屏蔽', isBlocked: true }
// 			}
// 			return { success: true, message: '检查内容是否被屏蔽成功，内容未被屏蔽', isBlocked: false }
// 		}

// 		if (CheckIsBlockedRequest.type === 'block') {
// 			const targetUuid = await getUserUuid(CheckIsBlockedRequest.Uid)
// 			if (targetUuid === uuid) {
// 				console.error('ERROR', '检查内容是否被屏蔽失败，不能屏蔽自己')
// 				return { success: false, message: '检查内容是否被屏蔽失败，不能屏蔽自己', isBlocked: false }
// 			}
// 			if (!(await checkUserTokenByUuidService(uuid, token)).success) {
// 				console.error('ERROR', '检查内容是否被屏蔽失败，非法用户')
// 				return { success: false, message: '检查内容是否被屏蔽失败，非法用户', isBlocked: false }
// 			}

// 			const blockingSelect: SelectType<Blocking> = {
// 				blockUuid: 1,
// 			}

// 			const blockingResult = await selectDataFromMongoDB<Blocking>(blockingWhere, blockingSelect, blockingSchemaInstance, blockingCollectionName)
// 			const blockingData = blockingResult.result?.[0]
// 			const blockUuid = blockingData.blockUuid

// 			if (!blockingResult.success) {
// 				console.error('ERROR', '检查内容是否被屏蔽失败，查询数据库失败')
// 				return { success: false, message: '检查内容是否被屏蔽失败，查询数据库失败', isBlocked: false }
// 			}

// 			if (!blockUuid?.length) {
// 				console.error('ERROR', '检查内容是否被屏蔽失败，无屏蔽用户')
// 				return { success: false, message: '检查内容是否被屏蔽失败，无屏蔽用户', isBlocked: false }
// 			}
// 			const isBlocked = targetUuid && blockUuid.includes(targetUuid)
// 			if (isBlocked) {
// 				console.error('ERROR', '检查内容是否被屏蔽成功，内容被屏蔽')
// 				return { success: true, message: '检查内容是否被屏蔽成功，内容被屏蔽', isBlocked: true }
// 			}
// 			return { success: true, message: '检查内容是否被屏蔽成功，内容未被屏蔽', isBlocked: false }
// 		}

// 		if (CheckIsBlockedRequest.type === 'mute') {
// 			const targetUuid = await getUserUuid(CheckIsBlockedRequest.Uid)
// 			if (targetUuid === uuid) {
// 				console.error('ERROR', '检查内容是否被屏蔽失败，不能屏蔽自己')
// 				return { success: false, message: '检查内容是否被屏蔽失败，不能屏蔽自己', isBlocked: false }
// 			}
// 			if (!(await checkUserTokenByUuidService(uuid, token)).success) {
// 				console.error('ERROR', '检查内容是否被屏蔽失败，非法用户')
// 				return { success: false, message: '检查内容是否被屏蔽失败，非法用户', isBlocked: false }
// 			}

// 			const blockingSelect: SelectType<Blocking> = {
// 				muteUuid: 1,
// 			}

// 			const blockingResult = await selectDataFromMongoDB<Blocking>(blockingWhere, blockingSelect, blockingSchemaInstance, blockingCollectionName)
// 			const blockingData = blockingResult.result?.[0]
// 			const muteUuid = blockingData.muteUuid

// 			if (!blockingResult.success) {
// 				console.error('ERROR', '检查内容是否被屏蔽失败，查询数据库失败')
// 				return { success: false, message: '检查内容是否被屏蔽失败，查询数据库失败', isBlocked: false }
// 			}

// 			if (!muteUuid?.length) {
// 				console.error('ERROR', '检查内容是否被屏蔽失败，无隐藏用户')
// 				return { success: false, message: '检查内容是否被屏蔽失败，无隐藏用户', isBlocked: false }
// 			}
// 			const isBlocked = targetUuid && muteUuid.includes(targetUuid)
// 			if (isBlocked) {
// 				console.error('ERROR', '检查内容是否被屏蔽成功，内容被隐藏')
// 				return { success: true, message: '检查内容是否被屏蔽成功，内容被隐藏', isBlocked: true }
// 			}
// 			return { success: true, message: '检查内容是否被屏蔽成功，内容未被隐藏', isBlocked: false }
// 		}

// 		if (CheckIsBlockedRequest.type === 'tag') {
// 			if (!(await checkUserTokenByUuidService(uuid, token)).success) {
// 				console.error('ERROR', '检查内容是否被屏蔽失败，非法用户')
// 				return { success: false, message: '检查内容是否被屏蔽失败，非法用户', isBlocked: false }
// 			}

// 			const blockingSelect: SelectType<Blocking> = {
// 				tagId: 1,
// 			}
// 			const blockingResult = await selectDataFromMongoDB<Blocking>(blockingWhere, blockingSelect, blockingSchemaInstance, blockingCollectionName)
// 			const blockingData = blockingResult.result?.[0]
// 			const tagId = blockingData.tagId

// 			if (!blockingResult.success) {
// 				console.error('ERROR', '检查内容是否被屏蔽失败，查询数据库失败')
// 				return { success: false, message: '检查内容是否被屏蔽失败，查询数据库失败', isBlocked: false }
// 			}
// 			if (!tagId?.length) {
// 				console.error('ERROR', '检查内容是否被屏蔽失败，无屏蔽标签')
// 				return { success: false, message: '检查内容是否被屏蔽失败，无屏蔽标签', isBlocked: false }
// 			}
// 			const isBlocked = tagId.includes(CheckIsBlockedRequest.tagId)

// 			if (isBlocked) {
// 				console.error('ERROR', '检查内容是否被屏蔽成功，内容被屏蔽')
// 				return { success: true, message: '检查内容是否被屏蔽成功，内容被屏蔽', isBlocked: true }
// 			}
// 		}
// 		console.error('ERROR', '检查内容是否被屏蔽失败，未知类型')
// 		return { success: false, message: '检查内容是否被屏蔽失败，未知类型', isBlocked: false}

// 	} catch (error) {
// 		console.error('ERROR', '查内容是否被屏蔽失败，未知错误', error)
// 		return { success: false, message: '检查内容是否被屏蔽失败，未知错误', isBlocked: false }
// 	}
// }

// /**
//  * 获取用户的分页黑名单
//  * @param params 请求参数 DTO
//  * @returns 用户的分页屏蔽列表
//  */
// export const GetPaginatedBlockListService = async (
//   params: GetPaginatedBlockListRequestDto,
//   // 注入 Mongoose 模型，这是更常见的做法
//   blockingModel: Model<InferSchemaType<typeof BlockingSchema.schemaInstance>> = BlockingModel // 使用模拟的模型或实际注入的模型
// ): Promise<GetPaginatedBlockListResponseDto> => {
//   try {
//     const {
//       uuid,
//       token,
//       blockUuidPagination = {},
//       muteUuidPagination = {},
//       tagIdPagination = {},
//       blockKeywordPagination = {},
//       blockRegexPagination = {},
//     } = params;
//     // 1. 用户认证
//     if (!(await checkUserTokenByUuidService(uuid, token)).success) {
//       console.error('ERROR', '获取分页屏蔽列表失败，非法用户', { uuid });
//       return { success: false, message: '获取分页屏蔽列表失败，非法用户' };
//     }
//     // 2. 处理分页参数，提供默认值
//     const getPaginationDetails = (pagination: PaginationParams | undefined) => {
//       const page = pagination?.page ?? DEFAULT_PAGE;
//       const limit = pagination?.limit ?? DEFAULT_LIMIT;
//       const skip = (page - 1) * limit;
//       return { page, limit, skip };
//     };
//     const blockUuidPaging = getPaginationDetails(blockUuidPagination);
//     const muteUuidPaging = getPaginationDetails(muteUuidPagination);
//     const tagIdPaging = getPaginationDetails(tagIdPagination);
//     const blockKeywordPaging = getPaginationDetails(blockKeywordPagination);
//     const blockRegexPaging = getPaginationDetails(blockRegexPagination);
//     // 3. 构建聚合管道
//     const pipeline: any[] = [
//       // 第一阶段：匹配用户文档
//       {
//         $match: { UUID: uuid },
//       },
//       // 第二阶段：投射并处理数组分页
//       {
//         $project: {
//           _id: 0, // 不返回 _id
//           blockUuid: {
//             // $ifNull 确保即使字段不存在（理论上不应发生，因为有 default），也不会出错
//             items: { $slice: [{ $ifNull: ['$blockUuid', []] }, blockUuidPaging.skip, blockUuidPaging.limit] },
//             total: { $size: { $ifNull: ['$blockUuid', []] } },
//           },
//           muteUuid: {
//             items: { $slice: [{ $ifNull: ['$muteUuid', []] }, muteUuidPaging.skip, muteUuidPaging.limit] },
//             total: { $size: { $ifNull: ['$muteUuid', []] } },
//           },
//           tagId: {
//             items: { $slice: [{ $ifNull: ['$tagId', []] }, tagIdPaging.skip, tagIdPaging.limit] },
//             total: { $size: { $ifNull: ['$tagId', []] } },
//           },
//           blockKeyword: {
//             items: { $slice: [{ $ifNull: ['$blockKeyword', []] }, blockKeywordPaging.skip, blockKeywordPaging.limit] },
//             total: { $size: { $ifNull: ['$blockKeyword', []] } },
//           },
//           blockRegex: {
//             items: { $slice: [{ $ifNull: ['$blockRegex', []] }, blockRegexPaging.skip, blockRegexPaging.limit] },
//             total: { $size: { $ifNull: ['$blockRegex', []] } },
//           },
//         },
//       },
//     ];
//     // 4. 执行聚合查询
//     // 注意：你需要确保 blockingModel 已经被正确初始化并连接到数据库
//     if (!blockingModel) {
//         console.error('ERROR', 'BlockingModel 未初始化');
//         return { success: false, message: '服务器内部错误，模型未初始化' };
//     }
//     const results = await blockingModel.aggregate(pipeline).exec();
//     // 5. 处理查询结果
//     let finalResult: GetBlockListResponseDto['result'];
//     if (results && results.length > 0) {
//       // 找到用户数据，整理格式
//       const data = results[0];
//       finalResult = {
//         blockUuid: { ...data.blockUuid, page: blockUuidPaging.page, limit: blockUuidPaging.limit },
//         muteUuid: { ...data.muteUuid, page: muteUuidPaging.page, limit: muteUuidPaging.limit },
//         tagId: { ...data.tagId, page: tagIdPaging.page, limit: tagIdPaging.limit },
//         blockKeyword: { ...data.blockKeyword, page: blockKeywordPaging.page, limit: blockKeywordPaging.limit },
//         blockRegex: { ...data.blockRegex, page: blockRegexPaging.page, limit: blockRegexPaging.limit },
//       };
//     } else {
//       // 未找到用户数据或用户没有任何屏蔽设置 (聚合管道对于 $match 无结果时返回空数组)
//       // 返回空的、符合分页结构的默认值
//       const createEmptyPaginatedList = <T>(paging: { page: number, limit: number }): PaginatedList<T> => ({
//         items: [],
//         total: 0,
//         page: paging.page,
//         limit: paging.limit,
//       });
//       finalResult = {
//         blockUuid: createEmptyPaginatedList<string>(blockUuidPaging),
//         muteUuid: createEmptyPaginatedList<string>(muteUuidPaging),
//         tagId: createEmptyPaginatedList<number>(tagIdPaging),
//         blockKeyword: createEmptyPaginatedList<string>(blockKeywordPaging),
//         blockRegex: createEmptyPaginatedList<string>(blockRegexPaging),
//       };
//     }
//     return { success: true, message: '获取分页屏蔽列表成功', result: finalResult };
//   } catch (error: any) {
//     console.error('ERROR', '获取分页屏蔽列表错误', error);
//     return { success: false, message: `获取分页屏蔽列表失败: ${error.message || '未知错误'}` };
//   }
// }

/**
 * 检测屏蔽用户的请求载荷
 * @param blockUserByUidRequest 屏蔽用户的请求载荷
 * @returns 合法返回 true, 不合法返回 false
 */
export const checkBlockUserByUidRequest = (blockUserByUidRequest: BlockUserByUidRequestDto): boolean => {
	if (!blockUserByUidRequest.blockUid) {
		console.error('ERROR', '屏蔽用户请求载荷不合法')
		return false
	}
	return true
}

/**
 * 检测隐藏用户的请求载荷
 */
export const checkMuteUserByUidRequest = (muteUserByUidRequest: MuteUserByUidRequestDto): boolean => {
	if (!muteUserByUidRequest.muteUid) {
		console.error('ERROR', '隐藏用户请求载荷不合法')
		return false
	}
	return true
}

/**
 * 检测屏蔽关键词的请求载荷
 */
export const checkBlockKeywordRequest = (blockKeywordRequest: BlockKeywordRequestDto): boolean => {
	if (!blockKeywordRequest?.blockKeyword) {
			console.error('ERROR', '屏蔽关键词请求载荷不合法')
			return false
	}
	const keyword = blockKeywordRequest.blockKeyword
	const validKeywordRegex = /^[a-zA-Z0-9\u4e00-\u9fa5\s.,!?@#$%&*()_+-=[\]{}|;:'"`~<>]+$/
	if (
			keyword.trim().length === 0 || // 空字符串或纯空格
			keyword.length > 100 || // 长度超限
			!validKeywordRegex.test(keyword) // 包含非法字符
	) {
			console.error('ERROR', '屏蔽关键词请求载荷不合法')
			return false
	}

	return true
}


/**
 * 检测屏蔽标签的请求载荷
 */
export const checkBlockTagRequest = (blockTagRequest: BlockTagRequestDto): boolean => {
	if (!blockTagRequest.tagId) {
		console.error('ERROR', '屏蔽标签请求载荷不合法')
		return false
	}
	return true
}

/**
 * 检测添加正则表达式的请求载荷
 */
export const checkAddRegexRequest = (addRegexRequest: AddRegexRequestDto): boolean => {
	if (!addRegexRequest?.blockRegex) {
			console.error('ERROR', '添加正则表达式请求载荷不合法')
			return false
	}
	const regex = addRegexRequest.blockRegex
	if (
			regex.trim().length === 0 || // 空字符串或纯空格
			regex.length > 500 // 长度超限
	) {
			return false
	}
	try {
			new RegExp(regex)
	} catch (e) {
			return false
	}
	return true
}
