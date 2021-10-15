#!/usr/bin/env bash
if [[ -z $IMAGE_TAG ]]; then
  echo "IMAGE_TAG is empty"
  exit 1
fi
if [[ -z $DOCKER_IMAGE_NAME ]]; then
  echo "DOCKER_IMAGE_NAME is empty"
  exit 1
fi
if [[ -z $DOCKER_REGISTRY ]]; then
  echo "DOCKER_REGISTRY is empty"
  exit 1
fi

# Login to registry
aws ecr get-login-password | docker login --username AWS --password-stdin $DOCKER_REGISTRY
# Create image's repository if it doesn't exist
aws ecr describe-repositories --repository-names $DOCKER_IMAGE_NAME --no-cli-pager &> /dev/null || aws ecr create-repository --repository-name $DOCKER_IMAGE_NAME --no-cli-pager

DOCKER_IMAGE="$DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:$IMAGE_TAG"
docker build -f $DOCKER_FILE -t $DOCKER_IMAGE .
docker push $DOCKER_IMAGE
