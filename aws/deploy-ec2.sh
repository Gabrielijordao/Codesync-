#!/usr/bin/env bash
set -Eeuo pipefail
# Uso: AWS_REGION=us-east-1 ./aws/deploy-ec2.sh
# Prerequisitos: AWS CLI configurada via IAM role da EC2, Docker instalado, git checkout do repo.
# SSM SecureString: /hospedja/prod/DB_HOST, DB_USER, DB_PASSWORD, JWT_SECRET
# Apenas role da instancia deve ter GetParameter nesses nomes e kms:Decrypt se necessario.
AWS_REGION="${AWS_REGION:-us-east-1}"
SCOPE="/hospedja/prod"
ENV_FILE="/etc/hospedja/api.env"
if ! command -v aws >/dev/null || ! command -v docker >/dev/null; then
  echo 'Instale AWS CLI v2 e Docker antes de executar.' >&2; exit 2
fi
sudo install -d -m 0700 /etc/hospedja
sudo install -d -m 0755 /etc/hospedja/certs
curl --fail --silent --show-error --location   https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem   | sudo tee /etc/hospedja/certs/global-bundle.pem >/dev/null
sudo chmod 0644 /etc/hospedja/certs/global-bundle.pem
sudo touch "$ENV_FILE"
sudo chmod 0600 "$ENV_FILE"
printf '%s\n'   'NODE_ENV=production' 'PORT=3000' 'DB_PORT=3306' 'DB_NAME=hospedja'   'DB_SSL_CA_PATH=/etc/hospedja/certs/global-bundle.pem'   'JWT_EXPIRES_IN=1h' 'BCRYPT_ROUNDS=12' 'TRUST_PROXY_HOPS=1'   "CORS_ORIGINS=${CORS_ORIGINS:-https://app.example.com}"   'LOG_LEVEL=info' | sudo tee "$ENV_FILE" >/dev/null
for KEY in DB_HOST DB_USER DB_PASSWORD JWT_SECRET; do
  VALUE="$(aws ssm get-parameter --name "$SCOPE/$KEY" --with-decryption     --region "$AWS_REGION" --query 'Parameter.Value' --output text)"
  if [[ -z "$VALUE" || "$VALUE" == *$'\n'* || "$VALUE" == *$'\r'* ]]; then
    echo "Parametro SSM vazio ou com quebra de linha: $KEY" >&2; exit 1
  fi
  printf '%s=%s\n' "$KEY" "$VALUE" | sudo tee -a "$ENV_FILE" >/dev/null
  unset VALUE
done
sudo docker build --pull -t hospedja:cp3 .
sudo docker rm -f hospedja-api >/dev/null 2>&1 || true
sudo docker run --name hospedja-api -d --restart unless-stopped   --env-file "$ENV_FILE"   -v /etc/hospedja/certs:/etc/hospedja/certs:ro   -p 127.0.0.1:3000:3000 hospedja:cp3
sudo docker ps --filter name=hospedja-api
for attempt in $(seq 1 20); do
  if curl --fail --silent http://127.0.0.1:3000/health; then
    echo; echo 'Health check local OK'; exit 0
  fi
  sleep 2
done
sudo docker logs --tail 100 hospedja-api >&2
exit 1
# HTTPS / domínio / Nginx configurados separadamente. Não abra 3000 no Security Group.
