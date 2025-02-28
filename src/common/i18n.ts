import English from "../locales/English.js";
import ChineseSimplified from "../locales/ChineseSimplified.js";

/**
 * 判断客户端的语言并返回对应的语言包
 * @param clientLanguage 客户端的语言
 * @returns 对应的语言包
 */
export const geti18nLanguagePack = async (clientLanguage: string): Promise<any> => {
	if (clientLanguage === 'zh-Hans-CN') {
		return ChineseSimplified
	}
	
	if (clientLanguage === 'en-US') {
		return English
	}
	return English
}