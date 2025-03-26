import { Global, Module } from '@nestjs/common';
import { ImageAnnotatorClient } from '@google-cloud/vision';

export const VISION_CLIENT = 'VISION_CLIENT';

const visionProvider = {
  provide: VISION_CLIENT,
  useFactory: () => {
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    return new ImageAnnotatorClient({
      keyFilename: credentialsPath,
    });
  },
};

@Global()
@Module({
  providers: [visionProvider],
  exports: [visionProvider],
})
export class VisionModule {}
