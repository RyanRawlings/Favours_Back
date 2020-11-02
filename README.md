# Favours Back


## Cloud Deployment 1 on AWS Amplify using AppSync, GraphQL, DynamoDB

Cloud deployment 1 is implemented by utilising AWS Amplify, AppSync, GraphQL and DynamoDB. The APIs for this deployment were implemented using GraphQL APIs that are stored in api/favours folder. The schema is stored in schema.graphql



## Cloud Deployment 2 on AWS EC2 using RESTFUL, MongoDB

Cloud deployment 2 is implemented by utilising AWS EC2, RESTFUL, MongoDB. The APIs for this deployment were implemented using RESTFUL APIs that are stored in routes/api. 

# Notes
upgrade_s3 is currently unused but represents a more secure way of handling the image processing to and from s3.

# Usage
Need to create a .env file with the same structure as .env_sample file, the main concern is the BUCKET_NAME, multer requires a bucket value to be passed otherwise the application will crash and will not compile

