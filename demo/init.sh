#!/bin/bash

set -e

cd $(dirname $0)

if [ -f ../tars/settings/local.py ]; then
    echo "local.py exists, no need to copy sample file"
else
    echo "local.py not exists, copying sample file"
    cp ../tars/settings/local.py.example ../tars/settings/local.py && echo 'file copied'
fi
