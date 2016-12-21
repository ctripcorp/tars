DIR="$( cd "$( dirname "$0" )" && pwd )"
OS=$( lsb_release -si )

# UWSGI
pip install uwsgi

mkdir -p /var/log/uwsgi
chmod 777 /var/log/uwsgi

mkdir -p /var/www
cp "$DIR/tarsd.ini" /var/www/
cp "$DIR/tarsd" /etc/init.d/
chmod 755 /etc/init.d/tarsd


# NGINX
case $OS in
  'CentOS')
    yum install -y nginx
    ;;
  'Ubuntu')
    apt-get install -y nginx
    ;;
  *)
    echo "Unsupported Linux distribution: $OS, aborting deployment"
    exit 64
    ;;
esac

cp "$DIR/django.conf" /etc/nginx/conf.d/


# CELERY
mkdir -p /var/log/celery
mkdir -p /var/run/celery
chmod 777 /var/log/celery
chmod 777 /var/run/celery

cp "$DIR/celeryd.conf" /etc/default/celeryd
cp "$DIR/celeryd" /etc/init.d/
chmod 755 /etc/init.d/celeryd


# Finally restart related services
service nginx restart
service tarsd restart
service celeryd restart
