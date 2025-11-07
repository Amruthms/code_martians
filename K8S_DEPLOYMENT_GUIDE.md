# Kubernetes Deployment Guide with Twilio

## 📋 Prerequisites

1. **Kubernetes Cluster** (minikube, EKS, GKE, AKS, or on-premise)
2. **kubectl** configured to access your cluster
3. **Docker Hub images** pushed:
   - `shrinidhiupadhyaya/code_martians_backend:latest`
   - `shrinidhiupadhyaya/code_martians_frontend:latest`
   - `shrinidhiupadhyaya/code_martians_yolov8-model:latest`

## 🔐 Step 1: Update Secrets (IMPORTANT!)

Before deploying, you MUST update `k8s/secrets.yaml` with your Twilio credentials:

```bash
# Edit the secrets file
nano k8s/secrets.yaml
```

Update these values:
```yaml
stringData:
  account-sid: "YOUR_TWILIO_ACCOUNT_SID"
  auth-token: "YOUR_TWILIO_AUTH_TOKEN"
  caller-number: "YOUR_TWILIO_PHONE_NUMBER"
```

**⚠️ WARNING:** Never commit `secrets.yaml` to git with real credentials!

## 🌐 Step 2: Update ConfigMap BASE_URL

Edit `k8s/configmap.yaml` and update BASE_URL with your Kubernetes ingress URL:

```yaml
BASE_URL: "http://your-k8s-ingress-url:8000"
```

Or if using LoadBalancer:
```yaml
BASE_URL: "http://your-loadbalancer-ip:8000"
```

## 🚀 Step 3: Deploy to Kubernetes

### Deploy All Resources

```bash
# Navigate to k8s directory
cd k8s

# Create namespace
kubectl apply -f namespace.yaml

# Deploy secrets (with your credentials)
kubectl apply -f secrets.yaml

# Deploy configmaps
kubectl apply -f configmap.yaml

# Deploy persistent volumes
kubectl apply -f persistent-volumes.yaml

# Deploy YOLOv8 model
kubectl apply -f yolov8-deployment.yaml

# Wait for model to be ready
kubectl wait --for=condition=ready pod -l app=yolov8-model -n safety-monitoring --timeout=120s

# Deploy backend
kubectl apply -f backend-deployment.yaml

# Wait for backend to be ready
kubectl wait --for=condition=ready pod -l app=backend -n safety-monitoring --timeout=180s

# Deploy frontend
kubectl apply -f frontend-deployment.yaml

# Deploy ingress
kubectl apply -f ingress.yaml

# Deploy horizontal pod autoscaler
kubectl apply -f hpa.yaml
```

### Or Deploy All at Once

```bash
kubectl apply -f k8s/
```

## 🔍 Step 4: Verify Deployment

### Check All Pods

```bash
kubectl get pods -n safety-monitoring
```

Expected output:
```
NAME                            READY   STATUS    RESTARTS   AGE
backend-xxxxxxxxxx-xxxxx        1/1     Running   0          2m
backend-xxxxxxxxxx-xxxxx        1/1     Running   0          2m
frontend-xxxxxxxxxx-xxxxx       1/1     Running   0          1m
frontend-xxxxxxxxxx-xxxxx       1/1     Running   0          1m
yolov8-model-xxxxxxxxxx-xxxxx   1/1     Running   0          3m
```

### Check Services

```bash
kubectl get svc -n safety-monitoring
```

### Check Ingress

```bash
kubectl get ingress -n safety-monitoring
```

### Verify Twilio Configuration

```bash
# Check backend logs for Twilio initialization
kubectl logs -n safety-monitoring -l app=backend | grep -i twilio
```

**You should see:**
```
[INFO] Twilio client initialized. Caller: +12174396550
```

**NOT:**
```
[WARN] Twilio not configured
```

### Check Secrets

```bash
# Verify secrets exist
kubectl get secrets -n safety-monitoring

# Check backend environment variables
kubectl exec -n safety-monitoring deployment/backend -- env | grep TWILIO
kubectl exec -n safety-monitoring deployment/backend -- env | grep EMERGENCY
```

## 🌍 Step 5: Access the Application

### Get Ingress URL

```bash
kubectl get ingress -n safety-monitoring -o wide
```

### Port Forward (for testing)

```bash
# Frontend
kubectl port-forward -n safety-monitoring svc/frontend-service 3000:80

# Backend
kubectl port-forward -n safety-monitoring svc/backend-service 8000:8000
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

## 🧪 Step 6: Test Emergency Calling

### Test Backend Health

```bash
kubectl exec -n safety-monitoring deployment/backend -- curl -s http://localhost:8000/stats
```

### Test Emergency Call

```bash
# Get backend service IP
BACKEND_URL=$(kubectl get svc backend-service -n safety-monitoring -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Or use port-forward
kubectl port-forward -n safety-monitoring svc/backend-service 8000:8000 &

# Test call
curl -X POST http://localhost:8000/voice/call/ \
  -H "Content-Type: application/json" \
  -d '{
    "emergency_type": "Manager",
    "location": "K8s Test Zone",
    "description": "Testing Kubernetes deployment"
  }'
```

## 📊 Step 7: Monitor Resources

### View All Resources

```bash
kubectl get all -n safety-monitoring
```

### Check HPA Status

```bash
kubectl get hpa -n safety-monitoring
```

### View Backend Logs

```bash
# All backend pods
kubectl logs -n safety-monitoring -l app=backend --tail=100 -f

# Specific pod
kubectl logs -n safety-monitoring <pod-name> -f
```

### View Pod Resource Usage

```bash
kubectl top pods -n safety-monitoring
```

## 🔄 Step 8: Update Deployment

### Update Image

```bash
# Pull new images from Docker Hub
kubectl set image deployment/backend backend=shrinidhiupadhyaya/code_martians_backend:latest -n safety-monitoring
kubectl set image deployment/frontend frontend=shrinidhiupadhyaya/code_martians_frontend:latest -n safety-monitoring

# Or force rollout
kubectl rollout restart deployment/backend -n safety-monitoring
kubectl rollout restart deployment/frontend -n safety-monitoring
```

### Update Secrets

```bash
# Edit secrets
kubectl edit secret twilio-credentials -n safety-monitoring
kubectl edit secret emergency-contacts -n safety-monitoring

# Restart backend to pick up changes
kubectl rollout restart deployment/backend -n safety-monitoring
```

### Update ConfigMap

```bash
# Edit configmap
kubectl edit configmap backend-config -n safety-monitoring

# Restart backend
kubectl rollout restart deployment/backend -n safety-monitoring
```

## 🐛 Troubleshooting

### Backend Pod Not Starting

```bash
# Describe pod
kubectl describe pod -n safety-monitoring <pod-name>

# Check events
kubectl get events -n safety-monitoring --sort-by='.lastTimestamp'

# Check logs
kubectl logs -n safety-monitoring <pod-name>
```

### Twilio Not Configured

```bash
# Check if secrets exist
kubectl get secret twilio-credentials -n safety-monitoring -o yaml

# Verify environment variables in pod
kubectl exec -n safety-monitoring deployment/backend -- env | grep TWILIO

# Check backend logs
kubectl logs -n safety-monitoring -l app=backend | grep -i twilio
```

### Image Pull Errors

```bash
# Check image pull policy
kubectl describe pod -n safety-monitoring <pod-name> | grep -i image

# If using private registry, create image pull secret:
kubectl create secret docker-registry dockerhub-secret \
  --docker-server=https://index.docker.io/v1/ \
  --docker-username=shrinidhiupadhyaya \
  --docker-password=<your-password> \
  --docker-email=<your-email> \
  -n safety-monitoring

# Update deployment to use secret
kubectl patch serviceaccount default -n safety-monitoring \
  -p '{"imagePullSecrets": [{"name": "dockerhub-secret"}]}'
```

### Model Not Found

```bash
# Check PVC
kubectl get pvc -n safety-monitoring

# Check if model is in volume
kubectl exec -n safety-monitoring deployment/yolov8-model -- ls -la /model/

# Check backend can access model
kubectl exec -n safety-monitoring deployment/backend -- ls -la /model/
```

## 🔒 Security Best Practices

### 1. Don't Commit Secrets

Add to `.gitignore`:
```
k8s/secrets.yaml
k8s/*-secrets.yaml
```

### 2. Use External Secrets (Production)

Consider using:
- AWS Secrets Manager
- Azure Key Vault
- HashiCorp Vault
- Kubernetes External Secrets Operator

### 3. Encrypt Secrets at Rest

Enable encryption in your Kubernetes cluster.

### 4. Use Network Policies

Create network policies to restrict pod-to-pod communication.

### 5. RBAC

Implement Role-Based Access Control for kubectl access.

## 📈 Scaling

### Manual Scaling

```bash
# Scale backend
kubectl scale deployment backend --replicas=5 -n safety-monitoring

# Scale frontend
kubectl scale deployment frontend --replicas=3 -n safety-monitoring
```

### Auto-scaling (HPA)

Already configured in `hpa.yaml`:
- Backend: 2-10 replicas (target 70% CPU)
- Frontend: 2-5 replicas (target 80% CPU)

### Check HPA

```bash
kubectl get hpa -n safety-monitoring
kubectl describe hpa backend-hpa -n safety-monitoring
```

## 🗑️ Cleanup

### Delete All Resources

```bash
# Delete entire namespace (this removes everything)
kubectl delete namespace safety-monitoring

# Or delete individual resources
kubectl delete -f k8s/
```

### Keep Persistent Volumes

If you want to keep data:
```bash
kubectl delete deployment,svc,ingress,hpa,configmap,secret -n safety-monitoring --all
```

## 📚 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Kubernetes Cluster                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Namespace: safety-monitoring             │  │
│  │                                                        │  │
│  │  ┌─────────────┐     ┌──────────────┐               │  │
│  │  │   Ingress   │────▶│   Frontend   │               │  │
│  │  │  (NGINX)    │     │  (2 replicas)│               │  │
│  │  └─────────────┘     └──────────────┘               │  │
│  │         │                                             │  │
│  │         ▼                                             │  │
│  │  ┌──────────────┐     ┌──────────────┐              │  │
│  │  │   Backend    │────▶│  YOLOv8      │              │  │
│  │  │  (2-10       │     │  Model       │              │  │
│  │  │   replicas)  │     │  (1 replica) │              │  │
│  │  └──────────────┘     └──────────────┘              │  │
│  │         │                      │                      │  │
│  │         ▼                      ▼                      │  │
│  │  ┌──────────────┐     ┌──────────────┐              │  │
│  │  │   Twilio     │     │  Model PVC   │              │  │
│  │  │   Secrets    │     │  (Shared)    │              │  │
│  │  └──────────────┘     └──────────────┘              │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## 📞 Twilio Configuration in K8s

### Environment Variable Flow

```
secrets.yaml
    ↓
Kubernetes Secrets
    ↓
Backend Deployment (env from secretKeyRef)
    ↓
Backend Pod Environment Variables
    ↓
app.py (os.getenv())
    ↓
Twilio Client Initialization
```

## 🎯 Next Steps

1. ✅ Update `secrets.yaml` with your credentials
2. ✅ Update `configmap.yaml` BASE_URL
3. ✅ Deploy to Kubernetes
4. ✅ Verify Twilio initialization
5. ✅ Test emergency calling
6. ✅ Set up monitoring (Prometheus/Grafana)
7. ✅ Configure ingress with SSL/TLS
8. ✅ Implement backup strategy for PVCs

## 📖 References

- **Docker Hub Images:** https://hub.docker.com/u/shrinidhiupadhyaya
- **Twilio Console:** https://console.twilio.com/
- **Kubernetes Docs:** https://kubernetes.io/docs/
- **Project Repository:** https://github.com/Amruthms/code_martians
