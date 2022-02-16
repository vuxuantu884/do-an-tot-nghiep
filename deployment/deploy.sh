#!/usr/bin/env bash
if [[ -z $1 ]]; then
    echo "Please provide module in the first argument"
    exit 1
fi
MODULE_DIR="deployment/k8s/$ENVIRONMENT"

if [[ -z $IMAGE_TAG ]]; then
  echo "IMAGE_TAG is empty"
  exit 1
fi

if [[ -z $SERVICE_NAME ]]; then
    echo "SERVICE_NAME is empty"
    exit 1
fi

if [[ -z $ENVIRONMENT ]]; then
    echo "ENVIRONMENT is empty"
    exit 1
fi

if [[ -z $NAMESPACE ]]; then
    echo "NAMESPACE is empty"
    exit 1
fi

envsubst < $MODULE_DIR/main.$ENVIRONMENT.yml > k8s-main.yml

# Apply deployment template
kubectl apply -f k8s-main.yml -n $NAMESPACE
if [[ $? != 0 ]]; then exit 1; fi

kubectl rollout status deployments/$SERVICE_NAME -n $NAMESPACE
if [[ $? != 0 ]]; then
    kubectl logs -n $NAMESPACE $(kubectl get pods --sort-by=.metadata.creationTimestamp -n $NAMESPACE | grep "$SERVICE_NAME" | awk '{print $1}' | tac | head -1 ) --tail=20 && exit 1;
fi
