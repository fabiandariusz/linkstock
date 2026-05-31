#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(Outbox, NSObject)

RCT_EXTERN_METHOD(append:(NSString *)jsonString
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(drain:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup { return NO; }

@end
