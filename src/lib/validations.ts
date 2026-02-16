import { z } from "zod"

export const signInSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少需要6个字符"),
})

export const signUpSchema = z.object({
  name: z.string().min(2, "名称至少需要2个字符").max(50, "名称不能超过50个字符"),
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少需要6个字符"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
})

export const rankingSchema = z.object({
  title: z.string().min(3, "标题至少需要3个字符").max(100, "标题不能超过100个字符"),
  description: z.string().max(1000, "描述不能超过1000个字符").optional(),
  categoryId: z.string().optional(),
  items: z.array(z.object({
    name: z.string().min(1, "项目名称不能为空").max(100, "项目名称不能超过100个字符"),
    description: z.string().max(500, "项目描述不能超过500个字符").optional(),
    imageUrl: z.string().url("请输入有效的图片URL").optional().or(z.literal("")),
    justification: z.string().max(500, "理由不能超过500个字符").optional(),
  })).min(2, "排名至少需要2个项目").max(50, "排名最多50个项目"),
  tags: z.array(z.string()).max(10, "最多10个标签").optional(),
})

export const commentSchema = z.object({
  content: z.string().min(1, "评论内容不能为空").max(500, "评论不能超过500个字符"),
})

export const profileSchema = z.object({
  name: z.string().min(2, "名称至少需要2个字符").max(50, "名称不能超过50个字符"),
  bio: z.string().max(200, "简介不能超过200个字符").optional(),
  image: z.string().url("请输入有效的图片URL").optional().or(z.literal("")),
})

export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type RankingInput = z.infer<typeof rankingSchema>
export type CommentInput = z.infer<typeof commentSchema>
export type ProfileInput = z.infer<typeof profileSchema>
