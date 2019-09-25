import json
import os
import csv
import urllib.parse
from werkzeug import security

from flask import Flask, redirect, url_for, session, request, jsonify, render_template
from flask_oauthlib.client import OAuth
import requests

from secrets import SECRET

CONSUMER_KEY = "61a-grade-view"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
GRADES_PATH = os.path.join(BASE_DIR, "grades.csv")

AUTHORIZED_ROLES = ["staff", "instructor"]


def get_course_code():
    try:
        with open("static/config/courseList.json") as config:
            data = json.load(config)
            host = request.headers['Host']
            return data.get(host, host)
    except FileNotFoundError:
        return "eecs16a"


def is_staff(remote):
    ret = remote.get('user', token=session['dev_token'])
    for course in ret.data["data"]["participations"]:
        if course["role"] not in AUTHORIZED_ROLES:
            continue
        if course["course"]["display_name"].lower().replace(" ", "") != get_course_code():
            continue
        return True
    return False


def create_client(app):
    oauth = OAuth(app)

    remote = oauth.remote_app(
        'ok-server',  # Server Name
        consumer_key=CONSUMER_KEY,
        consumer_secret=SECRET,
        request_token_params={'scope': 'all',
                              'state': lambda: security.gen_salt(10)},
        base_url='https://okpy.org/api/v3/',
        request_token_url=None,
        access_token_method='POST',
        access_token_url='https://okpy.org/oauth/token',
        authorize_url='https://okpy.org/oauth/authorize'
    )

    def check_req(uri, headers, body):
        """ Add access_token to the URL Request. """
        if 'access_token' not in uri and session.get('dev_token'):
            params = {'access_token': session.get('dev_token')[0]}
            url_parts = list(urllib.parse.urlparse(uri))
            query = dict(urllib.parse.parse_qsl(url_parts[4]))
            query.update(params)

            url_parts[4] = urllib.parse.urlencode(query)
            uri = urllib.parse.urlunparse(url_parts)
        return uri, headers, body

    remote.pre_request = check_req

    @app.route("/")
    def index():
        return render_template("index.html", courseCode=get_course_code())

    @app.route('/query/')
    def query():
        try:
            if 'dev_token' in session:
                ret = remote.get('user', token=session['dev_token'])

                email = ret.data['data']['email']

                target = request.args.get("target", None)

                if is_staff(remote):
                    if target:
                        email = target
                    else:
                        return jsonify({
                            "success": True,
                            "isStaff": True,
                            "allStudents": list(CACHED_ALL_STUDENTS.values()),
                            "email": ret.data['data']['email'],
                            "name": ret.data['data']['name'],
                        })

                if email in CACHED_CSV:
                    return jsonify({
                        "success": True,
                        "header": CSV_HEADER,
                        "data": CACHED_CSV[email],
                        "email": CACHED_ALL_STUDENTS[email]["Email"],
                        "name": CACHED_ALL_STUDENTS[email]["Name"],
                        "SID": CACHED_ALL_STUDENTS[email]["SID"],
                    })
            else:
                return jsonify({
                    "success": False,
                    "retry": True,
                })

        except Exception as e:
            pass
        return jsonify({
            "success": False,
            "retry": False,
        })

    @app.route('/login/')
    def login():
        session.pop('dev_token', None)
        return remote.authorize(callback=url_for('authorized', _external=True, _scheme='https'))

    @app.route('/logout/')
    def logout():
        session.pop('dev_token', None)
        return redirect(url_for('query'))

    @app.route('/authorized/')
    def authorized():
        resp = remote.authorized_response()
        if resp is None:
            return 'Access denied: error=%s' % (
                request.args['error']
            )
        if isinstance(resp, dict) and 'access_token' in resp:
            session['dev_token'] = (resp['access_token'], '')
        return redirect("/")

    @app.route('/user/')
    def client_method():
        token = session['dev_token'][0]
        r = requests.get('http://localhost:5000/api/v3/user/?access_token={}'.format(token))
        r.raise_for_status()
        return jsonify(r.json())

    @remote.tokengetter
    def get_oauth_token():
        return session.get('dev_token')

    return remote


app = Flask(__name__, static_url_path="", static_folder="static", template_folder="static")
app.secret_key = SECRET
create_client(app)

CACHED_CSV = {}
with open(GRADES_PATH) as grades:
    reader = csv.reader(grades)
    CSV_HEADER = next(reader)
    for row in reader:
        CACHED_CSV[row[0]] = row

CACHED_ALL_STUDENTS = {}
for email in CACHED_CSV:
    student = {}
    for i, header in enumerate(CSV_HEADER):
        if header in ["SID", "Name", "Email"]:
            student[header] = CACHED_CSV[email][i]
    CACHED_ALL_STUDENTS[email] = student

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000)
