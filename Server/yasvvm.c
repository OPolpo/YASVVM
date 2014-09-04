#include <stdlib.h>
#include <stdio.h>

#include <opencv2/core/core.hpp>
#include <opencv2/highgui/highgui.hpp>
#include <opencv2/opencv.hpp>
#include <iostream>
#include <dirent.h>
#include "yasvvm.h"
#include <string.h>

using namespace cv;
using namespace std;

#define WIDTH 640
#define HEIGHT 640
#define FRAME_RATE 24

vector <string> read_directory(const string & path = string()){
    cout << path << endl;
    vector <string> result;
    dirent* de;
    DIR* dp;
    errno = 0;
    dp = opendir( path.empty() ? "." : path.c_str() );
    if (dp){
        while (true){
            errno = 0;
            de = readdir(dp);
            if (de == NULL)
                break;
            if (strlen(de->d_name) > 4 && strcmp((de->d_name) + strlen(de->d_name) - 4, ".jpg")==0) 
                result.push_back( string( de->d_name ) );
        }
        closedir( dp );
        sort( result.begin(), result.end() );
    }
    return result;
}
int do_video(string image_path, string destination_path){
    vector <string> files = read_directory(image_path);
    int isColor = 1;
    int fps     = FRAME_RATE;
    int frameW  = WIDTH;
    int frameH  = HEIGHT;
    CvSize size;
    
    size.width = frameW;
    size.height = frameH;
    String filepathtmp (destination_path);
    filepathtmp += ".tmp";
    CvVideoWriter* writer = cvCreateVideoWriter(filepathtmp.c_str(), CV_FOURCC('m','p','4','v'), fps, size, isColor);
    IplImage* f = 0;

    string base_link (image_path);
    string link;
    string filename;
    unsigned long i;
    for (i = 0; i < files.size();){
        filename = files.at(i).c_str();
        link = base_link + files.at(i++).c_str();
        f = cvLoadImage(link.c_str(), CV_LOAD_IMAGE_COLOR);
        cvWriteFrame(writer, f);
        cvReleaseImage(&f);
    }
    cvReleaseVideoWriter(&writer);
    rename(filepathtmp.c_str(), destination_path.c_str());
    return 0;
}

int main(int const argc, const char ** const argv){
    if(argc != 3)
        exit(EXIT_FAILURE);
    do_video(argv[1], argv[2]);
    return 0;
}



