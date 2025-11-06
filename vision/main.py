import cv2, time, uuid, yaml, requests
from detector import detect_persons
from ppe import roi_slices, crop, mask_ratio_hsv
from zones import centroid, in_polygon, draw_polygon

with open("config.yaml","r") as f:
    CFG = yaml.safe_load(f)

cap = cv2.VideoCapture(CFG["video_source"])
zones = CFG["zones"]
H = CFG["helmet_hsv"]; V = CFG["vest_hsv"]
H_T = CFG["helmet_ratio_thresh"]; V_T = CFG["vest_ratio_thresh"]
PROX = CFG["proximity_pixels"]
BACKEND = CFG["backend_url"]

def emit_alert(a_type, meta, frame, box=None, zone=None):
    # save thumbnail
    fname = f"frames/{int(time.time()*1000)}_{uuid.uuid4().hex[:6]}.jpg"
    if box:
        x,y,w,h = box
        cv2.rectangle(frame,(x,y),(x+w,y+h),(0,0,255),2)
    cv2.imwrite(fname, frame)
    payload = {"type": a_type, "ts": int(time.time()*1000), "zone": zone, "frame_path": fname, "meta": meta}
    try:
        requests.post(f"{BACKEND}/alerts", json=payload, timeout=1.0)
    except Exception:
        pass

while True:
    ok, frame = cap.read()
    if not ok: break

    # optional resize for speed
    frame = cv2.resize(frame, (960, int(frame.shape[0]*960/frame.shape[1])))

    persons = detect_persons(frame)
    centroids = []

    # draw zones
    for z in zones:
        draw_polygon(frame, z["polygon"], (0,0,255))

    for (x,y,w,h) in persons:
        c = centroid(x,y,w,h); centroids.append(((x,y,w,h), c))
        head_roi, torso_roi = roi_slices(x,y,w,h)
        head_img  = crop(frame, head_roi)
        torso_img = crop(frame, torso_roi)

        helmet_ok = mask_ratio_hsv(head_img, **H) > H_T
        vest_ok   = mask_ratio_hsv(torso_img, **V) > V_T

        color = (0,255,0) if (helmet_ok and vest_ok) else (0,0,255)
        cv2.rectangle(frame, (x,y), (x+w,y+h), color, 2)
        label = []
        if not helmet_ok: label.append("Helmet Missing")
        if not vest_ok:   label.append("Vest Missing")
        if label:
            cv2.putText(frame, ", ".join(label), (x, y-6), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
            emit_alert("PPE", {"helmet_ok":helmet_ok, "vest_ok":vest_ok, "bbox":[x,y,w,h]}, frame.copy(), (x,y,w,h), None)

        # zone violation
        for z in zones:
            if in_polygon(c, z["polygon"]):
                cv2.circle(frame, c, 5, (0,0,255), -1)
                cv2.putText(frame, f"ZONE: {z['name']}", (x, y+h+16), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,0,255), 2)
                emit_alert("ZONE_VIOLATION", {"bbox":[x,y,w,h]}, frame.copy(), (x,y,w,h), z["name"])

    # proximity (pixel space)
    for i in range(len(centroids)):
        for j in range(i+1, len(centroids)):
            (b1,c1),(b2,c2) = centroids[i], centroids[j]
            d = ((c1[0]-c2[0])**2 + (c1[1]-c2[1])**2) ** 0.5
            if d < PROX:
                cv2.line(frame, c1, c2, (0,0,255), 2)
                emit_alert("PROXIMITY", {"d": d}, frame.copy())

    cv2.imshow("SafeSite - Vision", frame)
    if cv2.waitKey(1) & 0xFF == 27:  # ESC to quit
        break

cap.release()
cv2.destroyAllWindows()