from flask import Flask, render_template, request, jsonify, send_file
import os
import csv
from datetime import datetime

# Flaskクラスのインスタンスを作成
app = Flask(__name__)

# 保存するCSVファイルのパスと列の定義
CSV_FILE = 'rallies.csv'
CSV_HEADER = ['GameID', 'GameName', 'rallyID', 'shotID', 'PlayerName', 'gridX', 'gridY', 'ShotType', 'judge']

# 試合ID（GameID）カウンターの初期化
gameID_counter = 1

# ルートURL ('/') へのリクエストを処理するルートを定義
@app.route('/')
def index():
    """ホームページをレンダリングする"""
    return render_template('index.html')

@app.route('/api/get_game_id')
def get_game_id():
    """新しいGameIDを発行するエンドポイント"""
    global gameID_counter
    game_id = gameID_counter
    gameID_counter += 1
    return jsonify({'gameID': game_id})
    
@app.route('/api/record_rally', methods=['POST'])
def record_rally():
    """フロントエンドからラリーデータを受け取り、ローカルのCSVファイルに追記保存する"""
    shots = request.get_json()
    if not shots:
        return jsonify({'status': 'error', 'message': 'No data received'}), 400

    try:
        # CSVファイルがすでに存在するかどうかを確認
        file_exists = os.path.exists(CSV_FILE)

        # 'a' (append) モードでファイルを開いて追記する
        # encoding='utf-8-sig' でExcelの文字化けを防ぐ
        with open(CSV_FILE, mode='a', newline='', encoding='utf-8-sig') as f:
            writer = csv.writer(f)
            
            # まだファイルがない場合は、最初にヘッダー行を書き込む
            if not file_exists:
                writer.writerow(CSV_HEADER)
            
            # 送信されてきたショットを一行ずつ書き込む
            for i, shot in enumerate(shots):
                writer.writerow([
                    shot.get('gameID'),
                    shot.get('GameName'),
                    shot.get('rallyID'),
                    i + 1,  # shotID (ラリー内のショットの連番)
                    shot.get('player'),
                    shot.get('gridX'),
                    shot.get('gridY'),
                    shot.get('shotType'),
                    shot.get('judge')
                ])

    except Exception as e:
        print(f"Error writing to CSV: {e}")
        return jsonify({'status': 'error', 'message': 'Failed to save data to CSV file'}), 500

    return jsonify({'status': 'success', 'message': 'Rally data saved to CSV successfully!'}), 200

@app.route('/download_csv')
def download_csv():
    """記録されたCSVファイルをダウンロードさせるエンドポイント"""
    try:
        if os.path.exists(CSV_FILE):
            # 日本語対応のため、現在の日時をファイル名に含めてダウンロードさせる
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            return send_file(CSV_FILE, as_attachment=True, download_name=f'badminton_rallies_{timestamp}.csv')
        else:
            return "File not found. Please record some rallies first.", 404
    except Exception as e:
        print(f"Error during file download: {e}")
        return "An error occurred during file download.", 500

# スクリプトが直接実行された場合にのみサーバーを起動
if __name__ == '__main__':
    # debug=Trueに設定すると、開発中に便利なデバッグモードが有効になる
    app.run(debug=True)
