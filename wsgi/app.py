from flask import Flask, render_template, request, jsonify

app = Flask(__name__)


@app.route("/")
def welcome():
    return render_template("welcome.html", title="Welcome")
