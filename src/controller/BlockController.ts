import { AddRegexService, BlockKeywordService, BlockTagService, BlockUserByUidService, GetBlockListService, HideUserByUidService, RemoveRegexService, ShowUserByUidService, UnBlockKeywordService, UnBlockTagService, UnBlockUserByUidService } from '../service/BlockService.js'
import { koaCtx, koaNext } from '../type/koaTypes.js'
import { AddRegexRequestDto, BlockKeywordRequestDto, BlockTagRequestDto, BlockUserByUidRequestDto, HideUserByUidRequestDto, RemoveRegexRequestDto, ShowUserByUidRequestDto, UnblockTagRequestDto, UnblockUserByUidRequestDto } from './BlockControllerDto.js'

/**
 * 封禁用户
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

	ctx.body = await BlockUserByUidService(BlockUserByUidData, uuid, token)
	await next()
}

/**
 * 隐藏用户
 * @param ctx context
 * @param next context
 */
export const hideUserByUidController = async (ctx: koaCtx, next: koaNext) => {
	const data = ctx.request.body as Partial<HideUserByUidRequestDto>
	const uuid = ctx.cookies.get('uuid')
	const token = ctx.cookies.get('token')
	const HideUserByUidData = {
		hideUid: data.hideUid ?? -1,
	}

	ctx.body = await HideUserByUidService(HideUserByUidData, uuid, token)
	await next()
}

/**
 * 封禁关键词
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

	ctx.body = await BlockKeywordService(BlockKeywordData, uuid, token)
	await next()
}

/**
 * 封禁标签
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

	ctx.body = await BlockTagService(BlockTagData, uuid, token)
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

	ctx.body = await AddRegexService(BlockKeywordData, uuid, token)
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

	ctx.body = await UnBlockUserByUidService(UnblockUserByUidData, uuid, token)
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
		hideUid: data.hideUid ?? -1,
	}

	ctx.body = await ShowUserByUidService(ShowUserByUidData, uuid, token)
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

	ctx.body = await 	UnBlockKeywordService(BlockKeywordData, uuid, token)
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

	ctx.body = await UnBlockTagService(BlockTagData, uuid, token)
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
	const BlockKeywordData = {
		blockRegex: data.blockRegex ?? '',
	}
	ctx.body = await RemoveRegexService(BlockKeywordData, uuid, token)
	await next()
}

/**
 * 获取封禁用户列表
 * @param ctx context
 * @param next context
 */
export const getBlockUserListController = async (ctx: koaCtx, next: koaNext) => {
	const uuid = ctx.cookies.get('uuid')
	const token = ctx.cookies.get('token')
	ctx.body = await GetBlockListService(uuid, token)
	await next()
}
