from flask import Flask, jsonify
from flask import render_template

app = Flask(__name__)

@app.route('/', methods = ['POST', 'GET'])
def home():
    return render_template('index.html')

@app.route('/message/', methods = ['POST', 'GET'])
def message():
    return jsonify()



if __name__ == '__main__':
    app.run(debug = True)