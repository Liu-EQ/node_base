const WebSocket = require('ws');

// 创建 WebSocket 服务器
const wss = new WebSocket.Server({ port: 8080 });

// 牌堆和玩家数据
let deck = [];
let players = [];
let landlordCards = [];
let currentPlayerIndex = 0;

// 初始化牌堆
function initializeDeck() {
  const suits = ['♠', '♥', '♣', '♦'];
  const ranks = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
  deck = [];
  suits.forEach(suit => {
    ranks.forEach(rank => {
      deck.push(rank + suit);
    });
  });
  deck.push('JOKER-B', 'JOKER-R'); // 大小王
}

// 分发牌
function dealCards() {
  shuffle(deck);
  landlordCards = deck.splice(-3); // 抽取3张底牌
  const handSize = Math.floor(deck.length / 3);
  players.forEach((player, index) => {
    player.hand = deck.slice(index * handSize, (index + 1) * handSize);
  });
}

// 洗牌
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// 广播消息
function broadcast(data) {
  players.forEach(player => {
    if (player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(JSON.stringify(data));
    }
  });
}

// 验证出牌是否有效
function isValidPlay(cards, hand) {
  return cards.every(card => hand.includes(card));
}

// 游戏结束
function endGame(winnerIndex) {
  broadcast({ type: 'gameOver', winner: players[winnerIndex].name });
  players = []; // 重置玩家列表
}

// 处理玩家出牌
function handlePlay(playerIndex, cards) {
  const player = players[playerIndex];
  if (!isValidPlay(cards, player.hand)) {
    player.ws.send(JSON.stringify({ type: 'error', message: 'Invalid play' }));
    return;
  }

  // 从玩家手牌中移除
  player.hand = player.hand.filter(card => !cards.includes(card));

  // 广播出牌信息
  broadcast({
    type: 'play',
    player: player.name,
    cards,
    remainingCards: player.hand.length,
  });

  // 检查是否胜利
  if (player.hand.length === 0) {
    endGame(playerIndex);
    return;
  }

  // 切换到下一个玩家
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  broadcast({ type: 'nextTurn', currentPlayer: players[currentPlayerIndex].name });
}

// WebSocket 事件监听
wss.on('connection', ws => {
  if (players.length >= 3) {
    ws.send(JSON.stringify({ type: 'error', message: 'Game is full' }));
    ws.close();
    return;
  }

  // 添加新玩家
  const playerName = `Player${players.length + 1}`;
  const player = { name: playerName, ws, hand: [] };
  players.push(player);

  // 广播新玩家加入
  broadcast({ type: 'playerJoined', name: playerName });

  // 启动游戏（当3个玩家都连接时）
  if (players.length === 3) {
    initializeDeck();
    dealCards();
    broadcast({
      type: 'gameStart',
      players: players.map(p => ({ name: p.name, handSize: p.hand.length })),
      landlordCards,
      currentPlayer: players[currentPlayerIndex].name,
    });
  }

  // 监听客户端消息
  ws.on('message', message => {
    const data = JSON.parse(message);
    if (data.type === 'play' && players[currentPlayerIndex].ws === ws) {
      handlePlay(currentPlayerIndex, data.cards);
    }
  });

  // 玩家断开连接
  ws.on('close', () => {
    players = players.filter(p => p.ws !== ws);
    broadcast({ type: 'playerLeft', name: playerName });
  });
});

console.log('WebSocket server is running on ws://localhost:8080');
