# VEYA Backend: Hands-Off Implementation Plan (Phases 4 - 9)

This file contains the complete, detailed technical plan for implementing the remaining phases of the VEYA backend. Each phase provides exact file structures, TypeScript code blueprints, validation rules, repository logic, and routing bindings. Follow these instructions directly to complete the implementation.

---

## Phase 4: Artist Service CRUD

This phase handles the catalog of services (e.g., haircut, makeup) offered by artists.

### 1. Validator (`backend/src/validators/service.validator.ts`)
```typescript
import { z } from 'zod';

export const createServiceSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters'),
  description: z.string().trim().max(500, 'Description must not exceed 500 characters').optional().or(z.literal('')),
  price: z.number().positive('Price must be greater than 0'),
  duration: z.number().int().positive('Duration must be a positive integer in minutes'),
});

export const updateServiceSchema = createServiceSchema.partial();
```

### 2. Repository (`backend/src/repositories/service.repository.ts`)
```typescript
import { Service, Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

export class ServiceRepository {
  async create(artistId: string, data: Prisma.ServiceCreateWithoutArtistInput): Promise<Service> {
    return prisma.service.create({
      data: {
        ...data,
        artist: { connect: { id: artistId } },
      },
    });
  }

  async findById(id: string): Promise<Service | null> {
    return prisma.service.findUnique({
      where: { id },
      include: { artist: true },
    });
  }

  async findByArtistId(artistId: string): Promise<Service[]> {
    return prisma.service.findMany({
      where: { artistId },
    });
  }

  async update(id: string, data: Prisma.ServiceUpdateInput): Promise<Service> {
    return prisma.service.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Service> {
    return prisma.service.delete({
      where: { id },
    });
  }
}

export const serviceRepository = new ServiceRepository();
export default serviceRepository;
```

### 3. Service (`backend/src/services/service.service.ts`)
```typescript
import serviceRepository from '../repositories/service.repository';
import artistRepository from '../repositories/artist.repository';
import { CreateProfileInput } from './artist.service'; // Use Zod schema types
import { NotFoundError, UnauthorizedError } from '../utils/customErrors';

export class ServiceService {
  async createService(userId: string, data: any) {
    const artist = await artistRepository.findByUserId(userId);
    if (!artist) {
      throw new NotFoundError('Artist profile not found. Please create a profile first.');
    }
    return serviceRepository.create(artist.id, data);
  }

  async getServiceById(id: string) {
    const service = await serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundError('Service not found');
    }
    return service;
  }

  async getServicesByArtist(artistId: string) {
    const artist = await artistRepository.findById(artistId);
    if (!artist) {
      throw new NotFoundError('Artist profile not found');
    }
    return serviceRepository.findByArtistId(artistId);
  }

  async updateService(userId: string, id: string, data: any) {
    const artist = await artistRepository.findByUserId(userId);
    if (!artist) {
      throw new NotFoundError('Artist profile not found');
    }
    const service = await serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundError('Service not found');
    }
    if (service.artistId !== artist.id) {
      throw new UnauthorizedError('You are not authorized to update this service');
    }
    return serviceRepository.update(id, data);
  }

  async deleteService(userId: string, id: string) {
    const artist = await artistRepository.findByUserId(userId);
    if (!artist) {
      throw new NotFoundError('Artist profile not found');
    }
    const service = await serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundError('Service not found');
    }
    if (service.artistId !== artist.id) {
      throw new UnauthorizedError('You are not authorized to delete this service');
    }
    return serviceRepository.delete(id);
  }
}

export const serviceService = new ServiceService();
export default serviceService;
```

### 4. Controller (`backend/src/controllers/service.controller.ts`)
```typescript
import { Request, Response } from 'express';
import serviceService from '../services/service.service';
import { UnauthorizedError } from '../utils/customErrors';

export class ServiceController {
  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError('User authentication context not found');
    const service = await serviceService.createService(req.user.id, req.body);
    res.status(201).json({ success: true, data: service });
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const service = await serviceService.getServiceById(req.params.id);
    res.status(200).json({ success: true, data: service });
  };

  getByArtistId = async (req: Request, res: Response): Promise<void> => {
    const services = await serviceService.getServicesByArtist(req.params.artistId);
    res.status(200).json({ success: true, data: services });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError('User authentication context not found');
    const service = await serviceService.updateService(req.user.id, req.params.id, req.body);
    res.status(200).json({ success: true, data: service });
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError('User authentication context not found');
    await serviceService.deleteService(req.user.id, req.params.id);
    res.status(200).json({ success: true, message: 'Service deleted successfully' });
  };
}

export const serviceController = new ServiceController();
export default serviceController;
```

### 5. Routes (`backend/src/routes/service.routes.ts`)
```typescript
import { Router } from 'express';
import { Role } from '@prisma/client';
import serviceController from '../controllers/service.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { createServiceSchema, updateServiceSchema } from '../validators/service.validator';
import asyncHandler from '../utils/asyncHandler';

const router = Router();

router.post('/', authenticate, authorize(Role.ARTIST), validateBody(createServiceSchema), asyncHandler(serviceController.create));
router.get('/:id', asyncHandler(serviceController.getById));
router.get('/artist/:artistId', asyncHandler(serviceController.getByArtistId));
router.put('/:id', authenticate, authorize(Role.ARTIST), validateBody(updateServiceSchema), asyncHandler(serviceController.update));
router.delete('/:id', authenticate, authorize(Role.ARTIST), asyncHandler(serviceController.delete));

export default router;
```

Mount inside `app.ts`:
`app.use('/api/v1/services', serviceRoutes);`

---

## Phase 5: Media Upload System

Handles profile image and portfolio uploads. Integrated Cloudinary SDK with a fallback local directory.

### 1. Setup Environment
Add the following to `.env` and `src/config/index.ts` (as optional/conditional strings):
`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

### 2. Multer Configuration (`backend/src/utils/uploader.ts`)
```typescript
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { BadRequestError } from './customErrors';

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const fileUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new BadRequestError('Only images (jpg, jpeg, png, webp) are allowed'));
  },
});
```

### 3. Cloudinary Utility (`backend/src/utils/cloudinary.ts`)
```typescript
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import config from '../config';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadMedia = async (filePath: string, folderName: string): Promise<string> => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      // Fallback: return local relative URL
      const relativePath = filePath.split('/uploads/')[1];
      return `/uploads/${relativePath}`;
    }
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `veya/${folderName}`,
    });
    // Remove local file after upload
    fs.unlinkSync(filePath);
    return result.secure_url;
  } catch (error) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    throw error;
  }
};
```

### 4. Controller & Routes
- Under `ArtistController` add `uploadProfileImage` and `addPortfolioImage`.
- Bind in `artist.routes.ts`:
  - `POST /profile/image` -> `fileUpload.single('image')`, `uploadProfileImage`
  - `POST /portfolio` -> `fileUpload.single('image')`, `addPortfolioImage`

Implementation of `uploadProfileImage`:
```typescript
uploadProfileImage = async (req: Request, res: Response) => {
  if (!req.file) throw new BadRequestError('No file uploaded');
  const url = await uploadMedia(req.file.path, 'profiles');
  const artist = await artistRepository.findByUserId(req.user!.id);
  if (!artist) throw new NotFoundError('Artist profile not found');
  const updated = await artistRepository.update(artist.id, { profileImage: url });
  res.status(200).json({ success: true, data: updated });
};
```

Implementation of `addPortfolioImage`:
```typescript
addPortfolioImage = async (req: Request, res: Response) => {
  if (!req.file) throw new BadRequestError('No file uploaded');
  const url = await uploadMedia(req.file.path, 'portfolio');
  const artist = await artistRepository.findByUserId(req.user!.id);
  if (!artist) throw new NotFoundError('Artist profile not found');
  
  const portfolioImage = await prisma.portfolioImage.create({
    data: { artistId: artist.id, imageUrl: url }
  });
  res.status(201).json({ success: true, data: portfolioImage });
};
```

---

## Phase 6: Availability & Scheduling

Handles artist's operational schedule slot listings.

### 1. Validator (`backend/src/validators/availability.validator.ts`)
```typescript
import { z } from 'zod';

export const setAvailabilitySchema = z.object({
  dates: z.array(
    z.string().datetime({ message: 'Each availability date must be a valid ISO DateTime string' })
  ).min(1, 'At least one date is required'),
});
```

### 2. Service (`backend/src/services/availability.service.ts`)
```typescript
import prisma from '../lib/prisma';
import artistRepository from '../repositories/artist.repository';
import { NotFoundError, BadRequestError } from '../utils/customErrors';
import { AvailabilityStatus } from '@prisma/client';

export class AvailabilityService {
  async setAvailability(userId: string, dates: string[]) {
    const artist = await artistRepository.findByUserId(userId);
    if (!artist) throw new NotFoundError('Artist profile not found');

    const now = new Date();
    const records = dates.map(d => {
      const parsedDate = new Date(d);
      if (parsedDate <= now) {
        throw new BadRequestError('Availability slots must be set in the future');
      }
      return {
        artistId: artist.id,
        date: parsedDate,
        status: AvailabilityStatus.AVAILABLE,
      };
    });

    // Execute bulk upsert (using skipDuplicates or separate transaction)
    await prisma.$transaction(
      records.map(rec =>
        prisma.availability.upsert({
          where: { artistId_date: { artistId: rec.artistId, date: rec.date } },
          create: rec,
          update: { status: AvailabilityStatus.AVAILABLE },
        })
      )
    );
    return { success: true, count: dates.length };
  }

  async removeAvailability(userId: string, dates: string[]) {
    const artist = await artistRepository.findByUserId(userId);
    if (!artist) throw new NotFoundError('Artist profile not found');

    const parsedDates = dates.map(d => new Date(d));

    // Verify no bookings exist for these slots before deleting
    const bookings = await prisma.booking.findMany({
      where: {
        artistId: artist.id,
        bookingDate: { in: parsedDates },
        bookingStatus: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    if (bookings.length > 0) {
      throw new BadRequestError('Cannot remove availability slots containing active bookings');
    }

    await prisma.availability.deleteMany({
      where: {
        artistId: artist.id,
        date: { in: parsedDates },
      },
    });

    return { success: true };
  }

  async getAvailability(artistId: string) {
    return prisma.availability.findMany({
      where: {
        artistId,
        date: { gte: new Date() },
        status: AvailabilityStatus.AVAILABLE,
      },
      orderBy: { date: 'asc' },
    });
  }
}

export const availabilityService = new AvailabilityService();
export default availabilityService;
```

### 3. Controller & Routes
- Under `ArtistController` or a separate `AvailabilityController` mount:
  - `POST /api/v1/artists/availability` (Protected: ARTIST) - Set availability
  - `DELETE /api/v1/artists/availability` (Protected: ARTIST) - Remove availability
  - `GET /api/v1/artists/:artistId/availability` (Public) - Fetch active future availability slots

---

## Phase 7: Booking & Slot Reservations

Handles reservations using Prisma transactions.

### 1. Validator (`backend/src/validators/booking.validator.ts`)
```typescript
import { z } from 'zod';

export const createBookingSchema = z.object({
  serviceId: z.string().uuid('Invalid service ID format'),
  bookingDate: z.string().datetime({ message: 'Booking date must be a valid ISO DateTime string' }),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'CANCELLED', 'COMPLETED']),
});
```

### 2. Service (`backend/src/services/booking.service.ts`)
```typescript
import prisma from '../lib/prisma';
import { BookingStatus, AvailabilityStatus } from '@prisma/client';
import { NotFoundError, BadRequestError, UnauthorizedError } from '../utils/customErrors';

export class BookingService {
  async createBooking(customerId: string, serviceId: string, bookingDateStr: string) {
    const bookingDate = new Date(bookingDateStr);

    return prisma.$transaction(async (tx) => {
      // 1. Get service
      const service = await tx.service.findUnique({
        where: { id: serviceId },
        include: { artist: true },
      });
      if (!service) throw new NotFoundError('Service not found');

      // 2. Lock & Check availability slot
      const availability = await tx.availability.findUnique({
        where: { artistId_date: { artistId: service.artistId, date: bookingDate } },
      });

      if (!availability || availability.status !== AvailabilityStatus.AVAILABLE) {
        throw new BadRequestError('The requested timeslot is not available');
      }

      // 3. Mark timeslot as UNAVAILABLE
      await tx.availability.update({
        where: { id: availability.id },
        data: { status: AvailabilityStatus.UNAVAILABLE },
      });

      // 4. Create booking
      const booking = await tx.booking.create({
        data: {
          customerId,
          artistId: service.artistId,
          serviceId,
          bookingDate,
          bookingStatus: BookingStatus.PENDING,
        },
        include: {
          service: true,
          artist: { include: { user: { select: { name: true } } } },
        },
      });

      return booking;
    });
  }

  async getMyBookings(userId: string, role: string) {
    if (role === 'ARTIST') {
      const artist = await prisma.artistProfile.findUnique({ where: { userId } });
      if (!artist) throw new NotFoundError('Artist profile not found');
      return prisma.booking.findMany({
        where: { artistId: artist.id },
        include: { service: true, customer: { select: { name: true, email: true } } },
        orderBy: { bookingDate: 'desc' },
      });
    } else {
      return prisma.booking.findMany({
        where: { customerId: userId },
        include: { service: true, artist: { include: { user: { select: { name: true } } } } },
        orderBy: { bookingDate: 'desc' },
      });
    }
  }

  async updateStatus(userId: string, role: string, bookingId: string, status: BookingStatus) {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { service: true },
      });
      if (!booking) throw new NotFoundError('Booking not found');

      // Authorization checks
      if (role === 'CUSTOMER') {
        if (booking.customerId !== userId) throw new UnauthorizedError('Unauthorized');
        if (status !== BookingStatus.CANCELLED) {
          throw new BadRequestError('Customers can only cancel bookings');
        }
      } else if (role === 'ARTIST') {
        const artist = await tx.artistProfile.findUnique({ where: { userId } });
        if (!artist || booking.artistId !== artist.id) throw new UnauthorizedError('Unauthorized');
      }

      // If completing, just update status
      if (status === BookingStatus.COMPLETED) {
        if (booking.bookingStatus !== BookingStatus.CONFIRMED) {
          throw new BadRequestError('Only confirmed bookings can be marked completed');
        }
      }

      // If cancelling, restore timeslot availability
      if (status === BookingStatus.CANCELLED) {
        await tx.availability.updateMany({
          where: { artistId: booking.artistId, date: booking.bookingDate },
          data: { status: AvailabilityStatus.AVAILABLE },
        });
      }

      return tx.booking.update({
        where: { id: bookingId },
        data: { bookingStatus: status },
      });
    });
  }
}

export const bookingService = new BookingService();
export default bookingService;
```

### 3. Controller & Routes
- Mount under `routes/booking.routes.ts`:
  - `POST /api/v1/bookings` (Protected: CUSTOMER) - Create a booking
  - `GET /api/v1/bookings/me` (Protected: CUSTOMER or ARTIST) - List my bookings
  - `PATCH /api/v1/bookings/:id/status` (Protected: CUSTOMER or ARTIST) - Update booking status

---

## Phase 8: Review & Rating System

Handles post-appointment reviews and recalculates ratings.

### 1. Validator (`backend/src/validators/review.validator.ts`)
```typescript
import { z } from 'zod';

export const createReviewSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID format'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must not exceed 5'),
  comment: z.string().trim().max(1000, 'Comment must not exceed 1000 characters').optional().or(z.literal('')),
});
```

### 2. Service (`backend/src/services/review.service.ts`)
```typescript
import prisma from '../lib/prisma';
import { BookingStatus } from '@prisma/client';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/customErrors';

export class ReviewService {
  async addReview(customerId: string, bookingId: string, rating: number, comment?: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Verify booking completion and ownership
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) throw new NotFoundError('Booking record not found');
      if (booking.customerId !== customerId) {
        throw new BadRequestError('You can only review bookings that you requested');
      }
      if (booking.bookingStatus !== BookingStatus.COMPLETED) {
        throw new BadRequestError('Reviews can only be written for completed services');
      }

      // 2. Check if review already exists
      const existingReview = await tx.review.findUnique({
        where: { bookingId },
      });
      if (existingReview) {
        throw new ConflictError('You have already submitted a review for this booking');
      }

      // 3. Create review
      const review = await tx.review.create({
        data: {
          bookingId,
          customerId,
          artistId: booking.artistId,
          rating,
          comment: comment || null,
        },
      });

      // 4. Recalculate and update aggregate artist ratings
      const aggregateResult = await tx.review.aggregate({
        where: { artistId: booking.artistId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await tx.artistProfile.update({
        where: { id: booking.artistId },
        data: {
          rating: aggregateResult._avg.rating || 0.0,
          reviewCount: aggregateResult._count.rating || 0,
        },
      });

      return review;
    });
  }

  async getArtistReviews(artistId: string) {
    return prisma.review.findMany({
      where: { artistId },
      include: { customer: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const reviewService = new ReviewService();
export default reviewService;
```

### 3. Controller & Routes
- Mount under `routes/review.routes.ts`:
  - `POST /api/v1/reviews` (Protected: CUSTOMER) - Write a review
  - `GET /api/v1/artists/:artistId/reviews` (Public) - Fetch reviews for an artist

---

## Phase 9: Admin Operations & Platform Moderation

Enables core administration tools for moderation.

### 1. Routes (`backend/src/routes/admin.routes.ts`)
```typescript
import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.middleware';
import prisma from '../lib/prisma';
import asyncHandler from '../utils/asyncHandler';
import { NotFoundError } from '../utils/customErrors';

const router = Router();

// Require ADMIN role for all routes in this router
router.use(authenticate, authorize(Role.ADMIN));

/**
 * @route   PATCH /api/v1/admin/artists/:id/verify
 * @desc    Toggle verification status of an artist
 */
router.patch(
  '/artists/:id/verify',
  asyncHandler(async (req, res) => {
    const { verified } = req.body;
    const profile = await prisma.artistProfile.findUnique({ where: { id: req.params.id } });
    if (!profile) throw new NotFoundError('Artist profile not found');

    const updated = await prisma.artistProfile.update({
      where: { id: req.params.id },
      data: { verified: !!verified },
    });
    res.status(200).json({ success: true, data: updated });
  })
);

/**
 * @route   GET /api/v1/admin/bookings
 * @desc    List all platform bookings
 */
router.get(
  '/bookings',
  asyncHandler(async (_req, res) => {
    const bookings = await prisma.booking.findMany({
      include: {
        customer: { select: { name: true, email: true } },
        artist: { select: { id: true, city: true } },
        service: true,
      },
      orderBy: { bookingDate: 'desc' },
    });
    res.status(200).json({ success: true, data: bookings });
  })
);

export default router;
```

Mount inside `app.ts`:
`app.use('/api/v1/admin', adminRoutes);`

---

## Global Verification Step
Ensure that after implementing any module, running `./node_modules/.bin/tsc --noEmit` from `backend/` yields exit code 0.
