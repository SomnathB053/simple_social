#! /bin/sh
echo "======================================================================"
echo "BlogLite app	|	Flask App"
echo "----------------------------------------------------------------------"
if [ -d ".env" ];
then
    echo "Enabling virtual env"
else
    echo "No Virtual env. Please run local_setup.sh first"
    exit N
fi

# Activate virtual env
. .env/bin/activate
export ENV=development
echo "Running on default python server"
python main.py
deactivate

