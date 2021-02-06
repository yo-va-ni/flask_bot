a = [1,2,3]
c = {'a': 5, 'b':6}

try:
    d = c.keys()
    print(d)
    b = a.keys()
    print(b)
except:
    print(a[0])