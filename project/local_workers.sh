#! /bin/sh
echo "======================================================================"
echo "BlogLite	|	Celery Workers"
echo "----------------------------------------------------------------------"
if [ -d ".env" ];
then
    echo "Enabling virtual env"
else
    echo "No Virtual env. Please run setup.sh first"
    exit N
fi

. .env/bin/activate
export ENV=development
celery -A main.celery worker -l info
deactivate
