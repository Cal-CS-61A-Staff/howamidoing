""" This file is a sample implementation of OAuth with OK.
If you are running OK Locally, make sure you are using different
hostnames for the two apps (otherwise Flask will clobber your session)
"""
import os
import csv
import urllib.parse
from werkzeug import security

from flask import Flask, redirect, url_for, session, request, jsonify, abort, send_from_directory
from flask_oauthlib.client import OAuth
import requests

from .secrets import SECRET

CONSUMER_KEY = "61a-grade-view"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
GRADES_PATH = os.path.join(BASE_DIR, "../cached/grades.csv")


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
        return send_from_directory("static", "index.html")

    @app.route('/query/')
    def query():
        try:
            if 'dev_token' in session:
                ret = remote.get('user', token=session['dev_token'])
                email = ret.data['data']['email']
                email = "some.random@berkeley.edu"
                with open(GRADES_PATH) as grades:
                    reader = csv.reader(grades)
                    header = next(reader)
                    for row in reader:
                        if row[0] == email:
                            return jsonify({
                                "success": True,
                                "header": header,
                                "data": row,
                            })
            else:
                print("fail")

        except Exception as e:
            print(e)
            pass
        return jsonify({
            "success": False,
        })

    @app.route('/login/')
    def login():
        print(url_for('authorized', _external=True))
        return remote.authorize(callback=url_for('authorized', _external=True))

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


app = Flask(__name__, static_url_path="", static_folder="static")
app.secret_key = SECRET
create_client(app)


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000)
