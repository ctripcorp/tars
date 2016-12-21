_PROD_NET_TEMPLATE = """
---
:configgen:
- prd
- sh2
- IIS7
- NET4
- prd
:override:
    :from: "/BlackList/{bit}/prod"
    :to: "/bin"
"""

_UAT_NET_TEMPLATE = """
---
:configgen:
- uat_nt
- nt
- IIS7
- NET4
- uat_nt
:override:
    :from: "/BlackList/{bit}/other"
    :to: "/bin"
"""

_FAT_NET_TEMPLATE = """
---
:configgen:
- fat
- nt
- IIS7
- NET4
- fat
:override:
    :from: "/BlackList/{bit}/other"
    :to: "/bin"
"""

_PROD_JAVA_TEMPLATE = """
---
:language: java
:configgen:
- prd
- sh2
- IIS7
- NET4
- prd
:override:
    :from: "/BlackList/{bit}/prod"
    :to: "/bin"
"""

_PROD_JAVA2_TEMPLATE = """
---
:configgen:
- prd
- sh2
- IIS7
- NET4
- prd
:language: java
:container: javaapp
:override:
  :from: /BlackList/{bit}/prod
  :to: /bin
"""

_UAT_JAVA_TEMPLATE = """
---
:language: java
:configgen:
- uat_nt
- nt
- IIS7
- NET4
- uat_nt
:override:
    :from: "/BlackList/{bit}/other"
    :to: "/bin"
"""

_UAT_JAVA2_TEMPLATE = """
---
:configgen:
- uat_nt
- sh2
- IIS7
- NET4
- uat_nt
:language: java
:container: javaapp
:override:
  :from: /BlackList/{bit}/other
  :to: /bin
"""

_FAT_JAVA_TEMPLATE = """
---
:language: java
:configgen:
- fat
- nt
- IIS7
- NET4
- fat
:override:
    :from: "/BlackList/{bit}/other"
    :to: "/bin"
"""

_FAT_JAVA2_TEMPLATE = """
---
:configgen:
- fat
- sh2
- IIS7
- NET4
- fat
:language: java
:container: javaapp
:override:
  :from: /BlackList/{bit}/other
  :to: /bin
"""

_PHP_TEMPLATE = """
---
:language: php
"""

_WEBRESOURCE_TEMPLATE = """
---
:language: webresource
"""

_NODEJS_TEMPLATE = """
---
:language: nodejs
"""

_GOLANG_TEMPLATE = """
---
:language: golang
"""

PROD_TEMPLATES = {
    'windows_web_iis': _PROD_NET_TEMPLATE,
    'linux_tomcat': _PROD_JAVA_TEMPLATE,
    'linux_java': _PROD_JAVA2_TEMPLATE,
    'linux_webresource': _WEBRESOURCE_TEMPLATE,
    'linux_apache_php': _PHP_TEMPLATE,
    'linux_nginx_php': _PHP_TEMPLATE,
    'linux_nginx_nodejs': _NODEJS_TEMPLATE,
    'linux_nginx_go': _GOLANG_TEMPLATE
}
UAT_TEMPLATES = {
    'windows_web_iis': _UAT_NET_TEMPLATE,
    'linux_tomcat': _UAT_JAVA_TEMPLATE,
    'linux_java': _UAT_JAVA2_TEMPLATE,
    'linux_webresource': _WEBRESOURCE_TEMPLATE,
    'linux_apache_php': _PHP_TEMPLATE,
    'linux_nginx_php': _PHP_TEMPLATE,
    'linux_nginx_nodejs': _NODEJS_TEMPLATE,
    'linux_nginx_go': _GOLANG_TEMPLATE
}
FAT_TEMPLATES = {
    'windows_web_iis': _FAT_NET_TEMPLATE,
    'linux_tomcat': _FAT_JAVA_TEMPLATE,
    'linux_java': _FAT_JAVA2_TEMPLATE,
    'linux_webresource': _WEBRESOURCE_TEMPLATE,
    'linux_apache_php': _PHP_TEMPLATE,
    'linux_nginx_php': _PHP_TEMPLATE,
    'linux_nginx_nodejs': _NODEJS_TEMPLATE,
    'linux_nginx_go': _GOLANG_TEMPLATE
}
