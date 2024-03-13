from flask import Flask, render_template, jsonify, request
import json
import db

app = Flask(__name__)

@app.route('/', methods=['get'])
def main():
    return render_template('index.html')

@app.route('/get_data', methods=['get'])
def get_data():
    rows = db.get_all_data()
    jrows = json.dumps(rows)
    return jsonify(jrows)


@app.route('/post_data', methods=['post'])
def post_data():
    print('From json: ',request.json)
    if request.json:
        print('id: ', request.json.get('id'))
        print('first_name: ', request.json.get('first_name'))
        result = db.upsert(request.json)
    return jsonify({'response': f'Post request {request.json.get("id")} was {result}'})


if __name__ == '__main__':
    app.run(debug=True)