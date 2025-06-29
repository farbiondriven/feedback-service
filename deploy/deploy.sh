IMAGE="europe-west1-docker.pkg.dev/$GOOGLE_CLOUD_PROJECT/app/feedback:latest"
docker build -t $IMAGE -f ../Dockerfile.deploy ../
docker push $IMAGE

gcloud run deploy feedback-system --image $IMAGE --set-env-vars "DATABASE_URL=$DATABASE_URL,ADMIN_TOKEN=TestToken" --allow-unauthenticated
