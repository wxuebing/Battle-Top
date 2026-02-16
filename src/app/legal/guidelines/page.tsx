"use client"

import Link from "next/link"
import { ArrowLeft, AlertTriangle, Ban, FileText, Scale, Shield, Users } from "lucide-react"

export default function ContentGuidelinesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回首页
          </Link>

          <div className="bg-white rounded-xl shadow-sm p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">内容规范</h1>
            <p className="text-sm text-gray-500 mb-8">更新日期：2024年1月1日 | 生效日期：2024年1月1日</p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-800 mb-1">重要提示</h3>
                  <p className="text-sm text-red-700">
                    违反以下内容规范可能导致内容被删除、账户被限制或封禁。严重违规行为将移交相关部门处理。
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Ban className="h-5 w-5 text-red-500" />
                  <h2 className="text-lg font-semibold text-gray-900">一、禁止内容</h2>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">1.1 违法违规内容</h3>
                    <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                      <li>危害国家安全、泄露国家秘密的内容</li>
                      <li>煽动民族仇恨、民族歧视的内容</li>
                      <li>破坏国家宗教政策、宣扬邪教的内容</li>
                      <li>散布谣言、扰乱社会秩序的内容</li>
                      <li>涉及赌博、毒品、诈骗等违法犯罪的内容</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">1.2 低俗色情内容</h3>
                    <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                      <li>淫秽、色情、低俗的内容</li>
                      <li>性暗示、性挑逗的内容</li>
                      <li>展示或暗示性行为的内容</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">1.3 暴力恐怖内容</h3>
                    <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                      <li>展示暴力、血腥、恐怖的内容</li>
                      <li>宣扬暴力、教唆犯罪的内容</li>
                      <li>虐待动物或展示残害行为的内容</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-orange-500" />
                  <h2 className="text-lg font-semibold text-gray-900">二、侵权内容</h2>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <ul className="list-disc pl-5 text-gray-600 text-sm space-y-2">
                    <li>未经授权使用他人拥有著作权的作品（文章、图片、视频等）</li>
                    <li>侵犯他人商标权、专利权的内容</li>
                    <li>未经授权使用他人肖像、隐私信息</li>
                    <li>盗用他人身份信息、冒充他人</li>
                    <li>泄露他人隐私、个人信息</li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-yellow-500" />
                  <h2 className="text-lg font-semibold text-gray-900">三、不良行为</h2>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <ul className="list-disc pl-5 text-gray-600 text-sm space-y-2">
                    <li>发布虚假信息、谣言</li>
                    <li>恶意诽谤、侮辱、攻击他人</li>
                    <li>发布歧视性内容（种族、性别、地域等）</li>
                    <li>骚扰、恐吓其他用户</li>
                    <li>刷量、刷赞、刷评论等作弊行为</li>
                    <li>恶意举报、滥用举报功能</li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <h2 className="text-lg font-semibold text-gray-900">四、榜单内容规范</h2>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <ul className="list-disc pl-5 text-gray-600 text-sm space-y-2">
                    <li>榜单标题应清晰、准确，不得使用误导性标题</li>
                    <li>榜单内容应客观公正，不得恶意贬低或虚假宣传</li>
                    <li>排名项目应有事实依据或明确标注为主观评价</li>
                    <li>不得利用榜单进行商业推广（未经授权）</li>
                    <li>不得创建涉及敏感人物、事件的榜单</li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Scale className="h-5 w-5 text-green-500" />
                  <h2 className="text-lg font-semibold text-gray-900">五、违规处理</h2>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 text-gray-800">违规程度</th>
                        <th className="text-left py-2 text-gray-800">处理措施</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600">
                      <tr className="border-b">
                        <td className="py-2">轻微违规</td>
                        <td className="py-2">警告、删除内容</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">一般违规</td>
                        <td className="py-2">限制功能、短期封禁（1-7天）</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">严重违规</td>
                        <td className="py-2">长期封禁（30天以上）</td>
                      </tr>
                      <tr>
                        <td className="py-2">特别严重</td>
                        <td className="py-2">永久封禁、移交相关部门</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">六、举报与申诉</h2>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-800 mb-2">
                    如发现违规内容，请通过平台举报功能进行举报。我们将在24小时内处理。
                  </p>
                  <p className="text-sm text-blue-800">
                    如对处理结果有异议，可通过客服邮箱进行申诉：support@battle-top.com
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
