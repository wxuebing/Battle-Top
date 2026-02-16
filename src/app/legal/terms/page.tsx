"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">用户服务协议</h1>
            <p className="text-sm text-gray-500 mb-8">更新日期：2024年1月1日 | 生效日期：2024年1月1日</p>

            <div className="prose prose-gray max-w-none">
              <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">一、总则</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                欢迎您使用Battle Top（以下简称「本平台」）提供的服务。为使用本平台服务，您应当阅读并遵守《用户服务协议》（以下简称「本协议」）。请您务必审慎阅读、充分理解各条款内容，特别是免除或限制责任的相应条款。
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                除非您已阅读并接受本协议所有条款，否则您无权使用本平台服务。您的登录、使用本平台服务等行为即视为您已阅读并同意本协议的约束。
              </p>

              <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">二、服务内容</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                本平台为用户提供榜单创建、浏览、评论、订阅等社区服务。具体服务内容以本平台实际提供为准，本平台有权根据业务发展调整服务内容。
              </p>

              <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">三、账户注册与使用</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                3.1 用户在注册账户时，应按照页面提示提供真实、准确、完整的个人资料。
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                3.2 用户应妥善保管账户信息，因账户信息泄露造成的损失由用户自行承担。
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                3.3 用户不得将账户转让、出借给他人使用，由此产生的后果由用户自行承担。
              </p>

              <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">四、用户行为规范</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                用户在使用本平台服务时，不得从事以下行为：
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>发布违反法律法规的内容，包括但不限于涉黄、涉暴、涉政敏感信息等</li>
                <li>发布侵犯他人知识产权、肖像权、隐私权等合法权益的内容</li>
                <li>发布虚假、诽谤、歧视性内容，或恶意攻击他人</li>
                <li>利用技术手段干扰、破坏本平台的正常运行</li>
                <li>批量注册账户、刷量、刷赞等作弊行为</li>
                <li>其他违反法律法规或本协议的行为</li>
              </ul>

              <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">五、知识产权</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                5.1 本平台的Logo、「Battle Top」名称、界面设计等均属于本平台所有，未经授权不得使用。
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                5.2 用户在本平台发布的原创内容，知识产权归用户所有。用户发布内容即视为授权本平台在全球范围内使用、传播该内容。
              </p>

              <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">六、隐私保护</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                本平台重视用户隐私保护，具体内容请参阅《隐私政策》。本平台将采取合理措施保护用户的个人信息安全。
              </p>

              <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">七、免责声明</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                7.1 本平台不对用户发布的内容负责，用户自行承担其发布内容产生的法律责任。
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                7.2 因不可抗力、网络故障、系统维护等原因导致的服务中断，本平台不承担责任。
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                7.3 本平台有权在必要时修改本协议条款，修改后的协议将在平台上公布。
              </p>

              <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">八、违约处理</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                如用户违反本协议约定，本平台有权采取以下措施：
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>删除违规内容</li>
                <li>警告、限制功能</li>
                <li>暂时封禁账户</li>
                <li>永久封禁账户</li>
                <li>追究法律责任</li>
              </ul>

              <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">九、争议解决</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                本协议的订立、执行和解释及争议的解决均应适用中华人民共和国法律。如发生争议，双方应友好协商解决；协商不成的，任何一方均可向本平台所在地人民法院提起诉讼。
              </p>

              <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">十、联系我们</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                如您对本协议有任何疑问，可通过以下方式联系我们：
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                客服邮箱：support@battle-top.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
