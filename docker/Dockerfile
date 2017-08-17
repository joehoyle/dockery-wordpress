FROM docker-wordpress-base:latest
RUN apk --no-cache add mysql memcached avahi php7-simplexml
RUN /usr/bin/mysql_install_db
COPY config/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
