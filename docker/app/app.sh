#!/usr/bin/env bash

set -e

# Wait for the database to be ready
./wait-for-it.sh 0.0.0.0:5432 -t 0

python3 manage.py db upgrade
uwsgi --ini wsgi.ini
