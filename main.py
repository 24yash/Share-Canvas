from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import os
from uuid import uuid4

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.sqlite3'
db = SQLAlchemy(app)

class Image(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    data_url = db.Column(db.Text, nullable=False)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/<id>')
def homea(id):
    return render_template('index.html')
  
@app.route('/save', methods=['POST'])
def save():
   data = request.get_json()
   data_url = data['dataUrl']
   id = data.get('id')
   if id:
       image = Image.query.get(id)
       if image:
           image.data_url = data_url
       else:
           image = Image(id=id, data_url=data_url)
           db.session.add(image)
   else:
       image = Image(id=str(uuid4()), data_url=data_url) #UUID (Universally Unique Identifier)
       db.session.add(image)
   db.session.commit()
   return jsonify(id=image.id)



from flask import jsonify

@app.route('/a/load/<id>', methods=['GET'])
def loada(id):
    print(id)
    image = Image.query.filter_by(id=id).first()
    print(image)
    if image:
        return jsonify(dataUrl=image.data_url)
    else:
        return jsonify(error="Image not found"), 404


with app.app_context():
    db.create_all()

app.run(host='0.0.0.0',debug=True)
