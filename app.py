from flask import Flask, jsonify, render_template, request
import sqlite3
import random
import os
import gdown

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

    # Get categories with at least 5 entries
    cursor.execute("""
        SELECT category, COUNT(*) as count FROM (
            SELECT TRIM(SUBSTR(flds, INSTR(flds, '\x1f', INSTR(flds, '\x1f', 1)+1)+1,
                        INSTR(flds, '\x1f', INSTR(flds, '\x1f', INSTR(flds, '\x1f', 1)+1)+1)
                        - INSTR(flds, '\x1f', INSTR(flds, '\x1f', 1)+1) - 1)) AS category
            FROM notes
        ) GROUP BY category HAVING count >= 5
    """)
    categories = [row[0] for row in cursor.fetchall()]
    chosen_cats = random.sample(categories, 6)

    board = {}
    cells = []

    for cat in chosen_cats:
        cursor.execute("""
            SELECT flds FROM notes
            WHERE flds LIKE ?
        """, (f"%{cat}%",))
        rows = cursor.fetchall()
        random.shuffle(rows)
        questions = []
        for row in rows[:5]:
            fields = row[0].split('\x1f')
            if len(fields) >= 7:
                clue = fields[5].strip()
                answer = fields[6].strip()
                value = (len(questions) + 1) * 100 * multiplier
                questions.append({"value": value, "clue": clue, "answer": answer, "daily_double": False})
        board[cat] = questions
        cells.extend([(cat, i) for i in range(5)])

    dd_positions = random.sample(cells, num_daily_doubles)
    for cat, idx in dd_positions:
        board[cat][idx]['daily_double'] = True

    return jsonify(board)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host='0.0.0.0', port=port)