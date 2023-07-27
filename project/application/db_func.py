from application.dbase import db
from application.models import  Profiles, Posts, Relations
from flask_security import  current_user
from flask import jsonify
from application.cache import cache
import re
import html
from html.parser import HTMLParser

@cache.memoize(20)
def get_feed(username, page_no):
    followers = db.session.query(Relations).filter(Relations.follower == username).all()
    f =[]
    for i in followers:
        f.append(i.followed)         
    records = db.session.query(Posts).filter(Posts.username.in_(f)).order_by(Posts.timestamp.desc()).paginate(per_page= 5, page=page_no) 
    lis = [i.json_out() for i in records.items]
    print('COMPUTED NOT CACHED FEED')
    return jsonify(lis)

@cache.memoize(50)
def get_posts(username, page_no):
    records = db.session.query(Posts).filter(Posts.username == username).order_by(Posts.timestamp.desc()).paginate(per_page= 5, page=page_no) 
    total_pages = records.pages
    lis = [i.json_out() for i in records.items]
    print("COMPUTED NOT CACHED POSTS")
    
    return jsonify(lis)


@cache.memoize(50)
def get_profile(username):
    record = db.session.query(Profiles).filter(Profiles.username == username).one()
    print("COMPUTED NOT CACHED PROFILE")
    return record.json_out()

@cache.memoize(30)
def get_src_results(username, page_no):
    param = "^" + username + ".*"
    follows =  db.session.query(Relations).filter(Relations.follower == current_user.username).all()
    f= []
    for i in follows:
        f.append(i.followed)
    records = db.session.query(Profiles).filter(Profiles.username.op('REGEXP')(param)).paginate(per_page= 5, page=page_no)
    lis=[]
    for i in records.items:
        if i.username in f:
            lis.append({ 'user':i.username, 'status': 1})
        else:
            lis.append({ 'user':i.username, 'status': 0})
    print("COMPUTED NOT CACHED SEARCH")
    return lis

@cache.memoize(30)
def get_following(username):
    records = db.session.query(Relations).filter(Relations.follower == username).all()
    lis =[]
    for i in records:
        lis.append(i.followed)
    print("COMPUTED NOT CACHED FOLLOWING")
    return lis


@cache.memoize(30)
def get_follower(username):
    follows =  db.session.query(Relations).filter(Relations.follower == current_user.username).all()
    f= []
    for i in follows:
        f.append(i.followed)

    records = db.session.query(Relations).filter(Relations.followed == username).all()
    lis=[]
    for i in records:
        if i.follower in f:
            lis.append({ 'user':i.follower, 'status': 1})
        else:
            lis.append({ 'user':i.follower, 'status': 0})
    print("COMPUTED NOT CACHED FOLLOWER")
    return lis    


#ALLOWED = ['<p>','</p>','<b>','</b>','<i>','</i>','<u>','</u>','<em>','</em>','<strong>','</strong>', '<blockquote>','</blockquote>','<table>','</table>','<tr>','</tr>','<td>','</td>', '<a>', '</a>']

ALLOWED = ['p','b','i','u','em','strong','blockquote','table','tr','td','a', 'body', 'br']

user_string  = ''
class MyHTMLParser(HTMLParser):
    def handle_starttag(self, tag, attrs):
        global user_string
        if not tag in ALLOWED:
            fulltag= HTMLParser.get_starttag_text(self)
            user_string = user_string.replace(fulltag, html.escape(fulltag))
    def handle_endtag(self, tag):
        global user_string
        if not tag in ALLOWED:
            user_string = re.sub('</'+tag+'[^{<,>}]*>', html.escape('</'+tag+'>'), user_string)

def input_cleaner(string):
    global user_string
    user_string = string
    parser = MyHTMLParser()
    parser.feed(user_string)
    return user_string
