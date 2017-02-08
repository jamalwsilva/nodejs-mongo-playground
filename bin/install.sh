#!/bin/bash

dest_dir=config/config.js
[ ! -e $dest_dir ] && cp $dest_dir.dist $dest_dir

exit 0
