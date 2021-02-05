from flask import Flask, jsonify
from flask import render_template
from flask import Flask, session
from flask import request
# from flask.ext.session import Session
import mysql.connector
import pandas as pd

from my_model import get_response

user = ''


app = Flask(__name__)
app.secret_key = 'esto-es-una-clave-muy-secreta'

@app.route('/', methods = ['POST', 'GET'])
def home():
    # custom_cookie = request.cookies.get('custom_cookie', 'Undefined')
    # print(custom_cookie)
    # if 'codigo_alumno' in session:
    #     codigo_alumno = session['codigo_alumno']
    # print(session)
    return render_template('index.html')

@app.route('/message/', methods = ['POST', 'GET'])
def message():
    return jsonify()



@app.route('/set', methods = ['POST'])
def set():
    content = request.json
    print('-------------->')
    print(content)
    user_content = content['data']

    if user_content['nuevo']:
        res = getAlumno(user_content['content'])
        if (len(res) > 0):
            response = {
                'message': 'Bienvenido {}\n¿En qué te puedo ayudar?'.format(res[0][1]),
                'cookie': res[0][0]
            }
        else:
            response = {
                'message': 'Por favor, ingresa tu codigo para continuar',
                'cookie': ''
            }
    else:
        # response = modelmanage(user_content['content'])
        
        response = {
            'message': get_response(user_content['content']),
        }
    # codigo = content['data']['codigo']
    # print(codigo)
    # # Buscar en la BD de alumnos
    #     session['codigo'] = codigo
    #     response  = {'message': 'Bienvenido {}'.format(res[0][1])}
    #     response = {'message': 'Quien eres'}


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

def modelManage(message):
    pass


if __name__ == '__main__':
    app.run(debug = True) 