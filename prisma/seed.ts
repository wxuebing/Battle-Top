import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const defaultCategories = [
  {
    name: "AI大模型",
    type: "AI_MODEL",
    description: "人工智能大语言模型排名",
    icon: "sparkles",
    color: "purple",
  },
  {
    name: "动漫角色",
    type: "ANIME_CHARACTER",
    description: "动漫角色人气排名",
    icon: "star",
    color: "pink",
  },
  {
    name: "教育机构",
    type: "EDUCATIONAL_INSTITUTION",
    description: "大学、学院等教育机构排名",
    icon: "graduation-cap",
    color: "blue",
  },
]

const sampleRankings = {
  AI_MODEL: [
    {
      title: "2024年最强AI大模型综合能力排行榜",
      description: "基于推理能力、代码生成、创意写作、知识问答等多个维度对主流AI大模型进行综合评估排名",
      tags: ["AI", "大模型", "2024", "综合评估"],
      items: [
        { name: "GPT-4o", description: "OpenAI最新旗舰模型，多模态能力突出，推理能力顶尖" },
        { name: "Claude 3.5 Sonnet", description: "Anthropic最新模型，代码能力和推理能力极强" },
        { name: "Gemini 1.5 Pro", description: "Google多模态模型，长上下文处理能力领先" },
        { name: "GPT-4 Turbo", description: "OpenAI高性能版本，速度与质量平衡" },
        { name: "Claude 3 Opus", description: "Anthropic最强模型，复杂推理能力出色" },
        { name: "Llama 3.1 405B", description: "Meta开源最强模型，开源界标杆" },
        { name: "Qwen2.5-Max", description: "阿里通义千问最新版，中文能力顶尖" },
        { name: "DeepSeek V3", description: "深度求索最新模型，性价比极高" },
        { name: "Mistral Large 2", description: "Mistral旗舰模型，欧洲AI代表" },
        { name: "文心一言 4.0", description: "百度文心旗舰，中文理解能力强" },
      ],
    },
    {
      title: "AI大模型代码编程能力排行榜",
      description: "专门评估各大AI模型的代码生成、调试和编程辅助能力",
      tags: ["编程", "代码生成", "开发者"],
      items: [
        { name: "Claude 3.5 Sonnet", description: "代码生成质量最高，理解复杂代码能力强" },
        { name: "GPT-4o", description: "代码能力全面，支持多种编程语言" },
        { name: "DeepSeek Coder V2", description: "专为代码优化，开源代码模型之王" },
        { name: "GPT-4 Turbo", description: "代码生成速度快，质量稳定" },
        { name: "Qwen2.5-Coder", description: "中文代码注释理解好，支持主流语言" },
        { name: "CodeLlama 70B", description: "Meta代码专用模型，开源首选" },
        { name: "Gemini 1.5 Pro", description: "代码解释能力强，适合学习" },
        { name: "StarCoder 2", description: "开源代码模型，多语言支持" },
      ],
    },
    {
      title: "AI大模型中文理解能力排行榜",
      description: "评估各大模型对中文语言、文化、语境的理解和生成能力",
      tags: ["中文", "语言理解", "本土化"],
      items: [
        { name: "Qwen2.5-Max", description: "中文理解最强，文化背景知识丰富" },
        { name: "文心一言 4.0", description: "百度出品，中文语境理解深入" },
        { name: "DeepSeek V3", description: "中文表达自然，本土化程度高" },
        { name: "GPT-4o", description: "中文能力优秀，翻译质量高" },
        { name: "Claude 3.5 Sonnet", description: "中文写作流畅，逻辑清晰" },
        { name: "智谱GLM-4", description: "清华技术背景，中文能力强" },
        { name: "讯飞星火 4.0", description: "语音交互中文体验好" },
        { name: "Kimi", description: "长文本中文处理能力突出" },
      ],
    },
    {
      title: "AI大模型性价比排行榜",
      description: "综合考虑性能与价格，为预算有限的用户推荐最具性价比的AI模型",
      tags: ["性价比", "成本", "预算"],
      items: [
        { name: "DeepSeek V3", description: "性能接近GPT-4，价格仅为其1/10" },
        { name: "Qwen2.5-Turbo", description: "阿里高性价比版本，免费额度充足" },
        { name: "Llama 3.1 70B", description: "开源免费，性能优秀" },
        { name: "GPT-3.5 Turbo", description: "经典性价比之选，速度极快" },
        { name: "Claude 3 Haiku", description: "Anthropic入门款，速度快价格低" },
        { name: "Gemini 1.5 Flash", description: "Google轻量版，免费额度大" },
        { name: "Mistral 7B", description: "开源小模型，本地部署首选" },
        { name: "Kimi", description: "国内免费使用，长文本能力强" },
      ],
    },
    {
      title: "AI大模型创意写作能力排行榜",
      description: "评估各模型在小说创作、文案撰写、创意策划等方面的表现",
      tags: ["创意写作", "内容创作", "文案"],
      items: [
        { name: "Claude 3.5 Sonnet", description: "创意丰富，文笔优美，风格多变" },
        { name: "GPT-4o", description: "创意能力强，适合各类文体" },
        { name: "Claude 3 Opus", description: "长篇创作能力强，情节设计合理" },
        { name: "Gemini 1.5 Pro", description: "创意独特，适合头脑风暴" },
        { name: "Qwen2.5-Max", description: "中文创意写作出色，本土化风格" },
        { name: "文心一言 4.0", description: "中文文学创作能力强" },
        { name: "DeepSeek V3", description: "创意写作性价比高" },
        { name: "Llama 3.1 405B", description: "开源创意写作最佳选择" },
      ],
    },
    {
      title: "AI大模型数学推理能力排行榜",
      description: "评估各模型在数学问题求解、逻辑推理、数学竞赛等方面的表现",
      tags: ["数学", "推理", "逻辑"],
      items: [
        { name: "GPT-4o", description: "数学推理能力顶尖，竞赛级别问题表现出色" },
        { name: "Claude 3.5 Sonnet", description: "逻辑推理强，步骤清晰" },
        { name: "Gemini 1.5 Pro", description: "数学计算准确，解释详细" },
        { name: "Claude 3 Opus", description: "复杂数学问题处理能力强" },
        { name: "GPT-4 Turbo", description: "数学能力稳定，速度快" },
        { name: "Qwen2.5-Max", description: "中文数学题目理解好" },
        { name: "DeepSeek V3", description: "数学推理性价比高" },
        { name: "Llama 3.1 405B", description: "开源数学推理最佳" },
      ],
    },
  ],
  ANIME_CHARACTER: [
    {
      title: "2024年最受欢迎动漫角色排行榜",
      description: "基于全球粉丝投票、社交媒体讨论度、周边销量等综合数据评选",
      tags: ["人气", "2024", "全球"],
      items: [
        { name: "五条悟", description: "咒术回战最强咒术师，人气断层第一" },
        { name: "芙莉莲", description: "葬送的芙莉莲主角，治愈系魔法使" },
        { name: "虎杖悠仁", description: "咒术回战主角，成长型角色代表" },
        { name: "阿尼亚", description: "间谍过家家主角，可爱与实力并存" },
        { name: "�的�的�的郎", description: "鬼灭之刃主角，坚韧不拔的代表" },
        { name: "艾伦", description: "进击的巨人主角，复杂角色塑造典范" },
        { name: "路飞", description: "海贼王主角，热血漫永恒经典" },
        { name: "�的�的�的", description: "咒术回战角色，反差萌代表" },
        { name: "�的�的�的士", description: "蓝色监狱主角，足球动漫新标杆" },
        { name: "�的�的", description: "我推的孩子主角，偶像动漫现象级" },
      ],
    },
    {
      title: "动漫最强战斗力角色排行榜",
      description: "综合评估动漫角色的战斗力、特殊能力、成长潜力等因素",
      tags: ["战斗力", "实力", "能力"],
      items: [
        { name: "埼玉", description: "一拳超人主角，一拳无敌的设定" },
        { name: "五条悟", description: "咒术回战最强咒术师，六眼无下限" },
        { name: "�的�的", description: "龙珠主角，超级赛亚人之神" },
        { name: "黑崎一护", description: "死神主角，双刀始解" },
        { name: "小杰", description: "全职猎人主角，变化系能力者" },
        { name: "两面宿傩", description: "咒术回战反派，诅咒之王" },
        { name: "白胡子", description: "海贼王四皇之一，世界最强男人" },
        { name: "爆破", description: "一拳超人S级英雄第一位" },
      ],
    },
    {
      title: "动漫最美女性角色排行榜",
      description: "基于角色设计、性格魅力、人气投票等因素评选最美动漫女性角色",
      tags: ["美少女", "颜值", "女神"],
      items: [
        { name: "阿尼亚", description: "间谍过家家主角，可爱与优雅并存" },
        { name: "芙莉莲", description: "葬送的芙莉莲主角，千年精灵魔法使" },
        { name: "�的�的", description: "鬼灭之刃角色，蝴蝶屋主人" },
        { name: "�的�的", description: "咒术回战角色，京都校学生" },
        { name: "四宫辉夜", description: "辉夜大小姐主角，学生会副会长" },
        { name: "�的�的", description: "我推的孩子主角，偶像天才" },
        { name: "�的�的", description: "海贼王角色，历史正文解读能力" },
        { name: "�的�的�的", description: "咒术回战角色，东京校学生" },
      ],
    },
    {
      title: "动漫最帅男性角色排行榜",
      description: "基于角色设计、性格魅力、人气投票等因素评选最帅动漫男性角色",
      tags: ["帅哥", "男神", "颜值"],
      items: [
        { name: "五条悟", description: "咒术回战最强咒术师，白发蓝眼" },
        { name: "夏油杰", description: "咒术回战角色，特级咒术师" },
        { name: "�的�的", description: "咒术回战角色，东京校学生" },
        { name: "�的�的�的士", description: "蓝色监狱主角，足球天才" },
        { name: "�的�的�的", description: "海贼王角色，海贼猎人" },
        { name: "�的�的杏寿郎", description: "鬼灭之刃角色，炎柱" },
        { name: "�的�的", description: "咒术回战角色，京都校学生" },
        { name: "�的�的", description: "排球少年主角，排球天才" },
      ],
    },
    {
      title: "经典动漫角色影响力排行榜",
      description: "评选对动漫产业发展产生深远影响的经典角色",
      tags: ["经典", "影响力", "历史"],
      items: [
        { name: "�的�的", description: "龙珠主角，热血漫开山鼻祖" },
        { name: "路飞", description: "海贼王主角，全球影响力最大" },
        { name: "柯南", description: "名侦探柯南主角，推理漫代表" },
        { name: "�的�的", description: "火影忍者主角，忍者文化推广者" },
        { name: "黑崎一护", description: "死神主角，死神文化代表" },
        { name: "艾伦", description: "进击的巨人主角，新时代反英雄" },
        { name: "樱木花道", description: "灌篮高手主角，运动漫经典" },
        { name: "�的�的", description: "新世纪福音战士主角，机甲动漫代表" },
      ],
    },
    {
      title: "动漫最佳反派角色排行榜",
      description: "评选塑造最成功、最具魅力的动漫反派角色",
      tags: ["反派", "反派魅力", "反派角色"],
      items: [
        { name: "两面宿傩", description: "咒术回战反派，诅咒之王" },
        { name: "夜神月", description: "死亡笔记主角，反英雄代表" },
        { name: "库洛洛", description: "全职猎人反派，幻影旅团团长" },
        { name: "赤犬", description: "海贼王反派，海军大将" },
        { name: "鬼舞辻无惨", description: "鬼灭之刃反派，鬼王" },
        { name: "艾伦", description: "进击的巨人反派，复杂反派" },
        { name: "宇智波斑", description: "火影忍者反派，宇智波一族" },
        { name: "蓝染", description: "死神反派，护廷十三队叛徒" },
      ],
    },
  ],
  EDUCATIONAL_INSTITUTION: [
    {
      title: "2024年世界大学综合排名",
      description: "基于学术声誉、雇主声誉、师生比、国际师生比例等指标综合评估",
      tags: ["世界排名", "综合实力", "QS"],
      items: [
        { name: "麻省理工学院 (MIT)", description: "美国，理工科世界第一" },
        { name: "剑桥大学", description: "英国，历史悠久的顶尖学府" },
        { name: "牛津大学", description: "英国，世界最古老大学之一" },
        { name: "哈佛大学", description: "美国，常春藤盟校之首" },
        { name: "斯坦福大学", description: "美国，硅谷创新引擎" },
        { name: "帝国理工学院", description: "英国，理工科顶尖名校" },
        { name: "苏黎世联邦理工学院", description: "瑞士，欧洲理工科巅峰" },
        { name: "新加坡国立大学", description: "新加坡，亚洲第一学府" },
        { name: "伦敦大学学院 (UCL)", description: "英国，综合性研究型大学" },
        { name: "加州理工学院", description: "美国，科学研究圣地" },
      ],
    },
    {
      title: "中国大学综合实力排行榜",
      description: "基于教学质量、科研水平、社会声誉等综合评估中国高校实力",
      tags: ["中国", "综合实力", "985"],
      items: [
        { name: "清华大学", description: "北京，理工科国内第一" },
        { name: "北京大学", description: "北京，文理综合国内顶尖" },
        { name: "浙江大学", description: "杭州，综合实力强劲" },
        { name: "上海交通大学", description: "上海，工科实力雄厚" },
        { name: "复旦大学", description: "上海，文理医工综合发展" },
        { name: "南京大学", description: "南京，基础学科实力强" },
        { name: "中国科学技术大学", description: "合肥，理科研究顶尖" },
        { name: "华中科技大学", description: "武汉，工科医学并重" },
        { name: "武汉大学", description: "武汉，综合性研究型大学" },
        { name: "西安交通大学", description: "西安，西部工科龙头" },
      ],
    },
    {
      title: "世界计算机科学专业大学排名",
      description: "专门评估各大学计算机科学专业的教学和研究水平",
      tags: ["计算机", "CS", "专业排名"],
      items: [
        { name: "麻省理工学院 (MIT)", description: "计算机科学领域绝对王者" },
        { name: "斯坦福大学", description: "硅谷核心，创业氛围浓厚" },
        { name: "卡内基梅隆大学", description: "CS专业排名常年前三" },
        { name: "加州大学伯克利分校", description: "计算机理论研究的圣地" },
        { name: "清华大学", description: "亚洲计算机科学最强" },
        { name: "牛津大学", description: "计算机科学研究历史悠久" },
        { name: "剑桥大学", description: "计算机理论研究顶尖" },
        { name: "新加坡国立大学", description: "亚洲计算机科学第二" },
      ],
    },
    {
      title: "世界商学院MBA项目排名",
      description: "评估全球顶尖商学院MBA项目的教学质量、就业前景、薪资水平",
      tags: ["商学院", "MBA", "商业"],
      items: [
        { name: "哈佛商学院", description: "美国，全球商学教育标杆" },
        { name: "斯坦福商学院", description: "美国，创业与创新领导者" },
        { name: "沃顿商学院", description: "美国，金融方向最强" },
        { name: "伦敦商学院", description: "英国，欧洲第一商学院" },
        { name: "INSEAD", description: "法国/新加坡，全球化视野" },
        { name: "MIT斯隆商学院", description: "美国，技术与商业结合" },
        { name: "哥伦比亚商学院", description: "美国，华尔街人才摇篮" },
        { name: "芝加哥大学布斯商学院", description: "美国，金融研究顶尖" },
      ],
    },
    {
      title: "世界艺术与设计学院排名",
      description: "评估全球顶尖艺术与设计学院的教学质量和行业影响力",
      tags: ["艺术", "设计", "创意"],
      items: [
        { name: "皇家艺术学院", description: "英国，全球艺术设计第一" },
        { name: "帕森斯设计学院", description: "美国，时尚设计顶尖" },
        { name: "罗德岛设计学院", description: "美国，艺术设计综合强" },
        { name: "麻省理工学院媒体实验室", description: "美国，科技与艺术融合" },
        { name: "普瑞特艺术学院", description: "美国，工业设计著名" },
        { name: "伦敦艺术大学", description: "英国，艺术设计综合院校" },
        { name: "芝加哥艺术学院", description: "美国，当代艺术重镇" },
        { name: "中央圣马丁", description: "英国，时尚设计殿堂" },
      ],
    },
    {
      title: "亚洲大学综合实力排行榜",
      description: "评估亚洲地区大学的综合实力和国际影响力",
      tags: ["亚洲", "综合实力", "国际排名"],
      items: [
        { name: "新加坡国立大学", description: "新加坡，亚洲第一学府" },
        { name: "清华大学", description: "中国，理工科亚洲顶尖" },
        { name: "北京大学", description: "中国，文理综合亚洲顶尖" },
        { name: "南洋理工大学", description: "新加坡，工程技术强" },
        { name: "香港大学", description: "中国香港，国际化程度高" },
        { name: "东京大学", description: "日本，亚洲老牌名校" },
        { name: "首尔国立大学", description: "韩国，韩国最高学府" },
        { name: "香港科技大学", description: "中国香港，理工科顶尖" },
        { name: "京都大学", description: "日本，研究型大学典范" },
        { name: "复旦大学", description: "中国，综合性研究型大学" },
      ],
    },
  ],
}

async function main() {
  console.log("开始初始化数据库...")

  for (const category of defaultCategories) {
    const existing = await prisma.category.findFirst({
      where: { name: category.name },
    })

    if (!existing) {
      await prisma.category.create({
        data: category,
      })
      console.log(`创建分类: ${category.name}`)
    } else {
      console.log(`分类已存在: ${category.name}`)
    }
  }

  const hashedPassword = await bcrypt.hash("admin123", 10)
  let adminUser = await prisma.user.findFirst({
    where: { email: "admin@battletop.com" },
  })

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: "admin@battletop.com",
        name: "Battle Top 官方",
        password: hashedPassword,
        isAuthoritative: true,
        credibilityScore: 100,
      },
    })
    console.log("创建管理员用户: admin@battletop.com")
  } else {
    console.log("管理员用户已存在")
  }

  const categories = await prisma.category.findMany()

  for (const [categoryType, rankings] of Object.entries(sampleRankings)) {
    const category = categories.find((c) => c.type === categoryType)
    if (!category) continue

    for (const rankingData of rankings) {
      const existingRanking = await prisma.ranking.findFirst({
        where: { title: rankingData.title },
      })

      if (existingRanking) {
        console.log(`榜单已存在: ${rankingData.title}`)
        continue
      }

      const tagConnections = []
      for (const tagName of rankingData.tags) {
        let tag = await prisma.tag.findFirst({
          where: { name: tagName },
        })
        if (!tag) {
          tag = await prisma.tag.create({
            data: { name: tagName },
          })
        }
        tagConnections.push({ tagId: tag.id })
      }

      const ranking = await prisma.ranking.create({
        data: {
          title: rankingData.title,
          description: rankingData.description,
          authorId: adminUser.id,
          categoryId: category.id,
          status: "PUBLISHED",
          publishedAt: new Date(),
          viewCount: Math.floor(Math.random() * 500) + 100,
          likeCount: Math.floor(Math.random() * 50) + 10,
          items: {
            create: rankingData.items.map((item, index) => ({
              name: item.name,
              description: item.description,
              position: index + 1,
            })),
          },
          rankingTags: {
            create: tagConnections,
          },
        },
      })

      console.log(`创建榜单: ${rankingData.title}`)
    }
  }

  console.log("数据库初始化完成！")
}

main()
  .catch((e) => {
    console.error("初始化失败:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
