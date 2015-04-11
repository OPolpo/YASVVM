YASVVM
------

Yet Another Street View Video Maker is the final project for Digital Image Processing class.
The web-based user interface allows users to select two points on a map and calculates the route with Google’s APIs.
Information on images are collected and sent to a server, which download the photos and compose the video.
User interface allows to control work progress and to download the final video.

In order to do some experiments with frame interpolation we use [Butterflow](https://github.com/dthpham/butterflow).


##Environment

###Library
Some php script executes programs that requires OpenCV.
Remember to change the php configuration.
The simplest way is add the following lines in the **envars** file. (i think that this could be a security risk so be careful).

PATH=PATH=/usr/local/sbin:/usr/local/bin:/usr/bin:/bin:/usr/sbin
export PATH


###Directory

Compile and move all the file on the webserver.
Move the yasvvm binary and the php\_api directory onto webserver ad create also an empty file ".id".

YASVVM
├── .DS_Store
├── .id
├── frames
├── php\_api
│   ├── delete_job.php
│   ├── do\_job.php
│   ├── do\_jobz.php
│   ├── errors.php
│   ├── get\_all\_jobs_id.php
│   ├── get\_all\_video_link.php
│   ├── get\_new\_job_id.php
│   ├── get\_progress.php
│   ├── get\_video\_link.php
│   ├── left.jpg
│   ├── right.jpg
│   ├── set\_job.php
│   ├── start\_video\_elaboration.php
│   └── utils.php
├── video\_out
└── yasvvm
