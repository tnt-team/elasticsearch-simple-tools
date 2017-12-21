#!/bin/bash

# config your deploy path here
DEPLOY_PATH="/Users/trto1987/Sites/h5-tools"

p_path=$(cd `dirname $0`; cd ..; pwd)

if [ ! -d $DEPLOY_PATH ]; then
  cmd="mkdir $DEPLOY_PATH"
  echo "$cmd"
  `$cmd`
fi

cmd="rm -rf $DEPLOY_PATH/*"
echo "$cmd"
`$cmd`
cmd="cp -rf $p_path/dist/* $DEPLOY_PATH"
echo "$cmd"
`$cmd`