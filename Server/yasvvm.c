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

using namespace cv;
using namespace std;

int do_video()
{    
    int isColor = 1;
    int fps     = 25;
    int frameW  = 512;
    int frameH  = 512;
    CvSize size;
    
    size.width = frameW;
    size.height = frameH;
    CvVideoWriter* writer = cvCreateVideoWriter("out.avi", CV_FOURCC('m','p','4','v'), fps, size, isColor);
    IplImage* img = 0;
    img = cvLoadImage("Lenna.png",CV_LOAD_IMAGE_COLOR);
    //cvShowImage("ss", img);
    //waitKey(0);
    
    for(int counter=0; counter < 500; counter++)
    {
        cout << "aggiungo" << endl;
        
        cvWriteFrame(writer, img);
    }
    cvReleaseVideoWriter(&writer);
    return 0;
}

vector <string> read_directory(const string & path = string()){
    vector <string> result;
    dirent* de;
    DIR* dp;
    errno = 0;
    dp = opendir( path.empty() ? "." : path.c_str() );
    if (dp){
        while (true){
            errno = 0;
            de = readdir( dp );
            if (de == NULL) break;
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


static xmlrpc_value * sample_add(xmlrpc_env *   const envP,
           xmlrpc_value * const paramArrayP,
           void *         const serverInfo,
           void *         const channelInfo) {
    
    xmlrpc_int32 x, y, z;
    
    /* Parse our argument array. */
    xmlrpc_decompose_value(envP, paramArrayP, "(ii)", &x, &y);
    if (envP->fault_occurred)
      return NULL;
    
    z = x + y;
    
    return xmlrpc_build_value(envP, "i", z);
}

static xmlrpc_value * xmlrpc_read_dir(xmlrpc_env *   const envP,
           xmlrpc_value * const paramArrayP,
           void *         const serverInfo,
           void *         const channelInfo){
    read_directory("frames");
    xmlrpc_int32 z;
    z=0;
    return xmlrpc_build_value(envP, "i", z);;
}

static xmlrpc_value * xmlrpc_do_video(xmlrpc_env *   const envP,
           xmlrpc_value * const paramArrayP,
           void *         const serverInfo,
           void *         const channelInfo){
    do_video();
    xmlrpc_int32 z;
    z=0;
    return xmlrpc_build_value(envP, "i", z);;
}



int
main(int           const argc,
     const char ** const argv) {
    
    struct xmlrpc_method_info3 const methodInfo = {"sample.add",  &sample_add};

    struct xmlrpc_method_info3 const methodInforeaddir = {"xmlrpc.read_dir", &xmlrpc_read_dir};

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
    
    xmlrpc_registry_add_method3(&env, registryP, &methodInfo);
    if (env.fault_occurred) {
        printf("xmlrpc_registry_add_method3() failed.  %s\n",
               env.fault_string);
        exit(1);
    }

    xmlrpc_registry_add_method3(&env, registryP, &methodInfovideo);
    if (env.fault_occurred) {
        printf("xmlrpc_registry_add_method3() failed.  %s\n",
               env.fault_string);
        exit(1);
    }

    xmlrpc_registry_add_method3(&env, registryP, &methodInforeaddir);
    if (env.fault_occurred) {
        printf("xmlrpc_registry_add_method3() failed.  %s\n",
               env.fault_string);
        exit(1);
    }
    
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
    /* xmlrpc_server_abyss() never returns unless it fails */
    
    return 0;
}



