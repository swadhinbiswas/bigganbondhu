# Google Cloud VM Setup for BigganBondhu

This document provides instructions for setting up a Google Cloud VM to run the BigganBondhu application.

## Initial VM Setup

1. Create a new VM instance in Google Cloud Console with:

   - Ubuntu 20.04 or newer
   - At least 2 vCPUs and 4GB memory recommended
   - Allow HTTP/HTTPS traffic

2. SSH into your VM:

   ```bash
   gcloud compute ssh [VM_NAME] --zone=[ZONE]
   ```

3. Clone the repository:

   ```bash
   git clone https://github.com/[YOUR_USERNAME]/bigganbondhu.git
   cd bigganbondhu
   ```

4. Run the setup script:

   ```bash
   ./vm-setup.sh
   ```

5. Log out and log back in for Docker group changes to take effect:
   ```bash
   exit
   # Log back in
   gcloud compute ssh [VM_NAME] --zone=[ZONE]
   ```

## Setting Up GitHub Actions Secrets

For GitHub Actions to deploy to your VM, you'll need to add these secrets to your GitHub repository:

1. `GCP_SSH_PRIVATE_KEY`: The SSH private key for your VM

   - Generate a new key pair if needed:
     ```bash
     ssh-keygen -t rsa -b 4096 -C "github-actions" -f github-actions-key
     ```
   - Add the public key to your VM's `~/.ssh/authorized_keys`
   - Add the private key (entire contents of `github-actions-key`) to GitHub secrets

2. `GCP_VM_IP`: Your VM's external IP address

3. `GCP_VM_USER`: Your VM's username (typically the same as your Google Cloud username)

## Testing Deployment

After setup is complete and secrets are configured:

1. Push a change to your main branch, or
2. Trigger a manual workflow run from the GitHub Actions tab

## Firewall Configuration

Ensure your VM's firewall allows traffic to the necessary ports:

- Port 8000 for backend API
- Port 80/443 for frontend (if hosted on the same VM)

This can be configured through the Google Cloud Console under VPC Network > Firewall rules.

## Production Considerations

For a production environment, consider these additional steps:

### Setting Up a Domain Name

1. Purchase a domain name from a domain registrar
2. Add DNS records pointing to your VM's IP address:
   - A record: `yourdomain.com` → VM_IP
   - A record: `api.yourdomain.com` → VM_IP

### Configuring HTTPS with Let's Encrypt

1. Install Certbot on your VM:

   ```bash
   sudo apt update
   sudo apt install certbot python3-certbot-nginx
   ```

2. Generate certificates:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
   ```

### Setting Up NGINX as a Reverse Proxy

1. Install Nginx:

   ```bash
   sudo apt install nginx
   ```

2. Create a configuration file:

   ```bash
   sudo nano /etc/nginx/sites-available/bigganbondhu
   ```

3. Add this configuration:

   ```nginx
   server {
     server_name api.yourdomain.com;

     location / {
       proxy_pass http://localhost:8000;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
     }
   }

   server {
     server_name yourdomain.com;

     location / {
       proxy_pass http://localhost:3000;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
     }
   }
   ```

4. Enable the site and restart Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/bigganbondhu /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### Setting Up Monitoring

1. Set up the included monitoring script as a cron job:

   ```bash
   crontab -e
   ```

2. Add this line to run the script every 15 minutes:
   ```
   */15 * * * * /home/[USERNAME]/bigganbondhu/server-monitor.sh
   ```

After setup is complete and secrets are configured:

1. Push a change to your main branch, or
2. Trigger a manual workflow run from the GitHub Actions tab

## Firewall Configuration

Ensure your VM's firewall allows traffic to the necessary ports:

- Port 8000 for backend API
- Port 80/443 for frontend (if hosted on the same VM)

This can be configured through the Google Cloud Console under VPC Network > Firewall rules.
