# Kubernetes Deployment Guide

## Prerequisites

1. **Kubernetes cluster** (1.24+)
2. **kubectl** configured
3. **Docker images** built and pushed to registry
4. **NGINX Ingress Controller** installed (for Ingress)
5. **Metrics Server** installed (for HPA)

## Quick Start

### 1. Build and Push Docker Images

```bash
# Build images
docker build -t your-registry/yolov8-model:latest ./yolov8_model
docker build -t your-registry/backend:latest ./backend
docker build -t your-registry/frontend:latest --build-arg VITE_API_URL=http://your-domain.com/api ./frontend

# Push to registry
docker push your-registry/yolov8-model:latest
docker push your-registry/backend:latest
docker push your-registry/frontend:latest
```

### 2. Update Image References

Edit `k8s/kustomization.yaml` and update the `images` section with your registry:

```yaml
images:
  - name: yolov8-model
    newName: your-registry/yolov8-model
    newTag: latest
  - name: backend
    newName: your-registry/backend
    newTag: latest
  - name: frontend
    newName: your-registry/frontend
    newTag: latest
```

### 3. Deploy to Kubernetes

```bash
# Apply all manifests
kubectl apply -k k8s/

# Or apply individually
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/persistent-volumes.yaml
kubectl apply -f k8s/yolov8-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
```

### 4. Verify Deployment

```bash
# Check all resources
kubectl get all -n safety-monitoring

# Check pods
kubectl get pods -n safety-monitoring

# Check services
kubectl get svc -n safety-monitoring

# Check ingress
kubectl get ingress -n safety-monitoring

# Check HPA
kubectl get hpa -n safety-monitoring

# View logs
kubectl logs -f deployment/backend -n safety-monitoring
kubectl logs -f deployment/frontend -n safety-monitoring
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Ingress (NGINX)                      │
│          safety-monitoring.yourdomain.com               │
└───────────────┬─────────────────────┬───────────────────┘
                │                     │
                │ /api/*              │ /*
                ▼                     ▼
        ┌───────────────┐     ┌───────────────┐
        │   Backend     │     │   Frontend    │
        │   Service     │     │   Service     │
        │   Port: 8000  │     │   Port: 80    │
        └───────┬───────┘     └───────────────┘
                │
                │ Reads model
                ▼
        ┌───────────────┐
        │  YOLOv8 Model │
        │   (PVC)       │
        └───────────────┘
```

## Configuration

### ConfigMap

Backend environment variables can be modified in `k8s/configmap.yaml`:

- `PROCESS_EVERY_N_FRAMES`: Frame processing interval (default: 5)
- `INFERENCE_SIZE`: Model inference size (default: 480)
- `JPEG_QUALITY`: Output JPEG quality (default: 70)
- `CAMERA_WIDTH`: Camera capture width (default: 640)
- `CAMERA_HEIGHT`: Camera capture height (default: 480)

### Persistent Volumes

Storage requirements:
- **YOLOv8 Model**: 100Mi (ReadWriteMany)
- **Backend Logs**: 1Gi (ReadWriteOnce)
- **Backend Frames**: 2Gi (ReadWriteOnce)

Modify `k8s/persistent-volumes.yaml` to change storage sizes or classes.

### Resource Limits

Current resource configuration:

**YOLOv8 Model:**
- Requests: 64Mi RAM, 50m CPU
- Limits: 128Mi RAM, 100m CPU

**Backend:**
- Requests: 2Gi RAM, 1 CPU
- Limits: 4Gi RAM, 2 CPU

**Frontend:**
- Requests: 128Mi RAM, 100m CPU
- Limits: 256Mi RAM, 200m CPU

### Horizontal Pod Autoscaling (HPA)

**Backend HPA:**
- Min replicas: 2
- Max replicas: 10
- Target CPU: 70%
- Target Memory: 80%

**Frontend HPA:**
- Min replicas: 2
- Max replicas: 5
- Target CPU: 70%
- Target Memory: 80%

## Ingress Configuration

### Update Host

Edit `k8s/ingress.yaml` and replace `safety-monitoring.yourdomain.com` with your domain.

### Enable TLS/HTTPS

Uncomment the `tls` section in `k8s/ingress.yaml`:

```yaml
tls:
- hosts:
  - safety-monitoring.yourdomain.com
  secretName: safety-monitoring-tls
```

Then create TLS secret:

```bash
kubectl create secret tls safety-monitoring-tls \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key \
  -n safety-monitoring
```

Or use cert-manager for automatic TLS:

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

## Scaling

### Manual Scaling

```bash
# Scale backend
kubectl scale deployment backend --replicas=5 -n safety-monitoring

# Scale frontend
kubectl scale deployment frontend --replicas=3 -n safety-monitoring
```

### Auto-scaling

HPA is configured by default. To disable:

```bash
kubectl delete hpa backend-hpa -n safety-monitoring
kubectl delete hpa frontend-hpa -n safety-monitoring
```

## Monitoring

### Install Metrics Server (if not present)

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

### View Resource Usage

```bash
# Pod metrics
kubectl top pods -n safety-monitoring

# Node metrics
kubectl top nodes
```

## Troubleshooting

### Pods Not Starting

```bash
# Describe pod
kubectl describe pod <pod-name> -n safety-monitoring

# Check events
kubectl get events -n safety-monitoring --sort-by='.lastTimestamp'

# Check logs
kubectl logs <pod-name> -n safety-monitoring
kubectl logs <pod-name> -c <container-name> -n safety-monitoring
```

### Model Not Loading

```bash
# Check if model PVC is mounted
kubectl exec -it deployment/backend -n safety-monitoring -- ls -la /model/

# Check yolov8-model pod
kubectl logs deployment/yolov8-model -n safety-monitoring
```

### Backend Not Healthy

```bash
# Check health endpoint
kubectl exec -it deployment/backend -n safety-monitoring -- curl http://localhost:8000/stats

# Check startup logs
kubectl logs deployment/backend -n safety-monitoring | grep -i "model\|error\|startup"
```

### Ingress Not Working

```bash
# Check ingress status
kubectl describe ingress safety-monitoring-ingress -n safety-monitoring

# Check nginx ingress controller logs
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
```

## Cleanup

```bash
# Delete all resources
kubectl delete -k k8s/

# Or delete namespace (removes everything)
kubectl delete namespace safety-monitoring
```

## Production Recommendations

1. **Use Private Container Registry**: Push images to AWS ECR, Google GCR, or Azure ACR
2. **Enable TLS**: Use cert-manager with Let's Encrypt for automatic certificates
3. **Set Resource Quotas**: Limit namespace resource usage
4. **Enable Network Policies**: Restrict pod-to-pod communication
5. **Use Secrets**: Store sensitive data in Kubernetes Secrets, not ConfigMaps
6. **Configure Liveness/Readiness Probes**: Already configured, tune timeouts as needed
7. **Enable Monitoring**: Install Prometheus + Grafana for metrics
8. **Set up Logging**: Use ELK stack or Loki for centralized logging
9. **Backup PVCs**: Regular backups of persistent volumes
10. **Use GitOps**: Deploy with ArgoCD or Flux for declarative management

## Advanced Features

### Rolling Updates

```bash
# Update backend image
kubectl set image deployment/backend backend=your-registry/backend:v2.0 -n safety-monitoring

# Check rollout status
kubectl rollout status deployment/backend -n safety-monitoring

# Rollback if needed
kubectl rollout undo deployment/backend -n safety-monitoring
```

### Blue-Green Deployment

Create separate deployments for blue/green and switch service selector.

### Canary Deployment

Use Istio or NGINX Ingress traffic splitting for gradual rollout.

## Support

For issues, refer to:
- Project README: `/README.md`
- Docker Guide: `/DOCKER_GUIDE.md`
- Setup Guide: `/SETUP.md`
