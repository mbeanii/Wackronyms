from flask import Flask, render_template, request, jsonify
from wackronyms import Wackronyms

app = Flask(__name__)
wackronyms = Wackronyms()


@app.route("/", methods=["GET", "POST"])
@app.route("/lobby", methods=["GET", "POST"])
def lobby():
    global wackronyms

    if request.method == "POST":
        name = request.form.get("name").strip()
        while not name:
            return render_template("get_name_form.html", title="No Name Provided")
        wackronyms.add_player(name)
        return render_template("welcome.html", title="Welcome", name=name)

    return render_template("get_name_form.html", title="Add player")

if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True)