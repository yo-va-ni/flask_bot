from flask import Flask, jsonify
from flask import render_template
from flask import Flask, session
from flask import request
# from flask.ext.session import Session
import mysql.connector
import pandas as pd

from my_model import get_response
from recomendacion import getConsequents

user = ''
params_array = [
    'Autor',
    'Nombre',
    'ISBN'
]
# nombreAutor
# nombreLibro
# idLibro


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
    print(content)
    user_content = content['data']

    if user_content['nuevo']:
        res = getAlumno(user_content['content'])
        cod = getCodigoPrestamo()
        if (len(res) > 0):
            response = {
                'message': 'Bienvenido {}\n¿En qué te puedo ayudar?'.format(res[0][1]),
                'cookie': '{}'.format(res[0][0]),
                'codigo_prestamo': cod
            }
        else:
            response = {
                'message': 'Por favor, ingresa tu codigo para continuar',
                'cookie': '',
            }
    elif(user_content['tag'] == 'db_search'):
        db_response = getLibros(user_content['param'], user_content['content'])
        response = {
            'message': db_response['response'],
            'tag': 'db_response',
            'param': db_response['param'],
        }
    elif(user_content['tag'] == 'busqueda_seleccion-recomendacion'):
        book = user_content['content']
        #db_response = insertReserva(book['id_libro'], book['id_estudiante'], book['dias'], book['fecha'])
        getRecomendacion(book['idLibro'])
        response = {
            'message': getRecomendacion(book['idLibro']),
            'tag': 'recomendacion',
            'param': user_content['param']
        }
    else:
        model_response = get_response(user_content['content'])
        response = model_manage(model_response)
        
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


def getCodigoPrestamo():
    miConexion = mysql.connector.connect(host='chatbot.czmuos7b0p9f.sa-east-1.rds.amazonaws.com', user= 'chatbotAD', passwd='chatbotAD', db='PrestamoBiblioteca' )
    cur = miConexion.cursor()
    sentencia = "SELECT idPrestamo from PRESTAMO"
    cur.execute(sentencia)
    array_fetch=cur.fetchall()
    return "P" + str(len(array_fetch) + 1)
    

def getRecomendacion(id_libro):
    recom = getConsequents(id_libro)
    libro = {
        'idLibro': recom[0][0],
        'nombreLibro': recom[0][1],
        'maxDias': recom[0][2]
    }
    return libro


def getAlumno(codigo_alumno):
    miConexion = mysql.connector.connect(host='chatbot.czmuos7b0p9f.sa-east-1.rds.amazonaws.com', user= 'chatbotAD', passwd='chatbotAD', db='PrestamoBiblioteca' )
    cur = miConexion.cursor()
    sentencia = "SELECT * from ESTUDIANTE WHERE idEstudiante='{}'".format(codigo_alumno)
    cur.execute(sentencia)
    array_fetch=cur.fetchall()
    # df = pd.DataFrame(array_fetch,columns=['itemPrestamo','idPrestamo','idEstudiante','idLibro','nombreLibro'])
    miConexion.close()
    return array_fetch



def getLibros(param, param_input):
    miConexion = mysql.connector.connect(host='chatbot.czmuos7b0p9f.sa-east-1.rds.amazonaws.com', user= 'chatbotAD', passwd='chatbotAD', db='PrestamoBiblioteca' )
    cur = miConexion.cursor()
    if(param == 'nombreLibro'):
        sentencia = "SELECT idLibro, nombreLibro, maxDias from LIBRO WHERE {} LIKE '%{}%'".format(param, param_input)
    if(param == 'nombreAutor'):
        sentencia="SELECT c.nombreAutor,b.idLibro,b.nombreLibro,b.maxDias FROM LIBROxAUTOR a INNER JOIN LIBRO b on a.idLibro=b.idLibro INNER JOIN AUTOR c on c.idAutor=a.idAutor where c.{} LIKE '%{}%'".format(param,param_input)
    if(param == 'idLibro'):
        sentencia = "SELECT idLibro, nombreLibro, maxDias from LIBRO WHERE {}='{}'".format(param, param_input)

    cur.execute(sentencia)
    array_fetch = cur.fetchall()
    miConexion.close()
    
    return {'param': param, 'response': array_fetch}

def insertReserva(id_libro, id_estudiante, dias, fecha):
    miConexion = mysql.connector.connect(host='chatbot.czmuos7b0p9f.sa-east-1.rds.amazonaws.com', user= 'chatbotAD', passwd='chatbotAD', db='PrestamoBiblioteca' )
    cur = miConexion.cursor()
    sentencia = "INSERT INTO PRESTAMO (idPrestamo, idEstudiante, fecPrestamo, diasPrestamo) VALUES ('{}','{}','{}',{})".format('P-32', id_estudiante, fecha, dias)
    print(sentencia)
    cur.execute(sentencia)
    miConexion.commit()
    print(cur.rowcount)


def model_manage(message):
    response = {'message': '', 'tag': ''}
    if(message['tag'] == 'despedida'):
        response['message'] = message['response']
        response['tag'] = message['tag']

    if(message['tag'] == 'busqueda'):
        response['message'] = message['response']
        response['tag'] = 'parametros'
        response['data'] = params_array

    if(message['tag'] == 'busqueda_parametros'):
        response['message'] = 'Ingrese el {} del libro'.format(message['response'])
        response['tag'] = 'parametro_input',
        if(message['response'] == 'Autor'):
            response['param'] = 'nombreAutor'
        elif(message['response'] == 'Nombre'):
            response['param'] = 'nombreLibro'
        elif(message['response'] == 'ISBN'):
            response['param'] = 'idLibro'

    if(message['tag'] == 'recomendacion'):
        pass

    if(message['tag'] == 'prestamo'):
        pass

    if(message['tag'] == 'home'):
        response['message'] = message['response']
        response['tag'] = message['tag']

    return response



if __name__ == '__main__':
    app.run(debug = True)



## TAGS
# despedida
# busqueda
# busqueda_parametros
# busqueda_seleccion_param
# busqueda_seleccion_item - recomendacion
# prestamo
# home

## ESTADOS