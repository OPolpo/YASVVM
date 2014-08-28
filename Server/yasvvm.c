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
    // for (int i = 0; i < result.size(); ++i){
    //     printf("%s\n", result.at(i).c_str());        
    // }
    return result;
}
int do_video(string path){
    vector <string> files = read_directory(path);
    int isColor = 1;
    int fps     = FRAME_RATE;
    int frameW  = WIDTH;
    int frameH  = HEIGHT;
    CvSize size;
    
    size.width = frameW;
    size.height = frameH;
    String filepathtmp (path);
    String filepath (path);
    filepathtmp += "tmp.avi";
    filepath += "out.avi";
    CvVideoWriter* writer = cvCreateVideoWriter(filepathtmp.c_str(), CV_FOURCC('m','p','4','v'), fps, size, isColor);
    IplImage* f = 0;

    unsigned long i;
    for (i = 0; i < files.size();){

        string filename = files.at(i).c_str();
        string filename_old = (i == 0) ? files.at(i).c_str() : files.at(i-1).c_str();

        string link (path);
        link += files.at(i++).c_str();
        printf("apro %s \n", link.c_str());
        f = cvLoadImage(link.c_str() ,CV_LOAD_IMAGE_COLOR);
        printf("scrivo %s \n", link.c_str());
        
        cvWriteFrame(writer, f);

    }
    cvReleaseVideoWriter(&writer);
    rename(filepathtmp.c_str(), filepath.c_str());
    return 0;
}

int main(int const argc, const char ** const argv){
    if(argc != 2)
        exit(EXIT_FAILURE);
    do_video(argv[1]);
    // system("whoami");
    return 0;
}



