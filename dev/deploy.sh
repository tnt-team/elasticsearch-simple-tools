#!/bin/bash

# config your deploy path here
DEPLOY_PATH="/Users/trto1987/Sites/h5-tools"

cd ..
p_path=`pwd`
cmd="cp -rf $p_path/* $DEPLOY_PATH"
echo "$cmd"
`$cmd`