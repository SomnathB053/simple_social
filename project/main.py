#from app import create_app
from flask import Flask, render_template, request
from flask_security import Security, SQLAlchemySessionUserDatastore, hash_password
from flask_restful import Api
from flask_cors import CORS
from sqlalchemy.exc import IntegrityError
from application.config import LocalDevelopmentConfig
from application.dbase import db
from application import workers
from application.models import User, Role, Profiles
from application.api import postAPI, authAPI, feedAPI, profileAPI, searchAPI, followingAPI, followersAPI, hookAPI, exportAPI
from application.cache import cache

app=None
api=None
uds=None
celery=None


def create_app():
    app = Flask(__name__, template_folder="templates")
    app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)
    api = Api(app)
    app.app_context().push()
    user_datastore= SQLAlchemySessionUserDatastore(db.session, User,Role)
    security = Security(app, user_datastore)
    cors= CORS(app)
    app.app_context().push()
    celery = workers.celery
    celery.conf.update(
		broker_url = app.config["CELERY_BROKER_URL"],
		result_backend = app.config["CELERY_RESULT_BACKEND"],
		enable_utc = True,
		timezone = 'Asia/Calcutta'
	)
    celery.Task = workers.ContextTask
    app.app_context().push()
    cache.init_app(app)
    app.app_context().push()
    return app,api, user_datastore, celery

app,api, uds, celery = create_app()

from application.controllers import *

api.add_resource(authAPI, "/api/user")
api.add_resource(postAPI, "/api/posts/edit/<id>", "/api/posts/<username>", "/api/posts/delete/<id>", "/api/posts")
api.add_resource(feedAPI, "/api/feed/<username>" )
api.add_resource(profileAPI, "/api/profile/<username>", "/api/profile", "/api/profile/edit/<user>")
api.add_resource(searchAPI, "/api/src/<username>")
api.add_resource(followingAPI, "/api/following/<username>", "/api/following/", "/api/following/<u1>/<u2>")
api.add_resource(followersAPI, "/api/followers/<username>")
api.add_resource(hookAPI, "/api/add_hook")
api.add_resource(exportAPI, "/api/exportfor/<duration>")




@app.route("/register", methods= [ "GET", "POST"] )
def register():
    if request.method == "GET":
        return render_template("register_user.html")   
    if request.method == "POST":
        try:
            print("received")
            uds.create_user( email= request.form.get('email'), password= hash_password(request.form.get('password')), username= request.form.get('username'))
            record = Profiles( username= request.form.get('username'), follower_count =0, following_count=0, posts_count=0, dp = "/static/imgs/assets/user.png", location= "Internet", about='New to bloglite!')
            db.session.add(record)
            db.session.commit()
            return {'code': 200, 'message': 'Registered!'}
        except IntegrityError as error:
            err = str(error).split('\n')[0].split('auth.')[1]
            db.session.rollback()
            if err == 'username':
                return {'code': 400, 'message': 'Username already in use'}
            elif err == 'email':
                return {'code': 400, 'message': 'Email already in use'}
            else:
                return {'code': 400, 'message': error.split('\n')[0]}
        




if __name__ == '__main__':
    app.debug=True
    app.run()



