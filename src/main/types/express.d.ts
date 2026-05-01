import 'express';

// It seems that TypeScript does not automatically merge augmentations across re-export boundaries
// So CoPilot advices to augment both the "express-serve-static-core" and "express" modules

declare module 'express-serve-static-core' {
  interface Request {
    idempotencyKey?: string;
  }
}

declare module 'express' {
  interface Request {
    idempotencyKey?: string;
  }
}
