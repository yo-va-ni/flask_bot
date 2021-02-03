from flask import Flask, jsonify
from flask import render_template
from flask import Flask, session
from flask import request
# from flask.ext.session import Session
import mysql.connector
import pandas as pd





app = Flask(__name__)
app.secret_key = 'esto-es-una-clave-muy-secreta'

@app.route('/', methods = ['POST', 'GET'])
def home():
    if 'codigo_alumno' in session:
        codigo_alumno = session['codigo_alumno']
    return render_template('index.html')

@app.route('/message/', methods = ['POST', 'GET'])
def message():
    return jsonify()



@app.route('/set', methods = ['POST'])
def set():
    content = request.json
    print('----->')
    codigo = content['data']['codigo']
    print(codigo)
    # Buscar en la BD de alumnos
    res = getAlumno(codigo)
    if (len(res) > 0):
        session['codigo'] = codigo
        response  = {'message': 'Bienvenido {}'.format(res[0][1])}
    else:
        response = {'message': 'Quien eres'}
    return jsonify(response)

@app.route('/get/')
def get():
    return session.get('key', 'not set')

def getAlumno(codigo_alumno):
    miConexion = mysql.connector.connect(host='chatbot.czmuos7b0p9f.sa-east-1.rds.amazonaws.com', user= 'chatbotAD', passwd='chatbotAD', db='PrestamoBiblioteca' )
    cur = miConexion.cursor()
    sentencia = "SELECT * from ESTUDIANTE WHERE idEstudiante='{}'".format(codigo_alumno)
    cur.execute(sentencia)
    array_fetch=cur.fetchall()
    # df = pd.DataFrame(array_fetch,columns=['itemPrestamo','idPrestamo','idEstudiante','idLibro','nombreLibro'])
    miConexion.close()
    print(array_fetch)
    return array_fetch






if __name__ == '__main__':
    app.run(debug = True) 