from celery.schedules import crontab
import requests
import csv 
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email import encoders
import smtplib
from datetime import datetime, timedelta
from jinja2 import  Environment, FileSystemLoader

from application.workers import celery
from application.dbase import db
from application.models import User, Posts, Profiles
from application.config import mailConfig




def format_message(template_file, data):
    environment = Environment(loader=FileSystemLoader("templates/"))
    template = environment.get_template(template_file)
    return template.render(data)

@celery.task()
def send_email():
    ts = datetime.utcnow()
    prev_ts = ts - timedelta(weeks = 4)
    ts_millis = prev_ts.timestamp()*1000
    rec_u = db.session.query(User).all()
    for r in rec_u:
        profile = db.session.query(Profiles).filter(Profiles.username == r.username).one()     
        record = db.session.query(Posts).filter(Posts.username == r.username).filter(Posts.timestamp > ts_millis).order_by(Posts.timestamp.desc()).all()
        data = { "user" : r.username, "n_posts": profile.posts_count, "n_followers": profile.follower_count, "n_followings": profile.following_count, "n_newposts": len(record), "records": record}
        msg = MIMEMultipart()
        msg["From"] = mailConfig.SENDER_ADDRESS
        msg["To"] = r.email
        msg["Subject"] ="Monthly report"
        _msg = format_message("email.html", data=data)
        msg.attach(MIMEText(_msg, "html"))
        s = smtplib.SMTP(host= mailConfig.SMTP_SERVER_HOST, port= mailConfig.SMTP_SERVER_PORT)
        s.login(mailConfig.SENDER_ADDRESS,mailConfig.SENDER_PASSWORD)
        s.send_message(msg)
        s.quit()
        print("Monthly Email sent to ", r.email)

@celery.task()
def export_csv(user, email, duration):
    ts_millis =0
    if duration == 'one':
        ts = datetime.utcnow()
        prev_ts = ts - timedelta(weeks = 4)
        ts_millis = prev_ts.timestamp()*1000
    elif duration == 'six':
        ts = datetime.utcnow()
        prev_ts = ts - timedelta(weeks = 24)
        ts_millis = prev_ts.timestamp()*1000
    elif duration == 'all':
        pass
    record = db.session.query(Posts).filter(Posts.username == user).filter(Posts.timestamp > ts_millis).order_by(Posts.timestamp.desc()).all()
    f = open('export_posts.csv', 'w')
    out = csv.writer(f)
    out.writerow(['caption', 'body', 'timestamp'])
    for item in record:
        out.writerow([item.caption, item.body, item.timestamp])
    f.close()
    msg = MIMEMultipart()
    msg["From"] = mailConfig.SENDER_ADDRESS
    msg["To"] = email
    msg["Subject"] ="Export CSV"
    msg.attach(MIMEText("CSV for posts data", "html"))
    f = open('export_posts.csv', 'rb')
    part = MIMEBase("application", "octet-stream")
    part.set_payload(f.read())
    encoders.encode_base64(part)
    part.add_header('Content-Disposition', "attachment; filename= export-trackers.csv" )
    msg.attach(part)
    s = smtplib.SMTP(host= mailConfig.SMTP_SERVER_HOST, port= mailConfig.SMTP_SERVER_PORT)
    s.login(mailConfig.SENDER_ADDRESS,mailConfig.SENDER_PASSWORD)
    s.send_message(msg)
    s.quit()
    print("Export csv email sent to ", email)

@celery.task()
def reminder():
    record = db.session.query(User).filter(User.whooks != None).all()
    print(record)
    for i in record:
        if i.log_flag != 1:
            url = i.whooks
            payload = { 'text': 'Wanna check out what others are thinking?'}
            r = requests.post(url, json=payload)
            print("reminder sent to " ,i.username)

@celery.task()
def flag_clear():
    record = db.session.query(User).all()
    for i in record:
        i.log_flag = 0
    print("All notif flags cleared")
    db.session.commit()




@celery.on_after_finalize.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(
        crontab(minute=30, hour=18), reminder.s())
    sender.add_periodic_task(
        crontab(minute=0, hour=0), flag_clear.s())
    sender.add_periodic_task(
        crontab(minute=0, hour=12, day_of_month= '30'), send_email.s())