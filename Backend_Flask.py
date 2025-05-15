from flask import Flask, request, jsonify
import pickle
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load models and vectorizer
with open(r'C:\Users\villa\Documents\SoftEng\logistic_regression.pkl', 'rb') as f:
    LR = pickle.load(f)

with open(r'C:\Users\villa\Documents\SoftEng\decision_tree.pkl', 'rb') as f:
    DT = pickle.load(f)

with open(r'C:\Users\villa\Documents\SoftEng\gradient_boosting.pkl', 'rb') as f:
    GB = pickle.load(f)

with open(r'C:\Users\villa\Documents\SoftEng\random_forest.pkl', 'rb') as f:
    RF = pickle.load(f)

with open(r'C:\Users\villa\Documents\SoftEng\vectorizer.pkl', 'rb') as f:
    vectorizer = pickle.load(f)

# Set threshold
CONFIDENCE_THRESHOLD = 0.75
def get_prediction_with_confidence(model, vectorized_text):
    probas = model.predict_proba(vectorized_text)[0]
    prediction = np.argmax(probas)
    confidence = max(probas)
    
    if confidence < CONFIDENCE_THRESHOLD:
        label = "Uncertain"
    else:
        label = "Factual News" if prediction == 1 else "Fake News"

    return {
        "label": label,
        "confidence": round(confidence * 100, 2)  # return % format
    }

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        text = data.get('text', '')

        text_vectorized = vectorizer.transform([text])

        results = {
            'Logistic Regression': get_prediction_with_confidence(LR, text_vectorized),
            'Decision Tree': get_prediction_with_confidence(DT, text_vectorized),
            'Gradient Boosting': get_prediction_with_confidence(GB, text_vectorized),
            'Random Forest': get_prediction_with_confidence(RF, text_vectorized)
        }

        return jsonify(results)

    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
