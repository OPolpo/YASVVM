#define WIN32_LEAN_AND_MEAN  /* required by xmlrpc-c/server_abyss.h */

#include <stdlib.h>
#include <stdio.h>
#ifdef _WIN32
#  include <windows.h>
#  include <winsock2.h>
#else
#  include <unistd.h>
#endif

#include <xmlrpc-c/base.h>
#include <xmlrpc-c/server.h>
#include <xmlrpc-c/server_abyss.h>

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

vector <string> read_directory(const string & path);

// IplImage* createFrame(IplImage* ah, IplImage* bh, IplImage* ch, IplImage* al, IplImage* bl, IplImage* cl){
//     IplImage* merged = cvCreateImage(cvSize(WIDTH*3, HEIGHT*2), al->depth, al->nChannels);


//     int i,j,k=0;
//     for(i = 0; i < HEIGHT; i++)
//         for(j = 0; j < WIDTH; j++)
//             for(k = 0; k < 3; k++){
//                 merged->imageData[i * WIDTH*3*3 + j * 3 + k] = ah->imageData[i * WIDTH*3 + j * 3 + k];
//                 merged->imageData[i * WIDTH*3*3 + (j + WIDTH) * 3 + k] = bh->imageData[i * WIDTH*3 + j * 3 + k];
//                 merged->imageData[i * WIDTH*3*3 + (j + WIDTH*2) * 3 + k] = ch->imageData[i * WIDTH*3 + j * 3 + k];
//                 merged->imageData[(i + HEIGHT) * WIDTH*3*3 + j * 3 + k] = al->imageData[i * WIDTH*3 + j * 3 + k];
//                 merged->imageData[(i + HEIGHT) * WIDTH*3*3 + (j + WIDTH) * 3 + k] = bl->imageData[i * WIDTH*3 + j * 3 + k];
//                 merged->imageData[(i + HEIGHT) * WIDTH*3*3 + (j + WIDTH*2) * 3 + k] = cl->imageData[i * WIDTH*3 + j * 3 + k];
//             }

//     //cvShowImage("image", merged);
//     return merged;
// }

IplImage* createFrame(IplImage* a, IplImage* b){
    IplImage* merged = cvCreateImage(cvSize(WIDTH*2, HEIGHT), a->depth, a->nChannels);


    int i,j,k=0;
    for(i = 0; i < HEIGHT; i++)
        for(j = 0; j < WIDTH; j++)
            for(k = 0; k < 3; k++){
                merged->imageData[i * WIDTH*2*3 + j * 3 + k] = a->imageData[i * WIDTH*3 + j * 3 + k];
                merged->imageData[i * WIDTH*2*3 + (j + WIDTH) * 3 + k] = b->imageData[i * WIDTH*3 + j * 3 + k];
            }

    //cvShowImage("image", merged);
    return merged;
}

IplImage* interpole(IplImage* a, IplImage* b){
    IplImage* interpoled = cvCreateImage(cvGetSize(a), a->depth, a->nChannels);
    cvAddWeighted(a, 0.5, b, 0.5, 0.0, interpoled);
    return interpoled;
}

double getx(String s){
    char * pch;
    char cp[40];
    strcpy(cp, s.c_str());
    pch = strtok(cp,"-");
    pch = strtok (NULL, "-");
    return atof(pch);
}

double gety(String s){
    char * pch;
    char cp[30];
    strcpy(cp, s.c_str());
    pch = strtok(cp,"-");
    pch = strtok (NULL, "-");
    pch = strtok (NULL, "-");
    pch[strlen(pch)-4] = 0;
    return atof(pch);
}

double distance (String a, String b){
    double ax = getx(a);
    double bx = getx(b);
    double ay = gety(a);
    double by = gety(b);

    return sqrt(pow((ax - bx),2) + pow((ax - bx),2));
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
    String filepath (path);
    filepath += "out.avi";
    CvVideoWriter* writer = cvCreateVideoWriter(filepath.c_str(), CV_FOURCC('m','p','4','v'), fps, size, isColor);
    IplImage* frame = 0;
    // IplImage* dxh = 0;
    // IplImage* centerh = 0;
    // IplImage* sxh = 0;
    // IplImage* dxl = 0;
    // IplImage* centerl = 0;
    // IplImage* sxl = 0;

    // IplImage* sx = 0;
    // IplImage* dx = 0;

    IplImage* f = 0;

    //IplImage* old_frame = cvLoadImage("frames/thumbs-up-01 (dragged).jpg",CV_LOAD_IMAGE_COLOR);
    //IplImage* interpolated_frame = 0;
    //IplImage* a = cvLoadImage("0-1.jpg",CV_LOAD_IMAGE_COLOR);
    //IplImage* b = cvLoadImage("0-2.jpg",CV_LOAD_IMAGE_COLOR);
    //IplImage* c = cvLoadImage("0-3.jpg",CV_LOAD_IMAGE_COLOR);
    //createFrame(a,b,c);
    //createFrame(old_frame,old_frame,old_frame);
    unsigned long i;
    for (i = 0; i < files.size();){
        // string link ("frames/");
        // link += files.at(i++).c_str();
        // printf("apro %s ch\n", link.c_str());
        // centerh = cvLoadImage(link.c_str() ,CV_LOAD_IMAGE_COLOR);

        // link = "frames/";
        // link += files.at(i++).c_str();
        // printf("apro %s cl\n", link.c_str());
        // centerl = cvLoadImage(link.c_str() ,CV_LOAD_IMAGE_COLOR);

        // link = "frames/";
        // link += files.at(i++).c_str();
        // printf("apro %s sxh\n", link.c_str());
        // sxh = cvLoadImage(link.c_str() ,CV_LOAD_IMAGE_COLOR);

        // link = "frames/";
        // link += files.at(i++).c_str();
        // printf("apro %s sxl\n", link.c_str());
        // sxl = cvLoadImage(link.c_str() ,CV_LOAD_IMAGE_COLOR);

        // link = "frames/";
        // link += files.at(i++).c_str();
        // printf("apro %s dxh\n", link.c_str());
        // dxh = cvLoadImage(link.c_str() ,CV_LOAD_IMAGE_COLOR);

        // link = "frames/";
        // link += files.at(i++).c_str();
        // printf("apro %s dxl\n", link.c_str());
        // dxl = cvLoadImage(link.c_str() ,CV_LOAD_IMAGE_COLOR);


        // TWO IMAGES VERSION

        // string link ("frames/");
        // link += files.at(i++).c_str();
        // printf("apro %s sx\n", link.c_str());
        // sx = cvLoadImage(link.c_str() ,CV_LOAD_IMAGE_COLOR);

        // link = "frames/";
        // link += files.at(i++).c_str();
        // printf("apro %s dx\n", link.c_str());
        // dx = cvLoadImage(link.c_str() ,CV_LOAD_IMAGE_COLOR);

        string filename = files.at(i).c_str();
        string filename_old = (i == 0) ? files.at(i).c_str() : files.at(i-1).c_str();

        string link (path);
        //link += "/";
        link += files.at(i++).c_str();
        printf("apro %s \n", link.c_str());
        f = cvLoadImage(link.c_str() ,CV_LOAD_IMAGE_COLOR);
        printf("scrivo %s \n", link.c_str());
        //cout.precision(10);
        //cout << distance(filename, filename_old) << endl;

        //frame = createFrame(sxh,centerh,dxh,sxl,centerl,dxl);
        //frame = createFrame(sx, dx);

        //interpolated_frame = interpole(frame, old_frame);
        //cvWriteFrame(writer, interpolated_frame);
        //cvWriteFrame(writer, frame);
        cvWriteFrame(writer, f);

        //old_frame = frame;
    }
    cvReleaseVideoWriter(&writer);
    return 0;
}

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
    for (int i = 0; i < result.size(); ++i){
        printf("%s\n", result.at(i).c_str());        
    }
    return result;
}


// static xmlrpc_value * sample_add(xmlrpc_env *   const envP,
//                                  xmlrpc_value * const paramArrayP,
//                                  void *         const serverInfo,
//                                  void *         const channelInfo) {
    
//     xmlrpc_int32 x, y, z;
    
//     xmlrpc_decompose_value(envP, paramArrayP, "(ii)", &x, &y);
//     if (envP->fault_occurred)
//         return NULL;
    
//     z = x + y;
    
//     return xmlrpc_build_value(envP, "i", z);
// }

// static xmlrpc_value * xmlrpc_read_dir(xmlrpc_env *   const envP,
//                                       xmlrpc_value * const paramArrayP,
//                                       void *         const serverInfo,
//                                       void *         const channelInfo){
//     read_directory("frames");
//     xmlrpc_int32 z;
//     z=0;
//     return xmlrpc_build_value(envP, "i", z);;
// }

static xmlrpc_value * xmlrpc_do_video(xmlrpc_env *   const envP,
                                      xmlrpc_value * const paramArrayP,
                                      void *         const serverInfo,
                                      void *         const channelInfo){
    char * s;
    xmlrpc_decompose_value(envP, paramArrayP, "(s)", &s);
    cout << s << endl;
    do_video(s);
    xmlrpc_int32 z;
    z=0;
    return xmlrpc_build_value(envP, "i", z);;
}


int main(int const argc, const char ** const argv) {
    //do_video("frames");
    // struct xmlrpc_method_info3 const methodInfo = {"sample.add",  &sample_add};

    // struct xmlrpc_method_info3 const methodInforeaddir = {"xmlrpc.read_dir", &xmlrpc_read_dir};

    struct xmlrpc_method_info3 const methodInfovideo = {"xmlrpc.do_video", &xmlrpc_do_video};


    xmlrpc_server_abyss_parms serverparm;
    xmlrpc_registry * registryP;
    xmlrpc_env env;
    
    if (argc-1 != 1) {
        fprintf(stderr, "You must specify 1 argument:  The TCP port "
                "number on which the server will accept connections "
                "for RPCs (8080 is a common choice).  "
                "You specified %d arguments.\n",  argc-1);
        exit(1);
    }
    
    xmlrpc_env_init(&env);
    
    registryP = xmlrpc_registry_new(&env);
    if (env.fault_occurred) {
        printf("xmlrpc_registry_new() failed.  %s\n", env.fault_string);
        exit(1);
    }
    
    // xmlrpc_registry_add_method3(&env, registryP, &methodInfo);
    // if (env.fault_occurred) {
    //     printf("xmlrpc_registry_add_method3() failed.  %s\n",
    //            env.fault_string);
    //     exit(1);
    // }

    xmlrpc_registry_add_method3(&env, registryP, &methodInfovideo);
    if (env.fault_occurred) {
        printf("xmlrpc_registry_add_method3() failed.  %s\n",
               env.fault_string);
        exit(1);
    }

    // xmlrpc_registry_add_method3(&env, registryP, &methodInforeaddir);
    // if (env.fault_occurred) {
    //     printf("xmlrpc_registry_add_method3() failed.  %s\n",
    //            env.fault_string);
    //     exit(1);
    // }
    
    serverparm.config_file_name = NULL;   /* Select the modern normal API */
    serverparm.registryP        = registryP;
    serverparm.port_number      = atoi(argv[1]);
    serverparm.log_file_name    = "/tmp/xmlrpc_log";
    
    printf("Running XML-RPC server...\n");
    
    xmlrpc_server_abyss(&env, &serverparm, XMLRPC_APSIZE(log_file_name));
    if (env.fault_occurred) {
        printf("xmlrpc_server_abyss() failed.  %s\n", env.fault_string);
        exit(1);
    }
    
    return 0;
}



