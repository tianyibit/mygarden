#!/usr/bin/env node
/**
 * 根据中文标题生成英文 slug
 * 用法: node scripts/generate-slug.js "中文标题"
 */

// 常见中文词 → 英文映射
const dict = {
  '投行': 'investment-banking', '科技': 'tech', '金融': 'fintech',
  '产品': 'product', '思考': 'thoughts', '随笔': 'essay',
  '编程': 'coding', '乐趣': 'joy', '信任': 'trust',
  '未来': 'future', '过去': 'past', '现在': 'present',
  '发展': 'development', '软件': 'software', '行业': 'industry',
  '启示': 'insights', '工作流': 'workflow', '拆解': 'breakdown',
  '撰写': 'writing', '招股书': 'prospectus', '大模型': 'llm',
  '数字化': 'digital', '转型': 'transformation', '工具': 'tools',
  '项目': 'projects', '梳理': 'review', '数据': 'data',
  '建模': 'modeling', '审核': 'audit', '监管': 'regulation',
  '研究': 'research', '成果': 'results', '关键': 'key',
  '技术': 'technology', '披露': 'disclosure', '信息': 'information',
  '系统': 'system', '设计': 'design', '架构': 'architecture',
  '黑客松': 'hackathon', '冠军': 'champion', '第一个': 'first',
  '我的': 'my', '模块': 'modules', '功能': 'features',
  '五个': 'five', '必备': 'essential', '尽调': 'due-diligence',
  '百科': 'encyclopedia', '上交所': 'sse', '案例': 'case-study',
  '会计师': 'accountant', '分析': 'analysis', '逻辑': 'logic',
  '财务': 'financial', '核查': 'verification',
  '发行人': 'issuer', '自身': 'self', '瓶颈': 'bottleneck',
  '好东西': 'good-stuff', '做': 'making',
  'AI': 'ai', 'IPO': 'ipo',
}

function generateSlug(title) {
  let slug = title

  // 先替换已知词组（按长度降序，优先匹配长词）
  const entries = Object.entries(dict).sort((a, b) => b[0].length - a[0].length)
  for (const [cn, en] of entries) {
    slug = slug.replaceAll(cn, ` ${en} `)
  }

  // 移除剩余中文字符和特殊符号
  slug = slug.replace(/[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef「」『』【】]/g, '')

  // 清理：转小写，非字母数字变连字符，去重连字符
  slug = slug.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')

  // 截断
  if (slug.length > 60) slug = slug.substring(0, 60).replace(/-$/, '')

  return slug || 'untitled'
}

const title = process.argv[2]
if (!title) {
  process.exit(1)
}
console.log(generateSlug(title))
