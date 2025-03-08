import English from "../locales/English.js";
import ChineseSimplified from "../locales/Chinese Simplified.js";
import EmailTemplate from "./EmailTemplate.js";

const languagePacks = {
	"zh-Hans-CN": ChineseSimplified,
	"en-US": English,
	// "fr-FR": French,
	// "ja-JP": Japanese
}

/**
 * 判断客户端的语言并返回对应的语言包
 * @param clientLanguage 客户端的语言
 * @param targetMail 目标邮件
 * @returns 对应的语言包内容或 null
 */
export const getI18nLanguagePack = (clientLanguage: string, targetMail: string) => {
	const languagePack = languagePacks[clientLanguage as keyof typeof languagePacks] ?? English;
	const messages = languagePack[targetMail as keyof typeof languagePack];
	if (!messages) return null;

	let { mailTitle, mailHtml } = EmailTemplate;
	Object.entries(replacements).forEach(([key, value]) => mailHtml = mailHtml.replaceAll(`{{${key}}}`, value.replaceAll("\n", "<br>")));
	return { mailTitle, mailHtml };
};
