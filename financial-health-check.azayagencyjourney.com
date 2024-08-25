server {
    server_name financial-health-check.azayagencyjourney.com;

    location / {
        # Forward request to frontend running on port 3173
        proxy_pass http://localhost:3173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        # Forward request to backend running on port 3000
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
       location /report/ {
        # Forward request to backend running on port 3000
        proxy_pass http://localhost:3174;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/financial-health-check.azayagencyjourney.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/financial-health-check.azayagencyjourney.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}

server {
    if ($host = financial-health-check.azayagencyjourney.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    server_name financial-health-check.azayagencyjourney.com;
    return 404; # managed by Certbot


}