"use client"

import Link from "next/link"
import { Swords, Github, Mail, HelpCircle } from "lucide-react"
import { openUserGuide } from "@/components/guide"

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-primary-600 to-accent-500 p-1 rounded-lg">
                <Swords className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                Battle Top
              </span>
            </Link>
            <p className="text-sm text-gray-500">
              创建、发布和发现各类排名榜单的平台
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">功能</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/create" className="hover:text-primary-600">创建榜单</Link></li>
              <li><Link href="/explore" className="hover:text-primary-600">发现榜单</Link></li>
              <li><Link href="/explore" className="hover:text-primary-600">分类浏览</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">账户</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/auth/signin" className="hover:text-primary-600">登录</Link></li>
              <li><Link href="/auth/signup" className="hover:text-primary-600">注册</Link></li>
              <li><Link href="/profile" className="hover:text-primary-600">个人中心</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">联系我们</h3>
            <p className="text-sm text-gray-500 mb-3">
              有想法或建议？欢迎联系我们，我们会不断改进产品！
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://github.com/wxuebing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-900 transition-colors"
                title="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="mailto:3252140949@qq.com" 
                className="text-gray-400 hover:text-primary-600 transition-colors"
                title="发送邮件"
              >
                <Mail className="h-5 w-5" />
              </a>
              <button 
                onClick={openUserGuide}
                className="text-gray-400 hover:text-primary-600 transition-colors"
                title="使用帮助"
              >
                <HelpCircle className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Battle Top. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
