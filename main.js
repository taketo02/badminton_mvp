document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('badminton-court');
    const ctx = canvas.getContext('2d');

    // コートの寸法（ピクセル単位)
    const courtWidth = 500;
    const courtHeight = 670;

    // コートの寸法（ピクセル単位

    canvas.width = courtWidth + 200;
    canvas.height = courtHeight + 200;
    
    const courtX = (canvas.width - courtWidth) / 2;
    const courtY = (canvas.height - courtHeight) / 2;

    function drawCourt() {
        ctx.strokeStyle = '#FFFFFF'; // 線の色を白に
        ctx.lineWidth = 3;

        // 外枠
        ctx.strokeRect(courtX, courtY, courtWidth, courtHeight);

        // ネット
        ctx.beginPath();
        ctx.moveTo(courtX, courtY + courtHeight / 2);
        ctx.lineTo(courtX + courtWidth, courtY + courtHeight / 2);
        ctx.stroke();

        // ダブルスサイドライン
        ctx.strokeRect(courtX, courtY, courtWidth, courtHeight);
        
        // シングルスサイドライン
        ctx.beginPath();
        ctx.moveTo(courtX + 45, courtY);
        ctx.lineTo(courtX + 45, courtY + courtHeight);
        ctx.moveTo(courtX + courtWidth - 45, courtY);
        ctx.lineTo(courtX + courtWidth - 45, courtY + courtHeight);
        ctx.stroke();

        // センターライン
        ctx.beginPath();
        ctx.moveTo(courtX + courtWidth / 2, courtY);
        ctx.lineTo(courtX + courtWidth / 2, courtY + 285);
        ctx.moveTo(courtX + courtWidth / 2, courtY + courtHeight);
        ctx.lineTo(courtX + courtWidth / 2, courtY + courtHeight - 285);
        ctx.stroke();

        // ショートサービスライン
        ctx.beginPath();
        ctx.moveTo(courtX, courtY + 285);
        ctx.lineTo(courtX + courtWidth, courtY + 285);
        ctx.moveTo(courtX, courtY + courtHeight - 285);
        ctx.lineTo(courtX + courtWidth, courtY + courtHeight - 285);
        ctx.stroke();

        //バックサービスライン
        ctx.beginPath();
        ctx.moveTo(courtX, courtY + 60);
        ctx.lineTo(courtX + courtWidth, courtY + 60);
        ctx.moveTo(courtX, courtY + courtHeight - 60);
        ctx.lineTo(courtX + courtWidth, courtY + courtHeight - 60);
        ctx.stroke();
    }

    drawCourt();

    const NUM_COLS = 6;
    const NUM_ROWS_PER_SIDE = 5;
    const NUM_ROWS = NUM_ROWS_PER_SIDE * 2;

    const gridCellWidth = courtWidth / NUM_COLS;
    const gridCellHeight = courtHeight / NUM_ROWS;

// 開発用にグリッド線を描画する（本番ではコメントアウト可）
    function drawGrid() {
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)'; // 黄色、半透明
        ctx.lineWidth = 1;

    // 縦線
        for (let i = 1; i < NUM_COLS; i++) {
            const x = courtX + i * gridCellWidth;
            ctx.beginPath();
            ctx.moveTo(x, courtY);
            ctx.lineTo(x, courtY + courtHeight);
            ctx.stroke();
        }
    // 横線
        for (let i = 1; i < NUM_ROWS; i++) {
            const y = courtY + i * gridCellHeight;
            ctx.beginPath();
            ctx.moveTo(courtX, y);
            ctx.lineTo(courtX + courtWidth, y);
            ctx.stroke();
        }
    }

// ページ読み込み時にコートとグリッドを描画
drawCourt();
drawGrid(); // 開発用にグリッドを表示

let currentGameID = null;
let currentRallyID = 1;
    
async function fetchGameID(){
    try{
        const response = await
        fetch('/api/get_game_id');
        const data = await response.json();
        currentGameID = data.gameID;
    }catch(error){
        console.error('Failed to fetch game ID:',error);
    }
}
    
let rallyData = [];

let currentPlayer = 'top';
const serveSideSelector = document.getElementById('serve-side');

fetchGameID();

canvas.addEventListener('mousedown', function(e) {
    const rect = canvas.getBoundingClientRect();
    // コートの左上からの相対座標に変換
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // グリッド座標に変換
    const gridCol = Math.floor((x - courtX) / gridCellWidth);
    const gridRow = Math.floor((y - courtY) / gridCellHeight);

    const GameName = document.getElementById('Game-Name').value;
        
    // 選択されている打球の種類を取得
    const shotType = document.querySelector('input[name="shot-type"]:checked').value;

    const playerName = (currentPlayer === 'top')
        ?document.getElementById('top').value
        :document.getElementById('bottom').value;

    // クリックがコート内かチェック
    if (x >= courtX && x <= courtX + courtWidth && y >= courtY && y <= courtY + courtHeight) {
        // データを一時的に保存
        const shotData = {
            gameID: currentGameID,
            GameName: GameName,
            player: playerName,
            rallyID: currentRallyID,
            gridX: gridCol,
            gridY: gridRow,
            shotType: shotType,
            judge: 'IN'
        };
        rallyData.push(shotData);

        // クリック地点を視覚的に表示
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(rallyData.length, x, y);
        
        console.log('IN:', shotData);

        currentPlayer = (currentPlayer === 'top') ? 'bottom' : 'top';
    }
    else {    
        // データを一時的に保存
        const shotData = {
            gameID: currentGameID,
            GameName: GameName,
            player: playerName,
            rallyID: currentRallyID,
            gridX: gridCol,
            gridY: gridRow,
            shotType: shotType,
            judge: 'OUT'
        };
        rallyData.push(shotData);

        // クリック地点を視覚的に表示
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(rallyData.length, x, y);
        
        console.log('OUT:', shotData);
    }
});

const saveButton = document.getElementById('save-rally-btn');

async function saveRallyData() {
    if (rallyData.length === 0) {
        alert('No data to save.');
        return;
    }

    try {
        const response = await fetch('/api/record_rally', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(rallyData),
        });

        if (response.ok) {
            const result = await response.json();
            // 保存成功後、ラリーデータをリセットし、コートを再描画
            ctx.clearRect(0, 0, canvas.width, canvas.height); // キャンバスをクリア
            ctx.fillStyle = '#008000'; // 背景色を再設定
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            drawCourt();
            drawGrid();

            rallyData = [];
            currentPlayer = serveSideSelector.value;
            currentRallyID++;
            
            alert(result.message);
        } else {
            alert('Failed to save data.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while saving data.');
    }
}

const clearButton = document.getElementById('clear-btn');
async function clear() {
    // クリアボタンが押されたら、ラリーデータをリセットし、コートを再描画
    ctx.clearRect(0, 0, canvas.width, canvas.height); // キャンバスをクリア
    ctx.fillStyle = '#008000'; // 背景色を再設定
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawCourt();
    drawGrid();

    rallyData = [];
    currentPlayer = serveSideSelector.value;
    console.log('The coat has been reset.')
}

saveButton.addEventListener('click', saveRallyData);
clearButton.addEventListener('click', clear);

});
