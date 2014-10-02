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
//#define FRAME_RATE 24

IplImage * turn_right_image = cvLoadImage("right.jpg", CV_LOAD_IMAGE_COLOR);
IplImage * turn_left_image = cvLoadImage("left.jpg", CV_LOAD_IMAGE_COLOR);

int detect_turn(string filename){
    if(strstr(filename.c_str(), "[LEFT]"))
        return -1;
    if(strstr(filename.c_str(), "[RIGHT]"))
        return 1;
    return 0;

}

void impress_turn_sign(IplImage * image, int turn){
    if(turn == 1)
        cvAddWeighted(image, 1, turn_right_image, 0.5, 0.0, image);
    if(turn == -1)
        cvAddWeighted(image, 1, turn_left_image, 0.5, 0.0, image);
}

vector <string> read_directory(const string & path = string()){
    //cout << path << endl;
    vector <string> result;
    dirent* de;
    DIR* dp;
    errno = 0;
    dp = opendir(path.empty() ? "." : path.c_str());
    if(dp){
        while(true){
            errno = 0;
            de = readdir(dp);
            if(de == NULL)
                break;
            if(strlen(de->d_name) > 4 && strcmp((de->d_name) + strlen(de->d_name) - 4, ".jpg")==0) 
                result.push_back(string(de->d_name));
        }
        closedir( dp );
        sort(result.begin(), result.end());
    }
    return result;
}

void add_frames(IplImage* a, IplImage* b, CvVideoWriter* writer, int sub_frame_number){
    IplImage* interpoled = cvCreateImage(cvGetSize(b), b->depth, b->nChannels);
    cvAddWeighted(a, 0.5, b, 0.5, 0.0, interpoled);
    cvWriteFrame(writer, a);
    //cvWriteFrame(writer, interpoled);
    //cvWriteFrame(writer, b);
    int i;
    for(i = 1; i < sub_frame_number+1; i++){
        IplImage* interpoled = cvCreateImage(cvGetSize(b), b->depth, b->nChannels);
        cout << i/(sub_frame_number+1.0) << endl;
        cout << 1-i/(sub_frame_number+1.0) << endl;
        cvAddWeighted(a, 1 - i/(sub_frame_number+1.0), b, i/(sub_frame_number+1.0), 0.0, interpoled);
        cvWriteFrame(writer, interpoled);
    }
    cvWriteFrame(writer, b);
}


int do_video(string image_path, string destination_path, int frame_rate){
    vector <string> files = read_directory(image_path);

    int isColor = 1;
    int fps     = frame_rate;
    int frameW  = WIDTH;
    int frameH  = HEIGHT;
    CvSize size;
    
    size.width = frameW;
    size.height = frameH;
    String filepathtmp (destination_path);
    filepathtmp += ".tmp";
    CvVideoWriter* writer = cvCreateVideoWriter(filepathtmp.c_str(), CV_FOURCC('m','p','4','v'), fps, size, isColor);
    IplImage* f = 0;
    IplImage* f_old = 0;

    string base_link (image_path);
    string link;
    string filename;
    int turn = 0;
    unsigned long i;
    for (i = 0; i < files.size();){
        filename = files.at(i).c_str();         
        cout << filename << endl;

        link = base_link + files.at(i++).c_str();
        f = cvLoadImage(link.c_str(), CV_LOAD_IMAGE_COLOR);
        
        turn = detect_turn(filename);
        if(turn)
            impress_turn_sign(f, turn);

        if(f_old != 0 && f !=0){
            add_frames(f_old, f, writer, 12/frame_rate);
        }

        cvReleaseImage(&f_old);
        f_old = f;
    }
    cvReleaseVideoWriter(&writer);
    rename(filepathtmp.c_str(), destination_path.c_str());
    return 0;
}

int main(int const argc, const char ** const argv){
    if(argc != 4)
        exit(EXIT_FAILURE);
		cout << atoi(argv[3]) << endl;
    do_video(argv[1], argv[2], atoi(argv[3]));
    cvReleaseImage(&turn_right_image);
    cvReleaseImage(&turn_left_image);
    return 0;
}



