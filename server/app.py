import json
import os
import csv
import urllib.parse
from io import StringIO
from contextlib import contextmanager

from werkzeug import security

from flask import (
    Flask,
    redirect,
    url_for,
    session,
    request,
    jsonify,
    render_template,
    Response,
)
from flask_oauthlib.client import OAuth
import requests
from sqlalchemy import create_engine

from secrets import SECRET

CONSUMER_KEY = "61a-grade-view"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
GRADES_PATH = os.path.join(BASE_DIR, "grades.csv")

AUTHORIZED_ROLES = ["staff", "instructor"]


if __name__ == "__main__":
    engine = create_engine("mysql://localhost/statuscheck")
else:
    engine = create_engine(os.getenv("DATABASE_URL"))


@contextmanager
def connect_db():
    with engine.connect() as conn:

        def db(*args):
            try:
                if isinstance(args[1][0], str):
                    raise TypeError
            except (IndexError, TypeError):
                return conn.execute(*args)
            else:
                for data in args[1]:
                    conn.execute(args[0], data, *args[2:])

        yield db


with connect_db() as db:
    db(
        """CREATE TABLE IF NOT EXISTS configs (
       courseCode varchar(128),
       config LONGBLOB)"""
    )
    db(
        """CREATE TABLE IF NOT EXISTS students (
       courseCode varchar(128),
       email varchar(128),
       shortData varchar(256),
       data BLOB)"""
    )
    db(
        """CREATE TABLE IF NOT EXISTS headers (
       courseCode varchar(128),
       header BLOB)"""
    )


def get_course_code():
    try:
        with open("static/config/courseList.json") as config:
            data = json.load(config)
            host = request.headers["Host"]
            return data.get(host, host)
    except FileNotFoundError:
        return "cs61a"


def is_staff(remote):
    ret = remote.get("user", token=session["dev_token"])
    for course in ret.data["data"]["participations"]:
        if course["role"] not in AUTHORIZED_ROLES:
            continue
        if (
            course["course"]["display_name"].lower().replace(" ", "")
            != get_course_code()
        ):
            continue
        return True
    return False


def create_client(app):
    oauth = OAuth(app)

    remote = oauth.remote_app(
        "ok-server",  # Server Name
        consumer_key=CONSUMER_KEY,
        consumer_secret=SECRET,
        request_token_params={"scope": "all", "state": lambda: security.gen_salt(10)},
        base_url="https://okpy.org/api/v3/",
        request_token_url=None,
        access_token_method="POST",
        access_token_url="https://okpy.org/oauth/token",
        authorize_url="https://okpy.org/oauth/authorize",
    )

    def check_req(uri, headers, body):
        """ Add access_token to the URL Request. """
        if "access_token" not in uri and session.get("dev_token"):
            params = {"access_token": session.get("dev_token")[0]}
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

    @app.route("/redirect")
    def ohlord():
        return redirect("https://howamidoing.cs61a.org")

    @app.route("/config/config.js")
    def config():
        with connect_db() as db:
            data = db(
                "SELECT config FROM configs WHERE courseCode=%s", [get_course_code()]
            ).fetchone()
            print(data)
            return Response(data, mimetype="application/javascript")

    @app.route("/query/")
    def query():
        try:
            if "dev_token" in session:
                ret = remote.get("user", token=session["dev_token"])

                email = ret.data["data"]["email"]

                target = request.args.get("target", None)

                if is_staff(remote):
                    if target:
                        email = target
                    else:
                        all_students = []
                        with connect_db() as db:
                            lookup = db(
                                "SELECT shortData FROM students WHERE courseCode=%s",
                                [get_course_code()],
                            ).fetchall()
                            for row in lookup:
                                parsed = json.loads(row[0])
                                all_students.append(parsed)
                        return jsonify(
                            {
                                "success": True,
                                "isStaff": True,
                                "allStudents": all_students,
                                "email": ret.data["data"]["email"],
                                "name": ret.data["data"]["name"],
                            }
                        )

                with connect_db() as db:
                    [short_data, data] = db(
                        "SELECT shortData, data FROM students WHERE courseCode=%s AND email=%s",
                        [get_course_code(), email],
                    ).fetchone()
                    [header] = db("SELECT header FROM headers WHERE courseCode=%s", [get_course_code()]).fetchone()
                    short_data = json.loads(short_data)
                    data = json.loads(data)
                    header = json.loads(header)
                    return jsonify(
                        {
                            "success": True,
                            "header": header,
                            "data": data,
                            "email": short_data["Email"],
                            "name": short_data["Name"],
                            "SID": short_data["SID"],
                        }
                    )
            else:
                return jsonify({"success": False, "retry": True})

        except Exception as e:
            pass
        return jsonify({"success": False, "retry": False})

    @app.route("/setConfig", methods=["POST"])
    def set_config():
        if not is_staff(remote):
            return jsonify({"success": False})
        data = request.form.get("data")
        with connect_db() as db:
            db("DELETE FROM configs WHERE courseCode=%s", [get_course_code()])
            db("INSERT INTO configs VALUES (%s, %s)", [get_course_code(), data])
        return jsonify({"success": True})

    @app.route("/setGrades", methods=["POST"])
    def set_grades():
        if not is_staff(remote):
            return jsonify({"success": False})
        data = request.form.get("data")
        course_code = get_course_code()
        reader = csv.reader(StringIO(data))
        header = next(reader)
        email_index = header.index("Email")
        with connect_db() as db:
            db("DELETE FROM students WHERE courseCode=%s", [course_code])
            db("DELETE FROM headers WHERE courseCode=%s", [course_code])
            db("INSERT INTO headers VALUES (%s, %s)", [course_code, json.dumps(header)])
            for row in reader:
                short_data = {x: row[header.index(x)] for x in ["Email", "SID", "Name"]}
                db(
                    "INSERT INTO students VALUES (%s, %s, %s, %s)",
                    [
                        course_code,
                        row[email_index],
                        json.dumps(short_data),
                        json.dumps(row),
                    ],
                )

        return jsonify({"success": True})

    @app.route("/login/")
    def login():
        session.pop("dev_token", None)
        if __name__ == "__main__":
            return remote.authorize(callback=url_for("authorized", _external=True))
        else:
            return remote.authorize(
                callback=url_for("authorized", _external=True, _scheme="https")
            )

    @app.route("/logout/")
    def logout():
        session.pop("dev_token", None)
        return redirect(url_for("query"))

    @app.route("/authorized/")
    def authorized():
        resp = remote.authorized_response()
        if resp is None:
            return "Access denied: error=%s" % (request.args["error"])
        if isinstance(resp, dict) and "access_token" in resp:
            session["dev_token"] = (resp["access_token"], "")
        return redirect("/")

    @app.route("/user/")
    def client_method():
        token = session["dev_token"][0]
        r = requests.get(
            "http://localhost:5000/api/v3/user/?access_token={}".format(token)
        )
        r.raise_for_status()
        return jsonify(r.json())

    @remote.tokengetter
    def get_oauth_token():
        return session.get("dev_token")

    return remote


app = Flask(
    __name__, static_url_path="", static_folder="static", template_folder="static"
)
app.secret_key = SECRET
create_client(app)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000)
