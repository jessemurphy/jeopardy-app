from flask import Flask, jsonify, render_template, request
import sqlite3
import random
import os
import requests

app = Flask(__name__)
DB_PATH = "questions.db"

# Optional: replace with your Google Drive file ID
GOOGLE_DRIVE_FILE_ID = "1NCqMTSkql2lzxfgcx-tmRJouS_lkKe5j"
GOOGLE_DRIVE_URL = f"https://drive.google.com/uc?export=download&id={GOOGLE_DRIVE_FILE_ID}"

# Download the DB if missing
def download_db():
    if not os.path.exists(DB_PATH):
        print("Downloading questions.db from Google Drive...")
        r = requests.get(GOOGLE_DRIVE_URL)
        with open(DB_PATH, "wb") as f:
            f.write(r.content)
        print("Download complete.")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/game')
def game():
    download_db()

    round_type = request.args.get('round', 'regular')
    multiplier = 1 if round_type == 'regular' else 2
    num_daily_doubles = 1 if round_type == 'regular' else 2

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT flds FROM notes")
    rows = cursor.fetchall()

    data = []
    for row in rows:
        fields = row[0].split('\x1f')
        if len(fields) >= 7:
            try:
                category = fields[3].strip()
                clue = fields[5].strip()
                answer = fields[6].strip()
                value = int(fields[1]) if fields[1].isdigit() else 0
                data.append((category, value, clue, answer))
            except:
                continue

    category_map = {}
    for cat, val, clue, ans in data:
        if cat not in category_map:
            category_map[cat] = []
        category_map[cat].append({"value": val, "clue": clue, "answer": ans})

    valid_cats = [cat for cat in category_map if len(category_map[cat]) >= 5]
    chosen_cats = random.sample(valid_cats, 6)

    board = {}
    cells = []
    for cat in chosen_cats:
        selected = random.sample(category_map[cat], 5)
        for i, q in enumerate(selected):
            q['value'] = (i + 1) * 100 * multiplier
            q['daily_double'] = False
        board[cat] = selected
        cells.extend([(cat, i)])

    dd_positions = random.sample(cells, num_daily_doubles)
    for cat, idx in dd_positions:
        board[cat][idx]['daily_double'] = True

    return jsonify(board)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host='0.0.0.0', port=port)