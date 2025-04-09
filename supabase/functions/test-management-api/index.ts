import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
}

serve(async (req) => {
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 使用硬编码的值进行测试
    const accessToken = 'sbp_e6739cd03fb5afacd2f4703de196ec1b32e6a90b'
    const projectId = 'zhbfoqkfuqcruvqmlxnx'

    // 获取当前时间
    const now = new Date()
    // 获取5分钟前的时间
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000)

    // 构建请求URL - 使用新的日志 API 端点
    const url = `https://api.supabase.com/v1/projects/${projectId}/analytics/endpoints/logs.all?iso_timestamp_start=${fiveMinutesAgo.toISOString()}&iso_timestamp_end=${now.toISOString()}`

    console.log('正在请求:', url)
    console.log('使用令牌:', accessToken.substring(0, 10) + '...')

    // 发送请求到 Management API
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    // 获取响应状态和内容
    const status = response.status
    const data = await response.json()

    console.log('响应状态:', status)
    console.log('响应内容:', JSON.stringify(data, null, 2))

    // 返回结果
    return new Response(
      JSON.stringify({
        status,
        data,
        message: '测试完成',
        debug: {
          url,
          tokenPreview: accessToken.substring(0, 10) + '...',
          timeRange: {
            start: fiveMinutesAgo.toISOString(),
            end: now.toISOString(),
            duration: '5分钟'
          }
        }
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('错误:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        stack: error.stack,
        time: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
}) 