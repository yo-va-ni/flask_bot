import spacy
import json
import random

nlp = spacy.load("es_core_news_md")

def get_response(user_input = ''):
    with open('./data/data.json') as json_file:
        data = json.load(json_file)
        response = {'tag': None, 'response': ''}
        mini = 0
        for key in data.keys():
            statement1 = nlp(key.upper())
            statement2 = nlp(user_input.upper())
            aux = statement1.similarity(statement2)
            if aux > mini:
                mini = aux
                try:
                    response['tag'] = data[key]['tag']
                    response['response'] = random.choice(data[key]['responses'])
                except:
                    response['tag'] = 'home'
                    response['response'] = random.choice(data[key])

                # print('s1: {}\ns2: {}\nsimilarity: {}'.format(key, user_input, aux))
            # elif aux > 0.5:
            #     return random.choice('{} ({})'.format(data[key], aux))
        if mini > 0:
            # return '{} - {}'.format(response, mini)
            return response
        no_tag_response = {'tag': 'home', 'response': 'Lo siento, no entiendo lo que dices'}
        return no_tag_response
