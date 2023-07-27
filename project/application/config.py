import os

basedir = os.path.abspath(os.path.dirname(__file__))

class Config():
    WTF_CSRF_ENABLED= False
    DEBUG = False
    SQLITE_DB_DIR = None
    SQLALCHEMY_DATABASE_URI = None
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECURITY_TOKEN_AUTHENTICATION_HEADER = "Authentication-Token"
    CELERY_BROKER_URL = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND = "redis://localhost:6379/2"
    CACHE_TYPE = "RedisCache"
    CACHE_REDIS_HOST = "localhost"
    CACHE_REDIS_PORT = 6379



class LocalDevelopmentConfig(Config):
    DEBUG=True
    ROOT = basedir
    SQLITE_DB_DIR = os.path.join(basedir, "../db")
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(SQLITE_DB_DIR, "db.sqlite3")
    SECRET_KEY= "254cfvfdvwr34t4df34rw"
    SECURITY_PASSWORD_HASH= "bcrypt"
    SECURITY_PASSWORD_SALT = "TESTINkmsdkfmdcmdf"
    SECURITY_REGISTERABLE=False
    SECURITY_SEND_REGISTER_EMAIL=False
    SECURITY_UNAUTHORIZED_VIEW=None
    SECURITY_LOGIN_USER_TEMPLATE= "security/login_user.html"
    UPLOAD_FOLDER= os.path.join(basedir,"../static/imgs")
    CELERY_BROKER_URL = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND = "redis://localhost:6379/2"
    REDIS_URL = "redis://localhost:6379"
    CACHE_TYPE = "RedisCache"
    CACHE_REDIS_HOST = "localhost"
    CACHE_REDIS_PORT = 6379

class mailConfig():
    SMTP_SERVER_HOST = "localhost"
    SMTP_SERVER_PORT = "1025"
    SENDER_ADDRESS = "support@bloglite.com"
    SENDER_PASSWORD = ""
