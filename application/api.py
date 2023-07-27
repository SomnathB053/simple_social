from flask_restful import Resource
from flask_restful import  request
from flask_security import  auth_required, current_user
from werkzeug.utils import secure_filename
from flask import Response
from time import perf_counter_ns, strftime, time
import os
from math import ceil
from application.dbase import db
from application.models import  Profiles, Posts, User, Relations
from application.config import LocalDevelopmentConfig
from application import tasks
from application.db_func import *





class authAPI(Resource):
    @auth_required("token")
    def get(self):
       return { "username" :current_user.username}

class postAPI(Resource):
    @auth_required("token")
    def get(self, username):
        args = request.args
        page_no = args.get("page",default=1, type=int)
        try:
            start  = perf_counter_ns()
            posts = get_posts(username, page_no)
            stop = perf_counter_ns()
            print('Posts - retrieving time: ', stop - start)
            return posts
        except:
            return None
    @auth_required("token")
    def post(self):
        try:
            file = request.files['image']
            filename = secure_filename(file.filename)
        except:
            file = False
        ALLOWED_EXTENSIONS = { 'png', 'jpg', 'jpeg'}
        if file and '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS:
            new_filename = strftime("%Y%m%d-%H%M%S_"+current_user.username+ '.'+ filename.rsplit('.', 1)[1].lower())
            filepath = os.path.join(LocalDevelopmentConfig.UPLOAD_FOLDER , new_filename)
            file.save(filepath)
            record = Posts(
            username = current_user.username,
            caption= input_cleaner(request.form.get('caption')),
            body = input_cleaner(request.form.get('body')),
            image = "/static/imgs/" + new_filename,
            #timestamp = request.form.get('timestamp')   
            timestamp = int(time() * 1000)      
                )
            db.session.add(record)
            db.session.commit()
            no_of_page =0
            profile_patch = db.session.query(Profiles).filter(Profiles.username == current_user.username).one()
            profile_patch.posts_count = profile_patch.posts_count+1
            no_of_page = ceil(profile_patch.posts_count/5) +1
            db.session.commit()
            for i in range(1, no_of_page):
                cache.delete_memoized(get_posts, current_user.username, i)
            cache.delete_memoized(get_profile, current_user.username)
            print("POST post successful")
            return{"code": 200}
        else:
            record = Posts(    
            username = current_user.username,
            caption= input_cleaner(request.form.get('caption')),
            body = input_cleaner(request.form.get('body')),
            #timestamp = request.form.get('timestamp')
            timestamp = int(time() * 1000)
              )
            db.session.add(record)
            db.session.commit()
            no_of_page =0
            profile_patch = db.session.query(Profiles).filter(Profiles.username == current_user.username).one()
            profile_patch.posts_count = profile_patch.posts_count+1
            no_of_page = ceil(profile_patch.posts_count/5) +1
            db.session.commit()
            for i in range(1, no_of_page):
                cache.delete_memoized(get_posts, current_user.username, i)
            cache.delete_memoized(get_profile, current_user.username)
            print("POST post successful")
            return{"code": 200}
    @auth_required("token")
    def patch(self, id):
        try:
            file = request.files['image']
            filename = secure_filename(file.filename)
        except:
            file = False
        args = request.args
        flag = args.get("delete_image",default=False, type=bool)
        ALLOWED_EXTENSIONS = { 'png', 'jpg', 'jpeg'}
        
        record = db.session.query(Posts).filter(Posts.id == id).one()
        if record.username == current_user.username:
            if file and '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS:
                new_filename = strftime("%Y%m%d-%H%M%S_"+current_user.username+ '.'+ filename.rsplit('.', 1)[1].lower())
                filepath = os.path.join(LocalDevelopmentConfig.UPLOAD_FOLDER , new_filename)
                file.save(filepath)        
                record.caption =  input_cleaner(request.form.get('caption'))
                record.body = input_cleaner(request.form.get('body'))
                record.image = "/static/imgs/"+new_filename
                record.timestamp = int(time() * 1000)
                db.session.commit()
                cache.delete_memoized(get_posts)
                cache.delete_memoized(get_profile, current_user.username)
                print("PATCH post successful")
                return {"code": 200}
            else:
                record.caption =  input_cleaner(request.form.get('caption'))
                record.body = input_cleaner(request.form.get('body'))
                record.timestamp = int(time() * 1000)
                if flag == True:
                    os.remove(os.path.join(LocalDevelopmentConfig.UPLOAD_FOLDER, record.image.split('/')[-1]))
                    record.image = None
                db.session.commit() 
                cache.delete_memoized(get_posts)
                cache.delete_memoized(get_profile, current_user.username)
                print("PATCH post successful")
                return{"code": 200}
        else:
            return Response("Illegal action. Cannot edit others posts", status= 400)
    @auth_required("token")
    def delete(self, id):
        record = db.session.query(Posts).filter(Posts.id == id).one()
        if record.username == current_user.username:
            if record.image != None:
                os.remove(os.path.join(LocalDevelopmentConfig.UPLOAD_FOLDER, record.image.split('/')[-1]))
            db.session.delete(record)
            db.session.commit()
            no_of_page =0
            profile_patch = db.session.query(Profiles).filter(Profiles.username == current_user.username).one()
            profile_patch.posts_count = profile_patch.posts_count - 1
            no_of_page = ceil(profile_patch.posts_count/5) +1
            db.session.commit()
            for i in range(1, no_of_page):
                cache.delete_memoized(get_posts, current_user.username, i)
            cache.delete_memoized(get_profile, current_user.username)
            print("DELETE post successful")
            return{"code": 200}
        else:
            return Response("Illegal action. Cannot delete others post", status= 400)


class profileAPI(Resource):
    @auth_required("token")
    def get(self,username):
        start = perf_counter_ns()
        profile = get_profile(username)
        stop = perf_counter_ns()
        print('Profile - retrieving time: ', stop - start)
        print(profile)
        return profile
    @auth_required("token")
    def patch(self,user):
        record = db.session.query(Profiles).filter(Profiles.username == user).one()
        if user == current_user.username:
            args = request.args
            flag = args.get("delete_image",default=False, type=bool)
            try:
                file = request.files['image']
                filename = secure_filename(file.filename)
            except:
                file = False
            ALLOWED_EXTENSIONS = { 'png', 'jpg', 'jpeg'}
            
            if file and '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS:
                new_filename = current_user.username+ '.'+ filename.rsplit('.', 1)[1].lower()
                filepath = os.path.join(LocalDevelopmentConfig.UPLOAD_FOLDER , new_filename)
                file.save(filepath)
                
                record.name =  input_cleaner(request.form.get('name'))
                record.about = input_cleaner(request.form.get('about'))
                record.location = input_cleaner(request.form.get('location'))
                record.dp = "/static/imgs/"+new_filename
                db.session.commit()
                cache.delete_memoized(get_profile, current_user.username)
                print("PATCH profile successful")
                return{"code": 200}
            else:
                record.name =  input_cleaner(request.form.get('name'))
                record.about = input_cleaner(request.form.get('about'))
                record.location = input_cleaner(request.form.get('location'))
                if flag == True:
                    os.remove(os.path.join(LocalDevelopmentConfig.UPLOAD_FOLDER, record.dp.split('/')[-1]))
                    print('resetting dp')
                    record.dp = '/static/imgs/assets/user.png'
                db.session.commit()
                cache.delete_memoized(get_profile, current_user.username)     
                print("PATCH profile successful")   
            return{"code": 200}
        else:
            return Response("Illegal action. Cannot edit others profile", status= 400)
    @auth_required("token")
    def delete(self,username):
        record = db.session.query(Profiles).filter(Profiles.username == username).one()
        if username == current_user.username:
            if record.dp != None:
                os.remove(os.path.join(LocalDevelopmentConfig.UPLOAD_FOLDER, record.dp.split('/')[-1]))
            db.session.delete(record)
            db.session.commit()
            cache.delete_memoized(get_profile, current_user.username)
            print("DELETE post successful")
            return{"code": 200}
        else:
            return Response("Illegal action. Cannot edit others profile", status= 400)

class feedAPI(Resource):
    @auth_required("token")
    def get(self,username):
        if username ==  current_user.username:
            args = request.args
            page_no = args.get("page",default=1, type=int)
            try:
                start =  perf_counter_ns()
                feed = get_feed(username, page_no)
                stop =  perf_counter_ns()
                print('Feed- Retrieving Time ', stop - start)
                return feed
            except:
                return Response("Could not retrieve feed", status = 404)
        else:
            return Response("Illegal action. Cannot fetch others feed", status= 400)
    

class searchAPI(Resource):
    @auth_required("token")
    def get(self,username):
        args = request.args
        page_no = args.get("page",default=1, type=int)
        try:
            start = perf_counter_ns()
            src = get_src_results(username, page_no)
            stop =  perf_counter_ns()
            print('Search- Retrieving Time ', stop - start)
            return src
        except: 
            return None
    
class followingAPI(Resource):
    @auth_required("token")
    def get(self, username):
        start = perf_counter_ns()
        following = get_following(username)
        stop =  perf_counter_ns()
        print('Following- Retrieving Time ', stop - start)
        return following
    @auth_required("token")
    def post(self):
        req = request.get_json()
        if current_user.username == req["follower"]:
            record = Relations(          
                follower = req["follower"],
                followed = req["followed"]
            )
            db.session.add(record)
            db.session.commit()
            profile_patch = db.session.query(Profiles).filter(Profiles.username == req["follower"]).one()
            profile_patch.following_count = profile_patch.following_count+1
            db.session.commit()
            profile_patch = db.session.query(Profiles).filter(Profiles.username == req["followed"]).one()
            profile_patch.follower_count = profile_patch.follower_count+1
            db.session.commit()
            cache.delete_memoized(get_following, current_user.username)
            cache.delete_memoized(get_profile, current_user.username)
            for i in range(1,11):
                cache.delete_memoized(get_feed,current_user.username, i)
            print("POST following successful")
            return {"code": 200}
        else:
            return Response("Illegal action. Cannot change others followings", status= 400)
    
    @auth_required("token")
    def delete(self, u1, u2):
        if current_user.username == u1:
            record = db.session.query(Relations).filter(Relations.follower == u1).filter(Relations.followed == u2).one()
            db.session.delete(record)
            db.session.commit()
            profile_patch = db.session.query(Profiles).filter(Profiles.username == u1).one()
            profile_patch.following_count = profile_patch.following_count-1
            db.session.commit()
            profile_patch = db.session.query(Profiles).filter(Profiles.username == u2).one()
            profile_patch.follower_count = profile_patch.follower_count-1
            db.session.commit()
            cache.delete_memoized(get_following, current_user.username)
            cache.delete_memoized(get_profile, current_user.username)
            for i in range(1,11):
                cache.delete_memoized(get_feed,current_user.username, i)
            '''try:
                i = 1
                while(i>0):
                    cache.delete_memoized(get_feed,current_user.username, i)
            except:
                pass
            finally:'''
            print("DELETE following successful")
            return { "code": 200}
        else:
            return Response("Illegal action. Cannot change others followings", status= 400)

class followersAPI(Resource):
    @auth_required("token")
    def get(self, username):
        start = perf_counter_ns()
        follower = get_follower(username)
        stop =  perf_counter_ns()
        print('Follower- Retrieving Time ', stop - start)
        return follower
    
class hookAPI(Resource):
    @auth_required("token")
    def get(self):
        records = db.session.query(User).filter(User.username == current_user.username).one()
        return { "hook": records.whooks}
    @auth_required("token")
    def post(self):
        req = request.get_json()
        record = db.session.query(User).filter(User.username == current_user.username).one()
        record.whooks = input_cleaner(req["hook"])
        db.session.commit()
        print("POST webhook successful")
        return {"code": 200}

class exportAPI(Resource):
    @auth_required("token")
    def get(self, duration):    
        print("intask")
        tasks.export_csv(current_user.username, current_user.email, duration)
        return {'code': 200, 'message': 'Exported! check your mail.'}