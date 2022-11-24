import requests
urlpy="https://article-site-project.herokuapp.com/2/"
urllog="https://lit-headland-94940.herokuapp.com/login"
urlnode="https://lit-headland-94940.herokuapp.com/articles/1"

auth={
    'username':"Admin",
    'password':'123456'
}

with requests.session() as s:

    print(s.post(urlpy,data=auth).text)
