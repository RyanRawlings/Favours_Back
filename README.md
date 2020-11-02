CONTENTS OF THIS FILE
---------------------
 * Introduction
 * Project Details
 * Requirements 
 * Installation
 * Deployment
 * Notes
 * Configuration
 * Git Commenting
 * Group Members

# Introduction
Favours is a system that allows individuals to recieve rewards for completing favours for others, have
favours completed for them and has been designed for the sharing of IOUs with friends, social clubs and 
companies.

# Project Details
This is Backend implementation of Favours. Using Node js and Express js

This project exposes a Restful API that can be interacted with. The Frontend implementation of the Favours
project, makes requests to the backend project that is relayed to one of five api controllers:

Live Controllers:
    - awsS3Controller:
        - For uploading images to s3 instance
    - favourController:
        - Performing CRUD operations relating to Favour Records pertaining to application users
    - publicRequestController:
        - Performing CRUD operations relating to Public Request Records pertaining to application users        
    - userController:
        - Performing Authentication and CRUD operations relating to the application users

Future enhancements (still in development):
    - emailController:
        - Email service
    - upgrade_s3:
        - More secure way of interacting with s3 instance

## Requirements
No special requirements

## Installation
Once downloaded, install node packages with:
npm install | npm i

## Deployment

   ## Cloud Deployment 1 on AWS Amplify using AppSync, GraphQL, DynamoDB
    Cloud deployment 1 is implemented by utilising AWS Amplify, AppSync, GraphQL and DynamoDB. The APIs for this deployment were implemented using GraphQL APIs that are stored in api/favours folder. The schema is stored in schema.graphql

   ## Cloud Deployment 2 on AWS EC2 using RESTFUL, MongoDB
    Cloud deployment 2 is implemented by utilising AWS EC2, RESTFUL, MongoDB. The APIs for this deployment were implemented using RESTFUL APIs that are stored in routes/api. 

# Notes
upgrade_s3 is currently unused but represents a more secure way of handling the image processing to and from s3.

# Usage
Need to create a .env file with the same structure as .env_sample file, the main concern is the BUCKET_NAME, multer requires a bucket value to be passed otherwise the application will crash and will not compile

## Configuration
This project has no modifiable settings.

## Git Commenting
Git comments should utilise an imperative mood in the subject line
i.e. (Please) -> Add route to handle deletion of Favours

## Group Members
* Student Name | Student Number
* Rezo Ahmed | 13747199
* Wei Fu | 13161447
* Arsedian Ivanurrahman | 12464691
* Ryan Rawlings | 13524552