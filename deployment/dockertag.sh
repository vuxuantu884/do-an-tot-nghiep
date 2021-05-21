#!/usr/bin/env bash
DOCKER_IMAGE_NAME=$1
if [[ -z $DOCKER_IMAGE_NAME ]]; then
  echo "DOCKER_IMAGE_NAME is empty. Please provide the first argument"
  exit 1
fi

EXISTING_IMAGE_TAG=$2
if [[ -z $EXISTING_IMAGE_TAG ]]; then
  echo "EXISTING_IMAGE_TAG is empty. Please provide the second argument"
  exit 1
fi

NEW_IMAGE_TAG=$3
if [[ -z $NEW_IMAGE_TAG ]]; then
  echo "NEW_IMAGE_TAG is empty. Please provide the third argument"
  exit 1
fi

if [[ -z $DOCKER_REGISTRY ]]; then
  echo "DOCKER_REGISTRY is empty"
  exit 1
fi

# Login to registry
aws ecr get-login-password | docker login --username AWS --password-stdin $DOCKER_REGISTRY
# Get existing image manifest
EXISTING_MANIFEST=$(aws ecr batch-get-image --repository-name aws-deployer --image-ids imageTag=$EXISTING_IMAGE_TAG --query 'images[].imageManifest' --output text)
# Push new tag using existing image manifest
aws ecr put-image --repository-name $DOCKER_IMAGE_NAME --image-tag $NEW_IMAGE_TAG --image-manifest "$EXISTING_MANIFEST" --no-cli-pager
