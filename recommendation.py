import mysql.connector
import pandas as pd
from mlxtend.frequent_patterns import apriori, association_rules

def generarModelo():
    #Conexion con la base de datos
    miConexion = mysql.connector.connect(host='chatbot.czmuos7b0p9f.sa-east-1.rds.amazonaws.com', user= 'chatbotAD', passwd='chatbotAD', db='PrestamoBiblioteca' )
    cur = miConexion.cursor()
    sentencia = "SELECT a.idPrestamo,a.itemPrestamo,b.idLibro,b.nombreLibro FROM DETALLEPRESTAMO a INNER JOIN LIBRO b on a.idLibro=b.idLibro"
    cur.execute(sentencia)
    array_fetch=cur.fetchall()
    #Generar el dataframe
    df= pd.DataFrame(array_fetch,columns=['idPrestamo','itemPrestamo','idLibro','nombreLibro'])
    miConexion.close()
    #Colocamos una columna auxiliar
    df['Cantidad']=1
    pedidos_libros = (df.groupby(['idPrestamo','idLibro'])['Cantidad'].sum().unstack().reset_index().fillna(0).set_index('idPrestamo'))
    # Encoding the datasets 
    df_encoded = pedidos_libros.applymap(hot_encode) 
    df_prestados = df_encoded
    frq_items = apriori(df_prestados, min_support = 0.0004, use_colnames = True) 
    # Collecting the inferred rules in a dataframe 
    rules = association_rules(frq_items, metric ="lift",min_threshold = 1) 
    rules = rules.sort_values(['confidence', 'lift'], ascending =[False, False]) 
    rules["antecedents"] = rules["antecedents"].apply(lambda x: list(x)[0]).astype("unicode")
    rules["consequents"] = rules["consequents"].apply(lambda x: list(x)[0]).astype("unicode")
    asociaciones=rules.iloc[:,[0,1,4,5,6]]
    asociaciones.reset_index(inplace=True,drop=True)
    return asociaciones

def hot_encode(x): 
    if(x<= 0): 
        return 0
    if(x>= 1): 
        return 1

def getConsequents(codlibro):
    asociaciones=generarModelo()
    indice=asociaciones[asociaciones['antecedents']==codlibro].index.tolist()[0]
    #Conexion con la base de datos
    miConexion = mysql.connector.connect(host='chatbot.czmuos7b0p9f.sa-east-1.rds.amazonaws.com', user= 'chatbotAD', passwd='chatbotAD', db='PrestamoBiblioteca' )
    cur = miConexion.cursor()
    sentencia = "SELECT idLibro,nombreLibro,maxDias FROM LIBRO WHERE idLibro='{}'".format(asociaciones.iloc[indice,1])
    cur.execute(sentencia)
    array_fetch=cur.fetchall()
    return array_fetch
    # return array_fetch[0][0]

a = getConsequents('L-10')
print(a)