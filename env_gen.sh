touch ./.env

echo "JWT_ACCESS_SECRET=$(openssl rand -hex 16)" > ./.env
echo "JWT_REFRESH_SECRET=$(openssl rand -hex 16)" >> ./.env
echo "JWT_2FA_ACCESS_SECRET=$(openssl rand -hex 16)" >> ./.env
echo "HOST=0.0.0.0" >> ./.env
echo "PORT=443" >> ./.env

echo '' >> ./.env
echo 'ELASTIC_PASSWORD=kibanapass' >> ./.env

echo '' >> ./.env
echo '# username/password for initial grafana login is admin' >> ./.env