// SPDX-License-Identifier: 0BSD
const doh = 'https://security.cloudflare-dns.com/dns-query';
const contype = 'application/dns-message';
const jsontype = 'application/dns-json';
const dohPath = '/doh';

export default {
    async fetch(request, env, ctx) {
        const { method, headers, url } = request;
        const { searchParams, pathname } = new URL(url);
        
        // 根目录返回游戏页面
        if (pathname === '/' && method === 'GET') {
            return new Response(getGameHTML(), {
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
        }
        
        // 只处理 /doh 路径的请求
        if (!pathname.startsWith(dohPath)) {
            return new Response(null, { status: 404 });
        }
        
        try {
            let res;
            
            // GET 请求 - DNS 参数格式
            if (method === 'GET' && searchParams.has('dns')) {
                res = await fetch(doh + '?dns=' + searchParams.get('dns'), {
                    method: 'GET',
                    headers: { 'Accept': contype }
                });
            } 
            // POST 请求 - 二进制格式
            else if (method === 'POST' && headers.get('content-type') === contype) {
                res = await fetch(doh, {
                    method: 'POST',
                    headers: {
                        'Accept': contype,
                        'Content-Type': contype,
                    },
                    body: request.body,
                });
            } 
            // GET 请求 - JSON 格式
            else if (method === 'GET' && headers.get('Accept') === jsontype) {
                res = await fetch(doh + new URL(url).search, {
                    method: 'GET',
                    headers: { 'Accept': jsontype }
                });
            } 
            else {
                return new Response(null, { status: 404 });
            }
            
            return new Response(res.body, {
                status: res.status,
                headers: {
                    ...Object.fromEntries(res.headers),
                    'Access-Control-Allow-Origin': '*',
                }
            });
        } catch (error) {
            return new Response('代理错误', { status: 502 });
        }
    }
};

function getGameHTML() {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>贪吃蛇游戏 ??</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: Arial, sans-serif;
            color: white;
        }
        h1 { margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
        #gameCanvas {
            border: 4px solid white;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            background: #1a1a2e;
        }
        #score {
            margin-top: 20px;
            font-size: 24px;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        #info {
            margin-top: 10px;
            font-size: 14px;
            opacity: 0.9;
        }
        .doh-info {
            margin-top: 20px;
            padding: 15px 25px;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            font-size: 12px;
            max-width: 400px;
            text-align: center;
        }
        .btn {
            margin-top: 15px;
            padding: 10px 30px;
            font-size: 16px;
            background: white;
            color: #667eea;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-weight: bold;
            transition: transform 0.2s;
        }
        .btn:hover { transform: scale(1.05); }
        .btn:active { transform: scale(0.95); }
    </style>
</head>
<body>
    <h1>?? 贪吃蛇游戏</h1>
    <canvas id="gameCanvas" width="400" height="400"></canvas>
    <div id="score">得分: 0</div>
    <div id="info">使用方向键或 WASD 控制</div>
    <button class="btn" onclick="resetGame()">重新开始</button>
    
  
    <script>
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const gridSize = 20;
        const tileCount = canvas.width / gridSize;
        
        let snake = [{x: 10, y: 10}];
        let food = {x: 15, y: 15};
        let dx = 0, dy = 0;
        let score = 0;
        let gameLoop;
        
        function drawGame() {
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            if (dx !== 0 || dy !== 0) {
                const head = {x: snake[0].x + dx, y: snake[0].y + dy};
                
                if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount ||
                    snake.some(segment => segment.x === head.x && segment.y === head.y)) {
                    alert('游戏结束！得分: ' + score);
                    resetGame();
                    return;
                }
                
                snake.unshift(head);
                
                if (head.x === food.x && head.y === food.y) {
                    score++;
                    document.getElementById('score').textContent = '得分: ' + score;
                    placeFood();
                } else {
                    snake.pop();
                }
            }
            
            snake.forEach((segment, index) => {
                ctx.fillStyle = index === 0 ? '#00ff88' : '#00cc70';
                ctx.fillRect(segment.x * gridSize + 1, segment.y * gridSize + 1, 
                           gridSize - 2, gridSize - 2);
            });
            
            ctx.fillStyle = '#ff6b6b';
            ctx.beginPath();
            ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, 
                   gridSize/2 - 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        function placeFood() {
            do {
                food = {
                    x: Math.floor(Math.random() * tileCount),
                    y: Math.floor(Math.random() * tileCount)
                };
            } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
        }
        
        function resetGame() {
            snake = [{x: 10, y: 10}];
            dx = 0;
            dy = 0;
            score = 0;
            document.getElementById('score').textContent = '得分: 0';
            placeFood();
            if (gameLoop) clearInterval(gameLoop);
            gameLoop = setInterval(drawGame, 100);
        }
        
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp': case 'w': case 'W':
                    if (dy === 0) { dx = 0; dy = -1; }
                    break;
                case 'ArrowDown': case 's': case 'S':
                    if (dy === 0) { dx = 0; dy = 1; }
                    break;
                case 'ArrowLeft': case 'a': case 'A':
                    if (dx === 0) { dx = -1; dy = 0; }
                    break;
                case 'ArrowRight': case 'd': case 'D':
                    if (dx === 0) { dx = 1; dy = 0; }
                    break;
            }
            e.preventDefault();
        });
        
        resetGame();
    </script>
</body>
</html>`;
}
