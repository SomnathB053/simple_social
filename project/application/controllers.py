from flask import render_template, redirect
from flask_security import  current_user,  login_required
from flask import current_app as app
from application.dbase import db
from application.models import User


@app.route("/", methods = ["GET"])
def check():
		if current_user.is_authenticated:
			record = db.session.query(User).filter(User.username == current_user.username).one()
			record.log_flag = 1
			db.session.commit()
			return render_template("index.html")
		else:
			return redirect('/login')
		

