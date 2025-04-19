import { addRegexService, blockKeywordService, blockTagService, blockUserByUidService, getBlockListService, muteUserByUidService, removeRegexService, showUserService, unBlockKeywordService, unBlockTagService, unBlockUserService } from '../service/BlockService.js'
import { koaCtx, koaNext } from '../type/koaTypes.js'
import { AddRegexRequestDto, BlockKeywordRequestDto, BlockTagRequestDto, BlockUserByUidRequestDto, MuteUserByUidRequestDto, RemoveRegexRequestDto, ShowUserByUidRequestDto, UnblockTagRequestDto, UnblockUserByUidRequestDto } from './BlockControllerDto.js'

/**
 * 屏蔽用户
 * @param ctx context
 * @param next context
 */
export const blockUserByUidController = async (ctx: koaCtx, next: koaNext) => {
	const data = ctx.request.body as Partial<BlockUserByUidRequestDto>
	const uuid = ctx.cookies.get('uuid')
	const token = ctx.cookies.get('token')
	const BlockUserByUidData = {
		blockUid: data.blockUid ?? -1,
	}

	ctx.body = await blockUserByUidService(BlockUserByUidData, uuid, token)
	await next()
}

/**
 * 隐藏用户
 * @param ctx context
 * @param next context
 */
export const muteUserByUidController = async (ctx: koaCtx, next: koaNext) => {
	const data = ctx.request.body as Partial<MuteUserByUidRequestDto>
	const uuid = ctx.cookies.get('uuid')
	const token = ctx.cookies.get('token')
	const MuteUserByUidData = {
		muteUid: data.muteUid ?? -1,
	}

	ctx.body = await muteUserByUidService(MuteUserByUidData, uuid, token)
	await next()
}

/**
 * 屏蔽关键词
 * @param ctx context
 * @param next context
 */
export const blockKeywordController = async (ctx: koaCtx, next: koaNext) => {
	const data = ctx.request.body as Partial<BlockKeywordRequestDto>
	const uuid = ctx.cookies.get('uuid')
	const token = ctx.cookies.get('token')
	const BlockKeywordData = {
		blockKeyword: data.blockKeyword ?? '',
	}

	ctx.body = await blockKeywordService(BlockKeywordData, uuid, token)
	await next()
}

/**
 * 屏蔽标签
 * @param ctx context
 * @param next context
 */
export const blockTagController = async (ctx: koaCtx, next: koaNext) => {
	const data = ctx.request.body as Partial<BlockTagRequestDto>
	const uuid = ctx.cookies.get('uuid')
	const token = ctx.cookies.get('token')
	const BlockTagData = {
		tagId: data.tagId ?? -1,
	}

	ctx.body = await blockTagService(BlockTagData, uuid, token)
	await next()
}

/**
 * 添加正则表达式
 * @param ctx context
 * @param next context
 */
export const addRegexController = async (ctx: koaCtx, next: koaNext) => {
	const data = ctx.request.body as Partial<AddRegexRequestDto>
	const uuid = ctx.cookies.get('uuid')
	const token = ctx.cookies.get('token')
	const BlockKeywordData = {
		blockRegex: data.blockRegex ?? '',
	}

	ctx.body = await addRegexService(BlockKeywordData, uuid, token)
	await next()
}

/**
 * 解封用户
 * @param ctx context
 * @param next context
 */
export const unblockUserByUidController = async (ctx: koaCtx, next: koaNext) => {
	const data = ctx.request.body as Partial<UnblockUserByUidRequestDto>
	const uuid = ctx.cookies.get('uuid')
	const token = ctx.cookies.get('token')
	const UnblockUserByUidData = {
		blockUid: data.blockUid ?? -1,
	}

	ctx.body = await unBlockUserService(UnblockUserByUidData, uuid, token)
	await next()
}

/**
 * 显示用户
 * @param ctx context
 * @param next context
 */
export const showUserByUidController = async (ctx: koaCtx, next: koaNext) => {
	const data = ctx.request.body as Partial<ShowUserByUidRequestDto>
	const uuid = ctx.cookies.get('uuid')
	const token = ctx.cookies.get('token')
	const ShowUserByUidData = {
		muteUid: data.muteUid ?? -1,
	}

	ctx.body = await showUserService(ShowUserByUidData, uuid, token)
	await next()
}

/**
 * 解封关键词
 * @param ctx context
 * @param next context
 */
export const unblockKeywordController = async (ctx: koaCtx, next: koaNext) => {
	const data = ctx.request.body as Partial<BlockKeywordRequestDto>
	const uuid = ctx.cookies.get('uuid')
	const token = ctx.cookies.get('token')
	const BlockKeywordData = {
		blockKeyword: data.blockKeyword ?? '',
	}

	ctx.body = await 	unBlockKeywordService(BlockKeywordData, uuid, token)
	await next()
}

/**
 * 解封标签
 * @param ctx context
 * @param next context
 */
export const unblockTagController = async (ctx: koaCtx, next: koaNext) => {
	const data = ctx.request.body as Partial<UnblockTagRequestDto>
	const uuid = ctx.cookies.get('uuid')
	const token = ctx.cookies.get('token')
	const BlockTagData = {
		tagId: data.tagId ?? -1,
	}

	ctx.body = await unBlockTagService(BlockTagData, uuid, token)
	await next()
}

/**
 * 删除正则表达式
 * @param ctx context
 * @param next context
 */
export const removeRegexController = async (ctx: koaCtx, next: koaNext) => {
	const data = ctx.request.body as Partial<RemoveRegexRequestDto>
	const uuid = ctx.cookies.get('uuid')
	const token = ctx.cookies.get('token')
	const removeRegexData = {
		blockRegex: data.blockRegex ?? '',
	}
	ctx.body = await removeRegexService(removeRegexData, uuid, token)
	await next()
}

/**
 * 获取屏蔽用户列表
 * @param ctx context
 * @param next context
 */
export const getBlockUserListController = async (ctx: koaCtx, next: koaNext) => {
	const data = ctx.request.query as Partial<{ page: string, pageSize: string, type: string }>
	const { page, pageSize, type } = data
	const uuid = ctx.cookies.get('uuid')
	const token = ctx.cookies.get('token')
	const GetBlockListData = {
		type: type as string ?? '',
		pagination: {
			page: parseInt(page, 10) ?? 0,
			pageSize: parseInt(pageSize, 10) ?? Infinity,
		},
	}
	ctx.body = await getBlockListService(GetBlockListData, uuid, token)
	await next()
}
