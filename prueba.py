import spacy
import json
import random

nlp = spacy.load("es_core_news_md")

def get_response(user_input = ''):
    with open('./data/data.json') as json_file:
        data = json.load(json_file)
        response = ''
        mini = 0
        for key in data.keys():
            statement1 = nlp(key.upper())
            statement2 = nlp(user_input.upper())
            aux = statement1.similarity(statement2)
            if aux > mini:
                mini = aux
                response = random.choice(data[key]['responses'])
                # print('s1: {}\ns2: {}\nsimilarity: {}'.format(key, user_input, aux))
            # elif aux > 0.5:
            #     return random.choice('{} ({})'.format(data[key], aux))
        if mini > 0:
            print('{} - {}'.format(response, mini))
        else:
            print('Lo siento, no entiendo lo que dices')

while True:
    user = input('You: ')
    print('Bot: {}'.format(get_response(user)))