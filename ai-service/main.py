"""Tantravit AI service: real YOLO (Ultralytics YOLO11n, ONNX) inference via onnxruntime.
Default weights are COCO-pretrained (no watershed classes). To use a trained watershed model, export it to ONNX and
mount it as /models/watershed.onnx with /models/classes.txt (one class name per line)."""
import io, os
import numpy as np, cv2, onnxruntime as ort
from fastapi import FastAPI, UploadFile, File
from PIL import Image

HERE = os.path.dirname(__file__)
CUSTOM = os.getenv("YOLO_WEIGHTS", "/models/watershed.onnx")
custom = os.path.exists(CUSTOM)
path = CUSTOM if custom else os.getenv("YOLO_DEFAULT", os.path.join(HERE, "yolo11n.onnx"))
names = open("/models/classes.txt" if custom else os.path.join(HERE, "coco_names.txt")).read().split("\n")
sess = ort.InferenceSession(path, providers=["CPUExecutionProvider"])
inp = sess.get_inputs()[0].name
SIZE = sess.get_inputs()[0].shape[2] if isinstance(sess.get_inputs()[0].shape[2], int) else 640
CONF, IOU = float(os.getenv("CONF", "0.25")), 0.45
app = FastAPI(title="Tantravit AI service")

@app.get("/health")
def health():
    return {"ok": True, "model": os.path.basename(path), "custom_watershed_model": custom, "classes": len(names)}

@app.post("/predict")
async def predict(image: UploadFile = File(...)):
    im = np.array(Image.open(io.BytesIO(await image.read())).convert("RGB"))
    h, w = im.shape[:2]; r = min(SIZE / h, SIZE / w)
    nh, nw = round(h * r), round(w * r); px, py = (SIZE - nw) // 2, (SIZE - nh) // 2
    canvas = np.full((SIZE, SIZE, 3), 114, np.uint8); canvas[py:py + nh, px:px + nw] = cv2.resize(im, (nw, nh))
    x = (canvas.astype(np.float32) / 255).transpose(2, 0, 1)[None]
    out = sess.run(None, {inp: x})[0][0].T            # (anchors, 4 + classes)
    scores = out[:, 4:]; cls = scores.argmax(1); conf = scores.max(1); m = conf >= CONF
    out, cls, conf = out[m], cls[m], conf[m]
    boxes = np.stack([out[:, 0] - out[:, 2] / 2, out[:, 1] - out[:, 3] / 2, out[:, 2], out[:, 3]], 1)
    keep = cv2.dnn.NMSBoxes(boxes.tolist(), conf.tolist(), CONF, IOU) if len(boxes) else []
    objs = []
    for k in np.array(keep).flatten():
        bx, by, bw, bh = boxes[k]
        x1, y1 = max(0, (bx - px) / r), max(0, (by - py) / r); x2, y2 = min(w, (bx + bw - px) / r), min(h, (by + bh - py) / r)
        objs.append({"class": names[cls[k]], "confidence": round(float(conf[k]), 4),
                     "bounding_box": [round(float(v), 1) for v in (x1, y1, x2, y2)], "watershed_relevant": custom})
    return {"model": os.path.basename(path) + ("" if custom else " (Ultralytics YOLO11n, COCO pretrained, no watershed classes)"),
            "custom_watershed_model": custom, "image_width": w, "image_height": h, "detected_objects": objs}
