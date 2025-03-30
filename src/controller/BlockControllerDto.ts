/**
 * 封禁用户的请求载荷
 */
export type BlockUserByUidRequestDto = {
	/** 被封禁的用户的 UID - 非空 */
	blockUid: number;
}

/**
 * 隐藏用户的请求载荷
 */
export type HideUserByUidRequestDto = {
	/** 被隐藏的用户的 UID - 非空 */
	hideUid: number;
}

/**
 * 隐藏用户的请求响应
 */
export type HideUserByUidResponseDto = {
	/** 是否请求成功 */
	success: boolean;
	/** 附加的文本消息 */
	message?: string;
	/** 隐藏用户列表 */
	result?: {
		/** 被隐藏的用户的 UUID */
		hideUuid?: string;
	}
}

/**
 * 封禁用户的请求响应
 */
export type BlockUserByUidResponseDto = {
	/** 是否请求成功 */
	success: boolean;
	/** 附加的文本消息 */
	message?: string;
	/** 封禁用户列表 */
	result?: {
		/** 被封禁的用户的 UUID */
		blockUuid?: string;
	}
}

/**
 * 封禁标签的请求载荷
 */
export type BlockTagRequestDto = {
	/* 封禁的标签 ID - 非空 */
	tagId: number;
}

/**
 * 封禁标签的请求响应
 */
export type BlockTagResponseDto = {
	/** 是否请求成功 */
	success: boolean;
	/** 附加的文本消息 */
	message?: string;
}

/**
 * 封禁关键词的请求载荷
 */
export type BlockKeywordRequestDto = {
	/* 封禁的关键词 - 非空 */
	keyword: string;
}

/**
 * 封禁关键词的请求响应
 */
export type BlockKeywordResponseDto = {
	/** 是否请求成功 */
	success: boolean;
	/** 附加的文本消息 */
	message?: string;
}

/**
 * 添加正则表达式的请求载荷
 */
export type AddRegexRequestDto = {
	/** 正则表达式 - 非空 */
	regex: string;
	/** 正则表达式的标志 - 非空 */
	// flag: string;
}

/**
 * 添加正则表达式的请求响应
 */
export type AddRegexResponseDto = {
	/** 是否请求成功 */
	success: boolean;
	/** 附加的文本消息 */
	message?: string;
}

/**
 * 删除正则表达式的请求载荷
 */
export type RemoveRegexRequestDto = {
	/** 正则表达式 - 非空 */
	regex: string;
	/** 正则表达式的标志 - 非空 */
	// flag: string;
}
/**
 * 删除正则表达式的请求响应
 */
export type RemoveRegexResponseDto = {
	/** 是否请求成功 */
	success: boolean;
	/** 附加的文本消息 */
	message?: string;
}

/**
 * 解封用户的请求载荷
 */
export type UnblockUserByUidRequestDto = {
	/** 被封禁的用户的 UID - 非空 */
	blockUid: number;
}

/**
 * 显示用户的请求响应
 */
export type ShowUserByUidResponseDto = {
	/** 是否请求成功 */
	success: boolean;
	/** 附加的文本消息 */
	message?: string;
}

/**
 * 解封用户的请求响应
 */
export type UnblockUserByUidResponseDto = {
	/** 是否请求成功 */
	success: boolean;
	/** 附加的文本消息 */
	message?: string;
}

/**
 * 解封标签的请求载荷
 */
export type UnblockTagRequestDto = {
	/* 封禁的标签 ID - 非空 */
	tagId: number;
}

/**
 * 解封标签的请求响应
 */
export type UnblockTagResponseDto = {
	/** 是否请求成功 */
	success: boolean;
	/** 附加的文本消息 */
	message?: string;
}

/**
 * 解封关键词的请求载荷
 */
export type UnblockKeywordRequestDto = {
	/** 封禁的关键词 - 非空 */
	keyword: string;
}

/**
 * 解封关键词的请求响应
 */
export type UnblockKeywordResponseDto = {
	/** 是否请求成功 */
	success: boolean;
	/** 附加的文本消息 */
	message?: string;
}
