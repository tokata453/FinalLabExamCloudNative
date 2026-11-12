# Student Management Microservices

Three Node.js microservices for student registration and management:

- **API Gateway** (port 3003): the only public entry point
- **Registration Service** (port 3001): creates students
- **Student Service** (port 3002): search, login, update, and delete students

Both business services use the same MongoDB Atlas `students` collection.

## API routes (through the gateway)

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/register` | Register a student |
| GET | `/api/students/search?id=ST001` | Search by ID |
| GET | `/api/students/search?name=John` | Search by name |
| POST | `/api/students/login` | Login with email and password |
| PUT | `/api/students/ST001` | Update mobile number and/or password |
| DELETE | `/api/students/ST001` | Delete a student |

## Local setup

Copy each `.env.example` file to `.env`, then set its values. Do not commit `.env` files.

```bash
cd registration-service && npm install && npm start
cd student-service && npm install && npm start
cd api-gateway && npm install && npm start
```

For local use, set `STUDENT_SERVICE_URL=http://localhost:3002` in `api-gateway/.env`.

## Kubernetes / Minikube

Create the real secret locally (replace the placeholders; never commit this file):

```bash
cp kubernetes/secret.example.yaml kubernetes/secret.yaml
```

Build images in Minikube:

```bash
eval $(minikube docker-env)
docker build -t student-api-gateway:1.0 ./api-gateway
docker build -t student-registration:1.0 ./registration-service
docker build -t student-service:1.0 ./student-service
kubectl apply -f kubernetes/secret.yaml
kubectl apply -f kubernetes/deployments.yaml
kubectl apply -f kubernetes/services.yaml
kubectl get pods
kubectl get services
minikube service api-gateway-service --url
```

Use the URL returned by the final command in Postman.
