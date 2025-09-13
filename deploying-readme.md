# Deploying/Changing AWS Resources

To deploy, run:

```bash
aws cloudformation deploy --template-file infrastructure.yml --stack-name PlaylistTransferStack --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM --region eu-west-2
```

To changeset, run:

```bash
aws cloudformation create-change-set --stack-name PlaylistTransferStack --change-set-name {ADD NAME} --template-body file://infrastructure.yml --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM --region eu-west-2
```

Check AWS after you changeset and review changes. If all happy, apply changeset and make sure it completes okay.
