cd /opt/tars

sudo git pull origin develop

sudo service tarsd stop

sudo service tarsd start

sudo service nginx restart

sudo service celeryd restart