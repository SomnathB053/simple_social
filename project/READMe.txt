------------------------------------------------------------------
BLOGLITE
Created using Flask, VueJS and SQLite3
Folder Structure
code
├── application
│   ├── api.py
│   ├── cache.py
│   ├── config.py
│   ├── controllers.py
│   ├── db_func.py
│   ├── dbase.py
│   ├── models.py
│   ├── tasks.py
│   └── workers.py
├── db
│   └── db1.sqlite3
├── export_posts.csv
├── local_beat.sh
├── local_run.sh
├── local_setup.sh
├── local_workers.sh
├── main.py
├── req.txt
├── static
│   ├── imgs
│   │   └── assets
│   │       ├── logincover.png
│   │       ├── pexels-steve-johnson-1843717.jpg
│   │       └── user.png
│   └── spa.js
└── templates
    ├── index.html
    ├── register_user.html
    └── security
        └── login_user.html
--------------------------------------------------------------------
FOR LINUX/ WSL USERS:
> Extract all content from the zip folder
> Open the code folder and launch terminal
> Run the local_setup.sh file.
> Start the redis server: Execute> sudo service redis-server start
> Open a new terminal tab and run local_workers.sh.
> Open a new terminal tab and run local_beat.sh.
> If Mailhog installed run it for fake smtp server.
> Run the local_run.sh file. Open the link where the app is running (http://127.0.0.1:5000).

Note: The application is implemented with python developement server

