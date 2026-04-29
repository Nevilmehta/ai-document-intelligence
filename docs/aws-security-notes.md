# AWS Security Notes

## EC2 Security Group
Inbound:
- SSH 22 only from my IP
- HTTP 80 from anywhere
- HTTPS 443 from anywhere
- API port 8000 only temporarily for testing

## RDS Security Group
Inbound:
- PostgreSQL 5432 only from EC2 security group

RDS should not be publicly accessible.

## S3 Security
- Block Public Access ON
- No public bucket policy
- No public ACLs
- Use presigned URLs for temporary access

## Secrets
Never commit:
- AWS keys
- OpenAI keys
- database passwords
- JWT secret keys

Use:
- `.env.production`
- GitHub secrets later
- IAM roles later instead of hardcoded AWS keys