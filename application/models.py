from .dbase import db
from flask_security import UserMixin, RoleMixin

roles_users = db.Table('roles_users', db.Column('user_id',db.Integer(),db.ForeignKey('auth.id')),db.Column('role_id',db.Integer(),db.ForeignKey('role.id')))

class User(db.Model,UserMixin):
	__tablename__ = 'auth'
	id =db.Column(db.Integer, autoincrement=True, primary_key=True)
	username= db.Column(db.String, unique=True)
	email = db.Column(db.String, unique=True)	
	password= db.Column(db.String(255))
	fs_uniquifier= db.Column(db.String(255), unique=True, nullable=False)  
	active=db.Column(db.Boolean()) 	
	whooks = db.Column(db.String)
	log_flag =db.Column(db.Integer)
	roles =db.relationship('Role', secondary=roles_users, backref=db.backref('users', lazy='dynamic'))
	

class Role(db.Model,RoleMixin):
	__tablename__ = 'role'
	id =db.Column(db.Integer, autoincrement=True, primary_key=True)
	name= db.Column(db.String, unique=True)
	description = db.Column(db.String(255))	

class Profiles(db.Model):
    __tablename__ = 'profiles'
    id = db.Column(db.Integer, autoincrement=True, primary_key=True )
    name = db.Column(db.String)
    dp = db.Column(db.String )
    username = db.Column(db.String, db.ForeignKey("auth.username"), unique =True)
    location = db.Column(db.String)
    about = db.Column(db.String)
    follower_count = db.Column(db.Integer)
    following_count =db.Column(db.Integer)
    posts_count = db.Column(db.Integer)
    def json_out(self):
        return {
            'id' : self.id ,
            'name' : self.name ,
            'dp' : self.dp ,
            'username' : self.username ,
            'location' : self.location ,
            'about':self.about,
            'follower_count' : self.follower_count ,
            'following_count' : self.following_count ,
            'posts_count' : self.posts_count ,   
        }

class Posts(db.Model):
    __tablename__ = 'posts'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, db.ForeignKey("auth.username"))
    caption = db.Column(db.String)
    body = db.Column(db.String)
    image = db.Column(db.String)
    timestamp = db.Column(db.String)
    def json_out(self):
        return {
			'id': self.id,
			'username':  self.username, 
            'caption': self.caption,
			'body': self.body, 
			'image': self.image, 
            'timestamp': self.timestamp
			
		}

class Relations(db.Model):
     __tablename__ = 'relations'
     __table_args__ = (
        db.UniqueConstraint('follower', 'followed', name='unique_component_commit'),
    )
     id = db.Column(db.Integer, primary_key=True)
     follower = db.Column(db.String, db.ForeignKey('auth.username'))
     followed = db.Column(db.String, db.ForeignKey('auth.username'))