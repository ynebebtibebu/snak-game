from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class HighScore(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    player = db.Column(db.String(50), nullable=False)
    score = db.Column(db.Integer, nullable=False)

@app.route('/')
def game():
    return render_template('game.html')

@app.route('/save_score', methods=['POST'])
def save_score():
    data = request.json
    new_score = HighScore(player=data['player'], score=data['score'])
    db.session.add(new_score)
    db.session.commit()
    return jsonify(success=True)

@app.route('/get_scores')
def get_scores():
    scores = HighScore.query.order_by(HighScore.score.desc()).limit(3).all()
    return jsonify([{'player': score.player, 'score': score.score} for score in scores])

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create database tables if they don't exist
    app.run(debug=True)
