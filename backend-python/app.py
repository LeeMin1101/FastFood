from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torch.nn as nn
from torchvision.models import efficientnet_v2_s
from torchvision import transforms
from PIL import Image
import io

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

class_names = [
    'Burger', 'Combo', 'Gà Rán', 'Nước Uống', 'Pizza', 
    'Cơm Chiên', 'Sushi', 'Mì Ramen', 'Steak', 'Bánh Mì'
]
num_classes = len(class_names)

model = efficientnet_v2_s(weights=None)
model.classifier[1] = nn.Linear(model.classifier[1].in_features, num_classes)

try:
    model.load_state_dict(torch.load('food101_model.pth', map_location=device))
except Exception as e:
    print(e)

model = model.to(device)
model.eval()

data_transforms = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

@app.route('/api/predict-food', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'Không nhận được ảnh'}), 400
    
    file = request.files['file']
    
    try:
        img = Image.open(io.BytesIO(file.read())).convert('RGB')
        img_t = data_transforms(img).unsqueeze(0).to(device)
        
        with torch.no_grad():
            outputs = model(img_t)
            probs = torch.nn.functional.softmax(outputs[0], dim=0)
            conf, idx = torch.max(probs, 0)
            
        res_conf = conf.item() * 100
        predicted_class = class_names[idx.item()]
        
        if res_conf > 50:
            return jsonify({'label': predicted_class, 'confidence': round(res_conf, 2)})
        else:
            return jsonify({'label': 'Không xác định', 'confidence': round(res_conf, 2)})
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)