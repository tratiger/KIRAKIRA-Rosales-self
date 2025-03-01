import English from "../locales/English.js";
import ChineseSimplified from "../locales/ChineseSimplified.js";

const languagePacks: Record<string, any> = {
	"zh-Hans-CN": ChineseSimplified,
	"en-US": English,
	// "fr-FR": French,
	// "ja-JP": Japanese
};

/**
 * 判断客户端的语言并返回对应的语言包
 * @param clientLanguage 客户端的语言
 * @param targetMail 目标邮件
 * @returns 对应的语言包内容或 null
 */
export const geti18nLanguagePack = async (clientLanguage: string, targetMail: string): Promise<any> => {
	const languagePack = languagePacks[clientLanguage] ?? English;
	return targetMail in languagePack ? languagePack[targetMail] : null;
};
