#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
STACK_NAME="ecommerce-clean-arch"
REGION="us-east-1"
ENVIRONMENT="dev"
S3_BUCKET="ecommerce-clean-arch-cfn-templates"

echo -e "${YELLOW}Starting deployment process...${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Create S3 bucket if it doesn't exist
echo -e "${YELLOW}Checking if S3 bucket exists...${NC}"
if ! aws s3 ls "s3://${S3_BUCKET}" 2>&1 > /dev/null; then
    echo -e "${YELLOW}Creating S3 bucket ${S3_BUCKET}...${NC}"
    aws s3 mb "s3://${S3_BUCKET}" --region ${REGION}
else
    echo -e "${GREEN}S3 bucket already exists.${NC}"
fi

# Validate templates
echo -e "${YELLOW}Validating CloudFormation templates...${NC}"

templates=(
    "main.yml"
    "dynamodb/tables.yml"
    "aurora/postgres-database.yml"
    "documentdb/document-cluster.yml"
)

for template in "${templates[@]}"; do
    echo -e "${YELLOW}Validating ${template}...${NC}"
    if ! aws cloudformation validate-template --template-body file://${template} > /dev/null; then
        echo -e "${RED}Template validation failed for ${template}${NC}"
        exit 1
    fi
    echo -e "${GREEN}Template ${template} is valid.${NC}"
done

# Upload templates to S3
echo -e "${YELLOW}Uploading templates to S3...${NC}"
for template in "${templates[@]}"; do
    echo -e "${YELLOW}Uploading ${template}...${NC}"
    aws s3 cp ${template} "s3://${S3_BUCKET}/${template}"
done

# Update/Create the stack
echo -e "${YELLOW}Deploying main stack...${NC}"
aws cloudformation deploy \
    --template-file main.yml \
    --stack-name ${STACK_NAME} \
    --parameter-overrides Environment=${ENVIRONMENT} \
    --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
    --region ${REGION}

DEPLOY_STATUS=$?

if [ $DEPLOY_STATUS -eq 0 ]; then
    echo -e "${GREEN}Deployment completed successfully!${NC}"
    
    # Get stack outputs
    echo -e "${YELLOW}Stack outputs:${NC}"
    aws cloudformation describe-stacks \
        --stack-name ${STACK_NAME} \
        --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
        --output table \
        --region ${REGION}
else
    echo -e "${RED}Deployment failed! Getting detailed error information...${NC}"
    
    # Get stack events to show what went wrong
    echo -e "${YELLOW}Recent stack events:${NC}"
    aws cloudformation describe-stack-events \
        --stack-name ${STACK_NAME} \
        --query 'StackEvents[?contains(ResourceStatus, `FAILED`) || contains(ResourceStatus, `ROLLBACK`)].{Time: Timestamp, Resource: LogicalResourceId, Status: ResourceStatus, Reason: ResourceStatusReason}' \
        --output table \
        --region ${REGION}
        
    exit 1
fi
