from flask import Flask, jsonify, render_template, request
import sqlite3
import random
import os
import gdown
import html

app = Flask(__name__)
DB_PATH = "questions.db"
GOOGLE_DRIVE_FILE_ID = "1NCqMTSkql2lzxfgcx-tmRJouS_lkKe5j"
GOOGLE_DRIVE_URL = f"https://drive.google.com/uc?id={GOOGLE_DRIVE_FILE_ID}"

def download_db():
    if not os.path.exists(DB_PATH):
        print("Downloading questions.db using gdown...")
        gdown.download(GOOGLE_DRIVE_URL, DB_PATH, quiet=False)
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

    category_map = {}
    for row in rows:
        fields = row[0].split('\x1f')
        if len(fields) >= 8:
            cat = fields[3].strip()
            category_map.setdefault(cat, []).append(fields)

    valid_cats = [cat for cat, entries in category_map.items() if len(entries) >= 5]
    chosen_cats = random.sample(valid_cats, 6)

    board = {}
    cells = []

    for cat in chosen_cats:
        selected = random.sample(category_map[cat], 5)
        try:
            year = selected[0][7].strip().split("-")[0]
        except:
            year = ""
        questions = []
        for i, flds in enumerate(selected):
            clue = html.unescape(flds[5].strip().replace("\\", ""))
            answer = html.unescape(flds[6].strip().replace("\\", ""))
            value = (i + 1) * 100 * multiplier
            questions.append({
                "value": value,
                "clue": clue,
                "answer": answer,
                "daily_double": False,
                "year": year
            })
        board[cat] = questions
        cells.extend([(cat, i) for i in range(5)])

    dd_positions = random.sample(cells, num_daily_doubles)
    for cat, idx in dd_positions:
        board[cat][idx]["daily_double"] = True

    return jsonify(board)

@app.route('/final')
def final_jeopardy():
    download_db()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT flds FROM notes")
    rows = cursor.fetchall()

    final_clues = []
    for row in rows:
        fields = row[0].split('\x1f')
        if len(fields) >= 8 and "final jeopardy" in fields[3].lower():
            final_clues.append({
                "clue": html.unescape(fields[5].strip().replace("\\", "")),
                "answer": html.unescape(fields[6].strip().replace("\\", "")),
                "year": fields[7].strip().split("-")[0] if "-" in fields[7] else ""
            })

    if final_clues:
        return jsonify(random.choice(final_clues))
    else:
        return jsonify({"clue": "No Final Jeopardy question found.", "answer": "", "year": ""})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host='0.0.0.0', port=port)