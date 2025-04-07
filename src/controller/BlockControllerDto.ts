/**
 * 屏蔽用户的请求载荷
 */
export type BlockUserByUidRequestDto = {
	/** 被屏蔽的用户的 UID - 非空 */
	blockUid: number;
}

/**
 * 隐藏用户的请求载荷
 */
export type MuteUserByUidRequestDto = {
	/** 被隐藏的用户的 UID - 非空 */
	muteUid: number;
}

/**
 * 隐藏用户的请求响应
 */
export type MuteUserByUidResponseDto = {
	/** 是否请求成功 */
	success: boolean;
	/** 附加的文本消息 */
	message?: string;
	/** 隐藏用户列表 */
	result?: {
		/** 被隐藏的用户的 UUID */
		muteUuid?: string[];
	}
}

/**
 * 屏蔽用户的请求响应
 */
export type BlockUserByUidResponseDto = {
	/** 是否请求成功 */
	success: boolean;
	/** 附加的文本消息 */
	message?: string;
	/** 屏蔽用户列表 */
	result?: {
		/** 当前被屏蔽的用户的 UUID */
		blockUuid: string[];
	}
}

/**
 * 屏蔽标签的请求载荷
 */
export type BlockTagRequestDto = {
	/* 屏蔽的标签 ID - 非空 */
	tagId: number;
}

/**
 * 屏蔽标签的请求响应
 */
export type BlockTagResponseDto = {
	/** 是否请求成功 */
	success: boolean;
	/** 附加的文本消息 */
	message?: string;
	/** 屏蔽标签列表 */
	result?: {
		/** 当前被屏蔽的标签的 ID */
		tagId: number[];
	}
}

/**
 * 屏蔽关键词的请求载荷
 */
export type BlockKeywordRequestDto = {
	/* 屏蔽的关键词 - 非空 */
	blockKeyword: string;
}

/**
 * 屏蔽关键词的请求响应
 */
export type BlockKeywordResponseDto = {
	/** 是否请求成功 */
	success: boolean;
	/** 附加的文本消息 */
	message?: string;
	/** 屏蔽关键词列表 */
	result?: {
		/** 被屏蔽的关键词 */
		blockKeyword: string[];
	}
}

/**
 * 添加正则表达式的请求载荷
 */
export type AddRegexRequestDto = {
	/** 正则表达式 - 非空 */
	blockRegex: string;
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
	/** 添加的正则表达式列表 */
	result?: {
		/**  当前的正则表达式 */
		blockRegex: string[];
	}
}

/**
 * 删除正则表达式的请求载荷
 */
export type RemoveRegexRequestDto = {
	/** 正则表达式 - 非空 */
	blockRegex: string;
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
	/** 删除的正则表达式列表 */
	result?: {
		/** 当前的正则表达式 */
		blockRegex: string[];
	}
}

/**
 * 解封用户的请求载荷
 */
export type UnblockUserByUidRequestDto = {
	/** 被屏蔽的用户的 UID - 非空 */
	blockUid: number;
}

/**
 * 显示用户的请求载荷
 */
export type ShowUserByUidRequestDto = {
	/** 被显示的用户的 UID - 非空 */
	muteUid: number;
}

/**
 * 显示用户的请求响应
 */
export type ShowUserByUidResponseDto = {
	/** 是否请求成功 */
	success: boolean;
	/** 附加的文本消息 */
	message?: string;
	/** 显示用户列表 */
	result?: {
		/** 被显示的用户的 UUID */
		muteUuid: string[];
	}
}

/**
 * 解封用户的请求响应
 */
export type UnblockUserByUidResponseDto = {
	/** 是否请求成功 */
	success: boolean;
	/** 附加的文本消息 */
	message?: string;
	/** 解封用户列表 */
	result?: {
		/** 当前被屏蔽的用户列表  */
		blockUuid: string[];
	}
}

/**
 * 解封标签的请求载荷
 */
export type UnblockTagRequestDto = {
	/* 屏蔽的标签 ID - 非空 */
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
	/** 解封标签列表 */
	result?: {
		/** 当前被屏蔽标签的 ID */
		tagId: number[];
	}
}

/**
 * 解封关键词的请求载荷
 */
export type UnblockKeywordRequestDto = {
	/** 屏蔽的关键词 - 非空 */
	blockKeyword: string;
}

/**
 * 解封关键词的请求响应
 */
export type UnblockKeywordResponseDto = {
	/** 是否请求成功 */
	success: boolean;
	/** 附加的文本消息 */
	message?: string;
	/** 解封关键词列表 */
	result?: {
		/** 被解封的关键词 */
		blockKeyword: string[];
	}
}

/**
 * 获取屏蔽用户列表的请求响应
 */
export type GetBlockListResponseDto = {
	/** 是否请求成功 */
	success: boolean;
	/** 附加的文本消息 */
	message?: string;
	/** 屏蔽用户列表 */
	result?: {
		/** 当前被屏蔽的用户的 UUID */
		blockUuid: string[];
		/** 当前被隐藏的用户的 UID */
		muteUuid: string[];
		/** 当前被屏蔽的标签的 ID */
		tagId: number[];
		/** 当前被屏蔽的关键词 */
		blockKeyword: string[];
		/** 当前的正则表达式 */
		blockRegex: string[];
	}
}
