// SPDX-License-Identifier: 0BSD
// Cloudflare Snippets 版本
// 部署方式：Cloudflare Dashboard → 你的域名 → Snippets → 新建 Snippet → 粘贴此代码
// 然后添加规则：将需要的路径（/* 或指定路径）绑定到此 Snippet

const DOH_SERVERS = [
    'https://cloudflare-dns.com/dns-query',
    'https://dns.google/dns-query',
    'https://dns.quad9.net/dns-query',
    'https://doh.opendns.com/dns-query',
];

const TYPE_BINARY = 'application/dns-message';
const TYPE_JSON   = 'application/dns-json';

// ── 根目录首页 HTML ──────────────────────────────────────────────
const HOME_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>DoH Proxy</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0d0d0f;color:#f0f0f2;font-family:-apple-system,'Segoe UI',sans-serif;font-size:15px;line-height:1.7;padding:2rem 1rem;min-height:100vh}
.wrap{max-width:620px;margin:0 auto}
.tag{display:inline-block;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#7c6ff7;background:rgba(124,111,247,.13);border:0.5px solid rgba(124,111,247,.3);border-radius:20px;padding:3px 12px;margin-bottom:1.2rem}
h1{font-size:2rem;font-weight:700;letter-spacing:-.03em;margin-bottom:.6rem}
h1 span{color:#7c6ff7}
.sub{color:#8a8a96;margin-bottom:2.5rem}
.card{background:#18181c;border:0.5px solid rgba(255,255,255,.1);border-radius:12px;overflow:hidden;margin-bottom:1.2rem}
.card-head{padding:9px 16px;border-bottom:0.5px solid rgba(255,255,255,.08);font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#8a8a96;display:flex;justify-content:space-between}
.card-body{padding:14px 18px}
code{font-family:'Courier New',monospace;font-size:13px;color:#3ecf8e;word-break:break-all}
.row{display:flex;align-items:center;justify-content:space-between;gap:10px}
.copy{background:#222228;border:0.5px solid rgba(255,255,255,.14);color:#8a8a96;font-size:12px;padding:4px 12px;border-radius:6px;cursor:pointer;transition:.15s}
.copy:hover{color:#f0f0f2}.copy.ok{color:#3ecf8e;border-color:#3ecf8e}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:1.2rem}
.stat{background:#18181c;border:0.5px solid rgba(255,255,255,.08);border-radius:10px;padding:14px;text-align:center}
.stat b{display:block;font-size:22px;font-weight:700;letter-spacing:-.02em}
.stat span{font-size:12px;color:#8a8a96}
.method{font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;font-family:monospace}
.get{background:rgba(62,207,142,.15);color:#3ecf8e}
.post{background:rgba(124,111,247,.15);color:#7c6ff7}
pre{font-family:'Courier New',monospace;font-size:12.5px;color:#c8c8d8;white-space:pre-wrap;word-break:break-all}
.hl{color:#3ecf8e}.dim{color:#8a8a96}
.up-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:1.2rem}
.up{background:#18181c;border:0.5px solid rgba(255,255,255,.08);border-radius:9px;padding:10px 14px;display:flex;align-items:center;gap:10px}
.dot{width:6px;height:6px;border-radius:50%;background:#3ecf8e;flex-shrink:0}
.up-name{font-size:13px;font-weight:500}
.up-url{font-size:11px;color:#8a8a96;font-family:monospace}
footer{margin-top:2.5rem;text-align:center;font-size:12px;color:#8a8a96}
footer a{color:#8a8a96;text-decoration:none}
footer a:hover{color:#f0f0f2}
@media(max-width:480px){.grid,.up-grid{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="wrap">
  <div class="tag">DNS over HTTPS</div>
  <h1>安全、快速的<br/><span>DNS 加密代理</span></h1>
  <p class="sub">基于 Cloudflare Snippets，将 DNS 查询转为 HTTPS 请求，自动故障转移至多个上游服务器。</p>

  <div class="card">
    <div class="card-head"><span>DoH 端点</span><span>HTTPS · Port 443</span></div>
    <div class="card-body">
      <div class="row">
        <code id="ep"></code>
        <button class="copy" id="btn" onclick="cp()">复制</button>
      </div>
    </div>
  </div>

  <div class="grid">
    <div class="stat"><b>4</b><span>上游服务器</span></div>
    <div class="stat"><b>3</b><span>支持格式</span></div>
    <div class="stat"><b>5ms</b><span>CPU 限制</span></div>
    <div class="stat"><b>0</b><span>日志记录</span></div>
  </div>

  <div style="margin-bottom:.5rem;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#8a8a96">上游服务器</div>
  <div class="up-grid">
    <div class="up"><span class="dot"></span><div><div class="up-name">Cloudflare Security</div><div class="up-url">security.cloudflare-dns.com</div></div></div>
    <div class="up"><span class="dot"></span><div><div class="up-name">Google DNS</div><div class="up-url">dns.google</div></div></div>
    <div class="up"><span class="dot"></span><div><div class="up-name">Quad9</div><div class="up-url">dns.quad9.net</div></div></div>
    <div class="up"><span class="dot"></span><div><div class="up-name">OpenDNS</div><div class="up-url">doh.opendns.com</div></div></div>
  </div>

  <div style="margin-bottom:.5rem;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#8a8a96">使用方法</div>
  <div class="card" style="margin-bottom:10px">
    <div class="card-head"><span class="method get">GET</span>&nbsp; DNS wire 格式（RFC 8484）</div>
    <div class="card-body"><pre><span class="hl">GET</span> /dns-query<span class="dim">?dns=AAABAAABAAA...</span>
<span class="dim">Accept: application/dns-message</span></pre></div>
  </div>
  <div class="card" style="margin-bottom:10px">
    <div class="card-head"><span class="method post">POST</span>&nbsp; 二进制请求体</div>
    <div class="card-body"><pre><span class="hl">POST</span> /dns-query
<span class="dim">Content-Type: application/dns-message</span></pre></div>
  </div>
  <div class="card" style="margin-bottom:1.2rem">
    <div class="card-head"><span class="method get">GET</span>&nbsp; JSON 格式（调试用）</div>
    <div class="card-body"><pre><span class="hl">GET</span> /dns-query<span class="dim">?name=example.com&type=A</span>
<span class="dim">Accept: application/dns-json</span></pre></div>
  </div>

  <div style="margin-bottom:.5rem;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#8a8a96">健康检查</div>
  <div class="card">
    <div class="card-body"><pre><span class="hl">GET</span> /health  <span class="dim">→ JSON 状态响应</span></pre></div>
  </div>

  <footer style="margin-top:2rem">
    <p>基于 <a href="https://developers.cloudflare.com/rules/snippets/" target="_blank">Cloudflare Snippets</a> 部署 &nbsp;·&nbsp; 协议 <a href="https://opensource.org/licenses/0BSD" target="_blank">0BSD</a></p>
  </footer>
</div>
<script>
// 动态读取当前域名，自动生成端点地址
document.getElementById('ep').textContent = window.location.origin + '/dns-query';

function cp(){
  navigator.clipboard.writeText(document.getElementById('ep').textContent).then(()=>{
    const b=document.getElementById('btn');
    b.textContent='已复制 ✓';b.classList.add('ok');
    setTimeout(()=>{b.textContent='复制';b.classList.remove('ok')},2000);
  });
}
</script>
</body>
</html>`;

// ── 主处理逻辑 ────────────────────────────────────────────────────
export default {
    async fetch(request) {
        return handleRequest(request);
    }
};

async function handleRequest(request) {
    const { method, headers } = request;
    const { pathname, searchParams, search } = new URL(request.url);

    // 根目录 → 首页
    if (pathname === '/') {
        return new Response(HOME_HTML, {
            status: 200,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'public, max-age=3600',
            },
        });
    }

    // 健康检查
    if (pathname === '/health') {
        return new Response(JSON.stringify({
            status:      'healthy',
            service:     'DoH Proxy',
            timestamp:   new Date().toISOString(),
            upstreamDNS: DOH_SERVERS,
            version:     '1.2.0',
        }, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }

    // DoH 端点
    if (pathname === '/dns-query') {
        return handleDoh(request, method, headers, searchParams, search);
    }

    return new Response('Not Found', { status: 404 });
}

async function handleDoh(request, method, headers, searchParams, search) {
    let upstreamURL = '';
    let fetchOptions = {};

    if (method === 'GET' && searchParams.has('dns')) {
        // RFC 8484 GET
        upstreamURL = '?dns=' + searchParams.get('dns');
        fetchOptions = { method: 'GET', headers: { Accept: TYPE_BINARY } };

    } else if (method === 'POST' && headers.get('content-type') === TYPE_BINARY) {
        // RFC 8484 POST
        fetchOptions = {
            method: 'POST',
            headers: { Accept: TYPE_BINARY, 'Content-Type': TYPE_BINARY },
            body: request.body,
        };

    } else if (method === 'GET' && headers.get('accept') === TYPE_JSON) {
        // JSON API
        upstreamURL = search;
        fetchOptions = { method: 'GET', headers: { Accept: TYPE_JSON } };

    } else {
        return new Response('Bad Request', { status: 400 });
    }

    // 依次尝试上游服务器，返回第一个成功的结果
    let lastError = '';
    for (const server of DOH_SERVERS) {
        try {
            const res = await fetch(server + upstreamURL, fetchOptions);
            if (res.ok) {
                const respHeaders = new Headers(res.headers);
                respHeaders.set('Access-Control-Allow-Origin', '*');
                respHeaders.set('X-DoH-Server', server);
                return new Response(res.body, {
                    status:  res.status,
                    headers: respHeaders,
                });
            }
            lastError = `${server} → HTTP ${res.status}`;
        } catch (err) {
            lastError = `${server} → ${err.message}`;
        }
    }

    return new Response(`All DoH servers failed. Last error: ${lastError}`, {
        status: 502,
        headers: { 'Access-Control-Allow-Origin': '*' },
    });
}
