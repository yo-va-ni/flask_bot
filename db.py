import mysql.connector
import pandas as pd

miConexion = mysql.connector.connect(host='chatbot.czmuos7b0p9f.sa-east-1.rds.amazonaws.com', user= 'chatbotAD', passwd='chatbotAD', db='PrestamoBiblioteca' )
cur = miConexion.cursor()
sentencia = "SELECT a.itemPrestamo,a.idPrestamo,a.idEstudiante,b.idLibro,b.nombreLibro FROM DETALLEPRESTAMO a INNER JOIN LIBRO b on a.idLibro=b.idLibro"
cur.execute(sentencia)
array_fetch=cur.fetchall()
df = pd.DataFrame(array_fetch,columns=['itemPrestamo','idPrestamo','idEstudiante','idLibro','nombreLibro'])
miConexion.close()
print(df)

