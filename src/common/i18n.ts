import English from "../locales/English.js";
import ChineseSimplified from "../locales/Chinese Simplified.js";
import EmailTemplate from "./EmailTemplate.js";

const languagePacks: Record<string, any> = {
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
export const geti18nLanguagePack = async (clientLanguage: string, targetMail: string): Promise<any> => {
	const languagePack = languagePacks[clientLanguage] ?? English;
	if (languagePack[targetMail]) {
		const replacements: Record<string, string> = {
			"{{mailLine0}}": languagePack[targetMail].mailLine0,
			"{{mailLine1}}": languagePack[targetMail].mailLine1,
			"{{mailLine2}}": languagePack[targetMail].mailLine2,
		};

		const mailHtml = Object.entries(replacements).reduce((html, [key, value]) => html.replace(new RegExp(key, "g"), value),EmailTemplate.mailHtml)
		const mailTitle = languagePack[targetMail].mailTitle;
		
		return { mailTitle: mailTitle, mailHtml: mailHtml };
	}
	return null;
};
