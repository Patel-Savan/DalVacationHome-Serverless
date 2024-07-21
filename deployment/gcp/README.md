# GCP Deployment Guidelines

## Before You Start

### Create A New Project on GCP

Go to https://console.cloud.google.com/ and create a new project. For our example, we used `DalVacationHome` as the project name and `dalvacationhome-dev` as the project ID.

### Install and Initialize the Google Cloud SDK

Ensure you have the Google Cloud SDK installed on your machine. If not, download and install it first.

After installing, initialize the SDK:

```sh
gcloud init
```

### Authenticating with Google Cloud

```sh
gcloud auth login
```

### Specify Your Project ID

Specify the GCP project where you want to make all the deployment:

```sh
gcloud config set project YOUR_PROJECT_ID
```

This `YOUR_PROJECT_ID` will be also specified in `.env` file in the `gcp` folder.

### (OPTIONAL) Update .env Configurations

You can update the configurations or deployment variable values in the `.env` file in the `gcp` folder.

### Enable GCP Services

We have to enable the following services for our project:

```sh
gcloud services enable firestore.googleapis.com
```
