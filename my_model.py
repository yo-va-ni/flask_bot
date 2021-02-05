import spacy
import json
import random

nlp = spacy.load("es_core_news_md")

def get_response(user_input = ''):
    with open('./data/data.json') as json_file:
        data = json.load(json_file)
        for key in data.keys():
            statement1 = nlp(key.upper())
            statement2 = nlp(user_input.upper())
            aux = statement1.similarity(statement2)
            # print('\ns1: {}\ns2: {}\nsim: {}'.format(key, user_input, aux))
            if aux > 0.70:
                return '{}'.format(random.choice(data[key]))
                # print('s1: {}\ns2: {}\nsimilarity: {}'.format(key, user_input, aux))
            # elif aux > 0.5:
            #     return random.choice('{} ({})'.format(data[key], aux))
        return 'Lo siento, no entiendo lo que decis'

""" user_in = ''
while user_in != 'q':
    user_in = input('You: ')
    response = get_response(user_in)
    print('Bot: {}'.format(response)) """